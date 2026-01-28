import React, { useState } from 'react';
import HealthMetrics from './components/HealthMetrics';
import BiometricScanner from './components/BiometricScanner';
import TaskBoard from '../../components/MissionControl/TaskBoard';
import GoalsBoard from '../../components/MissionControl/GoalsBoard';
import NotesBoard from '../../components/MissionControl/NotesBoard';
import DailyProtocol from '../../components/MissionControl/DailyProtocol';
import { Activity, Dna, Target, StickyNote } from 'lucide-react';

const HealthModule = ({
    userData,
    updateUser,
    tasksActions, goalsActions, notesActions, biometricsActions, protocolsActions,
    processTask, viewMode,
    activeView, setActiveView, missionTab, setMissionTab
}) => {
    const [statusTab, setStatusTab] = useState('metrics'); // 'metrics' | 'telemetry'

    // --- Privacy Logic ---
    const getModulePrivacy = () => userData.modulePrivacy?.health || {};
    const isModuleEnabled = getModulePrivacy().enabled !== false;

    const isSectionVisible = (sectionKey) => {
        if (!isModuleEnabled) return false;
        return getModulePrivacy().sections?.[sectionKey] !== false;
    };

    const toggleSectionVisibility = (sectionKey) => {
        const currentPrivacy = userData.modulePrivacy || {};
        const currentModule = currentPrivacy.health || {};
        const currentSections = currentModule.sections || {};

        const newState = {
            ...currentPrivacy,
            health: {
                ...currentModule,
                sections: {
                    ...currentSections,
                    [sectionKey]: !isSectionVisible(sectionKey)
                }
            }
        };
        updateUser({ modulePrivacy: newState });
    };

    const isStatusView = activeView === 'dashboard';

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Module Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Health Protocol</h1>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                        System Status: <span className="text-emerald-500">Optimal</span>
                    </p>
                </div>

                {/* Sub-Navigation */}
                <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-white/5 self-start md:self-auto overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${isStatusView ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Activity className="w-3 h-3" /> Status
                    </button>
                    <button
                        onClick={() => setActiveView('tasks')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeView === 'tasks' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Target className="w-3 h-3" /> Tasks
                    </button>
                    <button
                        onClick={() => setActiveView('notes')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeView === 'notes' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <StickyNote className="w-3 h-3" /> Notes
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isStatusView ? (
                <div className="flex-1 min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-1">
                        <button
                            onClick={() => setStatusTab('metrics')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${statusTab === 'metrics' ? 'text-emerald-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Body Metrics
                            {statusTab === 'metrics' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setStatusTab('telemetry')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${statusTab === 'telemetry' ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Bio-Telemetry
                            {statusTab === 'telemetry' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1">
                        {statusTab === 'metrics' ? (
                            <HealthMetrics
                                userData={userData}
                                updateUser={updateUser}
                                viewMode={viewMode}
                                isSectionHidden={!isSectionVisible('metrics')}
                                toggleSectionVisibility={() => toggleSectionVisibility('metrics')}
                            />
                        ) : (
                            <BiometricScanner
                                biometrics={userData.biometrics || []}
                                actions={biometricsActions}
                                viewMode={viewMode}
                                isSectionHidden={!isSectionVisible('metrics')}
                                toggleSectionVisibility={() => toggleSectionVisibility('metrics')}
                            />
                        )}
                    </div>
                </div>
            ) : activeView === 'tasks' ? (
                <div className="flex-1 min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <div className="flex-1">
                        {missionTab === 'protocol' ? (
                            <DailyProtocol
                                protocols={userData.protocols}
                                actions={protocolsActions}
                                moduleId="health"
                                viewMode={viewMode}
                                processTask={processTask}
                                isSectionHidden={!isSectionVisible('routine')}
                                toggleSectionVisibility={() => toggleSectionVisibility('routine')}
                            />
                        ) : missionTab === 'missions' ? (
                            <TaskBoard
                                tasks={userData.tasks}
                                actions={tasksActions}
                                moduleId="health"
                                viewMode={viewMode}
                                processTask={processTask}
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
                                moduleId="health"
                                isSectionHidden={!isSectionVisible('tasks')}
                                toggleSectionVisibility={() => toggleSectionVisibility('tasks')}
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
                        moduleId="health"
                        isSectionHidden={!isSectionVisible('notes')}
                        toggleSectionVisibility={() => toggleSectionVisibility('notes')}
                    />
                </div>
            )}
        </div>
    );
};

export default HealthModule;
