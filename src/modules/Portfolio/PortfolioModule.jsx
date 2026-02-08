import React, { useState, useCallback } from 'react';
import SkillTree from './components/SkillTree';
import ProjectForge from './components/ProjectForge';
import ServicesList from './components/ServicesList';
import { EducationSection, ExperienceSection, LanguagesSection, AchievementsSection } from './components/InfoSections';
import { LayoutDashboard, Sliders, Eye, EyeOff, User, ArrowUp, ArrowDown, FileText, Download, Trash2, Globe, Plus, X } from 'lucide-react';

const DEFAULT_SECTIONS = ['about', 'cv', 'experience', 'skills', 'languages', 'projects', 'achievements', 'services', 'education'];

const SECTION_LABELS = {
    about: 'About Me',
    cv: 'CV & Portfolio',
    experience: 'Experience',
    skills: 'Skills',
    languages: 'Languages',
    projects: 'Projects',
    achievements: 'Achievements',
    services: 'Services',
    education: 'Education'
};

const AboutMeSection = ({ userData, updateUser, viewMode, isSectionHidden, toggleSectionVisibility }) => {
    const [localBio, setLocalBio] = React.useState(userData.bio || '');

    React.useEffect(() => {
        if (userData.bio !== undefined) {
             setLocalBio(userData.bio);
        }
    }, [userData.bio]);

    const handleChange = (e) => {
        setLocalBio(e.target.value);
    };

    const handleBlur = () => {
        if (localBio !== userData.bio) {
             updateUser({ bio: localBio });
        }
    };

    if (viewMode === 'guest' && (isSectionHidden || !userData.bio)) return null;

    return (
        <div className={`space-y-4`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-neutral-800 rounded-lg text-neutral-400">
                        <User className="w-5 h-5" />
                     </div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-neutral-300">About Me</h3>
                     {viewMode === 'admin' && isSectionHidden && (
                        <span className="text-[9px] font-bold text-red-500 uppercase border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Hidden Section</span>
                     )}
                </div>
                {viewMode === 'admin' && (
                    <button
                        onClick={toggleSectionVisibility}
                        className={`p-2 rounded-lg transition-all ${isSectionHidden ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-neutral-600 hover:text-white'}`}
                        title={isSectionHidden ? "Show Section" : "Hide Section"}
                    >
                        {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
             </div>
             
             {viewMode === 'admin' ? (
                 <textarea
                    className="w-full bg-neutral-900/30 border border-white/5 rounded-xl p-4 text-sm text-neutral-300 focus:border-blue-500/50 outline-none min-h-[100px] leading-relaxed resize-none"
                    placeholder="Write a brief professional bio..."
                    value={localBio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                 />
             ) : (
                 <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-6 text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                     {userData.bio}
                 </div>
             )}
        </div>
    );
};

const PortfolioSettings = ({ sectionOrder, setSectionOrder, isSectionVisible, toggleSectionVisibility }) => {
    const move = (index, direction) => {
        const newOrder = [...sectionOrder];
        if (direction === -1 && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 1 && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setSectionOrder(newOrder); 
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Portfolio Configuration</h3>
                <p className="text-xs text-neutral-500 mb-6">Manage visibility and order of your portfolio sections.</p>

                <div className="space-y-2">
                    {sectionOrder.map((key, index) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-neutral-600 w-4">{index + 1}</span>
                                <span className="text-sm font-bold text-neutral-300 uppercase tracking-wide">{SECTION_LABELS[key] || key}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleSectionVisibility(key)}
                                    className={`p-2 rounded-lg transition-all ${!isSectionVisible(key) ? 'text-red-500 bg-red-900/10' : 'text-neutral-500 bg-white/5'}`}
                                >
                                    {!isSectionVisible(key) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <div className="h-4 w-px bg-white/10 mx-1" />
                                <button 
                                    onClick={() => move(index, -1)} 
                                    disabled={index === 0}
                                    className="p-2 text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => move(index, 1)} 
                                    disabled={index === sectionOrder.length - 1}
                                    className="p-2 text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PortfolioModule = ({
    userData,
    updateSkillLevel, addNewSkill, updateSkillDetails, deleteSkill, updateUser,
    projectsActions, servicesActions, educationActions, experienceActions, languagesActions, achievementsActions,
    viewMode,
    activeView, setActiveView
}) => {
    // Navigation State: 'portfolio' or 'settings' handled by parent
    const [newPortfolioLink, setNewPortfolioLink] = useState({ name: '', url: '' });
    
    // Initialize order
    const sectionOrder = React.useMemo(() => {
        const order = (userData.careerSectionOrder && Array.isArray(userData.careerSectionOrder)) 
            ? userData.careerSectionOrder 
            : DEFAULT_SECTIONS;
        const merged = [...new Set([...order, ...DEFAULT_SECTIONS])]; 
        return merged.filter(k => DEFAULT_SECTIONS.includes(k));
    }, [userData.careerSectionOrder]);

    const handleUpdateSectionOrder = (newOrder) => {
        updateUser({ careerSectionOrder: newOrder });
    };

    // --- Privacy Logic ---
    const isSectionVisible = useCallback((sectionKey) => {
        const careerPrivacy = userData.modulePrivacy?.career || {};
        if (careerPrivacy.enabled === false) return false;
        return careerPrivacy.sections?.[sectionKey] !== false;
    }, [userData.modulePrivacy]);

    const toggleSectionVisibility = (sectionKey) => {
        const currentPrivacy = userData.modulePrivacy || {};
        const currentModule = currentPrivacy.career || {}; // Still using 'career' key for backward compatibility in DB
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

    const addPortfolioLink = () => {
        if (newPortfolioLink.name && newPortfolioLink.url) {
            const currentLinks = userData.portfolioLinks || [];
            updateUser({
                portfolioLinks: [...currentLinks, { id: Date.now(), ...newPortfolioLink }]
            });
            setNewPortfolioLink({ name: '', url: '' });
        }
    };

    const removePortfolioLink = (id) => {
        const currentLinks = userData.portfolioLinks || [];
        updateUser({
            portfolioLinks: currentLinks.filter(l => l.id !== id)
        });
    };

    const renderCVSection = () => {
        const hasResume = userData.cvLink && userData.cvLink !== '#';
        const hasLinks = userData.portfolioLinks && userData.portfolioLinks.length > 0;
        const showResumeCard = (viewMode === 'admin') || (isSectionVisible('cv') && hasResume);
        const showLinksCard = (viewMode === 'admin') || (isSectionVisible('cv') && hasLinks);

        if (!showResumeCard && !showLinksCard) return null;

        return (
            <div className={`space-y-6`}>
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
                        <button onClick={() => toggleSectionVisibility('cv')} className={`p-2 rounded-lg transition-all ${!isSectionVisible('cv') ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-neutral-600 hover:text-white'}`} title={!isSectionVisible('cv') ? "Show Section" : "Hide Section"}>
                            {!isSectionVisible('cv') ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {showResumeCard && (
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
                                                <a href={userData.cvLink} download={userData.cvName || 'Resume'} className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Download">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                {viewMode === 'admin' && (
                                                    <button onClick={() => updateUser({ cvLink: '#', cvName: '' })} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Remove">
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
                                                    <Download className="w-4 h-4" /> Upload File
                                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,image/*" onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => { updateUser({ cvLink: reader.result, cvName: file.name }); };
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
                        )}

                        {showLinksCard && (
                            <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-6 flex flex-col">
                                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">Portfolio Links</h4>
                                <div className="space-y-2 flex-1">
                                    {userData.portfolioLinks && userData.portfolioLinks.length > 0 ? (
                                        userData.portfolioLinks.map(link => (
                                            <div key={link.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-xl group hover:border-blue-500/30 transition-all">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-bold text-neutral-300 hover:text-blue-400 transition-colors">
                                                    <Globe className="w-4 h-4 text-neutral-500 group-hover:text-blue-500 transition-colors" /> {link.name}
                                                </a>
                                                {viewMode === 'admin' && (
                                                    <button onClick={() => removePortfolioLink(link.id)} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : ( <div className="text-xs text-neutral-500 italic py-2">No portfolio links added.</div> )}
                                </div>

                                {viewMode === 'admin' && (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Name</label>
                                            <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50" placeholder="e.g. Behance" value={newPortfolioLink.name} onChange={(e) => setNewPortfolioLink({ ...newPortfolioLink, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">URL</label>
                                            <input className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50" placeholder="https://..." value={newPortfolioLink.url} onChange={(e) => setNewPortfolioLink({ ...newPortfolioLink, url: e.target.value })} />
                                        </div>
                                        <button onClick={addPortfolioLink} className="w-full p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Add Link
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Top Navigation: Portfolio | Settings */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-2 md:pb-6 mb-3 md:mb-8 gap-2 md:gap-4">
                 {/* Navigation Tabs - Clean, no title */}
                 <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-white/5 overflow-x-auto no-scrollbar w-full md:w-auto">
                    <button onClick={() => setActiveView('portfolio')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeView === 'portfolio' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>
                        <LayoutDashboard className="w-3 h-3" /> Portfolio
                    </button>
                    {viewMode === 'admin' && (
                        <button onClick={() => setActiveView('settings')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeView === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>
                            <Sliders className="w-3 h-3" /> Settings
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {activeView === 'portfolio' ? (
                <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-500">
                        <div className="space-y-16">
                        {sectionOrder.map(section => {
                            switch (section) {
                                case 'about': return <AboutMeSection key="about" userData={userData} updateUser={updateUser} viewMode={viewMode} isSectionHidden={!isSectionVisible('about')} toggleSectionVisibility={() => toggleSectionVisibility('about')} />;
                                case 'cv': return <div key="cv">{renderCVSection()}</div>;
                                case 'experience':
                                    return (
                                        <ExperienceSection
                                            key="experience"
                                            items={userData.experience}
                                            actions={experienceActions}
                                            viewMode={viewMode}
                                            isSectionHidden={!isSectionVisible('experience')}
                                            toggleSectionVisibility={() => toggleSectionVisibility('experience')}
                                        />
                                    );
                                case 'skills':
                                    return (userData.skills?.length > 0 || viewMode === 'admin') && (
                                        <SkillTree
                                            key="skills"
                                            skills={userData.skills}
                                            updateSkillLevel={updateSkillLevel}
                                            addNewSkill={addNewSkill}
                                            updateSkillDetails={updateSkillDetails}
                                            deleteSkill={deleteSkill}
                                            viewMode={viewMode}
                                            isSectionHidden={!isSectionVisible('skills')}
                                            toggleSectionVisibility={() => toggleSectionVisibility('skills')}
                                        />
                                    );
                                case 'languages':
                                    return (userData.languages?.length > 0 || viewMode === 'admin') && (
                                        <LanguagesSection
                                            key="languages"
                                            items={userData.languages}
                                            actions={languagesActions}
                                            viewMode={viewMode}
                                            isSectionHidden={!isSectionVisible('languages')}
                                            toggleSectionVisibility={() => toggleSectionVisibility('languages')}
                                        />
                                    );
                                case 'projects':
                                    return (userData.projects?.length > 0 || viewMode === 'admin') && (
                                        <ProjectForge
                                            key="projects"
                                            projects={userData.projects}
                                            actions={projectsActions}
                                            viewMode={viewMode}
                                            isSectionHidden={!isSectionVisible('projects')}
                                            toggleSectionVisibility={() => toggleSectionVisibility('projects')}
                                        />
                                    );
                                case 'achievements':
                                    return (userData.achievements?.length > 0 || viewMode === 'admin') && (
                                            <AchievementsSection
                                            key="achievements"
                                            items={userData.achievements}
                                            actions={achievementsActions}
                                            viewMode={viewMode}
                                            isSectionHidden={!isSectionVisible('achievements')}
                                            toggleSectionVisibility={() => toggleSectionVisibility('achievements')}
                                        />
                                    );
                                case 'services':
                                    return (userData.services?.length > 0 || viewMode === 'admin') && (
                                        <ServicesList
                                            key="services"
                                            services={userData.services}
                                            actions={servicesActions}
                                            viewMode={viewMode}
                                            isSectionHidden={!isSectionVisible('services')}
                                            toggleSectionVisibility={() => toggleSectionVisibility('services')}
                                        />
                                    );
                                case 'education':
                                    return (userData.education?.length > 0 || viewMode === 'admin') && (
                                        <EducationSection
                                            key="education"
                                            items={userData.education}
                                            actions={educationActions}
                                            viewMode={viewMode}
                                            isSectionHidden={!isSectionVisible('education')}
                                            toggleSectionVisibility={() => toggleSectionVisibility('education')}
                                        />
                                    );
                                default: return null;
                            }
                        })}
                    </div>
                </div>
            ) : (
                <PortfolioSettings 
                    sectionOrder={sectionOrder} 
                    setSectionOrder={handleUpdateSectionOrder}
                    isSectionVisible={isSectionVisible}
                    toggleSectionVisibility={toggleSectionVisibility}
                />
            )}
        </div>
    );
};

export default PortfolioModule;
