import React from 'react';
import { Folder, ExternalLink, EyeOff, LayoutDashboard } from 'lucide-react';

const ProjectForge = ({ projects, viewMode, isSectionHidden, toggleSectionVisibility }) => {
    if (viewMode === 'guest' && isSectionHidden) return null;

    const visibleProjects = viewMode === 'admin' ? projects : projects.filter(p => !p.isHidden);

    return (
        <div className={`space-y-6`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">Projects</h3>
                    {viewMode === 'admin' && isSectionHidden && (
                        <span className="text-[9px] font-bold text-red-500 uppercase border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Hidden Section</span>
                    )}
                </div>
                {viewMode === 'admin' && (
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <LayoutDashboard className="w-3 h-3" /> Manage in Projects Hub
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleProjects.map(project => (
                    <div key={project.id} className={`group relative p-6 bg-white shadow-sm border rounded-2xl flex flex-col h-full ${project.isHidden ? 'border-red-900/30 opacity-60' : 'border-slate-200'}`}>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-base text-slate-700 pr-6 flex items-center gap-2">
                                    {project.name}
                                    {project.isHidden && <EyeOff className="w-3 h-3 text-red-400" />}
                                </h4>
                                <div className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-900/20 text-blue-400 border border-blue-500/20">
                                    {project.status}
                                </div>
                            </div>
                            {project.category && (
                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">{project.category}</div>
                            )}
                            {project.impact && (
                                <div className="text-xs font-mono text-green-500 mb-3">{project.impact}</div>
                            )}
                            <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">{project.description}</p>
                            
                            {project.teammates && project.teammates.length > 0 && (
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                        {project.teammates.slice(0, 4).map(m => {
                                            const initials = m.name ? m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                                            return (
                                                <div key={m.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-[9px] font-black" title={`${m.name} (${m.role})`}>
                                                    {initials}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {project.teammates.length > 4 && (
                                        <span className="text-[9px] font-bold text-slate-400">
                                            +{project.teammates.length - 4} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {project.links && project.links.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                                {project.links.map(link => (
                                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider transition-colors bg-blue-50 px-2 py-1 rounded">
                                        <ExternalLink className="w-3 h-3" />
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        )}
                        {(!project.links || project.links.length === 0) && project.link && project.link !== '#' && (
                            <div className="mt-auto pt-4 border-t border-slate-200">
                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider transition-colors">
                                    <ExternalLink className="w-3 h-3" />
                                    {project.linkName || 'View Project'}
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectForge;
