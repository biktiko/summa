import React, { useState } from 'react';

import {
  Trophy, User, Coins, Menu, X, LogOut, Edit2, CheckSquare, Sliders, UserCheck, Copy
} from 'lucide-react';

// Core "Brain"
import { useLifeData } from './core/hooks/useLifeData';
import { AuthProvider, useAuth } from './core/hooks/useAuth';

// Module Registry
import { MODULES } from './modules/registry';
import LoginPage from './modules/Auth/LoginPage';
import TaskBoard from "./components/MissionControl/TaskBoard";

// --- Authenticated App Shell ---
const AuthenticatedApp = () => {
  const { user, logout } = useAuth();
  const [activeTabId, setActiveTabId] = useState(MODULES[0].id);
  const [currentModuleView, setCurrentModuleView] = useState('dashboard'); // 'dashboard' | 'tasks' | 'notes'
  const [activeTaskTab, setActiveTaskTab] = useState('missions'); // 'protocol' | 'missions' | 'goals' (shared state)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize System Core with Logged In User ID
  const system = useLifeData(user.id);
  const { userData, loading, totalXP, level, viewMode, toggleViewMode, updateUser } = system;

  // --- Smart Module Switching ---
  const handleModuleChange = (newModuleId) => {
    setActiveTabId(newModuleId);

    // If we are currently in a "sticky" view (Tasks or Notes), keep it.
    if (['tasks', 'notes'].includes(currentModuleView)) {
      // Do nothing, keep 'tasks' or 'notes'
    } else {
      // Otherwise, reset to the default view for the new module
      const defaultViews = {
        career: 'profile', // Portfolio
        finance: 'dashboard', // Finance Dashboard
        health: 'dashboard', // Health Dashboard
      };
      // Fallback to 'dashboard' if unknown
      setCurrentModuleView(defaultViews[newModuleId] || 'dashboard');
    }
  };

  // Loading State
  if (loading) {
    // ... (Keep existing loading state)
    return (
      <div className="min-h-screen bg-[#020202] text-blue-500 flex flex-col items-center justify-center font-mono gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-black uppercase tracking-[0.2em]">Loading User Data...</div>
      </div>
    );
  }

  // Find Active Module
  const ActiveModule = MODULES.find(m => m.id === activeTabId)?.component || (() => <div>Module Not Found</div>);

  // Dynamic Theme Styles
  const themeColor = userData.themeColor || '#3b82f6';
  const backgroundColor = userData.backgroundColor || '#020202';

  return (
    <div className="min-h-screen text-neutral-100 font-sans flex flex-col selection:bg-blue-500/30 relative transition-colors duration-500 pb-20 md:pb-0" style={{
      backgroundColor: backgroundColor,
      '--theme-color': themeColor
    }}>

      {/* --- HUD Header --- */}
      <header className="p-4 md:p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          {/* User Profile */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg shrink-0 overflow-hidden relative"
              style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
            >
              {userData.avatar ? (
                <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter leading-none mb-1 flex items-center gap-2">
                {userData.firstName ? `${userData.firstName} ${userData.lastName || ''}` : user.name}
              </h1>
              <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2 flex-wrap">
                <span style={{ color: themeColor }}>Architect LVL {level}</span>
                <span className="w-1 h-1 bg-neutral-800 rounded-full"></span>
                <span>Status: Online</span>
                <button
                  onClick={toggleViewMode}
                  className={`ml-2 px-2 py-0.5 rounded border text-[8px] transition-all ${viewMode === 'admin' ? 'bg-red-900/20 border-red-500/30 text-red-500' : 'bg-green-900/20 border-green-500/30 text-green-500'} `}
                >
                  {viewMode === 'admin' ? 'ADMIN MODE' : 'GUEST MODE'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          {/* This container has the stats */}
          <div className="flex items-center gap-6 bg-neutral-900/40 p-3 rounded-xl border border-white/5 w-full md:w-auto font-mono overflow-x-auto md:overflow-visible">
            <button
              onClick={() => setActiveTabId('settings')}
              className={`p-2 rounded-lg transition-colors ${activeTabId === 'settings' ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
              title="System Settings"
            >
              <Sliders className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-white/10" />

            {/* Energy */}
            <div className="flex-1 min-w-[80px] md:w-32">
              <div className="flex justify-between text-[7px] mb-1 font-bold uppercase text-yellow-500">
                <span>Energy</span>
                <span>{userData.energy}%</span>
              </div>
              <div className="h-1 bg-black rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${userData.energy}% ` }} />
              </div>
            </div>
            {/* XP */}
            <div className="flex-1 min-w-[100px] md:w-40">
              <div className="flex justify-between text-[7px] mb-1 font-bold uppercase" style={{ color: themeColor }}>
                <span>XP Progress</span>
                <span>{totalXP % 500}/500</span>
              </div>
              <div className="h-1 bg-black rounded-full overflow-hidden">
                <div className="h-full transition-all duration-700" style={{ width: `${(totalXP % 500) / 5}% `, backgroundColor: themeColor }} />
              </div>
            </div>
            {/* Balance */}
            <div className="flex items-center gap-2 text-yellow-400 font-bold">
              <Coins className="w-3 h-3" />
              <span className="text-xs">{userData.balance}</span>
            </div>
            {/* Logout */}
            <button onClick={logout} className="ml-2 text-neutral-500 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row flex-1 border-x border-white/5 relative">

        {/* --- Sidebar Navigation (Desktop) --- */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex transition-all duration-300 p-4 space-y-2 border-r border-white/5 flex-col gap-2 md:gap-0`}>
          {MODULES.filter(m => {
            if (m.id === 'settings') return false;
            // Privacy Filter
            if (viewMode === 'guest') {
              const privacy = userData?.modulePrivacy?.[m.id];
              // Default to public (true) if not set
              if (privacy?.enabled === false) return false;
            }
            return true;
          }).map(module => (
            <button
              key={module.id}
              onClick={() => handleModuleChange(module.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 md:shrink ${activeTabId === module.id ? 'text-white shadow-lg' : 'text-neutral-500 hover:bg-white/5'} ${!isSidebarOpen && 'justify-center px-2'} `}
              style={activeTabId === module.id ? { backgroundColor: themeColor } : {}}
              title={!isSidebarOpen ? module.label : ''}
            >
              <module.icon className="w-4 h-4" />
              {isSidebarOpen && <span>{module.label}</span>}
            </button>
          ))}

          {/* Settings Separator */}
          <div className="pt-4 mt-auto border-t border-white/5">
            <button
              onClick={() => setActiveTabId('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 md:shrink ${activeTabId === 'settings' ? 'text-white shadow-lg' : 'text-neutral-500 hover:bg-white/5'} ${!isSidebarOpen && 'justify-center px-2'}`}
              style={activeTabId === 'settings' ? { backgroundColor: themeColor } : {}}
              title={!isSidebarOpen ? 'Settings' : ''}
            >
              <Sliders className="w-4 h-4" />
              {isSidebarOpen && <span>Settings</span>}
            </button>
          </div>
        </aside>

        {/* --- Main Module Content --- */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">

          {/* Render the Active Module and pass the System Core + View State */}
          <ActiveModule
            {...system}
            activeView={currentModuleView}
            setActiveView={setCurrentModuleView}
            missionTab={activeTaskTab}
            setMissionTab={setActiveTaskTab}
          />
        </main>

      </div>

      {/* --- Bottom Navigation (Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-around p-2 pb-6">
        {MODULES.filter(m => {
          if (viewMode === 'guest') {
            const privacy = userData?.modulePrivacy?.[m.id];
            if (privacy?.enabled === false) return false;
          }
          return true;
        }).map(module => (
          <button
            key={module.id}
            onClick={() => handleModuleChange(module.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${activeTabId === module.id ? 'text-white' : 'text-neutral-500'}`}
            style={activeTabId === module.id ? { color: themeColor } : {}}
          >
            <module.icon className={`w-5 h-5 mb-1 ${activeTabId === module.id && 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`} />
            <span className="text-[9px] font-black uppercase tracking-wider">{module.label}</span>
          </button>
        ))}
      </nav>

      {/* --- Footer (Desktop Only) --- */}
      <footer className="hidden md:block p-4 border-t border-white/5 text-center bg-black/80">
        <div className="text-[8px] text-neutral-800 font-black uppercase tracking-[0.8em]">
          SUMMA OS // SYSTEM_STATUS: STABLE // GROWTH_PROTOCOL: ACTIVE
        </div>
      </footer>
    </div >
  );
};

// --- Main Entry Point ---
const App = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

const AuthWrapper = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] text-blue-500 flex flex-col items-center justify-center font-mono gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-black uppercase tracking-[0.2em]">Initializing Security...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
};

export default App;
