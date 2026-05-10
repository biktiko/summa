import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Target, CheckCircle2, Circle, Trash2, Edit2, X, Eye, EyeOff, Calendar, TrendingUp, Save, Link as LinkIcon, ListChecks, Zap, Coins, CheckSquare, Filter, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { addEventToCalendar, createEventObject, isSignedIn, initGoogleCalendar, updateEvent, deleteEvent } from '../../core/services/googleCalendar';

const TAG_COLORS = [
    { name: 'Red', value: 'bg-red-500 text-white' },
    { name: 'Blue', value: 'bg-blue-500 text-white' },
    { name: 'Green', value: 'bg-green-500 text-white' },
    { name: 'Yellow', value: 'bg-amber-600 text-black' },
    { name: 'Purple', value: 'bg-purple-500 text-white' },
    { name: 'Pink', value: 'bg-pink-500 text-white' },
    { name: 'Orange', value: 'bg-orange-500 text-white' },
    { name: 'Gray', value: 'bg-neutral-500 text-white' },
];

const GoalsBoard = ({ goals, tasks, actions, viewMode, isSectionHidden, toggleSectionVisibility, processTask, moduleId }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '', description: '', type: 'numeric', target: 100, current: 0, unit: '%',
        deadline: '', status: 'active', isHidden: false,
        linkedTaskIds: [], linkedTaskIdsString: '', link: '', linkName: '',
        xpReward: 50, coinReward: 20, tags: [], moduleId: moduleId || 'architect'
    });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await initGoogleCalendar();
                setIsCalendarConnected(isSignedIn());
            } catch (e) {
                console.log("Calendar init failed", e);
            }
        };
        init();
    }, []);

    // Calendar init removed as it was unused in this scope or redundant


    // Filters
    const [filters, setFilters] = useState({ tags: [], status: '' });
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isTagsOpen, setIsTagsOpen] = useState(false);

    // Filter and Sort Goals
    const filteredGoals = useMemo(() => {
        let result = goals.filter(g => {
            if (moduleId && g.moduleId !== moduleId) return false;
            if (viewMode === 'guest' && g.isHidden) return false;
            if (filters.status && g.status !== filters.status) return false;
            if (filters.tags.length > 0) {
                if (!g.tags) return false;
                const goalTagTexts = g.tags.map(tag => tag.text);
                if (!filters.tags.some(filterTag => goalTagTexts.includes(filterTag))) return false;
            }
            return true;
        });

        // Sort: Active first, then Completed
        return result.sort((a, b) => {
            if (a.status === b.status) return 0;
            return a.status === 'completed' ? 1 : -1;
        });
    }, [goals, filters, viewMode, moduleId]);

    if (viewMode === 'guest' && isSectionHidden) return null;

    // Get all unique tags
    const allTags = Array.from(new Set(goals.flatMap(g => g.tags || []).map(t => t.text)));

    const handleAdd = async () => {
        if (!newGoal.title) return;

        const goalToAdd = {
            ...newGoal,
            linkedTaskIds: (newGoal.linkedTaskIdsString || '').split(',').map(s => s.trim()).filter(Boolean)
        };
        delete goalToAdd.linkedTaskIdsString;

        await actions.add(goalToAdd);

        // Sync to Calendar
        if (isCalendarConnected && newGoal.deadline) {
            try {
                const eventDate = new Date(newGoal.deadline);
                // Set to 9 AM
                eventDate.setHours(9, 0, 0, 0);

                const event = createEventObject(
                    `${newGoal.title} [Goal]`,
                    `Strategic Goal: ${newGoal.description || ''}`,
                    eventDate
                );
                await addEventToCalendar(event);
            } catch (e) {
                console.error("Failed to sync goal to calendar", e);
            }
        }

        setIsAdding(false);
        setNewGoal({
            title: '', description: '', type: 'numeric', target: 100, current: 0, unit: '%',
            deadline: '', status: 'active', isHidden: false,
            linkedTaskIds: [], linkedTaskIdsString: '', link: '', linkName: '',
            xpReward: 50, coinReward: 20, tags: [], moduleId: moduleId || 'architect'
        });
    };

    const startEdit = (goal) => {
        setEditingId(goal.id);
        setEditData({
            ...goal,
            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
            linkedTaskIdsString: goal.linkedTaskIds ? goal.linkedTaskIds.join(', ') : ''
        });
    };

    const calculateProjectedRewards = (goal) => {
        let xp = 200;
        let coins = 5;

        // Linked Tasks
        const linkedCount = (goal.linkedTaskIdsString || '').split(',').filter(Boolean).length || (goal.linkedTaskIds || []).length;
        xp += (linkedCount * 10);
        
        // Description
        if (goal.description) xp += 10;
        
        // Link
        if (goal.link) xp += 10;

        return { xp, coins };
    };

    const saveEdit = async () => {
        const { xp, coins } = calculateProjectedRewards(editData);
        const updatedData = {
            ...editData,
            xpReward: xp,
            coinReward: coins,
            linkedTaskIds: (editData.linkedTaskIdsString || '').split(',').map(s => s.trim()).filter(Boolean)
        };
        delete updatedData.linkedTaskIdsString;

        // Calendar Sync
        if (updatedData.googleEventId && isCalendarConnected) {
             try {
                if (updatedData.deadline) {
                    const eventDate = new Date(updatedData.deadline);
                    eventDate.setHours(9, 0, 0, 0);

                     const eventUpdate = createEventObject(
                        `${updatedData.title} [Goal]`,
                        `Strategic Goal: ${updatedData.description || ''}`,
                        eventDate
                    );
                    await updateEvent(updatedData.googleEventId, eventUpdate);
                }
             } catch (e) {
                 console.error("Failed to update calendar event", e);
             }
        }

        await actions.update(editingId, updatedData);
        setEditingId(null);
    };

    const deleteGoal = async (id) => {
        if (window.confirm('Delete this goal?')) {
            const goalToDelete = goals.find(g => g.id === id);
            if (goalToDelete && goalToDelete.googleEventId && isCalendarConnected) {
                 try {
                     await deleteEvent(goalToDelete.googleEventId);
                 } catch (e) {
                     console.error("Failed to delete goal calendar event", e);
                 }
            }

            await actions.delete(id);
        }
    };

    const toggleGoalCompletion = async (goal) => {
        const newStatus = goal.status === 'completed' ? 'active' : 'completed';
        const updates = { status: newStatus };

        if (newStatus === 'completed') {
             const { xp, coins } = calculateProjectedRewards(goal);
             let finalXp = xp;
             let finalCoins = coins;

             if (goal.deadline) {
                 const deadlineDate = new Date(goal.deadline);
                 deadlineDate.setHours(23, 59, 59, 999);
                 const now = new Date();
                 
                 if (now <= deadlineDate) {
                     finalXp = finalXp * 2; // +100%
                     finalCoins += 5;
                 } else {
                     finalXp = 0; // 0 XP penalty
                     finalCoins -= 5;
                 }
             }
             updates.xpReward = finalXp;
             updates.coinReward = finalCoins;

             await actions.update(goal.id, updates);
             if (processTask) processTask({ ...goal, ...updates });
        } else {
            await actions.update(goal.id, updates);
        }
    };

    const calculateProgress = (goal) => {
        if (goal.type === 'simple') return goal.status === 'completed' ? 100 : 0;
        if (goal.type === 'boolean') {
            // Legacy support for boolean type
            if (goal.linkedTaskIds && goal.linkedTaskIds.length > 0) {
                // Use loose equality to handle string/number ID mismatch
                const linkedTasks = tasks.filter(t => goal.linkedTaskIds.some(id => id == t.id));
                const completed = linkedTasks.filter(t => t.status === 'done').length;
                return (completed / goal.linkedTaskIds.length) * 100;
            }
            return goal.current >= goal.target ? 100 : 0;
        }
        return Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
    };

    const getProgressLabel = (goal) => {
        if (goal.type === 'simple') return goal.status === 'completed' ? 'Completed' : 'Pending';
        if (goal.type === 'boolean' && goal.linkedTaskIds && goal.linkedTaskIds.length > 0) {
            // Use loose equality to handle string/number ID mismatch
            const linkedTasks = tasks.filter(t => goal.linkedTaskIds.some(id => id == t.id));
            const completed = linkedTasks.filter(t => t.status === 'done').length;
            return `${completed}/${goal.linkedTaskIds.length} Tasks`;
        }
        if (goal.type === 'boolean') {
            return goal.current >= goal.target ? 'Completed' : 'Pending';
        }
        return `${Math.round(calculateProgress(goal))}% Complete`;
    };

    const addTag = () => {
        if (editData.newTagText) {
            const newTag = {
                text: editData.newTagText,
                color: editData.newTagColor || TAG_COLORS[0].value
            };
            setEditData({
                ...editData,
                tags: [...(editData.tags || []), newTag],
                newTagText: ''
            });
        }
    };

    const removeTag = (index) => {
        const newTags = [...(editData.tags || [])];
        newTags.splice(index, 1);
        setEditData({ ...editData, tags: newTags });
    };

    const toggleTagFilter = (tag) => {
        setFilters(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    return (
        <div className={`mb-12`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="hidden md:flex items-center gap-3">
                    <div className="p-2 bg-amber-600/10 rounded-lg">
                        <Target className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Strategic Goals</h2>
                        <p className="text-[10px] text-amber-600/80 font-mono uppercase tracking-widest">Long-term Objectives</p>
                    </div>

                </div>

                <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                    {/* Calendar Connect Button */}


                    {/* Filters */}
                    <div className="flex items-center gap-2 bg-white shadow-sm border border-slate-200/50 p-1 rounded-lg border border-slate-200 relative z-20">
                        <Filter className="w-3 h-3 text-slate-500 ml-2" />

                        {/* Status Filter */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsStatusOpen(!isStatusOpen); setIsTagsOpen(false); }}
                                className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                            >
                                {filters.status ? (filters.status === 'active' ? 'Active' : 'Completed') : 'All Status'}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isStatusOpen && (
                                <div className="absolute top-full left-0 mt-2 w-32 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                    <div className="p-1">
                                        <button onClick={() => { setFilters({ ...filters, status: '' }); setIsStatusOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.status === '' ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}>All Status</button>
                                        <button onClick={() => { setFilters({ ...filters, status: 'active' }); setIsStatusOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.status === 'active' ? 'bg-amber-600/20 text-amber-600' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'}`}>Active</button>
                                        <button onClick={() => { setFilters({ ...filters, status: 'completed' }); setIsStatusOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'text-slate-500 hover:text-green-400 hover:bg-slate-100'}`}>Completed</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-3 bg-slate-100 border border-slate-200" />

                        {/* Tags Filter */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsTagsOpen(!isTagsOpen); setIsStatusOpen(false); }}
                                className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                            >
                                {filters.tags.length > 0 ? `${filters.tags.length} Tags` : 'All Tags'}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isTagsOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                    <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                        {allTags.length > 0 ? allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTagFilter(tag)}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.tags.includes(tag) ? 'bg-blue-600 text-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}
                                            >
                                                <span>{tag}</span>
                                                {filters.tags.includes(tag) && <CheckCircle2 className="w-3 h-3" />}
                                            </button>
                                        )) : (
                                            <div className="text-[10px] text-slate-400 text-center py-2">No tags available</div>
                                        )}
                                    </div>
                                    {filters.tags.length > 0 && (
                                        <div className="p-1 border-t border-slate-200 bg-white shadow-sm border border-slate-200/50">
                                            <button
                                                onClick={() => setFilters({ ...filters, tags: [] })}
                                                className="w-full text-center py-1.5 text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {viewMode === 'admin' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleSectionVisibility}
                                className={`p-2 rounded-lg transition-all ${isSectionHidden ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-slate-400 hover:text-blue-600'}`}
                                title={isSectionHidden ? "Show Section" : "Hide Section"}
                            >
                                {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-black rounded-lg hover:bg-amber-600 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-900/10"
                            >
                                <Plus className="w-4 h-4" /> New Goal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Goal Form */}
            {isAdding && (
                <div className="mb-6 p-6 bg-slate-50 border border-slate-200 border border-amber-600/30 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-amber-600 uppercase">Goal Title</label>
                        <input
                            className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none"
                            value={newGoal.title}
                            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                            placeholder="e.g. 1 Million Dram Profit"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-amber-600 uppercase">Type</label>
                            <select
                                className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-xs text-slate-800 focus:border-amber-600 outline-none"
                                value={newGoal.type}
                                onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                            >
                                <option value="numeric">Numeric</option>
                                <option value="simple">Simple</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-amber-600 uppercase">Deadline</label>
                            <input
                                type="date"
                                className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-xs text-slate-800 focus:border-amber-600 outline-none"
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-amber-600 uppercase">Description</label>
                        <textarea
                            className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none min-h-[60px]"
                            value={newGoal.description}
                            onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                            placeholder="Describe your goal..."
                        />
                    </div>

                    {newGoal.type === 'numeric' && (
                        <div className="flex gap-2">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-amber-600 uppercase">Target</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none"
                                    value={newGoal.target}
                                    onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-amber-600 uppercase">Current</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none"
                                    value={newGoal.current}
                                    onChange={e => setNewGoal({ ...newGoal, current: e.target.value })}
                                />
                            </div>
                            <div className="w-16 space-y-2">
                                <label className="text-[10px] font-bold text-amber-600 uppercase">Unit</label>
                                <input
                                    className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none"
                                    value={newGoal.unit}
                                    onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                                    placeholder="%"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-amber-600 uppercase">Linked Task IDs</label>
                        <input
                            className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none"
                            value={newGoal.linkedTaskIdsString}
                            onChange={e => setNewGoal({ ...newGoal, linkedTaskIdsString: e.target.value })}
                            placeholder="e.g. 1, 2, 3"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <div className="relative">
                                <span className="absolute left-2 top-2 text-[10px] text-slate-500 font-bold">XP</span>
                                <div className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 pl-8 text-sm text-blue-400 font-bold">
                                    {calculateProjectedRewards(newGoal).xp}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-[10px] text-slate-500 font-bold">G</span>
                                <div className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 pl-8 text-sm text-amber-600 font-bold">
                                    {calculateProjectedRewards(newGoal).coins}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-amber-600 uppercase">Link Name</label>
                            <input
                                className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none"
                                value={newGoal.linkName}
                                onChange={e => setNewGoal({ ...newGoal, linkName: e.target.value })}
                                placeholder="e.g. Financial Plan"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-amber-600 uppercase">Link URL</label>
                            <input
                                className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded-lg p-2 text-sm text-slate-800 focus:border-amber-600 outline-none"
                                value={newGoal.link}
                                onChange={e => setNewGoal({ ...newGoal, link: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-blue-600">CANCEL</button>
                        <button onClick={handleAdd} className="px-6 py-2 bg-amber-600 text-black text-xs font-bold rounded-lg hover:bg-amber-600 shadow-lg shadow-amber-900/10">CREATE GOAL</button>
                    </div>
                </div>
            )}

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGoals.map(goal => {
                    const progress = calculateProgress(goal);
                    const isEditing = editingId === goal.id;
                    const isCompleted = goal.status === 'completed';

                    return (
                        <div key={goal.id} className={`group relative overflow-hidden rounded-2xl border transition-all 
                            ${isEditing ? 'border-amber-600 bg-white' :
                                isCompleted ? 'border-green-500/50 bg-green-50 hover:border-green-500' :
                                    'border-slate-200 bg-white shadow-sm border border-slate-200 hover:border-blue-500/40'} 
                            ${goal.isHidden ? 'opacity-60 border-red-900/30' : ''}`}>

                            {/* Glow Effect */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none ${isCompleted ? 'bg-green-500/10' : 'bg-amber-600/5'}`} />

                            <div className="p-6 relative z-10">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <input
                                                className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-sm font-bold text-slate-800"
                                                value={editData.title}
                                                onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                placeholder="Title"
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                 <select
                                                    className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                    value={editData.type}
                                                    onChange={e => setEditData({ ...editData, type: e.target.value })}
                                                >
                                                    <option value="numeric">Numeric</option>
                                                    <option value="simple">Simple</option>
                                                </select>
                                                <input
                                                    type="date"
                                                    className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                    value={editData.deadline}
                                                    onChange={e => setEditData({ ...editData, deadline: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <textarea
                                            className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800 min-h-[60px]"
                                            value={editData.description}
                                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                                            placeholder="Description"
                                        />

                                        {editData.type === 'numeric' && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="flex-1 bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                    value={editData.current}
                                                    onChange={e => setEditData({ ...editData, current: e.target.value })}
                                                    placeholder="Current"
                                                />
                                                <span className="text-slate-500 self-center">/</span>
                                                <input
                                                    type="number"
                                                    className="flex-1 bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                    value={editData.target}
                                                    onChange={e => setEditData({ ...editData, target: e.target.value })}
                                                    placeholder="Target"
                                                />
                                                <input
                                                    className="w-16 bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                    value={editData.unit}
                                                    onChange={e => setEditData({ ...editData, unit: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        {/* Tags Edit */}
                                        <div className="space-y-2 border-t border-slate-200 pt-2">
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {(editData.tags || []).map((tag, idx) => (
                                                    <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 ${tag.color}`}>
                                                        {tag.text}
                                                        <button onClick={() => removeTag(idx)} className="hover:text-red-200"><X className="w-2 h-2" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-1">
                                                <input
                                                    className="flex-1 bg-white shadow-sm border border-amber-600/30 rounded p-1 text-xs text-slate-800"
                                                    placeholder="New Tag"
                                                    value={editData.newTagText || ''}
                                                    onChange={e => setEditData({ ...editData, newTagText: e.target.value })}
                                                    onKeyDown={e => e.key === 'Enter' && addTag()}
                                                />
                                                <select
                                                    className="w-20 bg-white shadow-sm border border-amber-600/30 rounded p-1 text-xs text-slate-800"
                                                    value={editData.newTagColor || TAG_COLORS[0].value}
                                                    onChange={e => setEditData({ ...editData, newTagColor: e.target.value })}
                                                >
                                                    {TAG_COLORS.map(c => (
                                                        <option key={c.name} value={c.value}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <button onClick={addTag} className="p-1 bg-amber-600/20 text-amber-600 rounded hover:bg-amber-600 hover:text-blue-600"><Plus className="w-3 h-3" /></button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-amber-600 uppercase">Linked Task IDs</label>
                                                <input
                                                    className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                    value={editData.linkedTaskIdsString || ''}
                                                    onChange={e => setEditData({ ...editData, linkedTaskIdsString: e.target.value })}
                                                    placeholder="1, 2, 3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-amber-600 uppercase">XP</label>
                                                    <div className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-blue-400 font-bold">
                                                        {calculateProjectedRewards(editData).xp}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-amber-600 uppercase">Coins</label>
                                                    <div className="w-full bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-amber-600 font-bold">
                                                        {calculateProjectedRewards(editData).coins}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-2">
                                            <input
                                                className="flex-1 bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                value={editData.linkName}
                                                onChange={e => setEditData({ ...editData, linkName: e.target.value })}
                                                placeholder="Link Name"
                                            />
                                            <input
                                                className="flex-[2] bg-white border border-slate-200 shadow-md border border-amber-600/30 rounded p-2 text-xs text-slate-800"
                                                value={editData.link}
                                                onChange={e => setEditData({ ...editData, link: e.target.value })}
                                                placeholder="URL"
                                            />
                                        </div>

                                       {/* Moved Type/Deadline above */ }

                                        <div className="flex justify-between items-center pt-2">
                                            <button
                                                onClick={() => setEditData({ ...editData, isHidden: !editData.isHidden })}
                                                className={`p-1 rounded ${editData.isHidden ? 'text-red-500 bg-red-900/20' : 'text-slate-500 hover:text-blue-600'}`}
                                                title="Toggle Visibility"
                                            >
                                                {editData.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingId(null)} className="p-1 text-slate-500 hover:text-blue-600"><X className="w-4 h-4" /></button>
                                                <button onClick={saveEdit} className="p-1 text-amber-600 hover:text-amber-600"><Save className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className={`text-lg font-bold leading-tight mb-1 ${isCompleted ? 'text-green-500 line-through' : 'text-slate-800'}`}>{goal.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    {goal.deadline && (
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono uppercase">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(goal.deadline).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {goal.link && (
                                                        <a href={goal.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase transition-colors">
                                                            <LinkIcon className="w-3 h-3" />
                                                            {goal.linkName || 'Link'}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            {viewMode === 'admin' && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => toggleGoalCompletion(goal)} className={`p-1.5 rounded ${goal.status === 'completed' ? 'text-green-500 bg-green-500/10' : 'text-slate-500 hover:text-green-500 hover:bg-green-500/10'}`} title={goal.status === 'completed' ? "Mark Active" : "Mark Complete"}>
                                                        <CheckSquare className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => startEdit(goal)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"><Edit2 className="w-3 h-3" /></button>
                                                    <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            )}
                                        </div>

                                        {goal.tags && goal.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {goal.tags.map((tag, idx) => (
                                                    <span key={idx} className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${tag.color}`}>
                                                        {tag.text}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {goal.description && (
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{goal.description}</p>
                                        )}

                                        {goal.linkedTaskIds && goal.linkedTaskIds.length > 0 && (
                                            <div className="mb-4 space-y-1">
                                                <p className="text-[9px] font-bold text-amber-600 uppercase">Related Missions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {goal.linkedTaskIds.map(taskId => {
                                                        const task = tasks.find(t => t.id == taskId);
                                                        return (
                                                            <div key={taskId} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-[10px] text-slate-600 border border-slate-200">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${task?.status === 'done' ? 'bg-green-500' : 'bg-neutral-500'}`} />
                                                                <span className="max-w-[150px] truncate">{task ? task.title : `#${taskId}`}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                {goal.type === 'numeric' ? (
                                                    <div className={`text-2xl font-black tracking-tighter ${isCompleted ? 'text-green-500' : 'text-amber-600'}`}>
                                                        {goal.current.toLocaleString()} <span className={`text-xs font-bold align-top mt-1 inline-block ${isCompleted ? 'text-green-500/50' : 'text-amber-600/50'}`}>{goal.unit}</span>
                                                    </div>
                                                ) : (
                                                    <div className={`text-lg font-bold flex items-center gap-2 ${isCompleted ? 'text-green-500' : 'text-amber-600'}`}>
                                                        <ListChecks className="w-5 h-5" />
                                                        {getProgressLabel(goal)}
                                                    </div>
                                                )}

                                                <div className="flex flex-col items-end">
                                                    {goal.type === 'numeric' && (
                                                        <div className="text-xs font-bold text-slate-500 mb-1">
                                                            Target: {goal.target.toLocaleString()} {goal.unit}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        {goal.xpReward > 0 && (
                                                            <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400">
                                                                <Zap className="w-3 h-3" /> {goal.xpReward} XP
                                                            </div>
                                                        )}
                                                        {goal.coinReward > 0 && (
                                                            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600">
                                                                <Coins className="w-3 h-3" /> {goal.coinReward}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar - Only for Numeric/Boolean */}
                                            {goal.type !== 'simple' && (
                                                <>
                                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-200 relative">
                                                        <div
                                                            className={`h-full shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-1000 relative ${isCompleted ? 'bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`}
                                                            style={{ width: `${progress}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:10px_10px] opacity-30" />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 pt-1">
                                                        <span>Progress</span>
                                                        <span className={progress >= 100 ? 'text-green-500' : 'text-amber-600'}>{Math.round(progress)}% Complete</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalsBoard;
