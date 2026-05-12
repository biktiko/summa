import React, { useState } from 'react';
import { Plus, MoreVertical, CheckCircle2, Circle, Trash2, Edit2, X, Eye, EyeOff, Save, Check, Calendar, Coins, Zap, ExternalLink } from 'lucide-react';
import { TaskDetailsModal } from './TaskDetailsModal';
import { TaskEditModal } from './TaskEditModal';

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

export const TaskCard = ({ task, viewMode, displayMode, editingId, editData, setEditData, startEdit, saveEdit, setEditingId, updateStatus, deleteTaskId, toggleSubtask, settings, suggestedTags, index, isCalendarConnected }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Skip hidden tasks for guests
    if (viewMode === 'guest' && task.isHidden) return null;

    const calculateProgress = (current, target) => {
        if (!target) return 0;
        return Math.min(100, Math.max(0, (current / target) * 100));
    };

    const progress = calculateProgress(task.currentValue, task.targetValue);
    
    const formatCompletionTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (isToday) return timeStr;
        
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')} ${timeStr}`;
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



    return (
        <>
        <div 
            onClick={() => { if (editingId !== task.id) setIsDetailsOpen(true); }}
            className={`group bg-white shadow-sm border border-slate-200 rounded-xl hover:border-blue-500/30 transition-all relative cursor-pointer ${task.isHidden ? 'opacity-60 border-red-900/30' : ''} ${displayMode === 'list' && editingId !== task.id ? 'p-1.5 md:p-2' : 'p-2 md:p-4'}`}
        >
            {editingId === task.id ? (
                <TaskEditModal 
                    task={task}
                    editData={editData}
                    setEditData={setEditData}
                    saveEdit={saveEdit}
                    setEditingId={setEditingId}
                    suggestedTags={suggestedTags}
                    isCalendarConnected={isCalendarConnected}
                />
            ) : displayMode === 'list' ? (
                <div className="flex items-center justify-between w-full h-8 md:h-10 px-1 md:px-2">
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                        {task.status !== 'done' ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); updateStatus(task, 'done'); }}
                                className="w-5 h-5 rounded border border-slate-300 hover:border-blue-500 flex items-center justify-center text-transparent hover:text-blue-500 transition-all shrink-0 bg-white"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                        ) : (
                             <button 
                                onClick={(e) => { e.stopPropagation(); updateStatus(task, 'todo'); }}
                                className="w-5 h-5 rounded bg-blue-500 border border-blue-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                        )}
                        <h4 className={`text-xs md:text-sm font-bold truncate transition-all flex-1 ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700 hover:text-blue-600'}`}>{task.title}</h4>
                        
                        {task.status === 'done' && task.completedAt && (
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">
                                {formatCompletionTime(task.completedAt)}
                            </span>
                        )}
                        {task.priority === 'high' && task.status !== 'done' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="High Priority" />
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); startEdit(task); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTaskId(task.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col relative w-full">
                        {/* Mobile Header: ID & Actions */}
                        {/* Explicitly separate row for ID and Actions to ensure Title has full width below */}
                        <div className="flex md:hidden items-center justify-between w-full mb-3 z-10 relative">
                             <span className="text-[9px] font-mono text-slate-400 uppercase">#{task.sequenceNumber || (index !== undefined ? index + 1 : (task.id || '').slice(0, 4))}</span>
                             
                             <div className="flex items-center gap-1">
                                {task.status !== 'done' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); updateStatus(task, 'done'); }}
                                        className="p-1.5 text-green-500 bg-slate-50 rounded-lg border border-green-500/20 active:scale-95 transition-transform"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); startEdit(task); }}
                                    className="p-1.5 text-blue-500 bg-slate-50 rounded-lg border border-blue-500/20 active:scale-95 transition-transform"
                                    title="Edit Task"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <div className="relative group/mobile-menu">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="p-1.5 text-slate-500 bg-slate-50 rounded-lg border border-slate-300 active:scale-95 transition-transform"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-lg shadow-xl overflow-hidden z-20 hidden group-hover/mobile-menu:block">
                                        <div className="p-1 space-y-0.5">
                                            {task.status !== 'todo' && <button onClick={(e) => { e.stopPropagation(); updateStatus(task, 'todo'); }} className="w-full text-left px-2 py-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded">To Do</button>}
                                            {task.status !== 'in_progress' && <button onClick={(e) => { e.stopPropagation(); updateStatus(task, 'in_progress'); }} className="w-full text-left px-2 py-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded">In Progress</button>}
                                            <div className="h-px bg-slate-100 border border-slate-200 my-1" />
                                            <button onClick={(e) => { e.stopPropagation(); deleteTaskId(task.id); }} className="w-full text-left px-2 py-1 text-[10px] text-red-400 hover:bg-slate-200 rounded flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Title Row (Mobile: Full Width, Desktop: Standard) */}
                        <div className="flex flex-col w-full mb-2 z-0">
                             {/* Desktop ID (Hidden on Mobile as it is in header above) */}
                             <span className="hidden md:block text-[9px] font-mono text-slate-400 uppercase mb-0.5">#{task.sequenceNumber || (index !== undefined ? index + 1 : (task.id || '').slice(0, 4))}</span>
                             <h4 className="text-sm font-bold text-slate-700 leading-tight break-words w-full">{task.title}</h4>
                             {task.description && (
                                 <p className="text-xs text-slate-500 truncate mt-1">{task.description}</p>
                             )}
                        </div>
                        
                        {/* Tags */}
                         <div className="flex flex-wrap gap-1">
                            {(task.tags || []).map((tag, idx) => (
                                <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded ${tag.color}`}>
                                    {tag.text}
                                </span>
                            ))}
                        </div>

                        {/* Progress Bar if active */}
                         {task.targetValue > 0 && (
                            <div className="space-y-1 mt-2">
                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                    <span>Progress</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}
                        
                        {/* Footer Info Row */}
                        <div className="flex flex-wrap items-end justify-between gap-2 mt-2 pt-2 border-t border-slate-200">
                             {/* Left: Deadline / Link */}
                            <div className="flex items-center gap-3">
                                {task.deadline && (
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[10px]">{task.deadline}</span>
                                    </div>
                                )}
                                 {task.status === 'done' && task.completedAt && (
                                    <div className="flex items-center gap-1.5 text-slate-400 border-r border-slate-200 pr-3 mr-1">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        <span className="text-[9px] font-mono">{formatCompletionTime(task.completedAt)}</span>
                                    </div>
                                )}
                                 {task.link && (
                                    <a 
                                        href={task.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[100px]">{task.linkName || 'Link'}</span>
                                    </a>
                                )}
                            </div>

                            {/* Right: Badges & Rewards */}
                            <div className="flex items-center gap-2 ml-auto">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    task.priority === 'high' ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                                    task.priority === 'low' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' :
                                    'text-amber-600 border-amber-600/30 bg-amber-600/10'
                                }`}>
                                    {task.priority || 'Medium'}
                                </span>
                                {task.difficulty && (
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                        task.difficulty === 'hard' ? 'text-purple-500 border-purple-500/30 bg-purple-500/10' :
                                        task.difficulty === 'easy' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                                        'text-slate-500 border-neutral-500/30 bg-neutral-500/10'
                                    }`}>
                                        {task.difficulty}
                                    </span>
                                )}
                                
                                {(task.xpReward > 0 || task.coinReward > 0) && (
                                     <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-300">
                                        {task.xpReward > 0 && (!settings || settings.xp !== false) && (
                                           <div className="flex items-center gap-1 text-blue-400">
                                              <Zap className="w-3 h-3" />
                                              <span className="text-[10px] font-bold">{task.xpReward}</span>
                                           </div>
                                        )}
                                        {task.coinReward > 0 && (!settings || settings.coins !== false) && (
                                           <div className="flex items-center gap-1 text-amber-600">
                                              <Coins className="w-3 h-3" />
                                              <span className="text-[10px] font-bold">{task.coinReward}</span>
                                           </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Subtasks (Collapsible/Inline) */}
                        {task.subtasks && task.subtasks.length > 0 && (
                             <div className="space-y-1 bg-slate-50 p-2 rounded-lg mt-2">
                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Subtasks</div>
                                {task.subtasks.map((sub, idx) => (
                                    <div key={sub.id || idx} className="flex items-center gap-2 group/sub">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleSubtask(task, idx); }}
                                            className={`w-3 h-3 border rounded-sm flex items-center justify-center transition-all ${sub.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-300 hover:border-blue-500'}`}
                                        >
                                            {sub.completed && <Check className="w-2.5 h-2.5 text-black" />}
                                        </button>
                                        <span className={`text-[10px] flex-1 ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{sub.text}</span>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>

                    <div className="hidden md:flex absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all items-center gap-1">
                        {!task.isHidden ? (
                            <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-md rounded p-0.5 border border-slate-300">
                                {task.status !== 'done' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); updateStatus(task, 'done'); }}
                                        className="p-1 text-slate-500 hover:text-green-500 bg-white border border-slate-200 shadow-md rounded transition-colors"
                                        title="Mark as Done"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); startEdit(task); }}
                                    className="p-1 text-slate-500 hover:text-blue-500 bg-white border border-slate-200 shadow-md rounded transition-colors"
                                    title="Edit Task"
                                >
                                    <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                                <div className="relative group/menu">
                                    <button className="p-1 text-slate-500 md:text-slate-500 hover:text-blue-600 bg-white border border-slate-200 shadow-md rounded relative z-10">
                                        <MoreVertical className="w-3 h-3" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-lg shadow-xl overflow-hidden z-20 hidden group-hover/menu:block hover:block">
                                        <div className="p-1 space-y-0.5">
                                            {task.status !== 'todo' && (
                                                <button onClick={() => updateStatus(task, 'todo')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-slate-200 text-slate-500 hover:text-blue-600 rounded">To Do</button>
                                            )}
                                            {task.status !== 'in_progress' && (
                                                <button onClick={() => updateStatus(task, 'in_progress')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-slate-200 text-slate-500 hover:text-blue-600 rounded">In Progress</button>
                                            )}
                                            {task.status !== 'backlog' && (
                                                <button onClick={() => updateStatus(task, 'backlog')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-slate-200 text-slate-500 hover:text-blue-600 rounded">Backlog</button>
                                            )}
                                            <div className="h-px bg-slate-100 border border-slate-200 my-1" />
                                            <button onClick={() => deleteTaskId(task.id)} className="w-full text-left px-2 py-1 text-[10px] hover:bg-slate-200 text-red-400 hover:text-red-300 rounded flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
                                        </div>
                                    </div>
                                    {/* Invisible bridge to prevent menu closing */}
                                    <div className="absolute right-0 top-full h-2 w-full bg-transparent group-hover/menu:block hidden" />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </>
            )}
        </div>

        {isDetailsOpen && (
            <TaskDetailsModal 
                task={task} 
                onClose={() => setIsDetailsOpen(false)} 
                startEdit={startEdit}
                updateStatus={updateStatus}
                deleteTaskId={deleteTaskId}
                formatCompletionTime={formatCompletionTime}
                toggleSubtask={toggleSubtask}
                progress={progress}
            />
        )}
        </>
    );
};

