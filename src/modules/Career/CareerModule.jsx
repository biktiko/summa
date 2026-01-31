import React, { useState } from 'react';
import SkillTree from './components/SkillTree';
import ProjectForge from './components/ProjectForge';
import ServicesList from './components/ServicesList';
import { EducationSection, ExperienceSection, LanguagesSection, AchievementsSection } from './components/InfoSections';
import TaskBoard from '../../components/MissionControl/TaskBoard';
import GoalsBoard from '../../components/MissionControl/GoalsBoard';
import NotesBoard from '../../components/MissionControl/NotesBoard';
import DailyProtocol from '../../components/MissionControl/DailyProtocol';
import { LayoutDashboard, CheckSquare, FileText, Download, X, Plus, Globe, Eye, EyeOff, Trash2, StickyNote } from 'lucide-react';

const ArchitectModule = ({
    userData,
    updateSkillLevel, addNewSkill, updateSkillDetails, deleteSkill, updateUserCv, updateUser,
    skillsActions, projectsActions, servicesActions, educationActions, experienceActions, languagesActions, achievementsActions, tasksActions, goalsActions, notesActions, protocolsActions,
    processTask, viewMode,
    activeView, setActiveView, missionTab, setMissionTab
}) => {
    const [newPortfolioLink, setNewPortfolioLink] = useState({ name: '', url: '' });

    // --- Privacy Logic ---
    const getModulePrivacy = () => userData.modulePrivacy?.career || {};
    const isModuleEnabled = getModulePrivacy().enabled !== false;

    const isSectionVisible = (sectionKey) => {
        if (!isModuleEnabled) return false;
        return getModulePrivacy().sections?.[sectionKey] !== false;
    };

    const toggleSectionVisibility = (sectionKey) => {
        const currentPrivacy = userData.modulePrivacy || {};
        const currentModule = currentPrivacy.career || {};
        const currentSections = currentModule.sections || {};

        const newState = {
            ...currentPrivacy,
            career: {
                ...currentModule,
                sections: {
                    ...currentSections,
                    [sectionKey]: !isSectionVisible(sectionKey)
                }
            }
        };
        updateUser({ modulePrivacy: newState });
    };

    // Helper to add portfolio link
    const addPortfolioLink = () => {
        if (newPortfolioLink.name && newPortfolioLink.url) {
            const currentLinks = userData.portfolioLinks || [];
            updateUser({
                portfolioLinks: [...currentLinks, { id: Date.now(), ...newPortfolioLink }]
            });
            setNewPortfolioLink({ name: '', url: '' });
        }
    };

    // Helper to remove portfolio link
    const removePortfolioLink = (id) => {
        const currentLinks = userData.portfolioLinks || [];
        updateUser({
            portfolioLinks: currentLinks.filter(l => l.id !== id)
        });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Module Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 mb-8 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2" style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}>Career</h1>
                    <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest pl-1">
                        My Portfolio
                    </p>
                </div>

                {/* Sub-Navigation */}
                {viewMode === 'admin' && (
                    <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-white/5 self-start md:self-auto">
                        <button
                            onClick={() => setActiveView('profile')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeView === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <LayoutDashboard className="w-3 h-3" /> Portfolio
                        </button>
                        <button
                            onClick={() => setActiveView('tasks')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeView === 'tasks' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <CheckSquare className="w-3 h-3" /> Tasks
                        </button>
                        <button
                            onClick={() => setActiveView('notes')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeView === 'notes' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <StickyNote className="w-3 h-3" /> Notes
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {activeView === 'profile' ? (
                <div className="grid grid-cols-1 gap-8">
                    {/* Main Column */}
                    <div className="space-y-16">

                        {/* 1. CV / Resume Section */}
                        {!(viewMode === 'guest' && !isSectionVisible('cv')) && (
                            <div className={`space-y-6 ${!isSectionVisible('cv') ? 'opacity-50' : ''}`}>
                                {/* Section Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-600/10 rounded-xl">
                                            <FileText className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Curriculum Vitae & Portfolio</h3>
                                            <p className="text-xs text-neutral-500">Official professional record.</p>
                                        </div>
                                        {viewMode === 'admin' && !isSectionVisible('cv') && (
                                            <span className="text-[9px] font-bold text-red-500 uppercase border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Hidden Section</span>
                                        )}
                                    </div>
                                    {viewMode === 'admin' && (
                                        <button
                                            onClick={() => toggleSectionVisibility('cv')}
                                            className={`p-2 rounded-lg transition-all ${!isSectionVisible('cv') ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-neutral-600 hover:text-white'}`}
                                            title={!isSectionVisible('cv') ? "Show Section" : "Hide Section"}
                                        >
                                            {!isSectionVisible('cv') ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Resume Card */}
                                    <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">Resume File</h4>
                                            {userData.cvLink && userData.cvLink !== '#' ? (
                                                <div className="flex items-center gap-3 p-4 bg-black/40 border border-white/10 rounded-xl group hover:border-blue-500/30 transition-all">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-white truncate">{userData.cvName || 'My_Resume.pdf'}</div>
                                                        <div className="text-[10px] text-neutral-500 font-mono uppercase">PDF / DOC Document</div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={userData.cvLink}
                                                            download={userData.cvName || 'Resume'}
                                                            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        {viewMode === 'admin' && (
                                                            <button
                                                                onClick={() => updateUser({ cvLink: '#', cvName: '' })}
                                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Remove"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                                                    <p className="text-xs text-neutral-500 mb-2">No resume uploaded</p>
                                                    {viewMode === 'admin' && (
                                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-500 transition-all text-xs font-bold uppercase tracking-wider">
                                                            <Download className="w-4 h-4" />
                                                            Upload File
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".pdf,.doc,.docx,image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            updateUser({
                                                                                cvLink: reader.result,
                                                                                cvName: file.name
                                                                            });
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Portfolio Links Card */}
                                    <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-6 flex flex-col">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">Portfolio Links</h4>
                                        <div className="space-y-2 flex-1">
                                            {userData.portfolioLinks && userData.portfolioLinks.length > 0 ? (
                                                userData.portfolioLinks.map(link => (
                                                    <div key={link.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-xl group hover:border-blue-500/30 transition-all">
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-bold text-neutral-300 hover:text-blue-400 transition-colors">
                                                            <Globe className="w-4 h-4 text-neutral-500 group-hover:text-blue-500 transition-colors" />
                                                            {link.name}
                                                        </a>
                                                        {viewMode === 'admin' && (
                                                            <button onClick={() => removePortfolioLink(link.id)} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-xs text-neutral-500 italic py-2">No portfolio links added.</div>
                                            )}
                                        </div>

                                        {viewMode === 'admin' && (
                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Name</label>
                                                    <input
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
                                                        placeholder="e.g. Behance"
                                                        value={newPortfolioLink.name}
                                                        onChange={(e) => setNewPortfolioLink({ ...newPortfolioLink, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">URL</label>
                                                    <input
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
                                                        placeholder="https://..."
                                                        value={newPortfolioLink.url}
                                                        onChange={(e) => setNewPortfolioLink({ ...newPortfolioLink, url: e.target.value })}
                                                    />
                                                </div>
                                                <button
                                                    onClick={addPortfolioLink}
                                                    className="w-full p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Link
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Experience */}
                        <ExperienceSection
                            items={userData.experience}
                            actions={experienceActions}
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('experience')}
                            toggleSectionVisibility={() => toggleSectionVisibility('experience')}
                        />

                        {/* 3. Skills */}
                        <SkillTree
                            skills={userData.skills}
                            updateSkillLevel={updateSkillLevel}
                            addNewSkill={addNewSkill}
                            updateSkillDetails={updateSkillDetails}
                            deleteSkill={deleteSkill}
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('skills')}
                            toggleSectionVisibility={() => toggleSectionVisibility('skills')}
                        />

                        {/* 4. Languages */}
                        <LanguagesSection
                            items={userData.languages}
                            actions={languagesActions}
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('languages')}
                            toggleSectionVisibility={() => toggleSectionVisibility('languages')}
                        />

                        {/* 5. Projects */}
                        <ProjectForge
                            projects={userData.projects}
                            actions={projectsActions}
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('projects')}
                            toggleSectionVisibility={() => toggleSectionVisibility('projects')}
                        />

                        {/* 6. Achievements */}
                        <AchievementsSection
                            items={userData.achievements}
                            actions={achievementsActions}
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('achievements')}
                            toggleSectionVisibility={() => toggleSectionVisibility('achievements')}
                        />

                        {/* 7. Services */}
                        <ServicesList
                            services={userData.services}
                            actions={servicesActions}
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('services')}
                            toggleSectionVisibility={() => toggleSectionVisibility('services')}
                        />

                        <div className="grid grid-cols-1 gap-8">
                            <EducationSection
                                items={userData.education}
                                actions={educationActions}
                                viewMode={viewMode}
                                isSectionHidden={!isSectionVisible('education')}
                                toggleSectionVisibility={() => toggleSectionVisibility('education')}
                            />
                        </div>
                    </div>
                </div>
            ) : activeView === 'tasks' ? (
                <div className="flex-1 min-h-[600px] flex flex-col">
                    {/* Mission Control Tabs */}
                    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-1">
                        <button
                            onClick={() => setMissionTab('protocol')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'protocol' ? 'text-purple-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Routine
                            {missionTab === 'protocol' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setMissionTab('missions')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'missions' ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Mission & Backlog
                            {missionTab === 'missions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setMissionTab('goals')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'goals' ? 'text-yellow-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Strategic Goals
                            {missionTab === 'goals' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 rounded-t-full" />}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {missionTab === 'protocol' ? (
                            <DailyProtocol
                                protocols={userData.protocols}
                                actions={protocolsActions}
                                moduleId="architect"
                                viewMode={viewMode}
                                processTask={processTask}
                                isSectionHidden={!isSectionVisible('protocol')}
                                toggleSectionVisibility={() => toggleSectionVisibility('protocol')}
                            />
                        ) : missionTab === 'missions' ? (
                            <TaskBoard
                                tasks={userData.tasks}
                                actions={tasksActions}
                                moduleId="architect"
                                viewMode={viewMode}
                                processTask={processTask}
                                settings={userData.gameplaySettings}
                                isSectionHidden={!isSectionVisible('tasks')}
                                toggleSectionVisibility={() => toggleSectionVisibility('tasks')}
                            />
                        ) : (
                            <GoalsBoard
                                goals={userData.goals}
                                tasks={userData.tasks}
                                actions={goalsActions}
                                viewMode={viewMode}
                                processTask={processTask}
                                moduleId="architect"
                                isSectionHidden={!isSectionVisible('goals')}
                                toggleSectionVisibility={() => toggleSectionVisibility('goals')}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <NotesBoard
                        notes={userData.notes}
                        actions={notesActions}
                        viewMode={viewMode}
                        moduleId="architect"
                        isSectionHidden={!isSectionVisible('notes')}
                        toggleSectionVisibility={() => toggleSectionVisibility('notes')}
                    />
                </div>
            )}
        </div>
    );
};

export default ArchitectModule;
