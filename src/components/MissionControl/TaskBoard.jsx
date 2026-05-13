import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, MoreVertical, CheckCircle2, AlertCircle, Trash2, Edit2, X, Coins, Zap, ExternalLink, ChevronDown, Save, Eye, EyeOff, Archive, Filter, Calendar as CalendarIcon, Repeat, Check, Maximize2, LayoutGrid, Settings2, SlidersHorizontal, ArrowLeft, ArrowUpDown, Clock } from 'lucide-react';
import { addEventToCalendar, createEventObject, isSignedIn, initGoogleCalendar, updateEvent, deleteEvent } from '../../core/services/googleCalendar';
import { TaskCard } from './TaskCard';
import { StatusColumn } from './StatusColumn';

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

const TaskBoard = ({ tasks, actions, projectId, viewMode, processTask, isSectionHidden, toggleSectionVisibility, settings, updateUser, userXP }) => {
    const titleInputRef = useRef(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (isAdding) {
            setTimeout(() => titleInputRef.current?.focus(), 10);
        }
    }, [isAdding]);

    const checkLanguageMatch = (text, lang) => {
        if (!text || !lang || lang === 'none') return null; // 'null' means not applicable
        
        // English: Strict Latin Check (as per request "only Latin letters")
        if (lang === 'english') {
             return /^[a-zA-Z0-9\s.,!?'"-\(\)\[\]]+$/.test(text);
        }
        // Russian: Contains Cyrillic
        if (lang === 'russian') {
             return /[а-яА-Я]/.test(text);
        }
        // Armenian: Contains Armenian
        if (lang === 'armenian') {
             return /[ա-ֆԱ-Ֆ]/.test(text);
        }
        return true; // For any other language, assume it matches
    };
   
    // Filter tasks for this specific module
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem('summa_task_filters');
        try {
            return saved ? JSON.parse(saved) : { tags: [], priority: '', difficulty: '', dateStart: '', dateEnd: '', dateCreatedStart: '', dateCreatedEnd: '', search: '' };
        } catch (e) {
            return { tags: [], priority: '', difficulty: '', dateStart: '', dateEnd: '', dateCreatedStart: '', dateCreatedEnd: '', search: '' };
        }
    });
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    
    // Sort State
    const [sortConfig, setSortConfig] = useState(() => {
        const saved = localStorage.getItem('summa_task_sort');
        try {
            return saved ? JSON.parse(saved) : { key: 'createdAt', direction: 'desc' };
        } catch (e) {
            return { key: 'createdAt', direction: 'desc' };
        }
    });
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    // Display Mode State
    const [displayMode, setDisplayMode] = useState(() => {
        return localStorage.getItem('summa_task_display_mode') || 'board';
    });

    // Persist Settings
    useEffect(() => {
        localStorage.setItem('summa_task_filters', JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        localStorage.setItem('summa_task_sort', JSON.stringify(sortConfig));
    }, [sortConfig]);

    useEffect(() => {
        localStorage.setItem('summa_task_display_mode', displayMode);
    }, [displayMode]);

    // Get all unique tags from tasks (including color) - Case Insensitive
    // 1. Filter tasks by Module and Project (Context)
    const contextTasks = useMemo(() => {
        return tasks.filter(t => {
            // Project ID Filtering
            if (projectId !== undefined) {
                if (projectId === null && t.projectId) return false; // Hide project tasks from global view
                if (projectId !== null && t.projectId !== projectId) return false; // Show only tasks for this project
            }
            return true;
        });
    }, [tasks, projectId]);

    // 2. Calculate unique tags from contextTasks (including color) - Case Insensitive
    const uniqueTagsMap = useMemo(() => {
        const map = new Map();
        contextTasks.forEach(t => {
            if (t.tags) {
                t.tags.forEach(tag => {
                    if (tag.text) {
                        const lower = tag.text.toLowerCase();
                        if (!map.has(lower)) {
                            map.set(lower, { text: tag.text, color: tag.color });
                        }
                    }
                });
            }
        });
        return map;
    }, [contextTasks]);

    const suggestedTags = Array.from(uniqueTagsMap.values());
    const allTags = suggestedTags.map(t => t.text);

    // 3. Apply User Filters and Sorting to contextTasks
    const moduleTasks = useMemo(() => {
        return contextTasks.filter(t => {
            if (filters.priority && t.priority !== filters.priority) return false;
            if (filters.difficulty && t.difficulty !== filters.difficulty) return false;
            if (filters.search && !(t.title && t.title.toLowerCase().includes(filters.search.toLowerCase()))) return false;
            
            // Date Filter
            if (filters.dateStart || filters.dateEnd) {
                if (!t.deadline) return false; // If no deadline, it doesn't match a date range
                const taskDate = new Date(t.deadline).setHours(0,0,0,0);
                
                if (filters.dateStart) {
                    const startDate = new Date(filters.dateStart).setHours(0,0,0,0);
                    if (taskDate < startDate) return false;
                }
                if (filters.dateEnd) {
                    const endDate = new Date(filters.dateEnd).setHours(0,0,0,0);
                    if (taskDate > endDate) return false;
                }
            }

            if (filters.tags.length > 0) {
                if (!t.tags) return false;
                // Case insensitive tag check
                const taskTagTexts = t.tags.map(tag => tag.text.toLowerCase());
                if (!filters.tags.some(filterTag => taskTagTexts.includes(filterTag.toLowerCase()))) return false;
            }

            // Created Date Filter
            if (filters.dateCreatedStart || filters.dateCreatedEnd) {
                const createdDate = new Date(t.createdAt || t.id.slice(0, 13) / 1000 * 1000).setHours(0,0,0,0); // Fallback to ID timestamp if createdAt missing
                 if (filters.dateCreatedStart) {
                    const startDate = new Date(filters.dateCreatedStart).setHours(0,0,0,0);
                    if (createdDate < startDate) return false;
                }
                if (filters.dateCreatedEnd) {
                    const endDate = new Date(filters.dateCreatedEnd).setHours(0,0,0,0);
                    if (createdDate > endDate) return false;
                }
            }

            return true;
        }).sort((a, b) => {
            const { key, direction } = sortConfig;
            let va = a[key];
            let vb = b[key];

            // Specific Sort Logic
            if (key === 'priority') {
                const map = { high: 3, medium: 2, low: 1 };
                va = map[a.priority] || 0;
                vb = map[b.priority] || 0;
            } else if (key === 'difficulty') {
                const map = { hard: 3, medium: 2, easy: 1 };
                va = map[a.difficulty] || 0;
                vb = map[b.difficulty] || 0;
            } else if (key === 'value') {
                 // Sort by total calculated value (XP + Coins*Ratio)
                 va = (a.xpReward || 0) + (a.coinReward || 0) * 10;
                 vb = (b.xpReward || 0) + (b.coinReward || 0) * 10;
            } else if (key === 'createdAt') {
                 va = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                 vb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            }

            if (va < vb) return direction === 'asc' ? -1 : 1;
            if (va > vb) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [contextTasks, filters, sortConfig]);

    // --- Reward Calculation Logic ---
    const calculateProjectedRewards = (task) => {
        let xp = 0;
        let coins = 0;

        // Priority
        if (task.priority === 'low') { xp += 10; }
        else if (task.priority === 'medium') { xp += 20}
        else if (task.priority === 'high') { xp += 30}

        // Difficulty
        const diff = task.difficulty || 'medium';
        if (diff === 'medium') { xp += 10; coins += 1; }
        else if (diff === 'hard') { xp += 20; coins += 2; }

        // Extras
        if (task.subtasks) xp += (task.subtasks.length * 5);
        if (task.link) xp += 5;
        if (task.description) xp += 5;
        if (task.tags) xp += (task.tags.length * 2);

        // Language Bonus (Baked in)
        const primaryLanguage = settings?.primaryLanguage || 'none';
        if (primaryLanguage !== 'none' && task.title) {
             const isMatch = checkLanguageMatch(task.title, primaryLanguage);
             if (isMatch) xp += 10;
        }

        return { xp, coins };
    };

    const [newTask, setNewTask] = useState({
        title: '', status: 'todo', priority: 'low', difficulty: 'easy', description: '',
        xpReward: 10, coinReward: 5, link: '', linkName: '', isHidden: false,
        targetValue: 0, currentValue: 0, unit: '', tags: [], deadline: '',
        startTime: '', endTime: '', reminderBefore: 10, addToCalendar: true,
        subtasks: []
    });

    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);
    const [mobileColumnView, setMobileColumnView] = useState('todo'); // 'todo', 'in_progress', 'done', 'backlog'
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showDone, setShowDone] = useState(() => {
        const saved = localStorage.getItem('summa_task_show_done');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('summa_task_show_done', JSON.stringify(showDone));
    }, [showDone]);

    const handleConnectCalendar = async () => {
        try {
            await initAndSignIn();
            setIsCalendarConnected(isSignedIn());
        } catch (e) {
            console.error("Failed to connect calendar", e);
        }
    };

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

    if (viewMode === 'guest' && isSectionHidden) return null;

    const handleAdd = async () => {
        if (!newTask.title) return;

        // If user wants to sync but not signed in, trigger sign-in FIRST (direct user action)
        if (newTask.addToCalendar && newTask.deadline && !isCalendarConnected) {
            try {
                await initAndSignIn();
                if (!isSignedIn()) {
                    alert("Please connect your Google Calendar to sync this mission.");
                    return; // Don't add task if they wanted sync but didn't sign in? 
                    // Actually, let's proceed but warning.
                } else {
                    setIsCalendarConnected(true);
                }
            } catch (e) {
                console.error("Sign-in failed during add", e);
                alert("Failed to connect to Google Calendar. Task will be added without sync.");
            }
        }

        // Optimistic UI Update: Close immediately
        setIsAdding(false);
        
        // Calculate Sequential ID
        const maxSeq = tasks.reduce((max, t) => Math.max(max, t.sequenceNumber || 0), 0);
        const nextSeq = maxSeq + 1;

        const { xp, coins } = calculateProjectedRewards(newTask);

        // --- XP Reward for Adding Task (+5) ---
        if (updateUser && userXP !== undefined) {
            let xpChange = 5;
            
            // --- Language Penalty Check (-10) ---
            const primaryLanguage = settings?.primaryLanguage || 'none';
            if (primaryLanguage !== 'none') {
                const isMatch = checkLanguageMatch(newTask.title, primaryLanguage);
                if (isMatch === false) {
                    console.log(`Language Mismatch (${primaryLanguage}). deducting 10 XP.`);
                    xpChange -= 10; // Result: -5 XP total if mismatched
                }
            }
            
            await updateUser({ xp: Math.max(0, userXP + xpChange) });
        }

        const taskToAdd = { 
            ...newTask, 
            xpReward: xp, // Auto-calculated
            coinReward: coins, // Auto-calculated
            projectId,
            sequenceNumber: nextSeq,
            isSyncedToCalendar: false,
            // Use toString() to preserve local timezone context for display logic that might rely on it, 
            // or use a local-offset aware ISO string if needed. 
            // The user requested respecting their +4 timezone.
            createdAt: new Date().toString(), 
        };

        // Reset Form to Defaults (Low/Easy)
        setNewTask({
            title: '', 
            status: 'todo', 
            priority: 'low', 
            difficulty: 'easy', 
            description: '',
            xpReward: 10, 
            coinReward: 5, 
            link: '', 
            linkName: '', 
            isHidden: false,
            targetValue: 0, 
            currentValue: 0, 
            unit: '', 
            tags: [], 
            deadline: '',
            startTime: '', 
            endTime: '', 
            reminderBefore: 10, 
            addToCalendar: true,
            subtasks: []
        });

        // Background Processing
        try {
            // Sync to Calendar
            if (isCalendarConnected && taskToAdd.deadline && taskToAdd.addToCalendar) {
                try {
                    // Start with Local Date Parsing to avoid UTC shifts
                    const [y, m, d] = taskToAdd.deadline.split('-').map(Number);
                    let startDate = new Date(y, m - 1, d); // 00:00 Local Time
                    
                    let duration = 60; // Default 60 mins

                    if (taskToAdd.startTime) {
                        const [sh, sm] = taskToAdd.startTime.split(':');
                        startDate.setHours(parseInt(sh), parseInt(sm), 0, 0);

                        if (taskToAdd.endTime) {
                            const [eh, em] = taskToAdd.endTime.split(':');
                            
                            // End Date Base
                            const endDate = new Date(y, m - 1, d);
                            endDate.setHours(parseInt(eh), parseInt(em), 0, 0);
                            
                            const diffMs = endDate - startDate;
                            if (diffMs > 0) {
                                duration = Math.floor(diffMs / 60000);
                            }
                        }
                    } else {
                        // Default to 9 AM if no time
                        startDate.setHours(9, 0, 0, 0);
                    }

                    const attendees = [];

                    const richDescription = `
Mission Task: ${taskToAdd.description || 'No description'}
Priority: ${taskToAdd.priority}
Rewards: ${taskToAdd.xpReward} XP, ${taskToAdd.coinReward} Coins
Target: ${taskToAdd.targetValue > 0 ? `${taskToAdd.targetValue} ${taskToAdd.unit}` : 'N/A'}
Link: ${taskToAdd.link || 'None'}
                    `.trim();

                    const reminders = {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: parseInt(taskToAdd.reminderBefore) || 10 }
                        ]
                    };

                    const event = createEventObject(
                        `${taskToAdd.title} [Mission]`,
                        richDescription,
                        startDate,
                        duration,
                        attendees,
                        { reminders }
                    );

                    const result = await addEventToCalendar(event);
                    if (result) {
                        taskToAdd.isSyncedToCalendar = true;
                        taskToAdd.googleEventId = result.id;
                    }
                } catch (e) {
                    console.error("Failed to sync task to calendar", e);
                }
            }

            await actions.add(taskToAdd);
        } catch (e) {
            console.error("Failed to add task", e);
            // Optionally handle error, maybe toast
        }
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditData(task);
    };

    const saveEdit = async () => {
        // Recalculate base rewards on save (in case params changed)
        const { xp, coins } = calculateProjectedRewards(editData);
        let updatedData = { 
            ...editData, 
            xpReward: xp, 
            coinReward: coins 
        };

        // Handle Google Calendar Syncing during Edit
        if (isCalendarConnected) {
            try {
                // Scenario 1: User wants to sync but event doesn't exist yet
                if (updatedData.addToCalendar && updatedData.deadline && !updatedData.googleEventId) {
                    const [y, m, d] = updatedData.deadline.split('-').map(Number);
                    let startDate = new Date(y, m - 1, d);
                    let duration = 60;

                    if (updatedData.startTime) {
                        const [sh, sm] = updatedData.startTime.split(':');
                        startDate.setHours(parseInt(sh), parseInt(sm), 0, 0);
                    } else {
                        startDate.setHours(9, 0, 0, 0);
                    }

                    const richDescription = `Mission: ${updatedData.description || 'No description'}\nPriority: ${updatedData.priority}`.trim();
                    const reminders = {
                        useDefault: false,
                        overrides: [{ method: 'popup', minutes: parseInt(updatedData.reminderBefore) || 10 }]
                    };

                    const event = createEventObject(`${updatedData.title} [Mission]`, richDescription, startDate, duration, [], { reminders });
                    const result = await addEventToCalendar(event);
                    if (result) {
                        updatedData.googleEventId = result.id;
                        updatedData.isSyncedToCalendar = true;
                    }
                }
                // Scenario 2: Event exists, but user unchecked sync (Delete it)
                else if (!updatedData.addToCalendar && updatedData.googleEventId) {
                    await deleteEvent(updatedData.googleEventId);
                    updatedData.googleEventId = null;
                    updatedData.isSyncedToCalendar = false;
                }
                // Scenario 3: Event exists and still syncing (Update it)
                else if (updatedData.addToCalendar && updatedData.googleEventId && updatedData.deadline) {
                    const [y, m, d] = updatedData.deadline.split('-').map(Number);
                    let startDate = new Date(y, m - 1, d);
                    let duration = 60;

                    if (updatedData.startTime) {
                        const [sh, sm] = updatedData.startTime.split(':');
                        startDate.setHours(parseInt(sh), parseInt(sm), 0, 0);
                    } else {
                        startDate.setHours(9, 0, 0, 0);
                    }

                    const richDescription = `Mission: ${updatedData.description || 'No description'}\nPriority: ${updatedData.priority}`.trim();
                    const reminders = {
                        useDefault: false,
                        overrides: [{ method: 'popup', minutes: parseInt(updatedData.reminderBefore) || 10 }]
                    };

                    const eventUpdate = createEventObject(`${updatedData.title} [Mission]`, richDescription, startDate, duration, [], { reminders });
                    await updateEvent(updatedData.googleEventId, eventUpdate);
                }
            } catch (e) {
                console.error("Failed to sync calendar during edit", e);
            }
        }

        await actions.update(editingId, updatedData);
        setEditingId(null);
    };

    const updateStatus = async (task, newStatus) => {
        const updates = { status: newStatus };
        
        // Save completion time
        if (newStatus === 'done' && task.status !== 'done') {
            updates.completedAt = new Date().toISOString();
        } else if (newStatus !== 'done' && task.status === 'done') {
            updates.completedAt = null;
        }

        // If moving to done, apply bonus/penalty logic
        if (newStatus === 'done' && task.status !== 'done') {
            const { xp, coins } = calculateProjectedRewards(task);
            let finalXp = xp;
            let finalCoins = coins;

            if (task.deadline) {
                // Check if on time (Compare end of deadline day vs now)
                const deadlineDate = new Date(task.deadline);
                deadlineDate.setHours(23, 59, 59, 999);
                const now = new Date();
                
                if (now <= deadlineDate) {
                    finalXp = finalXp * 2; // +100%
                    finalCoins += 1;
                } else {
                    finalXp = Math.floor(finalXp / 2); // -50%
                    finalCoins -= 3;
                }
            }

            updates.xpReward = finalXp;
            updates.coinReward = finalCoins;

            // Process Rewards immediately with calculate values
             if (processTask) processTask({ ...task, ...updates });
        }

        await actions.update(task.id, updates);

        // Update Calendar if synced
        if (task.googleEventId && isCalendarConnected) {
            try {
                if (newStatus === 'done') {
                    await updateEvent(task.googleEventId, { colorId: '8' });
                } else {
                    await updateEvent(task.googleEventId, { colorId: null });
                }
            } catch (e) {
                console.error("Failed to update calendar event status", e);
            }
        }
    };

    const deleteTaskId = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) setTaskToDelete(task);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        
        const id = taskToDelete.id;

        // Check for calendar event
        if (taskToDelete.googleEventId && isCalendarConnected) {
             try {
                await deleteEvent(taskToDelete.googleEventId);
             } catch (e) {
                 console.error("Failed to delete from calendar", e);
             }
        }

        // --- Task Deletion Penalty (-10 XP) ---
        if (updateUser && userXP !== undefined) {
            await updateUser({ xp: Math.max(0, userXP - 10) });
        }

        await actions.delete(id);
        setTaskToDelete(null);
    };

    const toggleSubtask = async (task, index) => {
        if (!task.subtasks) return;
        
        const newSubtasks = [...task.subtasks];
        if (newSubtasks[index]) {
            newSubtasks[index] = { ...newSubtasks[index], completed: !newSubtasks[index].completed };
        }
        
        await actions.update(task.id, { subtasks: newSubtasks });
    };

    const toggleTagFilter = (tag) => {
        setFilters(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    // Backlog - No Pagination
    const backlogTasks = moduleTasks.filter(t => t.status === 'backlog');

    return (
        <div className={`flex flex-col`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-3">
                    {/* Header Removed as per request */}
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:flex-none">
                        <input
                            placeholder="Search..."
                            className="w-full md:w-48 bg-white shadow-sm border border-slate-200/50 border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-[10px] text-slate-800 outline-none focus:border-blue-500/50 placeholder:text-slate-400 transition-all font-mono"
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                        <Filter className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
                        {filters.search && (
                            <button 
                                onClick={() => setFilters({ ...filters, search: '' })}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* View Mode Toggle */}
                    <button
                        onClick={() => setDisplayMode(prev => prev === 'board' ? 'list' : 'board')}
                        className="p-1.5 bg-white shadow-sm border border-slate-200/50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 relative shrink-0 transition-colors"
                        title={displayMode === 'board' ? 'Switch to List View' : 'Switch to Board View'}
                    >
                        {displayMode === 'board' ? <LayoutGrid className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                    </button>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="md:hidden p-1.5 bg-white shadow-sm border border-slate-200/50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 relative shrink-0"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {(filters.difficulty || filters.priority || filters.tags.length > 0 || filters.dateStart || filters.dateEnd) && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                    </button>

                    {/* Desktop Filters (Hidden on Mobile) */}
                    <div className="hidden md:block w-full pb-2 md:pb-0">
                        <div className="flex items-center gap-2 bg-white shadow-sm border border-slate-200/50 p-1 rounded-lg border border-slate-200 w-max md:w-auto">
                            
                            {/* Difficulty Filter */}
                            <div className="relative border-r border-slate-300 pr-2 mr-2">
                                <button
                                    onClick={() => { setIsDifficultyOpen(!isDifficultyOpen); setIsPriorityOpen(false); setIsTagsOpen(false); setIsDateFilterOpen(false); }}
                                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors whitespace-nowrap"
                                >
                                    <span className="hidden md:inline">{filters.difficulty ? filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1) : 'All Levels'}</span>
                                    <span className="md:hidden">{filters.difficulty ? filters.difficulty.charAt(0).toUpperCase() : 'Lvl'}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>

                                {isDifficultyOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-32 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                        <div className="p-1">
                                            <button onClick={() => { setFilters({ ...filters, difficulty: '' }); setIsDifficultyOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.difficulty === '' ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}>All Diff.</button>
                                            <button onClick={() => { setFilters({ ...filters, difficulty: 'easy' }); setIsDifficultyOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' : 'text-slate-500 hover:text-green-400 hover:bg-slate-100'}`}>Easy</button>
                                            <button onClick={() => { setFilters({ ...filters, difficulty: 'medium' }); setIsDifficultyOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.difficulty === 'medium' ? 'bg-amber-600/20 text-amber-600' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'}`}>Medium</button>
                                            <button onClick={() => { setFilters({ ...filters, difficulty: 'hard' }); setIsDifficultyOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.difficulty === 'hard' ? 'bg-purple-500/20 text-purple-500' : 'text-slate-500 hover:text-purple-400 hover:bg-slate-100'}`}>Hard</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsTagsOpen(false); setIsDateFilterOpen(false); }}
                                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors whitespace-nowrap"
                                >
                                    <span className="hidden md:inline">{filters.priority ? filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1) : 'All Priorities'}</span>
                                    <span className="md:hidden">{filters.priority ? filters.priority.charAt(0).toUpperCase() : 'Pri'}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>

                                {isPriorityOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-32 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                        <div className="p-1">
                                            <button onClick={() => { setFilters({ ...filters, priority: '' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === '' ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}>All Priorities</button>
                                            <button onClick={() => { setFilters({ ...filters, priority: 'high' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'text-slate-500 hover:text-red-400 hover:bg-slate-100'}`}>High</button>
                                            <button onClick={() => { setFilters({ ...filters, priority: 'medium' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === 'medium' ? 'bg-amber-600/20 text-amber-600' : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'}`}>Medium</button>
                                            <button onClick={() => { setFilters({ ...filters, priority: 'low' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === 'low' ? 'bg-blue-500/20 text-blue-500' : 'text-slate-500 hover:text-blue-400 hover:bg-slate-100'}`}>Low</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-3 bg-slate-100 border border-slate-200" />

                            {/* Sort Toggle */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsSortOpen(!isSortOpen); setIsDateFilterOpen(false); setIsPriorityOpen(false); }}
                                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                                    title="Sort Tasks"
                                >
                                    <ArrowUpDown className="w-3 h-3" />
                                </button>
                                {isSortOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-40 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50 p-1">
                                        {[
                                            { id: 'priority', label: 'Priority' },
                                            { id: 'difficulty', label: 'Difficulty' },
                                            { id: 'deadline', label: 'Deadline' },
                                            { id: 'createdAt', label: 'Date Added' },
                                            { id: 'value', label: 'Reward Value' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { 
                                                    setSortConfig(prev => ({ 
                                                        key: opt.id, 
                                                        direction: prev.key === opt.id && prev.direction === 'desc' ? 'asc' : 'desc' 
                                                    })); 
                                                    setIsSortOpen(false); 
                                                }}
                                                className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors flex justify-between ${sortConfig.key === opt.id ? 'bg-blue-600 text-slate-800' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}
                                            >
                                                {opt.label}
                                                {sortConfig.key === opt.id && <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-3 bg-slate-100 border border-slate-200" />

                            {/* Tags Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsTagsOpen(!isTagsOpen); setIsPriorityOpen(false); setIsDateFilterOpen(false); }}
                                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors whitespace-nowrap"
                                >
                                    <span className="hidden md:inline">{filters.tags.length > 0 ? `${filters.tags.length} Tags` : 'All Tags'}</span>
                                    <span className="md:hidden">{filters.tags.length > 0 ? `${filters.tags.length}` : 'Tag'}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>

                                {isTagsOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                        <div className="p-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                            {allTags.map(tag => {
                                                const isSelected = filters.tags.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        onClick={() => toggleTagFilter(tag)}
                                                        className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-2 ${isSelected ? 'bg-blue-600/10 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                                                    >
                                                        <div className={`w-3 h-3 rounded border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                                            {isSelected && <Check className="w-2 h-2 text-white" />}
                                                        </div>
                                                        <span className="truncate">{tag}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Date Filter */}
                            <div className="w-px h-3 bg-slate-100 border border-slate-200" />

                            <div className="relative">
                                <button
                                    onClick={() => { setIsDateFilterOpen(!isDateFilterOpen); setIsPriorityOpen(false); setIsTagsOpen(false); }}
                                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                                    title="Filter by Date"
                                >
                                     <CalendarIcon className={`w-3 h-3 ${(filters.dateStart || filters.dateEnd || filters.dateCreatedStart || filters.dateCreatedEnd) ? 'text-blue-500' : ''}`} />
                                </button>
                                
                                {isDateFilterOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50 p-4 space-y-4">
                                        
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1">Creation Date</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[9px] text-slate-400 block mb-1">From</label>
                                                    <input 
                                                        type="date" 
                                                        value={filters.dateCreatedStart}
                                                        onChange={e => setFilters({...filters, dateCreatedStart: e.target.value})}
                                                        className="w-full bg-white shadow-sm border border-slate-200 rounded p-1.5 text-[10px] text-slate-700 outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-slate-400 block mb-1">To</label>
                                                    <input 
                                                        type="date" 
                                                        value={filters.dateCreatedEnd}
                                                        onChange={e => setFilters({...filters, dateCreatedEnd: e.target.value})}
                                                        className="w-full bg-white shadow-sm border border-slate-200 rounded p-1.5 text-[10px] text-slate-700 outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1">Deadline</h4>
                                             <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[9px] text-slate-400 block mb-1">From</label>
                                                    <input 
                                                        type="date" 
                                                        value={filters.dateStart}
                                                        onChange={e => setFilters({...filters, dateStart: e.target.value})}
                                                        className="w-full bg-white shadow-sm border border-slate-200 rounded p-1.5 text-[10px] text-slate-700 outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-slate-400 block mb-1">To</label>
                                                    <input 
                                                        type="date" 
                                                        value={filters.dateEnd}
                                                        onChange={e => setFilters({...filters, dateEnd: e.target.value})}
                                                        className="w-full bg-white shadow-sm border border-slate-200 rounded p-1.5 text-[10px] text-slate-700 outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            {(filters.dateStart || filters.dateEnd || filters.dateCreatedStart || filters.dateCreatedEnd) && (
                                                <button 
                                                    onClick={() => { setFilters({ ...filters, dateStart: '', dateEnd: '', dateCreatedStart: '', dateCreatedEnd: '' }); setIsDateFilterOpen(false); }}
                                                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider"
                                                >
                                                    <X className="w-3 h-3" /> Clear Date Filters
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Eye Toggle */}
                    {viewMode === 'admin' && (
                         <button
                            onClick={toggleSectionVisibility}
                            className={`p-2 rounded-lg ml-2 transition-all border border-slate-200 ${isSectionHidden ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-slate-400 hover:text-blue-600 bg-white shadow-sm border border-slate-200/50'}`}
                            title={isSectionHidden ? "Show Section" : "Hide Section"}
                        >
                            {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}

            {/* Header controls removed, moved inline */}
            </div>
            </div>

            {/* Add Task Input - Collapsible on Mobile */}
            <div className={`mb-2 md:mb-6 transition-all ${isAdding ? 'p-2 md:p-4' : 'p-0'}`}>
                {/* Mobile: Compact Button */}
                {!isAdding && (
                    <>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="md:hidden w-full bg-white shadow-sm border border-slate-200/30 border border-slate-300 text-slate-500 hover:text-blue-600 px-4 py-3 rounded-xl font-black uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-3 group active:scale-95 hover:bg-slate-100 hover:border-slate-300"
                        >
                            <div className="bg-blue-500/20 text-blue-500 p-1 rounded-md group-hover:bg-blue-500 group-hover:text-blue-600 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span>Create New Task</span>
                        </button>
                        
                        <div 
                            onClick={() => setIsAdding(true)} 
                            className="hidden md:flex items-center gap-3 bg-white shadow-sm border border-slate-200/50 border border-slate-200 rounded-xl p-3 text-slate-500 cursor-text hover:bg-white shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all group"
                        >
                            <div className="bg-blue-500/10 p-1 rounded group-hover:bg-blue-500/20 text-blue-500 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="font-mono text-xs uppercase tracking-wider group-hover:text-slate-600">Create new mission...</span>
                        </div>
                    </>
                )}

                {/* Desktop & Expanded Mobile: Full Form */}
                {isAdding && (
                    <div className="bg-white border border-slate-200 shadow-md backdrop-blur-md border border-slate-300 rounded-xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative z-10">
                        {/* Header: Title & Main Actions */}
                        <div className="flex gap-3 mb-4 items-start">
                            <div className="relative flex-1 group">
                                <input
                                    ref={titleInputRef}
                                    placeholder="Enter mission objectives..."
                                    className="w-full bg-white border border-slate-200 shadow-md border border-slate-300 rounded-xl pl-4 pr-12 py-3 text-sm md:text-base text-slate-800 focus:border-blue-500 focus:bg-white/80 outline-none font-bold tracking-wide transition-all shadow-inner"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                />
                                <button
                                    onClick={handleAdd}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
                                    title="Add Mission"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={() => setIsAdding(false)}
                                className="p-3 bg-slate-50 hover:bg-slate-200 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 transition-all"
                                title="Cancel"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Compact Settings Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <select
                                className="bg-white shadow-sm border border-slate-300 rounded-lg px-2 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono uppercase h-9"
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                            >
                                <option value="low">Pri: Low</option>
                                <option value="medium">Pri: Normal</option>
                                <option value="high">Pri: Critical</option>
                            </select>
                            <select
                                className="bg-white shadow-sm border border-slate-300 rounded-lg px-2 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono uppercase h-9"
                                value={newTask.difficulty}
                                onChange={e => setNewTask({ ...newTask, difficulty: e.target.value })}
                            >
                                <option value="easy">Diff: Easy</option>
                                <option value="medium">Diff: Medium</option>
                                <option value="hard">Diff: Hard</option>
                            </select>
                        </div>

                        {/* Progress Tracking Fields */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <input
                                type="number"
                                placeholder="Target"
                                className="bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono"
                                value={newTask.targetValue || ''}
                                onChange={e => setNewTask({ ...newTask, targetValue: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            />
                            <input
                                type="number"
                                placeholder="Current"
                                className="bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono"
                                value={newTask.currentValue || ''}
                                onChange={e => setNewTask({ ...newTask, currentValue: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            />
                            <input
                                placeholder="Unit (e.g. pages)"
                                className="bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono"
                                value={newTask.unit}
                                onChange={e => setNewTask({ ...newTask, unit: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            />
                        </div>

                        {/* Description & Additional Info */}
                        <div className="space-y-3">
                            <textarea
                                placeholder="Task Description (Optional)"
                                className="w-full bg-white shadow-sm border border-slate-300 rounded-lg p-3 text-xs text-slate-600 focus:border-blue-500/50 outline-none min-h-[60px] font-mono resize-none"
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                            />
                            
                            {/* Deadlines & Time */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deadline Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono uppercase"
                                        value={newTask.deadline}
                                        onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Time (Optional)</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono uppercase"
                                        value={newTask.startTime}
                                        onChange={e => setNewTask({ ...newTask, startTime: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    />
                                </div>
                            </div>

                            {/* Google Calendar Sync Options */}
                            {isCalendarConnected ? (
                                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Google Calendar Sync</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={newTask.addToCalendar}
                                                onChange={e => setNewTask({ ...newTask, addToCalendar: e.target.checked })}
                                            />
                                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {newTask.addToCalendar && (
                                        <div className="flex items-center gap-3 pt-1 border-t border-blue-100/50">
                                            <div className="flex-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-blue-400" />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">Remind me before:</span>
                                            </div>
                                            <select
                                                className="bg-white border border-blue-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 outline-none focus:border-blue-500 h-7"
                                                value={newTask.reminderBefore}
                                                onChange={e => setNewTask({ ...newTask, reminderBefore: parseInt(e.target.value) })}
                                            >
                                                <option value="5">5 mins</option>
                                                <option value="10">10 mins</option>
                                                <option value="15">15 mins</option>
                                                <option value="30">30 mins</option>
                                                <option value="60">1 hour</option>
                                                <option value="1440">1 day</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleConnectCalendar}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-all group"
                                >
                                    <CalendarIcon className="w-3.5 h-3.5 group-hover:animate-bounce" />
                                    Connect Google Calendar to enable sync
                                </button>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                                <input
                                    placeholder="Link URL (Optional)"
                                    className="bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono"
                                    value={newTask.link}
                                    onChange={e => setNewTask({ ...newTask, link: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                />
                            </div>

                             {/* Tags Selection in Creation */}
                             <div className="space-y-2 pt-2 border-t border-slate-200">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                                
                                {/* Quick Add Tags */}
                                {suggestedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {suggestedTags.filter(t => !(newTask.tags || []).some(nt => nt.text.toLowerCase() === t.text.toLowerCase())).map(tag => (
                                            <button
                                                key={tag.text}
                                                onClick={() => setNewTask({
                                                    ...newTask,
                                                    tags: [...newTask.tags, { text: tag.text, color: tag.color }]
                                                })}
                                                className={`text-[9px] px-2 py-1 rounded border border-slate-300 hover:border-white/30 transition-all ${tag.color} opacity-80 hover:opacity-100 flex items-center gap-1`}
                                            >
                                                {tag.text} <Plus className="w-2 h-2" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-1 mb-2">
                                    {newTask.tags.map((tag, idx) => (
                                        <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${tag.color}`}>
                                            {tag.text}
                                            <button onClick={() => {
                                                const newTags = [...newTask.tags];
                                                newTags.splice(idx, 1);
                                                setNewTask({ ...newTask, tags: newTags });
                                            }} className="hover:text-red-200"><X className="w-2 h-2" /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-1" onKeyDown={e => e.stopPropagation()}>
                                    <input
                                        className="flex-1 bg-white shadow-sm border border-slate-300 rounded px-2 py-1 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none"
                                        placeholder="New Tag..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.target.value) {
                                                const tagText = e.target.value.trim();
                                                 if (tagText) {
                                                    const existingColor = uniqueTagsMap[tagText] || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value;
                                                    setNewTask({
                                                        ...newTask,
                                                        tags: [...newTask.tags, { text: tagText, color: existingColor }]
                                                    });
                                                    e.target.value = '';
                                                }
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {/* Simple Subtasks */}
                            <div className="space-y-2">
                                <input
                                    placeholder="Add subtask (Press Enter)..."
                                    className="w-full bg-white shadow-sm border border-slate-300 rounded-lg px-3 py-2 text-[10px] text-slate-800 focus:border-blue-500/50 outline-none font-mono"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && e.target.value) {
                                            setNewTask({
                                                ...newTask,
                                                subtasks: [...(newTask.subtasks || []), { text: e.target.value, completed: false }]
                                            });
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                {newTask.subtasks?.length > 0 && (
                                    <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                                        {newTask.subtasks.map((st, i) => (
                                            <div key={i} className="text-[10px] text-slate-500 flex items-center justify-between group/st">
                                                <span>— {st.text}</span>
                                                <button onClick={() => {
                                                    const newSt = [...newTask.subtasks];
                                                    newSt.splice(i, 1);
                                                    setNewTask({ ...newTask, subtasks: newSt });
                                                }} className="opacity-0 group-hover/st:opacity-100 hover:text-red-500 transition-opacity"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>                )}
            </div>

            {/* Board Columns - Mobile Navigation & Desktop Grid */}
            <div className="flex-1 pb-4 mb-8">
                {/* Mobile View Selector */}
                <div className="md:hidden flex items-center bg-white/20 p-1 rounded-xl border border-slate-200 mb-4">
                    {['todo', 'in_progress', 'done'].map(status => {
                        const isActive = mobileColumnView === status;
                        const count = moduleTasks.filter(t => t.status === status).length;
                        const config = {
                            todo: { label: 'To Do', color: 'bg-blue-500' },
                            in_progress: { label: 'Active', color: 'bg-amber-600' },
                            done: { label: 'Done', color: 'bg-green-500' }
                        };
                        const theme = config[status];
                        
                        return (
                            <button
                                key={status}
                                onClick={() => setMobileColumnView(status)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all relative ${isActive ? 'bg-slate-50 text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-600'}`}
                            >
                                <div className="flex items-center gap-1.5">
                                    {isActive && <div className={`w-1.5 h-1.5 rounded-full ${theme.color} shadow-[0_0_5px_rgba(255,255,255,0.5)]`} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{theme.label}</span>
                                </div>
                                <span className={`text-[10px] font-mono leading-none opacity-60`}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="hidden md:flex justify-end mb-3">
                    <button 
                        onClick={() => setShowDone(!showDone)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showDone ? 'bg-green-50 text-green-600 border border-green-200/50 hover:bg-green-100' : 'bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        {showDone ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showDone ? 'Hide Done' : 'Show Done'}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {(() => {
                        const hasInProgress = moduleTasks.some(t => t.status === 'in_progress');
                        let todoSpan = 1;
                        if (!showDone && !hasInProgress) todoSpan = 3;
                        else if (!showDone && hasInProgress) todoSpan = 2;
                        else if (showDone && !hasInProgress) todoSpan = 2;
                        else todoSpan = 1;

                        return (
                            <>
                                {/* To Do Column */}
                                <div className={`${mobileColumnView === 'todo' ? 'block' : 'hidden'} md:block ${todoSpan === 3 ? 'flex-[3]' : todoSpan === 2 ? 'flex-[2]' : 'flex-1'} transition-all`}>
                                    <StatusColumn
                                        title="To Do"
                                        status="todo"
                                        color="blue"
                                        moduleTasks={moduleTasks}
                                        viewMode={viewMode}
                                        displayMode={displayMode}
                                        editingId={editingId}
                                        editData={editData}
                                        setEditData={setEditData}
                                        startEdit={startEdit}
                                        saveEdit={saveEdit}
                                        setEditingId={setEditingId}
                                        updateStatus={updateStatus}
                                        deleteTaskId={deleteTaskId}
                                        toggleSubtask={toggleSubtask}
                                        settings={settings}
                                        suggestedTags={suggestedTags}
                                        isCalendarConnected={isCalendarConnected}
                                        span={todoSpan}
                                    />
                                </div>

                                {/* In Progress Column */}
                                {hasInProgress && (
                                    <div className={`${mobileColumnView === 'in_progress' ? 'block' : 'hidden'} md:block flex-1 transition-all`}>
                                         <StatusColumn
                                            title="In Progress"
                                            status="in_progress"
                                            color="yellow"
                                            moduleTasks={moduleTasks}
                                            viewMode={viewMode}
                                            displayMode={displayMode}
                                            editingId={editingId}
                                            editData={editData}
                                            setEditData={setEditData}
                                            startEdit={startEdit}
                                            saveEdit={saveEdit}
                                            setEditingId={setEditingId}
                                            updateStatus={updateStatus}
                                            deleteTaskId={deleteTaskId}
                                            toggleSubtask={toggleSubtask}
                                            settings={settings}
                                            suggestedTags={suggestedTags}
                                            isCalendarConnected={isCalendarConnected}
                                        />
                                    </div>
                                )}

                                {/* Done Column */}
                                {showDone && (
                                    <div className={`${mobileColumnView === 'done' ? 'block' : 'hidden'} md:block flex-1 transition-all`}>
                                        <StatusColumn
                                            title="Done"
                                            status="done"
                                            color="green"
                                            moduleTasks={moduleTasks}
                                            viewMode={viewMode}
                                            displayMode={displayMode}
                                            editingId={editingId}
                                            editData={editData}
                                            setEditData={setEditData}
                                            startEdit={startEdit}
                                            saveEdit={saveEdit}
                                            setEditingId={setEditingId}
                                            updateStatus={updateStatus}
                                            deleteTaskId={deleteTaskId}
                                            toggleSubtask={toggleSubtask}
                                            settings={settings}
                                            suggestedTags={suggestedTags}
                                            isCalendarConnected={isCalendarConnected}
                                        />
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Backlog Section */}
            <div className="border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Archive className="w-5 h-5 text-slate-500" />
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Backlog</h3>
                        <span className="text-[10px] font-mono text-slate-400">{backlogTasks.length} Tasks</span>
                        {viewMode === 'admin' && (
                            <button
                                onClick={() => {
                                    setNewTask(prev => ({ ...prev, status: 'backlog' }));
                                    setIsAdding(true);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="ml-4 flex items-center gap-1 px-2 py-1 bg-slate-200 text-slate-600 rounded hover:bg-neutral-700 transition-all text-[10px] font-bold uppercase tracking-wider"
                            >
                                <Plus className="w-3 h-3" /> Add Mission
                            </button>
                        )}
                    </div>
                </div>

                <div className={`grid gap-4 ${displayMode === 'list' ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {backlogTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            viewMode={viewMode}
                            displayMode={displayMode}
                            editingId={editingId}
                            editData={editData}
                            setEditData={setEditData}
                            startEdit={startEdit}
                            saveEdit={saveEdit}
                            setEditingId={setEditingId}
                            updateStatus={updateStatus}
                            deleteTaskId={deleteTaskId}
                            toggleSubtask={toggleSubtask}
                            settings={settings}
                            suggestedTags={suggestedTags}
                            isCalendarConnected={isCalendarConnected}
                        />
                    ))}

                    {backlogTasks.length === 0 && (
                        <div className="col-span-full py-8 text-center border border-dashed border-slate-200 rounded-xl">
                            <p className="text-xs text-slate-400">No tasks in backlog.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Filter Drawer */}
            {isMobileFiltersOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-white border border-slate-200 shadow-md backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute bottom-0 left-0 right-0 bg-white shadow-xl border border-slate-200 border-t border-slate-300 rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800">Filters</h3>
                            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {/* Difficulty */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500 font-bold uppercase tracking-widest">Difficulty</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['easy', 'medium', 'hard'].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => setFilters({ ...filters, difficulty: filters.difficulty === lvl ? '' : lvl })}
                                            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                                filters.difficulty === lvl 
                                                ? (lvl === 'easy' ? 'bg-green-500/20 border-green-500 text-green-500' : lvl === 'medium' ? 'bg-amber-600/20 border-amber-600 text-amber-600' : 'bg-purple-500/20 border-purple-500 text-purple-500')
                                                : 'bg-white shadow-sm border border-slate-200 border-slate-200 text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500 font-bold uppercase tracking-widest">Priority</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['low', 'medium', 'high'].map(pri => (
                                        <button
                                            key={pri}
                                            onClick={() => setFilters({ ...filters, priority: filters.priority === pri ? '' : pri })}
                                            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                                filters.priority === pri 
                                                ? (pri === 'low' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : pri === 'medium' ? 'bg-amber-600/20 border-amber-600 text-amber-600' : 'bg-red-500/20 border-red-500 text-red-500')
                                                : 'bg-white shadow-sm border border-slate-200 border-slate-200 text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {pri}
                                        </button>
                                    ))}
                                </div>
                            </div>

                             {/* Tags */}
                             <div className="space-y-1.5">
                                <label className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tags</label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                                    {allTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTagFilter(tag)}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${
                                                filters.tags.includes(tag) 
                                                ? 'bg-blue-600 border-blue-500 text-slate-800' 
                                                : 'bg-white shadow-sm border border-slate-200 border-slate-200 text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {tag}
                                            {filters.tags.includes(tag) && <CheckCircle2 className="w-3 h-3" />}
                                        </button>
                                    ))}
                                    {allTags.length === 0 && <span className="text-slate-400 text-[10px italic">No tags found.</span>}
                                </div>
                             </div>

                             {/* Date Range */}
                             <div className="space-y-1.5">
                                <label className="text-xs text-slate-500 font-bold uppercase tracking-widest">Date Range</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">From</span>
                                        <input 
                                            type="date"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-lg px-3 py-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                                            value={filters.dateStart}
                                            onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                         <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">To</span>
                                         <input 
                                            type="date"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-lg px-3 py-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                                            value={filters.dateEnd}
                                            onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                                        />
                                    </div>
                                </div>
                             </div>

                             {/* Actions */}
                             <div className="pt-4 flex items-center gap-3 sticky bottom-0 bg-white shadow-xl border border-slate-200 pb-2 border-t border-slate-200 mt-4">
                                <button 
                                    onClick={() => { setFilters({ ...filters, tags: [], priority: '', difficulty: '', dateStart: '', dateEnd: '' }); }}
                                    className="flex-1 py-3 bg-slate-200 text-slate-500 font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-700 transition-all text-xs"
                                >
                                    Reset
                                </button>
                                <button 
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="flex-[2] py-3 bg-blue-600 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-blue-500 transition-all text-xs shadow-lg shadow-blue-500/20"
                                >
                                    View {moduleTasks.length} Results
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {taskToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setTaskToDelete(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Delete Mission?</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Are you sure you want to delete <span className="font-bold text-slate-700">"{taskToDelete.title}"</span>? 
                                <br/>
                                <span className="text-[10px] text-red-400 font-bold uppercase mt-2 block">Penalty: -10 XP</span>
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setTaskToDelete(null)}
                                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/30 transition-all active:scale-95"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoard;
