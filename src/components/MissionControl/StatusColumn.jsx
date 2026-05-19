import React, { useState, useEffect } from 'react';
import { Maximize2, X, MoreVertical } from 'lucide-react';
import { TaskCard } from './TaskCard';

export const StatusColumn = ({ title, status, color, moduleTasks, viewMode, displayMode, editingId, editData, setEditData, startEdit, saveEdit, setEditingId, updateStatus, deleteTaskId, toggleSubtask, settings, suggestedTags, isCalendarConnected, span = 1 }) => {
    const [page, setPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isExpanded, setIsExpanded] = useState(false); // Windowed Mode State

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Windowed Mode Escape Key Handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsExpanded(false);
        };
        if (isExpanded) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded]);

    const TASKS_PER_PAGE = isMobile ? 4 : (displayMode === 'list' ? (settings?.appearance?.listTasksPerPage || 20) : (span > 1 ? (span === 3 ? 15 : 10) : (settings?.appearance?.tasksPerPage || 6)));
    const paginationEnabled = displayMode === 'list' ? (settings?.appearance?.listPaginationEnabled === true) : (settings?.appearance?.paginationEnabled !== false);

    let filteredTasks = moduleTasks.filter(t => t.status === status);
    
    // For Done column, always sort by completion time descending
    if (status === 'done') {
        filteredTasks = [...filteredTasks].sort((a, b) => {
            const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return timeB - timeA;
        });
    }

    const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
    const visibleTasks = paginationEnabled ? filteredTasks.slice(page * TASKS_PER_PAGE, (page + 1) * TASKS_PER_PAGE) : filteredTasks;

    // Reset page if out of bounds (e.g. searching reduced count)
    if (page > 0 && page >= totalPages) {
        setPage(0);
    }

    return (
        <>
            <div className={`flex-1 min-w-[300px] bg-slate-100 rounded-2xl p-2 md:p-4 border border-slate-200 flex flex-col ${displayMode === 'list' ? '' : 'min-h-[500px]'}`}>
                <div className={`hidden md:flex items-center justify-between mb-4 pb-2 border-b border-${color}-500/20`}>
                    <h3 className={`text-xs font-black uppercase tracking-widest text-${color}-500`}>{title}</h3>
                    <div className="flex items-center gap-3">
                         <span className="text-[10px] font-mono text-slate-500">{filteredTasks.length}</span>
                         <button 
                            onClick={() => setIsExpanded(true)}
                            className="hidden md:block text-slate-500 hover:text-blue-600 transition-colors"
                            title="Open Grid View"
                         >
                             <Maximize2 className="w-3 h-3" />
                         </button>
                    </div>
                </div>

                {/* Apply CSS columns (Masonry) if spanning multiple columns */}
                <div className={`overflow-y-auto flex-1 pr-1 md:pr-2 pb-24 md:pb-4 custom-scrollbar ${span > 1 ? `columns-1 ${span === 3 ? 'md:columns-3' : 'md:columns-2'} gap-3 [&>div]:mb-3` : `space-y-2 md:space-y-3 ${displayMode === 'list' ? 'space-y-1' : ''}`}`}>
                    {visibleTasks.map((task, index) => (
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
                            index={page * TASKS_PER_PAGE + index}
                        />
                    ))}
                </div>

                {/* Pagination Controls */}
                {paginationEnabled && totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="p-1 rounded bg-white shadow-sm border border-slate-200 text-slate-500 disabled:opacity-30 hover:text-blue-600"
                        >
                            &lt;
                        </button>
                        <span className="text-[10px] text-slate-500">Page {page + 1} of {totalPages}</span>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page === totalPages - 1}
                            className="p-1 rounded bg-white shadow-sm border border-slate-200 text-slate-500 disabled:opacity-30 hover:text-blue-600"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>

            {/* Windowed / Grid Mode Overlay */}
            {isExpanded && (
                <div className="fixed inset-0 z-[100] bg-white/20 backdrop-blur-3xl p-6 md:p-12 overflow-y-auto animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) setIsExpanded(false); }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8 bg-transparent z-20 py-4 border-b border-slate-300">
                            <div className="flex items-center gap-4">
                                <h2 className={`text-2xl font-black uppercase tracking-tighter text-${color}-500`}>{title}</h2>
                                <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-mono text-slate-800">{filteredTasks.length} Tasks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1.5 bg-slate-50 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setIsExpanded(false)}
                                    className="p-2 rounded-full bg-slate-100 border border-slate-200 hover:bg-white/20 text-slate-800 transition-all shadow-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTasks.map((task, index) => (
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
                                    suggestedTags={suggestedTags}
                                    isCalendarConnected={isCalendarConnected}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
