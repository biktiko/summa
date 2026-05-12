import React from 'react';
import { X, Save, Plus, Eye, EyeOff, Check } from 'lucide-react';

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

export const TaskEditModal = ({ task, editData, setEditData, saveEdit, setEditingId, suggestedTags, isCalendarConnected }) => {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
            
            <div 
                className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all border border-slate-200/60"
                onClick={e => e.stopPropagation()}
            >
                <div className={`h-2 w-full ${editData.priority === 'high' ? 'bg-red-500' : editData.priority === 'low' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                
                <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
                    <div className="flex-1 flex flex-col gap-1 pr-8">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Editing Task #{task.sequenceNumber || (task.id || '').slice(0, 4)}</span>
                        <input
                            className="text-xl sm:text-2xl font-black text-slate-800 leading-tight bg-transparent border-none outline-none focus:ring-0 p-0 w-full"
                            value={editData.title}
                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                            placeholder="Task Title"
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={() => setEditingId(null)}
                        className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Description</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 min-h-[100px] outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
                            value={editData.description || ''}
                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                            placeholder="Add a detailed description..."
                        />
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                value={editData.priority}
                                onChange={e => setEditData({ ...editData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                value={editData.difficulty || 'medium'}
                                onChange={e => setEditData({ ...editData, difficulty: e.target.value })}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</label>
                            <input
                                type="date"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                value={editData.deadline || ''}
                                onChange={e => setEditData({ ...editData, deadline: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</label>
                            <input
                                type="time"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                value={editData.startTime || ''}
                                onChange={e => setEditData({ ...editData, startTime: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Google Calendar Sync Options (If Connected) */}
                    {isCalendarConnected && (
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-500/10 p-1.5 rounded-lg">
                                        <Save className="w-4 h-4 text-blue-500" /> {/* Reusing Save icon as a placeholder for calendar if lucide-react Calendar not imported, but it is in TaskBoard. Wait, check imports in TaskEditModal */}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Google Calendar</span>
                                        <span className="text-[9px] text-blue-400 font-bold">Sync this mission to your calendar</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={editData.addToCalendar}
                                        onChange={e => setEditData({ ...editData, addToCalendar: e.target.checked })}
                                    />
                                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {editData.addToCalendar && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-blue-100/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Notification:</span>
                                    </div>
                                    <select
                                        className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                        value={editData.reminderBefore}
                                        onChange={e => setEditData({ ...editData, reminderBefore: parseInt(e.target.value) })}
                                    >
                                        <option value="5">5 minutes before</option>
                                        <option value="10">10 minutes before</option>
                                        <option value="15">15 minutes before</option>
                                        <option value="30">30 minutes before</option>
                                        <option value="60">1 hour before</option>
                                        <option value="1440">1 day before</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progress Tracking */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Progress Tracking</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="number"
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                                placeholder="Current Value"
                                value={editData.currentValue}
                                onChange={e => setEditData({ ...editData, currentValue: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                            />
                            <input
                                type="number"
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                                placeholder="Target Value"
                                value={editData.targetValue}
                                onChange={e => setEditData({ ...editData, targetValue: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                            />
                            <input
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                                placeholder="Unit (e.g., Pages)"
                                value={editData.unit}
                                onChange={e => setEditData({ ...editData, unit: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                            />
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Checklist</label>
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                            {(editData.subtasks || []).map((subtask, idx) => (
                                <div key={subtask.id || idx} className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            const newSubtasks = [...(editData.subtasks || [])];
                                            newSubtasks[idx] = { ...subtask, completed: !subtask.completed };
                                            setEditData({ ...editData, subtasks: newSubtasks });
                                        }}
                                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${subtask.completed ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}
                                    >
                                        {subtask.completed && <Check className="w-3.5 h-3.5 text-white" />}
                                    </button>
                                    <input
                                        className={`flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-blue-500/50 pb-0.5 ${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}
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
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center gap-3 pt-2">
                                <Plus className="w-5 h-5 text-slate-400 shrink-0" />
                                <input
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
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
                                    className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tags & External Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {(editData.tags || []).map((tag, idx) => (
                                    <span key={idx} className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${tag.color}`}>
                                        {tag.text}
                                        <button onClick={() => removeTag(idx)} className="hover:text-red-200 opacity-80 hover:opacity-100 ml-1"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                                    placeholder="New Tag"
                                    value={editData.newTagText || ''}
                                    onChange={e => setEditData({ ...editData, newTagText: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && addTag()}
                                />
                                <select
                                    className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                                    value={editData.newTagColor || TAG_COLORS[0].value}
                                    onChange={e => setEditData({ ...editData, newTagColor: e.target.value })}
                                >
                                    {TAG_COLORS.map(c => (
                                        <option key={c.name} value={c.value}>{c.name}</option>
                                    ))}
                                </select>
                                <button onClick={addTag} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                            {suggestedTags && suggestedTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-[9px] text-slate-400 uppercase font-bold w-full mb-1">Quick Add:</span>
                                    {suggestedTags.filter(t => !(editData.tags || []).some(nt => nt.text.toLowerCase() === t.text.toLowerCase())).map(tag => (
                                        <button
                                            key={tag.text}
                                            onClick={() => setEditData({
                                                ...editData,
                                                tags: [...(editData.tags || []), { text: tag.text, color: tag.color }]
                                            })}
                                            className={`text-[9px] px-2 py-1 rounded shadow-sm hover:shadow transition-all ${tag.color} opacity-80 hover:opacity-100 flex items-center gap-1`}
                                        >
                                            {tag.text} <Plus className="w-2.5 h-2.5" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">External Link URL</label>
                                <input
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-blue-500 outline-none focus:border-blue-500"
                                    placeholder="https://..."
                                    value={editData.link || ''}
                                    onChange={e => setEditData({ ...editData, link: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Link Display Name</label>
                                <input
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    placeholder="Link Text"
                                    value={editData.linkName || ''}
                                    onChange={e => setEditData({ ...editData, linkName: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                    <button
                        onClick={() => setEditData({ ...editData, isHidden: !editData.isHidden })}
                        className={`px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors w-full sm:w-auto ${editData.isHidden ? 'text-red-600 bg-red-100 hover:bg-red-200' : 'text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-100'}`}
                    >
                        {editData.isHidden ? <><EyeOff className="w-4 h-4" /> Hidden</> : <><Eye className="w-4 h-4" /> Visible</>}
                    </button>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => setEditingId(null)} 
                            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={saveEdit} 
                            className="flex-1 sm:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
