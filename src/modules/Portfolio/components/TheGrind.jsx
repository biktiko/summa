import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus } from 'lucide-react';

const TheGrind = ({ processTask, viewMode }) => {
    // Temporary local state for demo purposes. In real app, this would be in useLifeData
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Review PR #42', xp: 50, done: false },
        { id: 2, text: 'Update Documentation', xp: 30, done: false },
        { id: 3, text: 'Weekly Planning', xp: 100, done: true },
    ]);

    const handleComplete = (id, xp) => {
        if (viewMode === 'guest') return;

        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
        // Only award XP if marking as done (simple logic for now)
        const task = tasks.find(t => t.id === id);
        if (!task.done) {
            processTask(id, xp);
        }
    };

    return (
        <div className="mt-12">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
                The Grind // Backlog
                <span className="text-[8px] px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded border border-emerald-500/20">DAILY OPS</span>
            </h2>

            <div className="space-y-2">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => handleComplete(task.id, task.xp)}
                        className={`
              p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group
              ${task.done
                                ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60'
                                : 'bg-neutral-900/40 border-white/5 hover:border-emerald-500/40 hover:bg-emerald-900/5'
                            }
            `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                w-5 h-5 rounded-full flex items-center justify-center border transition-all
                ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-600 group-hover:border-emerald-400'}
              `}>
                                {task.done && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-wide ${task.done ? 'text-emerald-700 line-through' : 'text-neutral-300'}`}>
                                {task.text}
                            </span>
                        </div>

                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/10">
                            +{task.xp} XP
                        </div>
                    </div>
                ))}

                {viewMode === 'admin' && (
                    <button className="w-full py-3 border border-dashed border-neutral-800 rounded-xl text-neutral-600 text-[10px] font-bold uppercase hover:bg-neutral-900 hover:border-neutral-700 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" /> Add Task
                    </button>
                )}
            </div>
        </div>
    );
};

export default TheGrind;
