import React, { useState } from 'react';
import TaskBoard from './TaskBoard';
import { Briefcase, Plus, FolderCheck, FolderOpen, Trash2 } from 'lucide-react';

const ProjectTasksView = ({ projects, tasks, projectsActions, tasksActions, viewMode, processTask, updateUser, userXP, settings }) => {
    const [selectedProjectId, setSelectedProjectId] = useState(projects?.[0]?.id || null);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const activeProject = projects?.find(p => p.id === selectedProjectId);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        await projectsActions.add({
            name: newProjectName,
            status: 'Active',
            createdAt: new Date().toISOString()
        });
        setNewProjectName('');
        setIsAddingProject(false);
    };

    const toggleProjectStatus = async (project) => {
        const newStatus = project.status === 'Completed' ? 'Active' : 'Completed';
        await projectsActions.update(project.id, { status: newStatus });
    };

    const deleteProject = async (id) => {
        if (window.confirm('Delete this project?')) {
            await projectsActions.delete(id);
            if (selectedProjectId === id) setSelectedProjectId(null);
        }
    };

    // Calculate tasks count
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
    const completedTasks = projectTasks.filter(t => t.status === 'done').length;

    return (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in">
            {/* Project Selector Horizontal */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {projects?.map(project => (
                    <button
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedProjectId === project.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {project.status === 'Completed' ? <FolderCheck className="w-4 h-4 opacity-70" /> : <FolderOpen className="w-4 h-4" />}
                        {project.name}
                    </button>
                ))}
                {viewMode === 'admin' && (
                    <button
                        onClick={() => setIsAddingProject(true)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all border-dashed"
                    >
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                )}
            </div>

            {isAddingProject && (
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm w-max">
                    <input 
                        autoFocus
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        placeholder="Project Name..."
                        className="text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                        onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                    />
                    <button onClick={handleCreateProject} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Create</button>
                    <button onClick={() => setIsAddingProject(false)} className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:text-slate-700">Cancel</button>
                </div>
            )}

            {/* Main Board Area */}
            {activeProject ? (
                <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative">
                    {/* Project Header */}
                    <div className="bg-white border-b border-slate-200 p-4 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className={`text-xl font-black text-slate-800 ${activeProject.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{activeProject.name}</h2>
                                {activeProject.status === 'Completed' && (
                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Completed</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {projectTasks.length} total tasks • {completedTasks} completed
                            </p>
                        </div>
                        {viewMode === 'admin' && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleProjectStatus(activeProject)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProject.status === 'Completed' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}>
                                    {activeProject.status === 'Completed' ? 'Reopen Project' : 'Complete Project'}
                                </button>
                                <button onClick={() => deleteProject(activeProject.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Board */}
                    <div className="p-4 md:p-6 flex-1 overflow-auto">
                        {activeProject.status === 'Completed' && projectTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-10">
                                <FolderCheck className="w-12 h-12 mb-3 text-slate-300" />
                                <p className="text-sm font-bold">Project is completed.</p>
                            </div>
                        ) : (
                            <TaskBoard
                                tasks={tasks}
                                actions={tasksActions}
                                moduleId={null}
                                projectId={activeProject.id}
                                viewMode={viewMode}
                                processTask={processTask}
                                updateUser={updateUser}
                                userXP={userXP}
                                isSectionHidden={false}
                                toggleSectionVisibility={() => {}}
                                settings={settings}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 min-h-[400px]">
                    <Briefcase className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="font-bold text-sm">No project selected</p>
                    <p className="text-xs mt-1">Select a project above or create a new one.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectTasksView;
