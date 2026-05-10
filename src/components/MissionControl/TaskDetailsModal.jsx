import React from 'react';
import { CheckCircle2, Circle, Trash2, Edit2, X, Calendar, Coins, Zap, ExternalLink, Check } from 'lucide-react';

export const TaskDetailsModal = ({ task, onClose, startEdit, updateStatus, deleteTaskId, formatCompletionTime, toggleSubtask, progress }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
            
            <div 
                className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all border border-slate-200/60"
                onClick={e => e.stopPropagation()}
            >
                <div className={`h-2 w-full ${task.status === 'done' ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-500' : task.priority === 'low' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                
                <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1 pr-8">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">#{task.sequenceNumber || (task.id || '').slice(0, 4)}</span>
                            {task.status === 'done' && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                            )}
                        </div>
                        <h2 className={`text-xl sm:text-2xl font-black text-slate-800 leading-tight ${task.status === 'done' ? 'line-through opacity-70' : ''}`}>
                            {task.title}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {task.description ? (
                        <div className="prose prose-sm max-w-none text-slate-600 font-medium whitespace-pre-wrap">
                            {task.description}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm italic">No description provided.</div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</span>
                            <span className={`text-xs font-bold ${task.priority === 'high' ? 'text-red-600' : task.priority === 'low' ? 'text-blue-600' : 'text-amber-600'} capitalize`}>
                                {task.priority || 'Medium'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</span>
                            <span className={`text-xs font-bold ${task.difficulty === 'hard' ? 'text-purple-600' : task.difficulty === 'easy' ? 'text-green-600' : 'text-slate-600'} capitalize`}>
                                {task.difficulty || 'Medium'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</span>
                            <span className="text-xs font-medium text-slate-700">
                                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</span>
                            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                                {task.deadline ? <><Calendar className="w-3 h-3 text-slate-400" /> {task.deadline}</> : 'None'}
                            </span>
                        </div>
                    </div>

                    {(task.targetValue > 0 || task.xpReward > 0 || task.coinReward > 0) && (
                        <div className="flex flex-col sm:flex-row gap-6">
                            {task.targetValue > 0 && (
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-widest">
                                        <span>Progress Goal</span>
                                        <span>{task.currentValue} / {task.targetValue} {task.unit} ({progress.toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}
                            
                            {(task.xpReward > 0 || task.coinReward > 0) && (
                                <div className="flex gap-4 shrink-0">
                                    {task.xpReward > 0 && (
                                        <div className="flex flex-col items-center justify-center p-3 bg-blue-50/50 rounded-xl border border-blue-100 min-w-[80px]">
                                            <Zap className="w-5 h-5 text-blue-500 mb-1" />
                                            <span className="text-sm font-black text-blue-600">+{task.xpReward}</span>
                                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">XP</span>
                                        </div>
                                    )}
                                    {task.coinReward > 0 && (
                                        <div className="flex flex-col items-center justify-center p-3 bg-amber-50/50 rounded-xl border border-amber-100 min-w-[80px]">
                                            <Coins className="w-5 h-5 text-amber-500 mb-1" />
                                            <span className="text-sm font-black text-amber-600">+{task.coinReward}</span>
                                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Coins</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</span>
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag, idx) => (
                                    <span key={idx} className={`text-xs px-2.5 py-1 rounded-md font-medium shadow-sm ${tag.color}`}>
                                        {tag.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist</span>
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                {task.subtasks.map((sub, idx) => (
                                    <div key={idx} className="flex items-start gap-3 group">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleSubtask(task, idx); }}
                                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${sub.completed ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-white border-slate-300 hover:border-blue-500'}`}
                                        >
                                            {sub.completed && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                        <span className={`text-sm leading-snug pt-0.5 ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {sub.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {task.link && (
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                            <a 
                                href={task.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-bold transition-colors border border-slate-200 hover:border-blue-200"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {task.linkName || 'Open External Resource'}
                            </a>
                        </div>
                    )}
                    
                    {task.status === 'done' && task.completedAt && (
                        <div className="pt-4 border-t border-slate-100 text-right">
                             <span className="text-xs text-slate-400 italic">
                                 Completed on {formatCompletionTime(task.completedAt)}
                             </span>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {task.status !== 'done' ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); updateStatus(task, 'done'); onClose(); }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Complete Mission
                            </button>
                        ) : (
                            <button 
                                onClick={(e) => { e.stopPropagation(); updateStatus(task, 'todo'); onClose(); }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-all"
                            >
                                <Circle className="w-4 h-4" /> Reopen Mission
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                            onClick={(e) => { e.stopPropagation(); startEdit(task); onClose(); }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl font-bold text-sm transition-colors"
                        >
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteTaskId(task.id); onClose(); }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl font-bold text-sm transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
