import React, { useState } from 'react';
import TaskBoard from '../../components/MissionControl/TaskBoard';
import GoalsBoard from '../../components/MissionControl/GoalsBoard';
import DailyProtocol from '../../components/MissionControl/DailyProtocol';
import ProjectTasksView from '../../components/MissionControl/ProjectTasksView';
import { Target, CheckSquare, Zap, Trophy, Repeat } from 'lucide-react';

const TasksModule = ({
    userData,
    tasksActions, 
    goalsActions, 
    protocolsActions,
    projectsActions,
    processTask, 
    viewMode,
    missionTab, 
    setMissionTab,
    updateUser
}) => {
    // If missionTab is not provided by parent, use local state
    const [localMissionTab, setLocalMissionTab] = useState('missions');
    const currentTab = missionTab || localMissionTab;
    const setTab = setMissionTab || setLocalMissionTab;

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
           {/* Top Navigation */}
           <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-2 md:pb-6 mb-4 md:mb-8 gap-2 md:gap-4 px-2 md:px-0">
               <div className="flex bg-white shadow-sm border border-slate-200/50 p-1 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar w-full md:w-auto">
                    <button
                        onClick={() => setTab('protocol')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentTab === 'protocol' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                        Routine
                    </button>
                    <button
                        onClick={() => setTab('missions')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentTab === 'missions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                         Tasks
                    </button>
                    <button
                        onClick={() => setTab('projects')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentTab === 'projects' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                         Projects
                    </button>
                    <button
                        onClick={() => setTab('goals')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentTab === 'goals' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                         Strategic
                    </button>
               </div>
           </div>
           
           {/* Content */}
           <div className="flex-1 min-h-[600px] flex flex-col">
                {currentTab === 'protocol' ? (
                    <DailyProtocol
                        protocols={userData.protocols}
                        actions={protocolsActions}
                        viewMode={viewMode}
                        processTask={processTask}
                        isSectionHidden={false}
                        toggleSectionVisibility={() => {}}
                        settings={userData}
                    />
                ) : currentTab === 'missions' ? (
                    <TaskBoard
                        tasks={userData.tasks}
                        actions={tasksActions}
                        projectId={null} // Hide project tasks from general TaskBoard
                        viewMode={viewMode}
                        processTask={processTask}
                        settings={userData}
                        isSectionHidden={false}
                        toggleSectionVisibility={() => {}}
                        updateUser={updateUser}
                        userXP={userData.xp}
                    />
                ) : currentTab === 'projects' ? (
                    <ProjectTasksView
                        projects={userData.projects}
                        tasks={userData.tasks}
                        projectsActions={projectsActions}
                        tasksActions={tasksActions}
                        viewMode={viewMode}
                        processTask={processTask}
                        updateUser={updateUser}
                        userXP={userData.xp}
                        settings={userData}
                    />
                ) : (
                    <GoalsBoard
                        goals={userData.goals}
                        tasks={userData.tasks}
                        actions={goalsActions}
                        viewMode={viewMode}
                        processTask={processTask}
                        isSectionHidden={false}
                        toggleSectionVisibility={() => {}}
                    />
                )}
           </div>
        </div>
    );
};

export default TasksModule;
