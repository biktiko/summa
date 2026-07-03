import React, { useState, useMemo, useEffect } from 'react';
import { 
    Folder, Plus, Briefcase, Calendar, Link as LinkIcon, Trash2, 
    Lock, Eye, EyeOff, Edit2, CheckCircle2, ChevronRight, DollarSign, Target, Play, Search, Filter, Menu, X, ArrowDownCircle, ArrowUpCircle, Users
} from 'lucide-react';
import TaskBoard from '../../components/MissionControl/TaskBoard';

// --- Helper Components ---
const DebouncedInput = ({ value, onChange, component: Component = 'input', ...props }) => {
    const [localValue, setLocalValue] = useState(value || '');
    
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleBlur = () => {
        if (localValue !== (value || '')) {
            onChange(localValue);
        }
    };

    return (
        <Component 
            value={localValue} 
            onChange={e => setLocalValue(e.target.value)} 
            onBlur={handleBlur} 
            {...props} 
        />
    );
};

const ProjectsModule = ({ 
    userData, viewMode, projectsActions, tasksActions, transactionsActions, updateUser, processTask 
}) => {
    const { projects = [], tasks = [], transactions = [], categories = [], accounts = [] } = userData || {};
    
    // Sidebar & View States
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState('All');

    const uniqueClients = useMemo(() => {
        return [...new Set(projects.map(p => p.client).filter(Boolean))].sort();
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => {
                if (statusFilter !== 'All' && p.status !== statusFilter) return false;
                if (clientFilter !== 'All' && p.client !== clientFilter) return false;
                if (searchTerm && !p.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0));
    }, [projects, statusFilter, clientFilter, searchTerm]);

    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || null);
    const [activeTab, setActiveTab] = useState('financials'); // financials, tasks, overview

    const activeProject = projects.find(p => p.id === selectedProjectId);

    useEffect(() => {
        if (filteredProjects.length > 0 && !filteredProjects.find(p => p.id === selectedProjectId)) {
            setSelectedProjectId(filteredProjects[0].id);
        }
    }, [filteredProjects, selectedProjectId]);

    const handleCreateProject = async () => {
        const newProject = {
            name: 'New Project',
            status: 'Active',
            client: '',
            secretData: '',
            links: [],
            stages: [],
            description: '',
            impact: 'Medium',
            isHidden: false,
            receivedAt: new Date().toISOString().slice(0, 10),
            completedAt: '',
            category: '',
            source: '',
            teammates: []
        };
        await projectsActions.add(newProject);
        setSearchTerm('');
        setStatusFilter('All');
        setClientFilter('All');
    };

    const updateProjectField = async (field, value) => {
        if (!activeProject || viewMode === 'guest') return;
        if (typeof field === 'object') {
            await projectsActions.update(activeProject.id, field);
        } else {
            await projectsActions.update(activeProject.id, { [field]: value });
        }
    };

    const deleteProject = async () => {
        if (!activeProject || viewMode === 'guest') return;
        if (window.confirm('Are you sure you want to delete this project?')) {
            await projectsActions.delete(activeProject.id);
            setSelectedProjectId(null);
        }
    };

    const projectFinancials = useMemo(() => {
        const stats = {};
        let globalExpected = 0;
        let globalProbably = 0;

        projects.forEach(p => {
            let received = 0;
            let expected = 0;
            let probably = 0;

            if (p.status !== 'Rejected' && p.status !== 'Archived') {
                p.stages?.forEach(s => {
                    if (s.status === 'Rejected') return;
                    const stageIncome = transactions.filter(t => t.projectStageId === s.id && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                    received += stageIncome;

                    const totalExpected = Number(s.expectedNetIncome) || 0;
                    const remainingNet = Math.max(0, totalExpected - stageIncome);

                    if (remainingNet > 0) {
                        if (s.status === 'Not Started') probably += remainingNet;
                        else expected += remainingNet;
                    }
                });
            } else {
                p.stages?.forEach(s => {
                    const stageIncome = transactions.filter(t => t.projectStageId === s.id && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                    received += stageIncome;
                });
            }

            stats[p.id] = { received, expected, probably };
            globalExpected += expected;
            globalProbably += probably;
        });

        return { stats, globalExpected, globalProbably };
    }, [projects, transactions]);

    return (
        <div className="flex h-full animate-in fade-in bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden relative shadow-sm">
            
            {/* Sidebar Project List */}
            {isSidebarOpen && (
                <div className="w-1/3 max-w-sm bg-white border-r border-slate-200 flex flex-col h-full z-10 shrink-0 shadow-lg">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <Folder className="w-4 h-4 text-blue-500" />
                            Projects Hub
                        </h2>
                        {viewMode === 'admin' && (
                            <button 
                                onClick={handleCreateProject}
                                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-md shadow-blue-500/20"
                                title="New Project"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="p-3 border-b border-slate-200 bg-white space-y-2">
                        {/* Global Expected & Probably Net Cards */}
                        <div className="flex gap-2">
                            <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 shadow-sm">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <DollarSign className="w-3 h-3 text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Expected</span>
                                </div>
                                <div className="font-black text-xs text-blue-600">֏{projectFinancials.globalExpected.toLocaleString()}</div>
                            </div>
                            <div className="flex-1 bg-purple-50/50 border border-purple-100 rounded-lg p-2.5 shadow-sm">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <Target className="w-3 h-3 text-purple-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Probably</span>
                                </div>
                                <div className="font-black text-xs text-purple-600">֏{projectFinancials.globalProbably.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input 
                                placeholder="Search projects..."
                                className="w-full bg-slate-100 border-none pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select 
                                className="flex-1 bg-slate-100 border-none px-2 py-1.5 rounded-lg text-[10px] sm:text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-600 font-bold"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="In Development">In Development</option>
                                <option value="Completed">Completed</option>
                                <option value="Archived">Archived</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <select 
                                className="flex-1 bg-slate-100 border-none px-2 py-1.5 rounded-lg text-[10px] sm:text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-600 font-bold"
                                value={clientFilter}
                                onChange={e => setClientFilter(e.target.value)}
                            >
                                <option value="All">All Clients</option>
                                {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {filteredProjects.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                No projects found
                            </div>
                        ) : (
                            filteredProjects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProjectId(p.id)}
                                    className={`w-full text-left p-2 rounded-lg border transition-all ${selectedProjectId === p.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                                >
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className={`font-bold text-[13px] truncate ${p.status === 'Completed' ? 'text-slate-400 line-through' : p.status === 'Rejected' ? 'text-red-400' : 'text-slate-800'}`}>
                                            {p.name || 'Untitled'}
                                        </div>
                                        {p.isHidden && <EyeOff className="w-3 h-3 text-red-400 shrink-0 ml-1.5" />}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] uppercase font-bold text-slate-500 mb-1.5">
                                        <span className={p.status === 'Completed' ? 'text-green-500' : p.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'}>{p.status}</span>
                                        {p.client && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="truncate max-w-[70px]">{p.client}</span>
                                            </>
                                        )}
                                        {p.category && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-blue-500 bg-blue-50 px-1 py-0.5 rounded truncate max-w-[70px]">{p.category}</span>
                                            </>
                                        )}
                                    </div>
                                    {/* Financial Mini-Stats */}
                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest pt-1 border-t border-slate-100/50">
                                        <div className="text-emerald-500 flex items-center gap-0.5" title="Received">
                                            Recv: ֏{(projectFinancials.stats[p.id]?.received || 0).toLocaleString()}
                                        </div>
                                        <div className="text-blue-500 flex items-center gap-0.5" title="Expected Net">
                                            Exp: ֏{(projectFinancials.stats[p.id]?.expected || 0).toLocaleString()}
                                        </div>
                                        <div className="text-purple-500 flex items-center gap-0.5" title="Probably Net">
                                            Prob: ֏{(projectFinancials.stats[p.id]?.probably || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden relative">
                {activeProject ? (
                    <>
                        {/* Project Header */}
                        <div className="bg-white p-6 border-b border-slate-200 shadow-sm z-10 relative">
                            {/* Toggle Sidebar Button */}
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="absolute top-6 left-2 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg md:hidden xl:block"
                                title="Toggle Sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="flex justify-between items-start gap-4 mb-4 ml-8 xl:ml-10">
                                <div className="flex-1 min-w-0 flex flex-col">
                                    
                                    {/* Client (Above Name) */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        {viewMode === 'admin' ? (
                                            <DebouncedInput 
                                                value={activeProject.client || ''}
                                                onChange={val => updateProjectField('client', val)}
                                                placeholder="Client / Company"
                                                className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none flex-1 transition-colors"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activeProject.client || 'No Client'}</span>
                                        )}
                                    </div>

                                    {/* Project Name */}
                                    {viewMode === 'admin' ? (
                                        <DebouncedInput 
                                            value={activeProject.name}
                                            onChange={val => updateProjectField('name', val)}
                                            className="text-2xl font-black text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-full transition-colors mb-1"
                                            placeholder="Project Name"
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-black text-slate-800 mb-1">{activeProject.name}</h1>
                                    )}

                                    {/* Metadata: Category, Source, Teammates count */}
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-bold mb-2">
                                        {activeProject.category && (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] uppercase tracking-wider">
                                                {activeProject.category}
                                            </span>
                                        )}
                                        {activeProject.source && (
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
                                                <span className="text-slate-300">Source:</span> {activeProject.source}
                                            </span>
                                        )}
                                        {activeProject.teammates && activeProject.teammates.length > 0 && (
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
                                                <span className="text-slate-300">Team:</span> {activeProject.teammates.length} {activeProject.teammates.length === 1 ? 'person' : 'people'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Dates */}
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[9px] text-slate-400">Received:</span>
                                            {viewMode === 'admin' && (!activeProject.stages || activeProject.stages.length === 0) ? (
                                                <input 
                                                    type="date"
                                                    value={activeProject.receivedAt || ''}
                                                    onChange={e => updateProjectField('receivedAt', e.target.value)}
                                                    className="bg-slate-100 px-2 py-0.5 rounded outline-none focus:ring-1 ring-blue-500"
                                                />
                                            ) : (
                                                <span className={activeProject.stages?.length > 0 ? 'text-blue-500' : ''} title={activeProject.stages?.length > 0 ? "Derived from first stage" : ""}>
                                                    {activeProject.receivedAt || 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[9px] text-slate-400">Completed:</span>
                                            {viewMode === 'admin' && (!activeProject.stages || activeProject.stages.length === 0) ? (
                                                <input 
                                                    type="date"
                                                    value={activeProject.completedAt || ''}
                                                    onChange={e => updateProjectField('completedAt', e.target.value)}
                                                    className="bg-slate-100 px-2 py-0.5 rounded outline-none focus:ring-1 ring-blue-500"
                                                />
                                            ) : (
                                                <span className={activeProject.stages?.length > 0 ? 'text-blue-500' : ''} title={activeProject.stages?.length > 0 ? "Derived from last stage" : ""}>
                                                    {activeProject.completedAt || 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {viewMode === 'admin' && (
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <select 
                                            value={activeProject.status}
                                            onChange={e => updateProjectField('status', e.target.value)}
                                            disabled={activeProject.stages && activeProject.stages.length > 0}
                                            className="bg-white border border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-50"
                                            title={activeProject.stages && activeProject.stages.length > 0 ? "Status is automatically derived from stages" : ""}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="In Development">In Development</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Archived">Archived</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <button 
                                            onClick={() => updateProjectField('isHidden', !activeProject.isHidden)}
                                            className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider border transition-all ${activeProject.isHidden ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                        >
                                            {activeProject.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            {activeProject.isHidden ? 'Hidden from public' : 'Visible to public'}
                                        </button>
                                        <button onClick={deleteProject} className="text-slate-400 hover:text-red-500 p-1 mt-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Inner Tabs */}
                            <div className="flex gap-1 border-b border-slate-200 ml-8 xl:ml-10">
                                {[
                                    { id: 'financials', label: 'Financials' },
                                    { id: 'tasks', label: 'Tasks' },
                                    { id: 'overview', label: 'Overview' }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 relative">
                            {activeTab === 'overview' && (
                                <ProjectOverview 
                                    project={activeProject} 
                                    updateProjectField={updateProjectField} 
                                    viewMode={viewMode}
                                />
                            )}
                            {activeTab === 'tasks' && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col w-full overflow-hidden">
                                    <div className="p-2 md:p-4 overflow-x-auto custom-scrollbar w-full">
                                        <div className="min-w-0">
                                            <TaskBoard
                                                tasks={tasks}
                                                actions={tasksActions}
                                                projectId={activeProject.id}
                                                viewMode={viewMode}
                                                processTask={processTask}
                                                updateUser={updateUser}
                                                userXP={userData?.xp || 0}
                                                settings={userData?.gameplaySettings}
                                                isSectionHidden={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'financials' && (
                                <ProjectFinancials 
                                    project={activeProject} 
                                    updateProjectField={updateProjectField}
                                    transactionsActions={transactionsActions}
                                    transactions={transactions}
                                    categories={categories}
                                    viewMode={viewMode}
                                    accounts={accounts}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full p-8 text-center">
                        <Folder className="w-16 h-16 mb-4 text-slate-300" />
                        <p className="font-bold text-lg text-slate-600">Select a project</p>
                        <p className="text-xs mt-1 max-w-xs">Choose a project from the sidebar or create a new one to view details, tasks, and financials.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Components ---

const ProjectOverview = ({ project, updateProjectField, viewMode }) => {
    const [showSecret, setShowSecret] = useState(false);
    const [newTeammateName, setNewTeammateName] = useState('');
    const [newTeammateRole, setNewTeammateRole] = useState('');

    const handleAddLink = () => {
        const links = [...(project.links || []), { id: Date.now().toString(), name: 'New Link', url: '' }];
        updateProjectField('links', links);
    };

    const handleUpdateLink = (id, field, value) => {
        const links = project.links.map(l => l.id === id ? { ...l, [field]: value } : l);
        updateProjectField('links', links);
    };

    const handleRemoveLink = (id) => {
        const links = project.links.filter(l => l.id !== id);
        updateProjectField('links', links);
    };

    const handleAddTeammate = (e) => {
        if (e) e.preventDefault();
        if (!newTeammateName.trim()) return;
        const teammates = [...(project.teammates || []), { 
            id: Date.now().toString(), 
            name: newTeammateName.trim(), 
            role: newTeammateRole.trim() || 'Contributor' 
        }];
        updateProjectField('teammates', teammates);
        setNewTeammateName('');
        setNewTeammateRole('');
    };

    const handleRemoveTeammate = (id) => {
        const teammates = (project.teammates || []).filter(member => member.id !== id);
        updateProjectField('teammates', teammates);
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-3xl ml-2 md:ml-10">
            {/* Description */}
            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</h3>
                {viewMode === 'admin' ? (
                    <DebouncedInput 
                        component="textarea"
                        value={project.description || ''}
                        onChange={val => updateProjectField('description', val)}
                        placeholder="Project description and goals..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 min-h-[100px] resize-y shadow-sm"
                    />
                ) : (
                    <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        {project.description || 'No description provided.'}
                    </p>
                )}
            </div>

            {/* Project Details (Category & Source) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Category</h3>
                    {viewMode === 'admin' ? (
                        <DebouncedInput 
                            value={project.category || ''}
                            onChange={val => updateProjectField('category', val)}
                            placeholder="e.g. Web Development, Design, Consulting"
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                        />
                    ) : (
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm font-bold">
                            {project.category || 'Not specified'}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Source</h3>
                    {viewMode === 'admin' ? (
                        <DebouncedInput 
                            value={project.source || ''}
                            onChange={val => updateProjectField('source', val)}
                            placeholder="e.g. Upwork, Cold Outreach, Referral"
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                        />
                    ) : (
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm font-bold">
                            {project.source || 'Not specified'}
                        </p>
                    )}
                </div>
            </div>

            {/* Secret Data (Admin Only) */}
            {viewMode === 'admin' && (
                <div className="space-y-2 bg-slate-100 border border-slate-200 p-4 rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2 relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-slate-500" />
                            Secret Data & Credentials
                        </h3>
                        <button 
                            onClick={() => setShowSecret(!showSecret)}
                            className="text-[9px] font-bold uppercase tracking-wider bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 flex items-center gap-1"
                        >
                            {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {showSecret ? 'Hide' : 'Reveal'}
                        </button>
                    </div>
                    
                    {showSecret ? (
                        <DebouncedInput 
                            component="textarea"
                            value={project.secretData || ''}
                            onChange={val => updateProjectField('secretData', val)}
                            placeholder="Passwords, API keys, hidden notes..."
                            className="w-full bg-white border border-slate-300 rounded p-3 text-xs font-mono text-slate-800 outline-none focus:border-blue-500 min-h-[80px] relative z-10 shadow-inner"
                        />
                    ) : (
                        <div className="w-full bg-slate-200/50 border border-slate-300/50 rounded p-3 text-xs font-mono text-slate-400 blur-sm select-none relative z-10">
                            ••••••••••••••••••••••••••••••••••••••
                        </div>
                    )}
                    {/* Subtle aesthetic pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] pointer-events-none" />
                </div>
            )}

            {/* Links */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3" />
                        Project Links
                    </h3>
                    {viewMode === 'admin' && (
                        <button onClick={handleAddLink} className="text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                            + Add Link
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.links?.map(link => (
                        <div key={link.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
                            {viewMode === 'admin' ? (
                                <>
                                    <DebouncedInput 
                                        value={link.name} onChange={val => handleUpdateLink(link.id, 'name', val)}
                                        className="w-1/3 bg-slate-50 px-2 py-1 rounded text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500" placeholder="Name"
                                    />
                                    <DebouncedInput 
                                        value={link.url} onChange={val => handleUpdateLink(link.id, 'url', val)}
                                        className="flex-1 bg-slate-50 px-2 py-1 rounded text-xs text-blue-500 outline-none focus:ring-1 focus:ring-blue-500" placeholder="https://"
                                    />
                                    <button onClick={() => handleRemoveLink(link.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                </>
                            ) : (
                                <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 w-full px-2 hover:bg-slate-50 rounded transition-colors group">
                                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <LinkIcon className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-800 truncate">{link.name}</div>
                                        <div className="text-[9px] text-slate-500 truncate">{link.url}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </a>
                            )}
                        </div>
                    ))}
                    {(!project.links || project.links.length === 0) && (
                        <div className="col-span-2 text-xs text-slate-400 italic bg-white p-3 rounded-lg border border-slate-100 border-dashed text-center">
                            No links attached.
                        </div>
                    )}
                </div>
            </div>

            {/* Teammates Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Teammates
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.teammates?.map(member => {
                        const initials = member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                        return (
                            <div key={member.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                        {initials}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">{member.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{member.role}</div>
                                    </div>
                                </div>
                                {viewMode === 'admin' && (
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveTeammate(member.id)} 
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {(!project.teammates || project.teammates.length === 0) && (
                        <div className="col-span-2 text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-100 border-dashed text-center">
                            No teammates assigned to this project.
                        </div>
                    )}
                </div>

                {viewMode === 'admin' && (
                    <div className="bg-slate-100/50 border border-slate-200/60 p-3 rounded-xl flex flex-col sm:flex-row gap-3">
                        <input 
                            type="text" 
                            placeholder="Teammate Name"
                            value={newTeammateName}
                            onChange={e => setNewTeammateName(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 flex-1 shadow-sm"
                        />
                        <input 
                            type="text" 
                            placeholder="Role (e.g. Designer, Developer)"
                            value={newTeammateRole}
                            onChange={e => setNewTeammateRole(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 flex-1 shadow-sm"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddTeammate} 
                            disabled={!newTeammateName.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-lg shadow-sm shrink-0"
                        >
                            Add Teammate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Compact Project Tasks List
const ProjectTasksList = ({ project, tasks, tasksActions, viewMode }) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id && t.type === 'mission');
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || viewMode === 'guest') return;
        await tasksActions.add({
            title: newTaskTitle,
            projectId: project.id,
            type: 'mission',
            status: 'Todo',
            priority: 'Medium',
            level: 'Easy',
            tags: [],
            dueDate: new Date().toISOString().slice(0, 10),
        });
        setNewTaskTitle('');
    };

    const toggleTaskStatus = async (task) => {
        if (viewMode === 'guest') return;
        const newStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
        await tasksActions.update(task.id, { status: newStatus });
    };

    const deleteTask = async (id) => {
        if (viewMode === 'guest') return;
        await tasksActions.delete(id);
    };

    const pendingTasks = projectTasks.filter(t => t.status !== 'Completed');
    const completedTasks = projectTasks.filter(t => t.status === 'Completed');

    return (
        <div className="space-y-6 max-w-3xl ml-2 md:ml-10 animate-in fade-in">
            {viewMode === 'admin' && (
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <input 
                        type="text"
                        placeholder="Add a new task..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all">
                        Add
                    </button>
                </form>
            )}

            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Pending ({pendingTasks.length})
                </h3>
                {pendingTasks.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                        No pending tasks
                    </div>
                ) : (
                    pendingTasks.map(task => (
                        <div key={task.id} className="group bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-blue-300 transition-all">
                            <button 
                                onClick={() => toggleTaskStatus(task)}
                                className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-blue-500 flex items-center justify-center shrink-0 transition-colors"
                            >
                                {/* Empty box for pending */}
                            </button>
                            <span className="text-sm text-slate-800 font-bold flex-1">{task.title}</span>
                            {viewMode === 'admin' && (
                                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {completedTasks.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-200">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed ({completedTasks.length})
                    </h3>
                    <div className="opacity-60 hover:opacity-100 transition-opacity">
                        {completedTasks.map(task => (
                            <div key={task.id} className="group flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                                <button 
                                    onClick={() => toggleTaskStatus(task)}
                                    className="w-5 h-5 rounded-md bg-green-500 text-white flex items-center justify-center shrink-0 transition-colors hover:bg-green-600"
                                >
                                    <CheckCircle2 className="w-3 h-3" />
                                </button>
                                <span className="text-sm text-slate-500 font-bold flex-1 line-through">{task.title}</span>
                                {viewMode === 'admin' && (
                                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const ProjectFinancials = ({ project, updateProjectField, transactionsActions, transactions, categories, viewMode, accounts }) => {
    const [paymentModal, setPaymentModal] = useState(null); // { stageId, stageName, amount, date }

    // Calculate actual income/expense
    const projectIncomes = transactions.filter(t => t.projectId === project.id && t.type === 'income');
    const projectExpenses = transactions.filter(t => t.projectId === project.id && t.type === 'expense');
    
    const getStageActual = (stageId) => {
        return projectIncomes
            .filter(t => t.projectStageId === stageId)
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    };

    const totalExpected = project.stages?.reduce((sum, s) => sum + (Number(s.expectedIncome) || 0), 0) || 0;
    
    let expectedProjectNet = 0;
    let probablyProjectNet = 0;
    
    project.stages?.forEach(s => {
        if (s.status === 'Rejected') return;
        const stageIncome = getStageActual(s.id);
        const totalExpectedNet = Number(s.expectedNetIncome) || 0;
        const remainingNet = Math.max(0, totalExpectedNet - stageIncome);

        if (remainingNet > 0) {
            if (s.status === 'Not Started') probablyProjectNet += remainingNet;
            else expectedProjectNet += remainingNet;
        }
    });
    const totalActual = projectIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExpense = projectExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const netProfit = totalActual - totalExpense;

    const progressPercent = totalExpected > 0 ? Math.min(100, (totalActual / totalExpected) * 100) : 0;

    const updateProjectFromStages = (stages) => {
        const updates = { stages };
        
        if (stages.length > 0) {
            const allCompleted = stages.every(s => s.status === 'Completed');
            if (allCompleted && project.status !== 'Completed') updates.status = 'Completed';
            if (!allCompleted && project.status === 'Completed') updates.status = 'Active';

            const recvDates = stages.map(s => s.receivedAt).filter(Boolean).sort();
            if (recvDates.length > 0) updates.receivedAt = recvDates[0];

            const compDates = stages.map(s => s.completedAt).filter(Boolean).sort().reverse();
            if (compDates.length > 0) updates.completedAt = compDates[0];
        }
        
        updateProjectField(updates);
    };

    const handleAddStage = () => {
        const stages = [...(project.stages || []), { 
            id: Date.now().toString(), 
            name: 'Release', 
            expectedIncome: 0, 
            expectedNetIncome: 0,
            receivedAt: new Date().toISOString().slice(0, 10),
            completedAt: '',
            expectedPaymentDate: '',
            status: 'Active' 
        }];
        updateProjectFromStages(stages);
    };

    const handleUpdateStage = (id, field, value) => {
        const stages = project.stages.map(s => {
            if (s.id !== id) return s;
            let updated = { ...s, [field]: value };
            if (field === 'completedAt' && value) {
                const completedDate = new Date(value);
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                if (completedDate <= today) {
                    updated.status = 'Completed';
                }
            }
            return updated;
        });
        updateProjectFromStages(stages);
    };

    const handleRemoveStage = (id) => {
        const stages = project.stages.filter(s => s.id !== id);
        updateProjectFromStages(stages);
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        if (viewMode === 'guest' || !paymentModal) return;
        
        const amount = parseFloat(paymentModal.amount);
        if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

        if (!paymentModal.accountId) return alert("Please select an account");

        // Prefer an income category that mentions "project", otherwise just grab any income category
        let incomeCat = categories.find(c => c.type === 'income' && c.label.toLowerCase().includes('project')) || categories.find(c => c.type === 'income');
        
        // Compute createdAt Date from selected date (using 12:00 to avoid timezone shifts)
        const parts = paymentModal.date.split('-').map(Number);
        const createdAtDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);

        await transactionsActions.add({
            type: 'income',
            amount: amount,
            categoryId: incomeCat ? incomeCat.id : 'project_income',
            accountId: paymentModal.accountId,
            projectId: project.id,
            projectStageId: paymentModal.stageId,
            description: `${project.name} - ${paymentModal.stageName}`,
            date: paymentModal.date,
            createdAt: createdAtDate.toISOString()
        });

        setPaymentModal(null);
    };

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in ml-2 md:ml-10 relative">
            
            {/* Payment Modal Overlay */}
            {paymentModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <form onSubmit={submitPayment} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xl max-w-md w-full space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-black text-slate-800">Log Payment: {paymentModal.stageName}</h3>
                            <button type="button" onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount (֏)</label>
                            <input 
                                type="number" 
                                required
                                min="1"
                                autoFocus
                                value={paymentModal.amount} 
                                onChange={e => setPaymentModal({...paymentModal, amount: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-lg font-bold text-slate-800 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Received</label>
                            <input 
                                type="date" 
                                required
                                value={paymentModal.date} 
                                onChange={e => setPaymentModal({...paymentModal, date: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account</label>
                            <select
                                required
                                value={paymentModal.accountId}
                                onChange={e => setPaymentModal({...paymentModal, accountId: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                            >
                                <option value="" disabled>Select Account</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.label}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-sm py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-colors mt-2">
                            Save Payment
                        </button>
                    </form>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-blue-500/20 shadow-sm relative overflow-hidden bg-blue-50/10">
                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1 line-clamp-1">Expected Net</div>
                    <div className="text-lg font-black text-blue-700 flex items-center gap-1">
                        <span className="text-sm font-bold text-blue-400">֏</span>
                        {expectedProjectNet.toLocaleString()}
                    </div>
                    <Target className="w-12 h-12 absolute -right-3 -bottom-3 text-blue-100 opacity-50" />
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-purple-500/20 shadow-sm relative overflow-hidden bg-purple-50/10">
                    <div className="text-[9px] font-black uppercase tracking-widest text-purple-500 mb-1 line-clamp-1">Probably Net</div>
                    <div className="text-lg font-black text-purple-700 flex items-center gap-1">
                        <span className="text-sm font-bold text-purple-400">֏</span>
                        {probablyProjectNet.toLocaleString()}
                    </div>
                    <Target className="w-12 h-12 absolute -right-3 -bottom-3 text-purple-100 opacity-50" />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 line-clamp-1">Expected Gross</div>
                    <div className="text-lg font-black text-slate-800 flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-400">֏</span>
                        {totalExpected.toLocaleString()}
                    </div>
                    <Target className="w-12 h-12 absolute -right-3 -bottom-3 text-slate-100 opacity-50" />
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-blue-500/20 shadow-sm relative overflow-hidden bg-blue-50/30">
                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-600/70 mb-1 line-clamp-1">Gross Received</div>
                    <div className="text-lg font-black text-blue-600 flex items-center gap-1">
                        <span className="text-sm font-bold text-blue-400">֏</span>
                        {totalActual.toLocaleString()}
                    </div>
                    <ArrowUpCircle className="w-12 h-12 absolute -right-3 -bottom-3 text-blue-100 opacity-50" />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-red-500/20 shadow-sm relative overflow-hidden bg-red-50/30">
                    <div className="text-[9px] font-black uppercase tracking-widest text-red-600/70 mb-1 line-clamp-1">Project Expenses</div>
                    <div className="text-lg font-black text-red-600 flex items-center gap-1">
                        <span className="text-sm font-bold text-red-400">֏</span>
                        {totalExpense.toLocaleString()}
                    </div>
                    <ArrowDownCircle className="w-12 h-12 absolute -right-3 -bottom-3 text-red-100 opacity-50" />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-500/20 shadow-sm relative overflow-hidden bg-emerald-50/50">
                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mb-1 line-clamp-1">Net Profit</div>
                    <div className="text-lg font-black text-emerald-600 flex items-center gap-1">
                        <span className="text-sm font-bold text-emerald-400">֏</span>
                        {netProfit.toLocaleString()}
                    </div>
                    <CheckCircle2 className="w-12 h-12 absolute -right-3 -bottom-3 text-emerald-100 opacity-50" />
                </div>
            </div>

            {/* Stages List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Project Stages</h3>
                    {viewMode === 'admin' && (
                        <button onClick={handleAddStage} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                            + Add Stage
                        </button>
                    )}
                </div>
                
                <div className="divide-y divide-slate-100">
                    {project.stages?.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                            No stages defined
                        </div>
                    ) : (
                        project.stages?.map((stage, index) => {
                            const actual = getStageActual(stage.id);
                            const expected = Number(stage.expectedIncome) || 0;
                            const isPaid = expected > 0 && actual >= expected;

                            const stageIncomes = projectIncomes.filter(t => t.projectStageId === stage.id);
                            const latestPayment = stageIncomes.length > 0 ? new Date(Math.max(...stageIncomes.map(t => new Date(t.date || t.createdAt)))) : null;
                            const paymentDayStr = latestPayment ? latestPayment.toLocaleDateString() : 'Pending';

                            return (
                                <div key={stage.id} className="p-4 md:p-5 hover:bg-slate-50 transition-colors flex flex-col gap-4 border-b border-slate-100 last:border-0 relative">
                                    
                                    {/* Top Row: Index, Name, Status, Actions */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-4 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-[200px]">
                                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Stage Name</div>
                                                {viewMode === 'admin' ? (
                                                    <DebouncedInput 
                                                        value={stage.name} onChange={val => handleUpdateStage(stage.id, 'name', val)}
                                                        className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="font-bold text-sm text-slate-800 px-1">{stage.name}</div>
                                                )}
                                            </div>
                                            <div className="min-w-[140px]">
                                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</div>
                                                {viewMode === 'admin' ? (
                                                    <select 
                                                        value={stage.status} onChange={e => handleUpdateStage(stage.id, 'status', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 outline-none focus:border-blue-500 shadow-sm"
                                                    >
                                                        <option>Not Started</option>
                                                        <option>Active</option>
                                                        <option>Completed</option>
                                                        <option>Rejected</option>
                                                    </select>
                                                ) : (
                                                    <div className="font-bold text-xs text-slate-600 px-3 py-1.5 bg-slate-100 rounded-lg inline-block border border-slate-200">{stage.status}</div>
                                                )}
                                            </div>
                                        </div>

                                        {viewMode === 'admin' && (
                                            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Received</span>
                                                    <span className={`text-sm font-black flex items-center gap-1 ${isPaid ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                        <span className="text-[10px]">֏</span>{actual.toLocaleString()}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => setPaymentModal({ stageId: stage.id, stageName: stage.name, amount: '', date: new Date().toISOString().slice(0, 10), accountId: accounts.length > 0 ? accounts[0].id : '' })}
                                                    className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${isPaid ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20'}`}
                                                    title="Log Payment"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleRemoveStage(stage.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Row: Financials and Timeline */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ml-0 md:ml-12 mt-2">
                                        
                                        {/* Financials Card */}
                                        <div className="col-span-1 flex flex-col gap-3 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Financials</div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-bold uppercase">Expected Gross</span>
                                                {viewMode === 'admin' ? (
                                                    <DebouncedInput 
                                                        type="number" value={stage.expectedIncome} onChange={val => handleUpdateStage(stage.id, 'expectedIncome', val)}
                                                        className="w-24 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-800 outline-none focus:border-blue-500 text-right"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-slate-800">֏{expected.toLocaleString()}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-bold uppercase">Expected Net</span>
                                                {viewMode === 'admin' ? (
                                                    <DebouncedInput 
                                                        type="number" value={stage.expectedNetIncome || 0} onChange={val => handleUpdateStage(stage.id, 'expectedNetIncome', val)}
                                                        className="w-24 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-800 outline-none focus:border-blue-500 text-right"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-slate-800">֏{(Number(stage.expectedNetIncome)||0).toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline Card */}
                                        <div className="col-span-1 lg:col-span-2 flex flex-col gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-xl shadow-sm">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Timeline</div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="space-y-1.5">
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> Received</div>
                                                    {viewMode === 'admin' ? (
                                                        <input type="date" value={stage.receivedAt || ''} onChange={e => handleUpdateStage(stage.id, 'receivedAt', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs outline-none focus:border-blue-500" />
                                                    ) : (
                                                        <div className="font-bold text-xs">{stage.receivedAt || 'N/A'}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> Completed</div>
                                                    {viewMode === 'admin' ? (
                                                        <input type="date" value={stage.completedAt || ''} onChange={e => handleUpdateStage(stage.id, 'completedAt', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs outline-none focus:border-blue-500" />
                                                    ) : (
                                                        <div className="font-bold text-xs">{stage.completedAt || 'N/A'}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> Exp. Payment</div>
                                                    {viewMode === 'admin' ? (
                                                        <input type="date" value={stage.expectedPaymentDate || ''} onChange={e => handleUpdateStage(stage.id, 'expectedPaymentDate', e.target.value)} className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs outline-none focus:border-amber-500 text-amber-600" />
                                                    ) : (
                                                        <div className="font-bold text-xs text-amber-600">{stage.expectedPaymentDate || 'N/A'}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1"><DollarSign className="w-3 h-3"/> Payment Day</div>
                                                    <div className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">{paymentDayStr}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Income History */}
            {projectIncomes.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Payment History</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {projectIncomes.map(tx => {
                            const stageName = project.stages?.find(s => s.id === tx.projectStageId)?.name || 'Unknown Stage';
                            return (
                                <div key={tx.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-emerald-600 text-[10px]">֏</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-800 truncate">{stageName}</div>
                                        <div className="text-[9px] text-slate-400 uppercase tracking-widest">{new Date(tx.date || tx.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-sm font-black text-emerald-600">֏{Number(tx.amount).toLocaleString()}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Expense History */}
            {projectExpenses.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-slate-200">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Expense History</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {projectExpenses.map(tx => (
                            <div key={tx.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-red-600 text-[10px]">֏</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-800 truncate">{tx.description || 'Project Expense'}</div>
                                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">{new Date(tx.date || tx.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="text-sm font-black text-red-600">-֏{Number(tx.amount).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsModule;
