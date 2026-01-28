import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Calendar, Repeat, Plus, Trash2, Edit2, X, AlertCircle, Eye, EyeOff, Calendar as CalendarIcon } from 'lucide-react';
import { addEventToCalendar, createEventObject, isSignedIn, signInToGoogle, initGoogleCalendar, getUserProfile } from '../../core/services/googleCalendar';

const DailyProtocol = ({ protocols, actions, moduleId, viewMode, processTask, isSectionHidden, toggleSectionVisibility }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Filter protocols for this specific module
    const moduleProtocols = protocols ? protocols.filter(p => p.moduleId === moduleId) : [];

    const [formData, setFormData] = useState({
        title: '',
        frequency: 'daily', // daily, weekly, monthly, specific_days
        specificDays: [], // 0-6 (Sun-Sat)
        time: '',
        xpReward: 10,
        coinReward: 5,
        description: '',
        addToCalendar: true
    });



    const daysOfWeek = [
        { id: 0, label: 'Sun', short: 'S' },
        { id: 1, label: 'Mon', short: 'M' },
        { id: 2, label: 'Tue', short: 'T' },
        { id: 3, label: 'Wed', short: 'W' },
        { id: 4, label: 'Thu', short: 'T' },
        { id: 5, label: 'Fri', short: 'F' },
        { id: 6, label: 'Sat', short: 'S' }
    ];

    useEffect(() => {
        // Init Google Calendar
        const init = async () => {
            try {
                // Note: This might fail if Client ID is missing, but we'll try
                await initGoogleCalendar();
                const signedIn = isSignedIn();
                setIsCalendarConnected(signedIn);

                if (signedIn) {
                    const profile = await getUserProfile();
                    if (profile && profile.email) {
                        setUserEmail(profile.email);
                    }
                }
            } catch (e) {
                console.log("Calendar init failed (likely missing Client ID or script load error)", e);
            }
        };
        init();
    }, []);

    const connectCalendar = async () => {
        try {
            await signInToGoogle();
            setIsCalendarConnected(true);
            const profile = await getUserProfile();
            if (profile && profile.email) {
                setUserEmail(profile.email);
            }
        } catch (e) {
            console.error("Sign in failed", e);
            alert("Failed to connect Google Calendar. Check console for details (Client ID missing?).");
        }
    };

    // Reset logic check
    useEffect(() => {
        const checkResets = async () => {
            const today = new Date().toISOString().split('T')[0];

            for (const p of moduleProtocols) {
                if (p.isCompleted && p.lastCompletedDate !== today) {
                    // It's a new day, check if we should reset
                    let shouldReset = false;

                    if (p.frequency === 'daily') shouldReset = true;
                    else if (p.frequency === 'weekly') {
                        const lastDate = new Date(p.lastCompletedDate);
                        const diffTime = Math.abs(new Date() - lastDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays >= 7) shouldReset = true;
                    }

                    if (shouldReset) {
                        await actions.update(p.id, { isCompleted: false });
                    }
                }
            }
        };

        if (viewMode === 'admin') {
            checkResets();
        }
    }, [moduleProtocols, viewMode, actions]);


    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title) return;

        const data = {
            ...formData,
            moduleId,
            isCompleted: false,
            lastCompletedDate: null,
            streak: 0
        };

        if (editingId) {
            await actions.update(editingId, data);
        } else {
            await actions.add(data);
        }

        // Sync to Calendar if time is set, connected, AND requested
        if (isCalendarConnected && formData.time && formData.addToCalendar) {
            try {
                // Construct a date object for today at the specified time
                const today = new Date();
                const [hours, minutes] = formData.time.split(':');
                today.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                let recurrence = [];
                if (formData.frequency === 'daily') {
                    recurrence.push('RRULE:FREQ=DAILY');
                } else if (formData.frequency === 'weekly') {
                    recurrence.push('RRULE:FREQ=WEEKLY');
                } else if (formData.frequency === 'monthly') {
                    recurrence.push('RRULE:FREQ=MONTHLY');
                } else if (formData.frequency === 'specific_days' && formData.specificDays.length > 0) {
                    const daysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
                    const byDay = formData.specificDays.map(d => daysMap[d]).join(',');
                    recurrence.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
                }

                const event = createEventObject(
                    `[Protocol] ${formData.title}`,
                    `Daily Protocol Routine: ${formData.description || ''}\nFrequency: ${formData.frequency}`,
                    today,
                    30, // Default 30 min duration for routines
                    [],
                    { recurrence }
                );

                await addEventToCalendar(event);
                console.log("Added to calendar");
            } catch (e) {
                console.error("Failed to sync to calendar", e);
            }
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            frequency: 'daily',
            specificDays: [],
            time: '',
            xpReward: 10,
            coinReward: 5,
            description: '',
            addToCalendar: true
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (item) => {
        setFormData({
            title: item.title,
            frequency: item.frequency || 'daily',
            specificDays: item.specificDays || [],
            time: item.time || '',
            xpReward: item.xpReward || 10,
            coinReward: item.coinReward || 5,
            description: item.description || ''
        });
        setEditingId(item.id);
        setIsAdding(true);
    };

    const toggleDay = (dayId) => {
        setFormData(prev => {
            const days = prev.specificDays.includes(dayId)
                ? prev.specificDays.filter(d => d !== dayId)
                : [...prev.specificDays, dayId];
            return { ...prev, specificDays: days };
        });
    };

    const handleComplete = async (protocol) => {
        if (protocol.isCompleted) return; // Already done

        const today = new Date().toISOString().split('T')[0];

        // Update protocol state
        await actions.update(protocol.id, {
            isCompleted: true,
            lastCompletedDate: today,
            streak: (protocol.streak || 0) + 1
        });

        // Award XP/Coins
        if (processTask) {
            await processTask({
                xpReward: protocol.xpReward,
                coinReward: protocol.coinReward
            });
        }
    };

    if (isSectionHidden && viewMode !== 'admin') return null;

    return (
        <div className={`h-full flex flex-col ${isSectionHidden ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Daily Protocol</h3>
                    <p className="text-xs text-neutral-500 font-mono">Routine Operations & Habits</p>
                </div>
                {viewMode === 'admin' && (
                    <div className="flex items-center gap-2">
                        {!isCalendarConnected ? (
                            <button
                                onClick={connectCalendar}
                                className="p-2 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors"
                                title="Connect Google Calendar"
                            >
                                <CalendarIcon className="w-4 h-4" />
                            </button>
                        ) : (
                            <a
                                href="https://calendar.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg group transition-all hover:bg-green-500/20"
                            >
                                <CalendarIcon className="w-3 h-3 text-green-500" />
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider group-hover:underline">Open Calendar</span>
                                {userEmail && <span className="text-[10px] text-neutral-500 border-l border-white/10 pl-2 ml-1 hidden sm:inline">{userEmail}</span>}
                            </a>
                        )}
                        {toggleSectionVisibility && (
                            <button
                                onClick={toggleSectionVisibility}
                                className={`p-2 rounded-lg transition-colors ${isSectionHidden ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-neutral-400 hover:text-white'}`}
                            >
                                {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            onClick={() => { resetForm(); setIsAdding(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            <Plus className="w-3 h-3" /> Add Routine
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {moduleProtocols.length === 0 && !isAdding && (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <p className="text-neutral-500 text-sm">No active protocols initialized.</p>
                    </div>
                )}

                {moduleProtocols.map(protocol => (
                    <div
                        key={protocol.id}
                        className={`group relative p-4 rounded-xl border transition-all ${protocol.isCompleted
                            ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60'
                            : 'bg-neutral-900/40 border-white/5 hover:border-blue-500/30'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleComplete(protocol)}
                                    disabled={protocol.isCompleted || viewMode === 'guest'}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${protocol.isCompleted
                                        ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                        : 'bg-black/40 border-2 border-neutral-600 hover:border-blue-500 text-transparent'
                                        }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>

                                <div>
                                    <h4 className={`font-bold text-sm ${protocol.isCompleted ? 'text-emerald-500 line-through' : 'text-white'}`}>
                                        {protocol.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono mt-1">
                                        {protocol.time && (
                                            <span className="flex items-center gap-1 text-blue-400">
                                                <Clock className="w-3 h-3" /> {protocol.time}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Repeat className="w-3 h-3" />
                                            {protocol.frequency === 'specific_days'
                                                ? protocol.specificDays.map(d => daysOfWeek[d].short).join(',')
                                                : protocol.frequency}
                                        </span>
                                        {protocol.streak > 0 && (
                                            <span className="text-yellow-500">
                                                🔥 {protocol.streak} Day Streak
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end text-[9px] font-bold text-neutral-600 uppercase tracking-wider">
                                    <span className="text-blue-500">+{protocol.xpReward} XP</span>
                                    <span className="text-yellow-500">+{protocol.coinReward} G</span>
                                </div>

                                {viewMode === 'admin' && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(protocol)} className="p-1.5 hover:bg-white/10 rounded text-neutral-500 hover:text-white">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => actions.delete(protocol.id)} className="p-1.5 hover:bg-red-500/10 rounded text-neutral-500 hover:text-red-500">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">
                                {editingId ? 'Edit Routine' : 'New Routine'}
                            </h3>
                            <button onClick={resetForm} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Protocol Name</label>
                                <input
                                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Morning Stretch"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Frequency</label>
                                    <select
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                                        value={formData.frequency}
                                        onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="specific_days">Specific Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Time (Optional)</label>
                                    <input
                                        type="time"
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isCalendarConnected && (
                                <label className="flex items-center gap-3 cursor-pointer group p-3 bg-neutral-900/50 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.addToCalendar ? 'bg-green-500 border-green-500' : 'border-white/20 bg-black/40 group-hover:border-white/40'}`}>
                                        {formData.addToCalendar && <CheckCircle2 className="w-4 h-4 text-black" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.addToCalendar}
                                        onChange={e => setFormData({ ...formData, addToCalendar: e.target.checked })}
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${formData.addToCalendar ? 'text-green-500' : 'text-neutral-400'}`}>
                                            Sync to Google Calendar
                                        </span>
                                        <span className="text-[10px] text-neutral-600">Automatically creates recurring event</span>
                                    </div>
                                </label>
                            )}

                            {formData.frequency === 'specific_days' && (
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Active Days</label>
                                    <div className="flex justify-between gap-1">
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day.id}
                                                type="button"
                                                onClick={() => toggleDay(day.id)}
                                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${formData.specificDays.includes(day.id)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
                                                    }`}
                                            >
                                                {day.short}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">XP Reward</label>
                                    <input
                                        type="number"
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                                        value={formData.xpReward}
                                        onChange={e => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Coin Reward</label>
                                    <input
                                        type="number"
                                        className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-yellow-500 transition-colors"
                                        value={formData.coinReward}
                                        onChange={e => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-sm rounded-xl hover:bg-neutral-200 transition-all">
                                Save Routine
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyProtocol;
