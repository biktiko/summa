import React, { useState } from 'react';
import TaskBoard from '../../components/MissionControl/TaskBoard';
import GoalsBoard from '../../components/MissionControl/GoalsBoard';
import DailyProtocol from '../../components/MissionControl/DailyProtocol';
import { Target, CheckSquare, Zap, Trophy, Repeat } from 'lucide-react';

const TasksModule = ({
    userData,
    tasksActions, 
    goalsActions, 
    protocolsActions,
    processTask, 
    viewMode,
    missionTab, 
    setMissionTab,
    updateUser // Recieve updateUser
}) => {
    // If missionTab is not provided by parent, use local state
    const [localMissionTab, setLocalMissionTab] = useState('missions');
    const currentTab = missionTab || localMissionTab;
    const setTab = setMissionTab || setLocalMissionTab;

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
           {/* Top Navigation */}
           {/* Top Navigation */}
           <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-2 md:pb-6 mb-4 md:mb-8 gap-2 md:gap-4 px-2 md:px-0">
               <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-white/5 overflow-x-auto no-scrollbar w-full md:w-auto">
                    <button
                        onClick={() => setTab('protocol')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentTab === 'protocol' ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Routine
                    </button>
                    <button
                        onClick={() => setTab('missions')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentTab === 'missions' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                         Tasks
                    </button>
                    <button
                        onClick={() => setTab('goals')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${currentTab === 'goals' ? 'bg-yellow-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
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
                        moduleId={null} // Global
                        viewMode={viewMode}
                        processTask={processTask}
                        isSectionHidden={false} 
                        toggleSectionVisibility={() => {}}
                        settings={userData?.gameplaySettings}
                    />
                ) : currentTab === 'missions' ? (
                    <TaskBoard
                        tasks={userData.tasks}
                        actions={tasksActions}
                        moduleId={null} // Global
                        viewMode={viewMode}
                        processTask={processTask}
                        settings={userData.gameplaySettings}
                        isSectionHidden={false}
                        toggleSectionVisibility={() => {}}
                        updateUser={updateUser}
                        userXP={userData.xp}
                    />
                ) : (
                    <GoalsBoard
                        goals={userData.goals}
                        tasks={userData.tasks}
                        actions={goalsActions}
                        viewMode={viewMode}
                        processTask={processTask}
                        moduleId={null}
                        isSectionHidden={false}
                        toggleSectionVisibility={() => {}}
                    />
                )}
           </div>
        </div>
    );
};

export default TasksModule;
