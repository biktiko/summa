import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, Clock, CheckCircle2, Circle, AlertCircle, Trash2, Edit2, X, Coins, Zap, ExternalLink, ChevronDown, Save, Eye, EyeOff, Archive, Filter, Calendar as CalendarIcon, Repeat, Check } from 'lucide-react';
import { addEventToCalendar, createEventObject, isSignedIn, signInToGoogle, initGoogleCalendar, updateEvent, getUserProfile, deleteEvent } from '../../core/services/googleCalendar';

const TAG_COLORS = [
    { name: 'Red', value: 'bg-red-500 text-white' },
    { name: 'Blue', value: 'bg-blue-500 text-white' },
    { name: 'Green', value: 'bg-green-500 text-white' },
    { name: 'Yellow', value: 'bg-yellow-500 text-black' },
    { name: 'Purple', value: 'bg-purple-500 text-white' },
    { name: 'Pink', value: 'bg-pink-500 text-white' },
    { name: 'Orange', value: 'bg-orange-500 text-white' },
    { name: 'Gray', value: 'bg-neutral-500 text-white' },
];

// Extract TaskCard outside to prevent re-renders and focus loss
const TaskCard = ({ task, viewMode, editingId, editData, setEditData, startEdit, saveEdit, setEditingId, updateStatus, deleteTaskId, toggleSubtask, settings }) => {
    // Skip hidden tasks for guests
    if (viewMode === 'guest' && task.isHidden) return null;

    const calculateProgress = (current, target) => {
        if (!target) return 0;
        return Math.min(100, Math.max(0, (current / target) * 100));
    };

    const progress = calculateProgress(task.currentValue, task.targetValue);

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

    return (
        <div className={`group bg-black/40 border border-white/5 p-4 rounded-xl hover:border-blue-500/30 transition-all relative ${task.isHidden ? 'opacity-60 border-red-900/30' : ''}`}>
            {editingId === task.id ? (
                <div className="space-y-4 z-10 relative bg-neutral-900/90 p-4 rounded-lg border border-blue-500/30 max-w-[85vw] md:max-w-none overflow-x-hidden">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Task Title</label>
                        <input
                            className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-sm font-bold text-white outline-none focus:border-blue-500"
                            value={editData.title}
                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Module</label>
                            <select
                                className="w-full bg-black/40 border border-blue-500/30 rounded px-2 text-[11px] text-white outline-none focus:border-blue-500 h-9"
                                value={editData.moduleId}
                                onChange={e => setEditData({ ...editData, moduleId: e.target.value })}
                            >
                                <option value="architect">Career</option>
                                <option value="finance">Finance</option>
                                <option value="health">Health</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-end">
                            <div className="space-y-1 col-span-2 md:col-span-1">
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1 block">Priority</label>
                                <select
                                    className="w-full bg-black/40 border border-blue-500/30 rounded px-2 text-[11px] text-white outline-none focus:border-blue-500 h-9"
                                    value={editData.priority}
                                    onChange={e => setEditData({ ...editData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            {(!settings || settings.xp !== false) && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-center block">XP Reward</label>
                                    <input
                                        className="w-full bg-black/40 border border-blue-500/30 rounded text-center px-1 text-[11px] text-blue-400 outline-none focus:border-blue-500 h-9"
                                        placeholder="0"
                                        type="number"
                                        value={editData.xpReward}
                                        onChange={e => setEditData({ ...editData, xpReward: e.target.value })}
                                    />
                                </div>
                            )}

                            {(!settings || settings.coins !== false) && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-center block">Coin Reward</label>
                                    <input
                                        className="w-full bg-black/40 border border-blue-500/30 rounded text-center px-1 text-[11px] text-yellow-400 outline-none focus:border-blue-500 h-9"
                                        placeholder="0"
                                        type="number"
                                        value={editData.coinReward}
                                        onChange={e => setEditData({ ...editData, coinReward: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="col-span-2 md:col-span-3 space-y-1">
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Task Deadline</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/40 border border-blue-500/30 rounded px-3 text-[11px] text-white outline-none focus:border-blue-500 h-9"
                                    value={editData.deadline || ''}
                                    onChange={e => setEditData({ ...editData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tags Edit */}
                    <div className="space-y-2 border-t border-white/5 pt-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Tags</label>
                        <div className="flex flex-wrap gap-1 mb-1">
                            {(editData.tags || []).map((tag, idx) => (
                                <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 ${tag.color}`}>
                                    {tag.text}
                                    <button onClick={() => removeTag(idx)} className="hover:text-red-200"><X className="w-2 h-2" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                placeholder="New Tag"
                                value={editData.newTagText || ''}
                                onChange={e => setEditData({ ...editData, newTagText: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && addTag()}
                            />
                            <select
                                className="w-24 bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                value={editData.newTagColor || TAG_COLORS[0].value}
                                onChange={e => setEditData({ ...editData, newTagColor: e.target.value })}
                            >
                                {TAG_COLORS.map(c => (
                                    <option key={c.name} value={c.value}>{c.name}</option>
                                ))}
                            </select>
                            <button onClick={addTag} className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-all"><Plus className="w-3 h-3" /></button>
                        </div>
                    </div>

                    {/* Subtasks Edit */}
                    <div className="space-y-2 border-t border-white/5 pt-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Subtasks</label>
                        <div className="space-y-2">
                            {(editData.subtasks || []).map((subtask, idx) => (
                                <div key={subtask.id || idx} className="flex items-center gap-2">
                                     <button
                                        onClick={() => {
                                            const newSubtasks = [...(editData.subtasks || [])];
                                            newSubtasks[idx] = { ...subtask, completed: !subtask.completed };
                                            setEditData({ ...editData, subtasks: newSubtasks });
                                        }}
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${subtask.completed ? 'bg-blue-500 border-blue-500' : 'border-neutral-600'}`}
                                     >
                                         {subtask.completed && <Check className="w-2.5 h-2.5 text-black" />}
                                     </button>
                                     <input
                                        className="flex-1 bg-transparent text-xs text-white outline-none border-b border-white/10 focus:border-blue-500/50 pb-0.5"
                                        value={subtask.text}
                                        onChange={(e) => {
                                            const newSubtasks = [...(editData.subtasks || [])];
                                            newSubtasks[idx] = { ...subtask, text: e.target.value };
                                            setEditData({ ...editData, subtasks: newSubtasks });
                                        }}
                                     />
                                     <button
                                        onClick={() => {
                                            const newSubtasks = [...(editData.subtasks || [])];
                                            newSubtasks.splice(idx, 1);
                                            setEditData({ ...editData, subtasks: newSubtasks });
                                        }}
                                        className="text-neutral-500 hover:text-red-500"
                                     >
                                        <X className="w-3 h-3" />
                                     </button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Plus className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                                <input
                                    className="flex-1 bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                    placeholder="Add subtask..."
                                    value={editData.newSubtaskText || ''}
                                    onChange={e => setEditData({ ...editData, newSubtaskText: e.target.value })}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && editData.newSubtaskText) {
                                            const newSubtask = {
                                                id: Date.now().toString(),
                                                text: editData.newSubtaskText,
                                                completed: false
                                            };
                                            setEditData({
                                                ...editData,
                                                subtasks: [...(editData.subtasks || []), newSubtask],
                                                newSubtaskText: ''
                                            });
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                         if (editData.newSubtaskText) {
                                            const newSubtask = {
                                                id: Date.now().toString(),
                                                text: editData.newSubtaskText,
                                                completed: false
                                            };
                                            setEditData({
                                                ...editData,
                                                subtasks: [...(editData.subtasks || []), newSubtask],
                                                newSubtaskText: ''
                                            });
                                        }
                                    }}
                                    className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-all"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Fields */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Progress Tracking</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                             <input
                                type="number"
                                className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                placeholder="Current"
                                value={editData.currentValue}
                                onChange={e => setEditData({ ...editData, currentValue: e.target.value })}
                            />
                            <input
                                type="number"
                                className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                placeholder="Target"
                                value={editData.targetValue}
                                onChange={e => setEditData({ ...editData, targetValue: e.target.value })}
                            />
                            <input
                                className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                placeholder="Unit"
                                value={editData.unit}
                                onChange={e => setEditData({ ...editData, unit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link URL</label>
                            <input
                                className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-blue-400 outline-none focus:border-blue-500"
                                placeholder="https://..."
                                value={editData.link || ''}
                                onChange={e => setEditData({ ...editData, link: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link Name</label>
                            <input
                                className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-blue-400 outline-none focus:border-blue-500"
                                placeholder="Display Name"
                                value={editData.linkName || ''}
                                onChange={e => setEditData({ ...editData, linkName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-neutral-300 min-h-[80px] outline-none focus:border-blue-500"
                            value={editData.description}
                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                        <button
                            onClick={() => setEditData({ ...editData, isHidden: !editData.isHidden })}
                            className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${editData.isHidden ? 'text-red-500 bg-red-900/20 shadow-inner' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                            title="Toggle Visibility"
                        >
                            {editData.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {editData.isHidden ? 'Hidden' : 'Visible'}
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:text-white uppercase">Cancel</button>
                            <button onClick={saveEdit} className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold text-xs uppercase hover:bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                <Save className="w-3 h-3" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-neutral-600 uppercase mb-1">#{task.id}</span>
                            <h4 className="text-sm font-bold text-neutral-200 leading-tight pr-6">{task.title}</h4>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    </div>

                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map((tag, idx) => (
                                <span key={idx} className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${tag.color}`}>
                                    {tag.text}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-[10px] text-neutral-500 line-clamp-2 mb-3">{task.description}</p>

                    {/* Subtasks List */}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-1 mb-3 pt-2 border-t border-white/5">
                             <div className="flex items-center justify-between mb-1.5 opacity-60">
                                <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider">Subtasks</span>
                                <span className="text-[8px] font-mono text-neutral-500">
                                    {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                                </span>
                             </div>
                             <div className="space-y-1.5">
                                {task.subtasks.map((subtask, idx) => (
                                    <button
                                        key={subtask.id || idx}
                                        onClick={(e) => { e.stopPropagation(); toggleSubtask(task, subtask.id); }}
                                        className="w-full flex items-start gap-2 text-left group/sub"
                                    >
                                        <div className={`mt-0.5 w-3 h-3 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${subtask.completed ? 'bg-blue-500 border-blue-500' : 'border-neutral-700 bg-black/40 group-hover/sub:border-neutral-500'}`}>
                                            {subtask.completed && <Check className="w-2 h-2 text-black" />} 
                                        </div>
                                        <span className={`text-[10px] leading-tight transition-all ${subtask.completed ? 'text-neutral-600 line-through' : 'text-neutral-300 group-hover/sub:text-white'}`}>
                                            {subtask.text}
                                        </span>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* Progress Bar for Tasks */}
                    {task.targetValue > 0 && (
                        <div className="mb-3">
                            <div className="flex justify-between text-[9px] font-bold text-neutral-400 mb-1">
                                <span>Progress</span>
                                <span>{task.currentValue} / {task.targetValue} {task.unit}</span>
                            </div>
                            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                        <div className="flex items-center gap-3">
                            {task.xpReward > 0 && (!settings || settings.xp !== false) && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400">
                                    <Zap className="w-3 h-3" /> {task.xpReward} XP
                                </div>
                            )}
                            {task.coinReward > 0 && (!settings || settings.coins !== false) && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-yellow-400">
                                    <Coins className="w-3 h-3" /> {task.coinReward}
                                </div>
                            )}
                        </div>

                        {task.link && task.link !== '#' && (
                            <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-white transition-colors flex items-center gap-1 text-[9px] font-bold uppercase">
                                <ExternalLink className="w-3 h-3" /> {task.linkName || 'Link'}
                            </a>
                        )}

                        {task.isSyncedToCalendar && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" title="Synced to Google Calendar">
                                <CalendarIcon className="w-3 h-3" /> <span className="hidden sm:inline">GCal</span>
                            </div>
                        )}
                    </div>

                    {/* Status Change Dropdown - Improved UX */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {viewMode === 'admin' ? (
                            <div className="relative group/menu">
                                <button className="p-1 text-neutral-500 hover:text-white bg-black/60 rounded">
                                    <MoreVertical className="w-3 h-3" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 hidden group-hover/menu:block hover:block">
                                    <div className="p-1 space-y-0.5">
                                        <button onClick={() => updateStatus(task, 'todo')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-neutral-400 hover:text-white rounded">To Do</button>
                                        <button onClick={() => updateStatus(task, 'in_progress')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-neutral-400 hover:text-white rounded">In Progress</button>
                                        <button onClick={() => updateStatus(task, 'done')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-neutral-400 hover:text-white rounded">Done</button>
                                        <button onClick={() => updateStatus(task, 'backlog')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-neutral-400 hover:text-white rounded">Backlog</button>
                                        <div className="h-px bg-white/10 my-1" />
                                        <button onClick={() => startEdit(task)} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-blue-400 hover:text-blue-300 rounded flex items-center gap-2"><Edit2 className="w-3 h-3" /> Edit</button>
                                        <button onClick={() => deleteTaskId(task.id)} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-red-400 hover:text-red-300 rounded flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
                                    </div>
                                </div>
                                {/* Invisible bridge to prevent menu closing */}
                                <div className="absolute right-0 top-full h-2 w-full bg-transparent group-hover/menu:block hidden" />
                            </div>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
};

const StatusColumn = ({ title, status, color, moduleTasks, viewMode, editingId, editData, setEditData, startEdit, saveEdit, setEditingId, updateStatus, deleteTaskId, toggleSubtask, settings }) => {
    const [page, setPage] = useState(0);
    const TASKS_PER_PAGE = 6;

    const filteredTasks = moduleTasks.filter(t => t.status === status);
    const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
    const visibleTasks = filteredTasks.slice(page * TASKS_PER_PAGE, (page + 1) * TASKS_PER_PAGE);

    return (
        <div className="flex-1 min-w-[300px] bg-neutral-900/20 rounded-2xl p-4 border border-white/5 flex flex-col min-h-[500px]">
            <div className={`flex items-center justify-between mb-4 pb-2 border-b border-${color}-500/20`}>
                <h3 className={`text-xs font-black uppercase tracking-widest text-${color}-500`}>{title}</h3>
                <span className="text-[10px] font-mono text-neutral-500">{filteredTasks.length}</span>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {visibleTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        viewMode={viewMode}
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
                    />
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="p-1 rounded bg-neutral-900 text-neutral-500 disabled:opacity-30 hover:text-white"
                    >
                        &lt;
                    </button>
                    <span className="text-[10px] text-neutral-500">Page {page + 1} of {totalPages}</span>
                    <button
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page === totalPages - 1}
                        className="p-1 rounded bg-neutral-900 text-neutral-500 disabled:opacity-30 hover:text-white"
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
};

const TaskBoard = ({ tasks, actions, moduleId, viewMode, processTask, isSectionHidden, toggleSectionVisibility, settings }) => {
    // Filter tasks for this specific module
    const [filters, setFilters] = useState({ tags: [], priority: '' });
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isTagsOpen, setIsTagsOpen] = useState(false);

    // Get all unique tags from tasks
    const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || []).map(t => t.text)));

    const moduleTasks = tasks.filter(t => {
        if (t.moduleId !== moduleId) return false;
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.tags.length > 0) {
            if (!t.tags) return false;
            // Check if task has ANY of the selected tags
            const taskTagTexts = t.tags.map(tag => tag.text);
            if (!filters.tags.some(filterTag => taskTagTexts.includes(filterTag))) return false;
        }
        return true;
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '', status: 'todo', priority: 'medium', description: '',
        xpReward: 10, coinReward: 5, link: '', linkName: '', isHidden: false,
        targetValue: 0, currentValue: 0, unit: '', tags: [], deadline: '',
        startTime: '', endTime: '', reminderBefore: 10, addToCalendar: true,
        subtasks: []
    });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [guestEmail, setGuestEmail] = useState(localStorage.getItem('calendar_guest_email') || '');

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
            alert("Failed to connect Google Calendar.");
        }
    };

    const handleGuestEmailChange = (e) => {
        const email = e.target.value;
        setGuestEmail(email);
        localStorage.setItem('calendar_guest_email', email);
    };

    if (viewMode === 'guest' && isSectionHidden) return null;

    const handleAdd = async () => {
        if (!newTask.title) return;

        let syncedToCalendar = false;

        // Sync to Calendar
        if (isCalendarConnected && newTask.deadline && newTask.addToCalendar) {
            try {
                // Parse date
                let startDate = new Date(newTask.deadline);
                let duration = 60; // Default 60 mins

                if (newTask.startTime) {
                    const [sh, sm] = newTask.startTime.split(':');
                    startDate.setHours(parseInt(sh), parseInt(sm), 0, 0);

                    if (newTask.endTime) {
                        const [eh, em] = newTask.endTime.split(':');
                        const endDate = new Date(newTask.deadline);
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

                const attendees = guestEmail ? [guestEmail] : [];

                const richDescription = `
Mission Task: ${newTask.description || 'No description'}
Priority: ${newTask.priority}
Rewards: ${newTask.xpReward} XP, ${newTask.coinReward} Coins
Target: ${newTask.targetValue > 0 ? `${newTask.targetValue} ${newTask.unit}` : 'N/A'}
Link: ${newTask.link || 'None'}
                `.trim();

                const reminders = {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: parseInt(newTask.reminderBefore) || 10 }
                    ]
                };

                const event = createEventObject(
                    `${newTask.title} [Mission]`,
                    richDescription,
                    startDate,
                    duration,
                    attendees,
                    { reminders }
                );

                const result = await addEventToCalendar(event);
                if (result) {
                    syncedToCalendar = true;
                    // Sync ID to task
                    await actions.add({ ...newTask, moduleId, isSyncedToCalendar: true, googleEventId: result.id });
                    setIsAdding(false);
                    setNewTask({
                        title: '', status: 'todo', priority: 'medium', description: '',
                        xpReward: 10, coinReward: 5, link: '', linkName: '', isHidden: false,
                        targetValue: 0, currentValue: 0, unit: '', tags: [], deadline: '',
                        startTime: '', endTime: '', reminderBefore: 10, addToCalendar: true
                    });
                    return; // Return early as we handled the add
                }
            } catch (e) {
                console.error("Failed to sync task to calendar", e);
            }
        }

        await actions.add({ ...newTask, moduleId, isSyncedToCalendar: syncedToCalendar });

        setIsAdding(false);
        setNewTask({
            title: '', status: 'todo', priority: 'medium', description: '',
            xpReward: 10, coinReward: 5, link: '', linkName: '', isHidden: false,
            targetValue: 0, currentValue: 0, unit: '', tags: [], deadline: '',
            startTime: '', endTime: '', reminderBefore: 10, addToCalendar: true
        });
    };

    const handleAddBacklog = async () => {
        if (!newTask.title) return;
        await actions.add({ ...newTask, moduleId, status: 'backlog' });
        setIsAdding(false);
        setNewTask({
            title: '', status: 'todo', priority: 'medium', description: '',
            xpReward: 10, coinReward: 5, link: '', linkName: '', isHidden: false,
            targetValue: 0, currentValue: 0, unit: '', tags: [], deadline: ''
        });
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditData(task);
    };

    const saveEdit = async () => {
        // Update Calendar if synced
        if (editData.googleEventId && isCalendarConnected) {
            try {
                // Parse date for update
                let startDate;
                let duration = 60;

                if (editData.deadline) {
                     startDate = new Date(editData.deadline);
                     if (editData.startTime) {
                        const [sh, sm] = editData.startTime.split(':');
                        startDate.setHours(parseInt(sh), parseInt(sm), 0, 0);

                        if (editData.endTime) {
                            const [eh, em] = editData.endTime.split(':');
                            const endDate = new Date(editData.deadline);
                            endDate.setHours(parseInt(eh), parseInt(em), 0, 0);
                            const diffMs = endDate - startDate;
                            if (diffMs > 0) duration = Math.floor(diffMs / 60000);
                        }
                     } else {
                         // Default 9 AM
                         startDate.setHours(9, 0, 0, 0);
                     }

                     const richDescription = `
Mission Task: ${editData.description || 'No description'}
Priority: ${editData.priority}
Rewards: ${editData.xpReward} XP, ${editData.coinReward} Coins
Target: ${editData.targetValue > 0 ? `${editData.targetValue} ${editData.unit}` : 'N/A'}
Link: ${editData.link || 'None'}
                     `.trim();

                     const eventUpdate = createEventObject(
                         `${editData.title} [Mission]`,
                         richDescription,
                         startDate,
                         duration
                     );

                     await updateEvent(editData.googleEventId, eventUpdate);
                }
            } catch (e) {
                console.error("Failed to update calendar event", e);
            }
        }

        await actions.update(editingId, editData);
        setEditingId(null);
    };

    const updateStatus = async (task, newStatus) => {
        await actions.update(task.id, { status: newStatus });

        // Update Calendar if synced
        if (task.googleEventId && isCalendarConnected) {
            try {
                if (newStatus === 'done') {
                    // Mark as "Graphite" (8) to signify done, or maybe checkmark in title?
                    // Let's verify if we should change color. 
                    await updateEvent(task.googleEventId, { colorId: '8' });
                } else {
                    // Revert color if moved back? (Default usually null or '1'?)
                    // Let's set it to default (remove colorId) or a standard one.
                    await updateEvent(task.googleEventId, { colorId: null });
                }
            } catch (e) {
                console.error("Failed to update calendar event status", e);
            }
        }

        // If moving to done, trigger rewards
        if (newStatus === 'done' && task.status !== 'done') {
            // We pass the task object to processTask which handles rewards
            if (processTask) processTask(task);
        }
    };

    const deleteTaskId = async (id) => {
        // Check for calendar event
        const taskToDelete = tasks.find(t => t.id === id);
        if (taskToDelete && taskToDelete.googleEventId && isCalendarConnected) {
             try {
                await deleteEvent(taskToDelete.googleEventId);
             } catch (e) {
                 console.error("Failed to delete from calendar", e);
             }
        }

        await actions.delete(id);
    };

    const toggleSubtask = async (task, subtaskId) => {
        if (!task.subtasks) return;
        
        const newSubtasks = task.subtasks.map(st => {
            if (st.id === subtaskId) {
                return { ...st, completed: !st.completed };
            }
            return st;
        });
        
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
        <div className={`flex flex-col ${isSectionHidden ? 'opacity-50' : ''}`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Mission Control</h2>
                    {viewMode === 'admin' && isSectionHidden && (
                        <span className="text-[9px] font-bold text-red-500 uppercase border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Hidden Section</span>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                    {/* Calendar Connect Button */}
                    {viewMode === 'admin' && (
                        <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-lg border border-white/5">
                            {!isCalendarConnected ? (
                                <button
                                    onClick={connectCalendar}
                                    className="p-2 text-neutral-400 hover:text-white transition-colors"
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
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider group-hover:underline">Open Calendar</span>
                                        {userEmail && <span className="text-[8px] text-neutral-500 hidden sm:inline">{userEmail}</span>}
                                    </div>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-lg border border-white/5 relative z-20">
                        <Filter className="w-3 h-3 text-neutral-500 ml-2" />

                        {/* Priority Filter */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsTagsOpen(false); }}
                                className="flex items-center gap-1 text-[10px] text-neutral-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                            >
                                {filters.priority ? filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1) : 'All Priorities'}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isPriorityOpen && (
                                <div className="absolute top-full left-0 mt-2 w-32 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                    <div className="p-1">
                                        <button onClick={() => { setFilters({ ...filters, priority: '' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === '' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>All Priorities</button>
                                        <button onClick={() => { setFilters({ ...filters, priority: 'high' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'text-neutral-400 hover:text-red-400 hover:bg-white/5'}`}>High</button>
                                        <button onClick={() => { setFilters({ ...filters, priority: 'medium' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'text-neutral-400 hover:text-yellow-400 hover:bg-white/5'}`}>Medium</button>
                                        <button onClick={() => { setFilters({ ...filters, priority: 'low' }); setIsPriorityOpen(false); }} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.priority === 'low' ? 'bg-blue-500/20 text-blue-500' : 'text-neutral-400 hover:text-blue-400 hover:bg-white/5'}`}>Low</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-3 bg-white/10" />

                        {/* Tags Filter */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsTagsOpen(!isTagsOpen); setIsPriorityOpen(false); }}
                                className="flex items-center gap-1 text-[10px] text-neutral-300 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                            >
                                {filters.tags.length > 0 ? `${filters.tags.length} Tags` : 'All Tags'}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isTagsOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                                    <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                        {allTags.length > 0 ? allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTagFilter(tag)}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${filters.tags.includes(tag) ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <span>{tag}</span>
                                                {filters.tags.includes(tag) && <CheckCircle2 className="w-3 h-3" />}
                                            </button>
                                        )) : (
                                            <div className="text-[10px] text-neutral-600 text-center py-2">No tags available</div>
                                        )}
                                    </div>
                                    {filters.tags.length > 0 && (
                                        <div className="p-1 border-t border-white/5 bg-neutral-900/50">
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
                                className={`p-2 rounded-lg transition-all ${isSectionHidden ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-neutral-600 hover:text-white'}`}
                                title={isSectionHidden ? "Show Section" : "Hide Section"}
                            >
                                {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    setNewTask(prev => ({ ...prev, status: 'todo' }));
                                    setIsAdding(!isAdding);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20"
                            >
                                <Plus className="w-4 h-4" /> New Task
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Task Form */}
            {
                isAdding && (
                    <div className="mb-6 p-4 bg-neutral-900/50 border border-blue-500/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Task Title</label>
                            <input
                                placeholder="e.g. Complete System Integration"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3 animate-in fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-end">
                                <div className="space-y-1 col-span-2 md:col-span-1">
                                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1 block">Priority</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 text-[11px] text-white focus:border-blue-500/50 outline-none h-9"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                {(!settings || settings.xp !== false) && (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-center block">XP Reward</label>
                                        <input
                                            placeholder="10"
                                            type="number"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 text-center text-[11px] text-white focus:border-blue-500/50 outline-none h-9"
                                            value={newTask.xpReward}
                                            onChange={e => setNewTask({ ...newTask, xpReward: e.target.value })}
                                        />
                                    </div>
                                )}

                                {(!settings || settings.coins !== false) && (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-center block">Coin Reward</label>
                                        <input
                                            placeholder="5"
                                            type="number"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 text-center text-[11px] text-white focus:border-blue-500/50 outline-none h-9"
                                            value={newTask.coinReward}
                                            onChange={e => setNewTask({ ...newTask, coinReward: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Task Deadline</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 text-[11px] text-white focus:border-blue-500/50 outline-none h-9"
                                    value={newTask.deadline}
                                    onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Time & Reminders (Only if Date selected) */}
                        {newTask.deadline && (
                            <div className="space-y-3 animate-in fade-in">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                            value={newTask.startTime || ''}
                                            onChange={e => setNewTask({ ...newTask, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                            value={newTask.endTime || ''}
                                            onChange={e => setNewTask({ ...newTask, endTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Reminder</label>
                                        <select
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                            value={newTask.reminderBefore}
                                            onChange={e => setNewTask({ ...newTask, reminderBefore: e.target.value })}
                                        >
                                            <option value="10">10m Before</option>
                                            <option value="30">30m Before</option>
                                            <option value="60">1h Before</option>
                                            <option value="1440">1d Before</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Add to Calendar Checkbox */}
                                {isCalendarConnected && (
                                    <label className="flex items-center gap-2 cursor-pointer group pt-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${newTask.addToCalendar ? 'bg-green-500 border-green-500' : 'border-white/20 bg-black/40 group-hover:border-white/40'}`}>
                                            {newTask.addToCalendar && <CheckCircle2 className="w-3 h-3 text-black" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={newTask.addToCalendar}
                                            onChange={e => setNewTask({ ...newTask, addToCalendar: e.target.checked })}
                                        />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${newTask.addToCalendar ? 'text-green-500' : 'text-neutral-500'}`}>
                                            Sync with Google Calendar
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Subtasks in Create Form */}
                        <div className="space-y-2 border-t border-white/5 pt-2">
                             <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Subtasks</label>
                             <div className="space-y-2">
                                {(newTask.subtasks || []).map((subtask, idx) => (
                                    <div key={subtask.id || idx} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-neutral-600 flex items-center justify-center flex-shrink-0">
                                            {subtask.completed && <Check className="w-2.5 h-2.5 text-neutral-500" />}
                                        </div>
                                         <input
                                            className="flex-1 bg-transparent text-xs text-white outline-none border-b border-white/10 focus:border-blue-500/50 pb-0.5"
                                            value={subtask.text}
                                            onChange={(e) => {
                                                const newSubtasks = [...(newTask.subtasks || [])];
                                                newSubtasks[idx] = { ...subtask, text: e.target.value };
                                                setNewTask({ ...newTask, subtasks: newSubtasks });
                                            }}
                                         />
                                         <button
                                            onClick={() => {
                                                const newSubtasks = [...(newTask.subtasks || [])];
                                                newSubtasks.splice(idx, 1);
                                                setNewTask({ ...newTask, subtasks: newSubtasks });
                                            }}
                                            className="text-neutral-500 hover:text-red-500"
                                         >
                                            <X className="w-3 h-3" />
                                         </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <Plus className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                                    <input
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500/50"
                                        placeholder="Add subtask..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.target.value) {
                                                const newSubtask = {
                                                    id: Date.now().toString(),
                                                    text: e.target.value,
                                                    completed: false
                                                };
                                                setNewTask({
                                                    ...newTask,
                                                    subtasks: [...(newTask.subtasks || []), newSubtask]
                                                });
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                             </div>
                        </div>

                        {/* Progress Fields for New Task - Using Grid to fix Unit overflow */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Target Value</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                    placeholder="e.g. 5"
                                    value={newTask.targetValue}
                                    onChange={e => setNewTask({ ...newTask, targetValue: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Unit</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                    placeholder="e.g. pages"
                                    value={newTask.unit}
                                    onChange={e => setNewTask({ ...newTask, unit: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="space-y-1 flex-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link URL</label>
                                <input
                                    placeholder="https://..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                    value={newTask.link}
                                    onChange={e => setNewTask({ ...newTask, link: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1 w-1/3">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link Name</label>
                                <input
                                    placeholder="e.g. Figma"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                    value={newTask.linkName}
                                    onChange={e => setNewTask({ ...newTask, linkName: e.target.value })}
                                />
                            </div>
                        </div>
                        <textarea
                            placeholder="Description"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-neutral-400 focus:border-blue-500/50 outline-none min-h-[60px]"
                            value={newTask.description}
                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-neutral-500 hover:text-white">Cancel</button>
                            <button onClick={handleAddBacklog} className="px-3 py-1 bg-neutral-700 text-white text-xs font-bold rounded hover:bg-neutral-600">Add to Backlog</button>
                            <button onClick={handleAdd} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500">Add to Board</button>
                        </div>
                    </div>
                )
            }

            {/* Board Columns */}
            <div className="flex-1 pb-4 mb-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <StatusColumn
                        title="To Do"
                        status="todo"
                        color="blue"
                        moduleTasks={moduleTasks}
                        viewMode={viewMode}
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
                    />
                    <StatusColumn
                        title="In Progress"
                        status="in_progress"
                        color="yellow"
                        moduleTasks={moduleTasks}
                        viewMode={viewMode}
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
                    />
                    <StatusColumn
                        title="Done"
                        status="done"
                        color="green"
                        moduleTasks={moduleTasks}
                        viewMode={viewMode}
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
                    />
                </div>
            </div>

            {/* Backlog Section */}
            <div className="border-t border-white/5 pt-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Archive className="w-5 h-5 text-neutral-500" />
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Backlog</h3>
                        <span className="text-[10px] font-mono text-neutral-600">{backlogTasks.length} Tasks</span>
                        {viewMode === 'admin' && (
                            <button
                                onClick={() => {
                                    setNewTask(prev => ({ ...prev, status: 'backlog' }));
                                    setIsAdding(true);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="ml-4 flex items-center gap-1 px-2 py-1 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700 transition-all text-[10px] font-bold uppercase tracking-wider"
                            >
                                <Plus className="w-3 h-3" /> Add Mission
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {backlogTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            viewMode={viewMode}
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
                        />
                    ))}

                    {backlogTasks.length === 0 && (
                        <div className="col-span-full py-8 text-center border border-dashed border-white/5 rounded-xl">
                            <p className="text-xs text-neutral-600">No tasks in backlog.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default TaskBoard;
