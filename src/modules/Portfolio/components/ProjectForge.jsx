import React, { useState } from 'react';
import { Plus, Trash2, Save, Edit2, X, ExternalLink, Folder, Eye, EyeOff } from 'lucide-react';

const ProjectForge = ({ projects, actions, viewMode, isSectionHidden, toggleSectionVisibility }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', status: '', impact: '', link: '', linkName: '', description: '', isHidden: false });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    if (viewMode === 'guest' && isSectionHidden) return null;

    return (
        <div className={`space-y-6`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-300">Project Forge</h3>
                    {viewMode === 'admin' && isSectionHidden && (
                        <span className="text-[9px] font-bold text-red-500 uppercase border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Hidden Section</span>
                    )}
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
                            onClick={() => setIsAdding(!isAdding)}
                            className="p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="p-4 bg-neutral-900/50 border border-blue-500/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Project Name</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                            value={newProject.name}
                            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Status</label>
                            <input
                                placeholder="e.g. In Progress"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                value={newProject.status}
                                onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Impact</label>
                            <input
                                placeholder="e.g. High"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                                value={newProject.impact}
                                onChange={e => setNewProject({ ...newProject, impact: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link URL</label>
                            <input
                                placeholder="Optional"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-blue-400 focus:border-blue-500/50 outline-none"
                                value={newProject.link}
                                onChange={e => setNewProject({ ...newProject, link: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link Name</label>
                            <input
                                placeholder="e.g. Repo"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-blue-400 focus:border-blue-500/50 outline-none"
                                value={newProject.linkName}
                                onChange={e => setNewProject({ ...newProject, linkName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-neutral-400 focus:border-blue-500/50 outline-none min-h-[60px]"
                            value={newProject.description}
                            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-neutral-500 hover:text-white">Cancel</button>
                        <button onClick={handleAdd} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 uppercase tracking-wider">Add Project</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map(project => (
                    <div key={project.id} className={`group relative p-6 bg-neutral-900/30 border rounded-2xl transition-all flex flex-col h-full ${project.isHidden ? 'border-red-900/30 opacity-60 hover:opacity-100' : 'border-white/5 hover:border-blue-500/20'}`}>
                        {editingId === project.id ? (
                            <div className="space-y-4 z-10 relative flex-1">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Project Name</label>
                                    <input
                                        className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-sm font-bold text-white outline-none focus:border-blue-500"
                                        value={editData.name}
                                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Status</label>
                                        <input
                                            className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-yellow-500 outline-none focus:border-blue-500"
                                            value={editData.status}
                                            onChange={e => setEditData({ ...editData, status: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Impact</label>
                                        <input
                                            className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-green-500 outline-none focus:border-blue-500"
                                            value={editData.impact}
                                            onChange={e => setEditData({ ...editData, impact: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link URL</label>
                                        <input
                                            className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-blue-400 outline-none focus:border-blue-500"
                                            value={editData.link || ''}
                                            onChange={e => setEditData({ ...editData, link: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Link Name</label>
                                        <input
                                            className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-blue-400 outline-none focus:border-blue-500"
                                            value={editData.linkName || ''}
                                            onChange={e => setEditData({ ...editData, linkName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Description</label>
                                    <textarea
                                        className="w-full bg-black/40 border border-blue-500/30 rounded p-2 text-xs text-neutral-300 min-h-[60px] outline-none focus:border-blue-500"
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
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-base text-neutral-200 pr-6">{project.name}</h4>
                                        <div className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-900/20 text-blue-400 border border-blue-500/20">
                                            {project.status}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-green-500 mb-3">{project.impact}</div>
                                    <p className="text-xs text-neutral-500 leading-relaxed mb-4">{project.description}</p>
                                </div>

                                {project.link && project.link !== '#' && (
                                    <div className="mt-auto pt-4 border-t border-white/5">
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider transition-colors">
                                            <ExternalLink className="w-3 h-3" />
                                            {project.linkName || 'View Project'}
                                        </a>
                                    </div>
                                )}

                                {viewMode === 'admin' && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 flex gap-1 bg-black/80 rounded p-1">
                                        <button onClick={() => startEdit(project)} className="text-neutral-400 hover:text-blue-500 p-1"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => actions.delete(project.id)} className="text-neutral-400 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    async function handleAdd() {
        if (!newProject.name) return;
        await actions.add(newProject);
        setIsAdding(false);
        setNewProject({ name: '', status: '', impact: '', link: '', linkName: '', description: '', isHidden: false });
    }

    function startEdit(project) {
        setEditingId(project.id);
        setEditData(project);
    }

    async function saveEdit() {
        await actions.update(editingId, editData);
        setEditingId(null);
    }
};

export default ProjectForge;
