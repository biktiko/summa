import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Calendar, Repeat, Plus, Trash2, Edit2, X, AlertCircle, Eye, EyeOff, Zap, Coins, Calendar as CalendarIcon } from 'lucide-react';
import { addEventToCalendar, createEventObject, isSignedIn, signInToGoogle, initGoogleCalendar, getUserProfile, updateEvent, deleteEvent } from '../../core/services/googleCalendar';
import ConfirmationModal from '../Common/ConfirmationModal';

const DailyProtocol = ({ protocols, actions, moduleId, viewMode, processTask, isSectionHidden, toggleSectionVisibility, settings }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [itemToDelete, setItemToDelete] = useState(null);

    // Filter protocols for this specific module
    const moduleProtocols = React.useMemo(() => 
        protocols ? protocols.filter(p => {
            if (moduleId && p.moduleId !== moduleId) return false;
            return true;
        }) : [], 
        [protocols, moduleId]
    );

    const [formData, setFormData] = useState({
        title: '',
        frequency: 'daily',
        specificDays: [], 
        time: '',
        xpReward: 10,
        coinReward: 5,
        description: '',
        addToCalendar: true
    });

    const checkLanguageMatch = (text, lang) => {
        if (!text || !lang || lang === 'none') return null;
        if (lang === 'english') return /^[a-zA-Z0-9\s.,!?'"-\(\)\[\]]+$/.test(text);
        if (lang === 'russian') return /[а-яА-Я]/.test(text);
        if (lang === 'armenian') return /[\u0530-\u058F]/.test(text);
        return null;
    };

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
        const init = async () => {
            try {
                await initGoogleCalendar();
                const signedIn = isSignedIn();
                setIsCalendarConnected(signedIn);
                if (signedIn) {
                    const profile = await getUserProfile();
                    if (profile && profile.email) setUserEmail(profile.email);
                }
            } catch (e) {
                console.log("Calendar init failed", e);
            }
        };
        init();
    }, []);

    const connectCalendar = async () => {
        try {
            await signInToGoogle();
            setIsCalendarConnected(true);
            const profile = await getUserProfile();
            if (profile && profile.email) setUserEmail(profile.email);
        } catch (e) {
            console.error("Sign in failed", e);
        }
    };

    // Reset logic check
    useEffect(() => {
        const checkResets = async () => {
            const today = new Date().toISOString().split('T')[0];

            for (const p of moduleProtocols) {
                if (p.isCompleted && p.lastCompletedDate !== today) {
                    let shouldReset = false;
                    if (p.frequency === 'daily') shouldReset = true;
                    else if (p.frequency === 'weekly') {
                        const lastDate = new Date(p.lastCompletedDate);
                        const diffTime = Math.abs(new Date() - lastDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays >= 7) shouldReset = true;
                    }
                    if (shouldReset) await actions.update(p.id, { isCompleted: false });
                }
            }
        };

        if (viewMode === 'admin') checkResets();
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
            // Edit Mode
            const existingProtocol = moduleProtocols.find(p => p.id === editingId);
            if (existingProtocol && existingProtocol.googleEventId && isCalendarConnected) {
                 try {
                    const today = new Date();
                    let updateTime = today;
                    if (formData.time) {
                        const [hours, minutes] = formData.time.split(':');
                        updateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    }
                     const eventUpdate = createEventObject(
                        `${formData.title} [Routine]`,
                        `Routine: ${formData.description || ''}\nFrequency: ${formData.frequency}`,
                        updateTime,
                        30
                    );
                    await updateEvent(existingProtocol.googleEventId, eventUpdate);
                 } catch (e) {
                     console.error("Failed to update routine calendar event", e);
                 }
            }
            await actions.update(editingId, data);
        } else {
            // Add Mode - Fix Double Creation
            let googleEventId = null;
            if (isCalendarConnected && formData.time && formData.addToCalendar) {
                 try {
                    const today = new Date();
                    const [hours, minutes] = formData.time.split(':');
                    today.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    let recurrence = [];
                    if (formData.frequency === 'daily') recurrence.push('RRULE:FREQ=DAILY');
                    else if (formData.frequency === 'weekly') recurrence.push('RRULE:FREQ=WEEKLY');
                    else if (formData.frequency === 'monthly') recurrence.push('RRULE:FREQ=MONTHLY');
                    else if (formData.frequency === 'specific_days' && formData.specificDays.length > 0) {
                        const daysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
                        const byDay = formData.specificDays.map(d => daysMap[d]).join(',');
                        recurrence.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
                    }

                    const event = createEventObject(
                        `${formData.title} [Routine]`,
                        `Routine: ${formData.description || ''}\nFrequency: ${formData.frequency}`,
                        today,
                        30, 
                        [],
                        { recurrence }
                    );
                    
                    const eventResult = await addEventToCalendar(event);
                    if (eventResult) googleEventId = eventResult.id;
                 } catch (e) {
                      console.error("Calendar Sync Error", e);
                 }
            }
            // Single Action Call
            await actions.add({ ...data, googleEventId });
        }

        resetForm();
    };

    const handleDelete = async (id) => {
        const protocol = moduleProtocols.find(p => p.id === id);
        if (protocol && protocol.googleEventId && isCalendarConnected) {
            try {
                await deleteEvent(protocol.googleEventId);
            } catch (e) {
                console.error("Failed to delete routine event", e);
            }
        }
        await actions.delete(id);
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
        if (protocol.isCompleted) return;

        const today = new Date().toISOString().split('T')[0];
        const newStreak = (protocol.streak || 0) + 1;

        // --- Improved Reward Logic ---
        // Formula: 5 + (Streak - 1). Hard Cap Base at 30.
        let xp = 5 + Math.max(0, newStreak - 1);
        if (xp > 30) xp = 30;

        // Language Bonus (+5)
        const primaryLanguage = settings?.primaryLanguage || 'none';
        if (primaryLanguage !== 'none') {
            const isMatch = checkLanguageMatch(protocol.title, primaryLanguage);
            if (isMatch) xp += 5; // Max becomes 35
        }

        // Coins Formula: Every 7th day -> Coins = Streak / 7 (Max 4)
        let coins = 0;
        if (newStreak > 0 && newStreak % 7 === 0) {
            coins = Math.min(4, Math.floor(newStreak / 7));
        }

        await actions.update(protocol.id, {
            isCompleted: true,
            lastCompletedDate: today,
            streak: newStreak
        });

        if (processTask) {
            await processTask({
                xpReward: xp,
                coinReward: coins
            });
        }
    };

    if (isSectionHidden && viewMode !== 'admin') return null;

    return (
        <div className={`h-full flex flex-col`}>
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                {/* Header Section */}
                <div className="hidden md:block">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider">🔄 Routines</h3>
                    <p className="text-xs text-slate-500 font-mono">Daily Operations & Habits</p>
                </div>
                 {viewMode === 'admin' && (
                     <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto max-w-full pb-1">
                         {/* Calendar Buttons ... (Keep existing) */}
                         {!isCalendarConnected ? (
                             <button onClick={connectCalendar} className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-500 hover:text-blue-600 rounded-lg transition-colors" title="Connect Google Calendar"><CalendarIcon className="w-4 h-4" /></button>
                         ) : (
                             <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg group transition-all hover:bg-green-500/20"><CalendarIcon className="w-3 h-3 text-green-500" /><span className="text-[10px] font-bold text-green-500 uppercase tracking-wider group-hover:underline">Open Calendar</span></a>
                         )}
                         {toggleSectionVisibility && (
                             <button onClick={toggleSectionVisibility} className={`p-2 rounded-lg transition-colors ${isSectionHidden ? 'bg-red-500/20 text-red-500' : 'bg-slate-50 text-slate-500 hover:text-blue-600'}`}>{isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                         )}
                         <button onClick={() => { resetForm(); setIsAdding(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"><Plus className="w-3 h-3" /> Add Routine</button>
                    </div>
                )}
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {moduleProtocols.length === 0 && !isAdding && (
                    <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl">
                        <p className="text-slate-500 text-sm">No active protocols initialized.</p>
                    </div>
                )}

                {moduleProtocols.map(protocol => (
                    <div
                        key={protocol.id}
                        className={`group relative p-3 rounded-2xl border transition-all ${protocol.isCompleted
                            ? 'bg-emerald-900/10 border-emerald-500/20'
                            : 'bg-white shadow-sm border border-slate-200/40 border-slate-200 hover:border-blue-500/30'
                            }`}
                    >
                         <div className="flex items-center gap-4">
                             {/* Check Button */}
                             <button
                                onClick={() => handleComplete(protocol)}
                                disabled={protocol.isCompleted || viewMode === 'guest'}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${protocol.isCompleted
                                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : 'bg-white shadow-sm border border-neutral-700 hover:border-blue-500 text-slate-500 hover:text-blue-500'
                                    }`}
                            >
                                <CheckCircle2 className="w-6 h-6" />
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className={`font-bold text-base truncate ${protocol.isCompleted ? 'text-emerald-500' : 'text-slate-700'}`}>
                                    {protocol.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                    <Repeat className="w-3 h-3" />
                                    <span>
                                        {protocol.frequency === 'specific_days'
                                            ? protocol.specificDays.map(d => daysOfWeek[d].short).join(',')
                                            : protocol.frequency}
                                    </span>
                                    {protocol.time && <span className="text-blue-500 ml-1">@ {protocol.time}</span>}
                                </div>
                            </div>

                            {/* Stats & Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                                
                                {/* Streak */}
                                <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-2xl drop-shadow-md">🔥</span>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-sm font-black text-amber-600">{protocol.streak || 0}</span>
                                        <span className="text-[7px] font-bold text-yellow-600 uppercase tracking-tighter">Day Streak</span>
                                    </div>
                                </div>
                                
                                {/* Divider */}
                                <div className="w-px h-8 bg-slate-50 mx-1 hidden sm:block" />

                                {/* XP Reward */}
                                <div className="text-xs font-black text-blue-500 tabular-nums bg-blue-500/10 px-2 py-1 rounded hidden sm:block">
                                    +{5 + Math.max(0, (protocol.streak || 0))} XP
                                </div>
                                {/* Mobile XP (Compact) */}
                                <div className="text-[10px] font-bold text-blue-500 sm:hidden">
                                     +{5 + Math.max(0, (protocol.streak || 0))} XP
                                </div>


                                {viewMode === 'admin' && (
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity ml-2 absolute top-2 right-2 md:static">
                                        <button onClick={() => startEdit(protocol)} className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => setItemToDelete(protocol.id)} className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-500">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-3xl shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                                {editingId ? 'Edit Routine' : 'New Routine'}
                            </h3>
                            <button onClick={resetForm} className="text-slate-500 hover:text-blue-600"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Routine Name</label>
                                <input
                                    className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Morning Stretch"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Frequency</label>
                                    <select
                                        className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors"
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
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Time (Optional)</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isCalendarConnected && (
                                <label className="flex items-center gap-3 cursor-pointer group p-3 bg-white shadow-sm border border-slate-200/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.addToCalendar ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white shadow-sm group-hover:border-white/40'}`}>
                                        {formData.addToCalendar && <CheckCircle2 className="w-4 h-4 text-black" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.addToCalendar}
                                        onChange={e => setFormData({ ...formData, addToCalendar: e.target.checked })}
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${formData.addToCalendar ? 'text-green-500' : 'text-slate-500'}`}>
                                            Sync to Google Calendar
                                        </span>
                                        <span className="text-[10px] text-slate-400">Automatically creates recurring event</span>
                                    </div>
                                </label>
                            )}

                            {formData.frequency === 'specific_days' && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Active Days</label>
                                    <div className="flex justify-between gap-1">
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day.id}
                                                type="button"
                                                onClick={() => toggleDay(day.id)}
                                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${formData.specificDays.includes(day.id)
                                                    ? 'bg-blue-600 text-slate-800'
                                                    : 'bg-white shadow-sm border border-slate-200 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {day.short}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-white shadow-sm border border-slate-200/50 rounded-xl border border-slate-200 text-center">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rewards are automatically calculated based on streak & frequency.</p>
                                <div className="flex justify-center gap-4 mt-2">
                                    <span className="text-xs font-bold text-blue-500 flex items-center gap-1"><Zap className="w-3 h-3" /> Auto XP</span>
                                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><Coins className="w-3 h-3" /> Auto Coins</span>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-sm rounded-xl hover:bg-neutral-200 transition-all">
                                Save Routine
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => handleDelete(itemToDelete)}
                title="Delete Routine"
                message="Are you sure you want to delete this routine? This action cannot be undone and will remove all streak data."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default DailyProtocol;
