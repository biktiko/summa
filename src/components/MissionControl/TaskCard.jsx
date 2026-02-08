import React from 'react';
import { Plus, MoreVertical, CheckCircle2, Circle, Trash2, Edit2, X, Eye, EyeOff, Save, Check, Calendar, Coins, Zap, ExternalLink } from 'lucide-react';

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

export const TaskCard = ({ task, viewMode, editingId, editData, setEditData, startEdit, saveEdit, setEditingId, updateStatus, deleteTaskId, toggleSubtask, settings, suggestedTags, index }) => {
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
        <div className={`group bg-black/40 border border-white/5 p-2 md:p-4 rounded-xl hover:border-blue-500/30 transition-all relative ${task.isHidden ? 'opacity-60 border-red-900/30' : ''}`}>
            {editingId === task.id ? (
                <>
                    <div className="fixed inset-0 z-10 bg-transparent" onClick={saveEdit} />
                    <div className="space-y-4 z-20 relative bg-[#0A0A0A] p-4 rounded-lg border border-blue-500/30 w-full max-h-[75vh] overflow-y-auto custom-scrollbar shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="bg-[#0A0A0A] pb-2 border-b border-white/5 mb-4 flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-500">Edit Task</h4>
                        <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded font-bold text-xs uppercase hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                            <Save className="w-3 h-3" /> Save
                        </button>
                    </div>
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

                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 block">Priority</label>
                                <select
                                    className="w-full bg-black/40 border border-blue-500/30 rounded px-2 text-[11px] text-white outline-none focus:border-blue-500 h-9"
                                    value={editData.priority}
                                    onChange={e => setEditData({ ...editData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Med</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 block">Difficulty</label>
                                <select
                                    className="w-full bg-black/40 border border-blue-500/30 rounded px-2 text-[11px] text-white outline-none focus:border-blue-500 h-9"
                                    value={editData.difficulty || 'medium'}
                                    onChange={e => setEditData({ ...editData, difficulty: e.target.value })}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Med</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1 mt-3">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Task Deadline</label>
                            <input
                                type="date"
                                className="w-full bg-black/40 border border-blue-500/30 rounded px-3 text-[11px] text-white outline-none focus:border-blue-500 h-9"
                                value={editData.deadline || ''}
                                onChange={e => setEditData({ ...editData, deadline: e.target.value })}
                            />
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
                                list="tag-suggestions"
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
                        {/* Suggested Tags (Quick Add for Edit) */}
                        {suggestedTags && suggestedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 p-2 bg-white/5 rounded-lg">
                                <span className="text-[9px] text-neutral-500 uppercase font-bold w-full mb-1">Quick Add:</span>
                                {suggestedTags.filter(t => !(editData.tags || []).some(nt => nt.text.toLowerCase() === t.text.toLowerCase())).map(tag => (
                                    <button
                                        key={tag.text}
                                        onClick={() => setEditData({
                                            ...editData,
                                            tags: [...(editData.tags || []), { text: tag.text, color: tag.color }]
                                        })}
                                        className={`text-[9px] px-2 py-1 rounded border border-white/10 hover:border-white/30 transition-all ${tag.color} opacity-80 hover:opacity-100 pr-2`}
                                    >
                                        {tag.text}
                                        <Plus className="w-2 h-2 inline-block ml-1" />
                                    </button>
                                ))}
                            </div>
                        )}
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                                className="col-span-2 md:col-span-1 w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
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
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:text-white uppercase">Cancel</button>
                            <button onClick={saveEdit} className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold text-xs uppercase hover:bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                <Save className="w-3 h-3" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </>
            ) : (
                <>
                    <div className="flex flex-col relative w-full">
                        {/* Mobile Header: ID & Actions */}
                        {/* Explicitly separate row for ID and Actions to ensure Title has full width below */}
                        <div className="flex md:hidden items-center justify-between w-full mb-3 z-10 relative">
                             <span className="text-[9px] font-mono text-neutral-600 uppercase">#{task.sequenceNumber || (index !== undefined ? index + 1 : (task.id || '').slice(0, 4))}</span>
                             
                             <div className="flex items-center gap-1">
                                {task.status !== 'done' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); updateStatus(task, 'done'); }}
                                        className="p-1.5 text-green-500 bg-white/5 rounded-lg border border-green-500/20 active:scale-95 transition-transform"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="relative group/mobile-menu">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="p-1.5 text-neutral-400 bg-white/5 rounded-lg border border-white/10 active:scale-95 transition-transform"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 hidden group-hover/mobile-menu:block">
                                        <div className="p-1 space-y-0.5">
                                            {task.status !== 'todo' && <button onClick={(e) => { e.stopPropagation(); updateStatus(task, 'todo'); }} className="w-full text-left px-2 py-1 text-[10px] text-neutral-400 hover:text-white hover:bg-white/10 rounded">To Do</button>}
                                            {task.status !== 'in_progress' && <button onClick={(e) => { e.stopPropagation(); updateStatus(task, 'in_progress'); }} className="w-full text-left px-2 py-1 text-[10px] text-neutral-400 hover:text-white hover:bg-white/10 rounded">In Progress</button>}
                                            <div className="h-px bg-white/10 my-1" />
                                            <button onClick={(e) => { e.stopPropagation(); startEdit(task); }} className="w-full text-left px-2 py-1 text-[10px] text-blue-400 hover:bg-white/10 rounded flex items-center gap-2"><Edit2 className="w-3 h-3" /> Edit</button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteTaskId(task.id); }} className="w-full text-left px-2 py-1 text-[10px] text-red-400 hover:bg-white/10 rounded flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Title Row (Mobile: Full Width, Desktop: Standard) */}
                        <div className="flex flex-col w-full mb-2 z-0">
                             {/* Desktop ID (Hidden on Mobile as it is in header above) */}
                             <span className="hidden md:block text-[9px] font-mono text-neutral-600 uppercase mb-0.5">#{task.sequenceNumber || (index !== undefined ? index + 1 : (task.id || '').slice(0, 4))}</span>
                             <h4 className="text-sm font-bold text-neutral-200 leading-tight break-words w-full">{task.title}</h4>
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
                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                                    <span>Progress</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}
                        
                        {/* Footer Info Row */}
                        <div className="flex flex-wrap items-end justify-between gap-2 mt-2 pt-2 border-t border-white/5">
                             {/* Left: Deadline / Link */}
                            <div className="flex items-center gap-3">
                                {task.deadline && (
                                    <div className="flex items-center gap-1.5 text-neutral-500">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[10px]">{task.deadline}</span>
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
                                    'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
                                }`}>
                                    {task.priority || 'Medium'}
                                </span>
                                {task.difficulty && (
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                        task.difficulty === 'hard' ? 'text-purple-500 border-purple-500/30 bg-purple-500/10' :
                                        task.difficulty === 'easy' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                                        'text-neutral-500 border-neutral-500/30 bg-neutral-500/10'
                                    }`}>
                                        {task.difficulty}
                                    </span>
                                )}
                                
                                {(task.xpReward > 0 || task.coinReward > 0) && (
                                     <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
                                        {task.xpReward > 0 && (!settings || settings.xp !== false) && (
                                           <div className="flex items-center gap-1 text-blue-400">
                                              <Zap className="w-3 h-3" />
                                              <span className="text-[10px] font-bold">{task.xpReward}</span>
                                           </div>
                                        )}
                                        {task.coinReward > 0 && (!settings || settings.coins !== false) && (
                                           <div className="flex items-center gap-1 text-yellow-400">
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
                             <div className="space-y-1 bg-white/5 p-2 rounded-lg mt-2">
                                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Subtasks</div>
                                {task.subtasks.map((sub, idx) => (
                                    <div key={sub.id || idx} className="flex items-center gap-2 group/sub">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleSubtask(task, idx); }}
                                            className={`w-3 h-3 border rounded-sm flex items-center justify-center transition-all ${sub.completed ? 'bg-blue-500 border-blue-500' : 'border-neutral-600 hover:border-blue-500'}`}
                                        >
                                            {sub.completed && <Check className="w-2.5 h-2.5 text-black" />}
                                        </button>
                                        <span className={`text-[10px] flex-1 ${sub.completed ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}>{sub.text}</span>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>

                    <div className="hidden md:flex absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all items-center gap-1">
                        {!task.isHidden ? (
                            <div className="flex items-center gap-1 bg-black/60 rounded p-0.5 border border-white/10">
                                {task.status !== 'done' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); updateStatus(task, 'done'); }}
                                        className="p-1 text-neutral-500 hover:text-green-500 bg-black/60 rounded transition-colors"
                                        title="Mark as Done"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                )}
                                <div className="relative group/menu">
                                    <button className="p-1 text-neutral-400 md:text-neutral-500 hover:text-white bg-black/60 rounded relative z-10">
                                        <MoreVertical className="w-3 h-3" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 hidden group-hover/menu:block hover:block">
                                        <div className="p-1 space-y-0.5">
                                            {task.status !== 'todo' && (
                                                <button onClick={() => updateStatus(task, 'todo')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-neutral-400 hover:text-white rounded">To Do</button>
                                            )}
                                            {task.status !== 'in_progress' && (
                                                <button onClick={() => updateStatus(task, 'in_progress')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-neutral-400 hover:text-white rounded">In Progress</button>
                                            )}
                                            {task.status !== 'backlog' && (
                                                <button onClick={() => updateStatus(task, 'backlog')} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-neutral-400 hover:text-white rounded">Backlog</button>
                                            )}
                                            <div className="h-px bg-white/10 my-1" />
                                            <button onClick={() => startEdit(task)} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-blue-400 hover:text-blue-300 rounded flex items-center gap-2"><Edit2 className="w-3 h-3" /> Edit</button>
                                            <button onClick={() => deleteTaskId(task.id)} className="w-full text-left px-2 py-1 text-[10px] hover:bg-white/10 text-red-400 hover:text-red-300 rounded flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
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
    );
};
