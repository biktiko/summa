import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useParams, Link } from 'react-router-dom';

import {
  Trophy, User, Coins, Menu, X, LogOut, Edit2, CheckSquare, Sliders, UserCheck, Copy, ArrowRight, LayoutDashboard
} from 'lucide-react';

// Core "Brain"
import { useLifeData } from './core/hooks/useLifeData';
import { AuthProvider, useAuth } from './core/hooks/useAuth';
import { db } from './core/services/db';

// Module Registry
import { MODULES } from './modules/registry';
import LoginPage from './modules/Auth/LoginPage';
import TaskBoard from "./components/MissionControl/TaskBoard";
import SettingsModule from './components/Settings/SettingsModule';

// --- System Interface (The Shell) ---
// This component handles the UI rendering for both Admin and Guest modes
const SystemInterface = ({ system, authUser, logout, isGuest = false }) => {
  const { userData, loading, level, viewMode, toggleViewMode, xpProgressInLevel, xpRequiredForNextLevel } = system;

  // Filter Modules based on Privacy/Visibility & Sort
  const visibleModules = useMemo(() => {
    const defaultOrder = ['tasks', 'finance', 'blog', 'career', 'health', 'network'];
    const order = userData?.moduleOrder || defaultOrder;

    const filtered = MODULES.filter(m => {
        if (m.id === 'settings') return false; 
        if (viewMode === 'guest') {
            const privacy = userData?.modulePrivacy?.[m.id];
            // Explicitly check if enabled is strictly false
            if (privacy && privacy.enabled === false) return false;
        } else {
             if (userData?.hiddenModules) {
                 if (userData.hiddenModules.includes(m.id)) return false;
             } else {
                 // Default Hidden for new users (if no preferences set)
                 if (['health', 'network'].includes(m.id)) return false;
             }
        }
        return true;
    });

    return filtered.sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        // If not in order array, put at end
        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;
        return valA - valB;
    });
  }, [userData, viewMode]);
  
  const [activeTabId, setActiveTabId] = useState(null);
  const [lastActiveTabId, setLastActiveTabId] = useState(MODULES[0].id);
  const [currentModuleView, setCurrentModuleView] = useState('dashboard'); 
  const [activeTaskTab, setActiveTaskTab] = useState('missions');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMobileMenu, setActiveMobileMenu] = useState(false);

  // Initialize Active Tab - synced safely
  useEffect(() => {
    if (visibleModules.length > 0) {
        // If we are currently in settings, don't force redirect
        if (activeTabId === 'settings') return;

        // If current activeTabId is not in visible modules, switch to first visible
        const isValid = visibleModules.find(m => m.id === activeTabId);
        if (!activeTabId || !isValid) {
             const timeoutId = setTimeout(() => {
                 setActiveTabId(visibleModules[0].id);
             }, 0);
             return () => clearTimeout(timeoutId);
        }
    }
  }, [visibleModules, activeTabId]);

  // Swipe State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- Smart Module Switching ---
  const handleModuleChange = (newModuleId) => {
    if (activeTabId !== 'settings' && newModuleId === 'settings') {
        setLastActiveTabId(activeTabId);
    }
    setActiveTabId(newModuleId);

    if (['tasks', 'notes'].includes(currentModuleView)) {
      // keep view
    } else {
      const defaultViews = {
        career: 'portfolio',
        finance: 'dashboard',
        health: 'dashboard',
        tasks: 'dashboard',
        blog: 'dashboard'
      };
      setCurrentModuleView(defaultViews[newModuleId] || 'dashboard');
    }
  };

  const toggleSettings = () => {
    if (activeTabId === 'settings') {
        handleModuleChange(lastActiveTabId);
    } else {
        handleModuleChange('settings');
    }
  };

  // --- Swipe Logic ---
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {       
        // Get Swipe Mode
        const swipeMode = userData?.swipeMode || 'modules'; // 'modules', 'internal', 'sections'
        
        console.log("Swipe Mode Detected:", swipeMode); // For Debugging

        // --- MODE 1: SWITCH MODULES ---
        if (swipeMode === 'modules') {
            const currentIndex = visibleModules.findIndex(m => m.id === activeTabId);
            if (currentIndex === -1) return;

            if (isLeftSwipe) {
                if (currentIndex < visibleModules.length - 1) {
                    handleModuleChange(visibleModules[currentIndex + 1].id);
                }
            }
            if (isRightSwipe) {
                if (currentIndex > 0) {
                    handleModuleChange(visibleModules[currentIndex - 1].id);
                }
            }
            return;
        }

        // --- MODE 2: INTERNAL NAVIGATION (Views) ---
        if (swipeMode === 'internal') {
            // Define internal view structure for each module
            const viewMaps = {
                career: ['portfolio', ...(viewMode === 'admin' ? ['settings'] : [])],
                finance: ['dashboard', 'tasks', 'notes'],
                health: ['dashboard'],
                network: ['dashboard']
            };

            const currentViews = viewMaps[activeTabId] || [];
            if (currentViews.length === 0) return;

            const currentIndex = currentViews.indexOf(currentModuleView);
            // If current view not found, possibly default to 0, but let's be safe
            if (currentIndex === -1) return;

            if (isLeftSwipe && currentIndex < currentViews.length - 1) {
                setCurrentModuleView(currentViews[currentIndex + 1]);
            } else if (isRightSwipe && currentIndex > 0) {
                setCurrentModuleView(currentViews[currentIndex - 1]);
            }
            return;
        }

        // --- MODE 3: SECTIONS (Mission Tabs) ---
        if (swipeMode === 'sections') {
            // Check if we are in the 'Tasks' module OR 'tasks' view of another module (legacy)
            if (activeTabId === 'tasks' || currentModuleView === 'tasks') {
                const tabs = ['protocol', 'missions', 'goals'];
                const currentIndex = tabs.indexOf(activeTaskTab);
                
                if (currentIndex !== -1) {
                    if (isLeftSwipe && currentIndex < tabs.length - 1) {
                        setActiveTaskTab(tabs[currentIndex + 1]);
                    } else if (isRightSwipe && currentIndex > 0) {
                        setActiveTaskTab(tabs[currentIndex - 1]);
                    }
                }
            }
            // Add other specific section logic if needed (e.g. Health Dashboard Tabs)
            else if (activeTabId === 'health' && currentModuleView === 'dashboard') {
                // Health Dashboard has 'metrics' and 'telemetry' (internal state of HealthModule, not accessible here via activeTaskTab)
                // Since statusTab is local state in HealthModule, we can't control it from App.jsx easily without lifting state.
                // For now, we support the main Mission Control tabs which are lifted to App.jsx.
            }
            return;
        }
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-blue-500 flex flex-col items-center justify-center font-mono gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-black uppercase tracking-[0.2em]">Loading System...</div>
      </div>
    );
  }
  
  // Show Nav if more than 1 module
  const showDetailNav = visibleModules.length > 1;

  let ActiveComponent = null;
  if (activeTabId === 'settings') {
      ActiveComponent = SettingsModule;
  } else {
      const activeModule = MODULES.find(m => m.id === activeTabId);
      if (activeModule) ActiveComponent = activeModule.component;
  }
  
  const themeColor = userData?.themeColor || '#3b82f6';
  const backgroundColor = userData?.backgroundColor || '#020202';
  
  const displayName = userData?.firstName 
      ? `${userData.firstName} ${userData.lastName || ''}` 
      : (authUser?.name || 'Guest User');

  return (
    <div className="min-h-screen text-slate-800 font-sans flex flex-col selection:bg-blue-500/30 relative transition-colors duration-500 pb-20 md:pb-0" style={{
      backgroundColor: backgroundColor,
      '--theme-color': themeColor
    }}>
      {/* --- HUD Header --- */}
      <header className="p-2 md:px-6 md:py-4 border-b border-slate-200 bg-white shadow-sm backdrop-blur-xl relative top-0 z-50">
        <div className="max-w-7xl mx-auto">
          
          {/* Mobile: Aesthetic Single Row */}
          <div className="md:hidden flex items-center gap-3">
            {/* Left: Name + Level */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-black uppercase tracking-tighter text-xs">{userData?.firstName || displayName}</span>
              {!isGuest && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ color: themeColor, backgroundColor: `${themeColor}15` }}>
                  {level}
                </span>
              )}
            </div>

            {/* Center: XP Bar with inline numbers */}
            {!isGuest && (!userData?.gameplaySettings || userData.gameplaySettings.xp !== false) && (
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <div className="flex-1 relative h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-700" 
                    style={{ 
                        width: `${xpRequiredForNextLevel > 0 ? (xpProgressInLevel / xpRequiredForNextLevel) * 100 : 0}%`, 
                        backgroundColor: themeColor 
                    }} 
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold font-mono" style={{ color: themeColor, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {Math.floor(xpProgressInLevel)}/{xpRequiredForNextLevel}
                  </span>
                </div>
              </div>
            )}

            {/* Right: Coins + Settings grouped */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Coins */}
              {((!isGuest && (!userData?.gameplaySettings || userData.gameplaySettings.coins !== false)) || (isGuest && userData?.gameplaySettings?.publicCoins)) && (
                <div className="flex items-center gap-1 bg-amber-600/10 px-2 py-1 rounded-lg border border-slate-200">
                  <Coins className="w-3 h-3 text-amber-600" />
                  <span className="font-bold text-[10px] text-amber-600">{userData?.balance || 0}</span>
                </div>
              )}

              {/* Settings */}
              {!isGuest && (
                <button
                  onClick={toggleSettings}
                  className="p-1.5 rounded-lg transition-colors border border-slate-200 text-slate-500 bg-white shadow-sm border border-slate-200/50 hover:bg-slate-100"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop: Unified Compact Header */}
          <div className="hidden md:flex flex-row justify-between items-center w-full">
            {/* Left: Profile & Menu */}
            <div className="flex items-center gap-4">
               {showDetailNav && (
                  <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                  <Menu className="w-5 h-5" />
                  </button>
               )}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shrink-0 overflow-hidden relative"
                style={{ backgroundColor: themeColor, boxShadow: `0 5px 10px -3px ${themeColor}40` }}
              >
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-800" />
                )}
              </div>
              <div>
                <h1 className="text-base font-black uppercase tracking-tighter leading-none flex items-center gap-2">
                  {displayName}
                </h1>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                  {!isGuest && (
                      <span style={{ color: themeColor }}>Architect LVL {level}</span>
                  )}
                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                  <span>{isGuest ? 'GUEST VIEW' : 'Online'}</span>
                  {!isGuest && (
                      <button
                      onClick={toggleViewMode}
                      className={`ml-2 px-1.5 py-0.5 rounded border text-[9px] transition-all ${viewMode === 'admin' ? 'bg-red-900/20 border-red-500/30 text-red-500' : 'bg-green-900/20 border-green-500/30 text-green-500'}`}
                      >
                      {viewMode === 'admin' ? 'ADMIN' : 'GUEST'}
                      </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Stats & Actions */}
            <div className="flex items-center gap-6">
                
                {/* XP - Compact Bar */}
                {((!isGuest && (!userData?.gameplaySettings || userData.gameplaySettings.xp !== false)) || (isGuest && userData?.gameplaySettings?.publicXP)) && (
                  <div className="flex items-center gap-3 w-48">
                        <span className="text-[9px] font-bold uppercase text-slate-500 w-12 text-right">XP {Math.floor(xpProgressInLevel)}/{xpRequiredForNextLevel}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full transition-all duration-700" 
                                style={{ 
                                    width: `${xpRequiredForNextLevel > 0 ? (xpProgressInLevel / xpRequiredForNextLevel) * 100 : 0}% `, 
                                    backgroundColor: themeColor 
                                }} 
                            />
                        </div>
                  </div>
                )}

                {/* Balance */}
                {((!isGuest && (!userData?.gameplaySettings || userData.gameplaySettings.coins !== false)) || (isGuest && userData?.gameplaySettings?.publicCoins)) && (
                  <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-600/5 px-3 py-1 rounded-full border border-amber-600/10">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="text-xs">{userData?.balance || 0}</span>
                  </div>
                )}
                
                {/* Settings & Logout */}
                <div className="flex items-center gap-1 border-l border-slate-300 pl-4 ml-2">
                    {!isGuest && (
                        <button
                            onClick={toggleSettings}
                            className={`p-2 rounded-lg transition-colors ${activeTabId === 'settings' ? 'text-slate-800 bg-slate-100 border border-slate-200' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}
                            title="System Settings"
                        >
                            <Sliders className="w-4 h-4" />
                        </button>
                    )}
                    
                    {logout ? (
                        <button onClick={logout} className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link to="/" className="ml-2 flex items-center gap-2 bg-slate-100 border border-slate-200 hover:bg-white/20 text-slate-800 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all">
                            <span>Create</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row flex-1 border-x border-slate-200 relative">

        {/* --- Sidebar Navigation (Desktop) --- */}
        {(showDetailNav) && (
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex transition-all duration-300 p-4 space-y-2 border-r border-slate-200 flex-col gap-2 md:gap-0`}>
            {visibleModules.map(module => (
                <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 md:shrink ${activeTabId === module.id ? 'text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'} ${!isSidebarOpen && 'justify-center px-2'} `}
                style={activeTabId === module.id ? { backgroundColor: themeColor } : {}}
                title={!isSidebarOpen ? module.label : ''}
                >
                <module.icon className="w-4 h-4" />
                {isSidebarOpen && <span>{module.label}</span>}
                </button>
            ))}
            
            {/* Settings in Sidebar (Admin Only) */}
            {!isGuest && (
                <div className="pt-4 mt-auto border-t border-slate-200">
                    <button
                    onClick={() => setActiveTabId('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 md:shrink ${activeTabId === 'settings' ? 'text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'} ${!isSidebarOpen && 'justify-center px-2'}`}
                    style={activeTabId === 'settings' ? { backgroundColor: themeColor } : {}}
                    title={!isSidebarOpen ? 'Settings' : ''}
                    >
                    <Sliders className="w-4 h-4" />
                    {isSidebarOpen && <span>Settings</span>}
                    </button>
                </div>
            )}
            </aside>
        )}

        {/* --- Main Module Content --- */}
        <main 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="flex-1 p-2 md:p-8 md:overflow-y-auto relative"
        >
          {ActiveComponent ? (
                <ActiveComponent
                    {...system}
                    activeView={currentModuleView}
                    setActiveView={setCurrentModuleView}
                    missionTab={activeTaskTab}
                    setMissionTab={setActiveTaskTab}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono uppercase">
                    Initializing Interface... (or Module Not Found)
                </div>
            )}
        </main>
      </div>

      {/* --- Bottom Navigation (Mobile) --- */}
      {showDetailNav && (
        <>
             {/* Extended Mobile Menu */}
            {activeMobileMenu && visibleModules.length > 5 && (
                 <div className="md:hidden fixed bottom-20 right-2 w-48 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl shadow-2xl p-1 z-50 animate-in slide-in-from-bottom-5 space-y-1">
                    {visibleModules.slice(4).map(module => (
                        <button
                            key={module.id}
                            onClick={() => { handleModuleChange(module.id); setActiveMobileMenu(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTabId === module.id ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'text-slate-500 hover:text-blue-600'}`}
                            style={activeTabId === module.id ? { color: themeColor } : {}}
                        >
                             <module.icon className="w-4 h-4" />
                             <span>{module.label}</span>
                        </button>
                    ))}
                 </div>
            )}

            <nav 
                className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-xl border border-slate-200/90 backdrop-blur-xl border-t border-slate-200 z-50 grid p-2 pb-6 gap-1"
                style={{ gridTemplateColumns: `repeat(${Math.min(visibleModules.length > 5 ? 5 : visibleModules.length, 5)}, 1fr)` }}
            >
                {visibleModules.slice(0, visibleModules.length > 5 ? 4 : 5).map(module => (
                <button
                    key={module.id}
                    onClick={() => { handleModuleChange(module.id); setActiveMobileMenu(false); }}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${activeTabId === module.id ? 'text-slate-800' : 'text-slate-500'}`}
                    style={activeTabId === module.id ? { color: themeColor } : {}}
                >
                    <module.icon className={`w-5 h-5 mb-1 ${activeTabId === module.id && 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`} />
                    <span className="text-[9px] font-black uppercase tracking-wider truncate w-full text-center">{module.label}</span>
                </button>
                ))}
                
                 {visibleModules.length > 5 && (
                     <button
                        onClick={() => setActiveMobileMenu(!activeMobileMenu)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${activeMobileMenu ? 'text-slate-800 bg-slate-50' : 'text-slate-500'}`}
                    >
                        <div className="w-5 h-5 mb-1 flex items-center justify-center">
                            <Menu className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider">More</span>
                    </button>
                 )}
            </nav>
        </>
      )}

      {/* --- Footer --- */}
      <footer className="hidden md:block p-4 border-t border-slate-200 text-center bg-white/80">
        <div className="text-[8px] text-neutral-800 font-black uppercase tracking-[0.8em]">
           SUMMA OS // PORTFOLIO_MODE: {isGuest ? 'GUEST' : 'ADMIN'}
        </div>
      </footer>
    </div>
  );
};

// --- Authenticated Route (Admin View) ---
const AuthenticatedRoute = () => {
    const { user, loading, isVerified, resendVerification, logout } = useAuth();
    
    // We fetch data for the logged-in user, defaulting to 'admin' view mode
    const system = useLifeData(user?.id, 'admin');

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-blue-500 flex flex-col items-center justify-center font-mono gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-black uppercase tracking-[0.2em]">Initializing Security...</div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    if (!isVerified) {
        return (
        <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-sans">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 z-10 animate-pulse">
                <UserCheck className="w-8 h-8 text-amber-600" />
                </div>
                
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 z-10">Verification Required</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-sm mb-8 z-10 leading-relaxed">
                A security protocol link has been sent to your email channel.<br/>
                Please verify your identity to access the system.
                </p>
                
                <div className="flex flex-col gap-3 w-full max-w-xs z-10">
                <button 
                    onClick={() => resendVerification().then(() => alert('Verification Link Sent! Please check your Inbox and Spam folder.'))}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                    Resend Link
                </button>
                <button 
                    onClick={logout}
                    className="w-full bg-white shadow-sm border border-slate-200/80 border border-slate-300 hover:bg-slate-100 text-slate-500 font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all backdrop-blur-sm"
                >
                    Return to Login
                </button>
                <div className="mt-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    Done verifying? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => window.location.reload()}>Reload Page</span>
                </div>
                </div>
        </div>
        );
    }

    return <SystemInterface system={system} authUser={user} logout={logout} isGuest={false} />;
};

// --- Public Profile Route (Guest View) ---
const PublicProfileRoute = () => {
    const { username } = useParams();
    const [targetUserId, setTargetUserId] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const resolveUser = async () => {
             setError(null);
             setLookupLoading(true);
             try {
                // Try to find by username
                const userData = await db.getUserByUsername(username);
                if (userData) {
                    setTargetUserId(userData.id);
                } else {
                    setError('User not found');
                }
             } catch (e) {
                 console.error("Profile lookup failed:", e);
                 setError('System Error');
             } finally {
                 setLookupLoading(false);
             }
        };

        if (username) resolveUser();
    }, [username]);

    // Force guest mode
    const system = useLifeData(targetUserId, 'guest');

    if (lookupLoading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-500 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !targetUserId) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-neutral-800">404 Error</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest mb-8">User Profile Not Found</p>
                <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-500 transition-all">
                    Create Your Own Profile
                </Link>
            </div>
        );
    }

    // Render System in Guest Mode (No Auth User, No Logout)
    return <SystemInterface system={system} authUser={null} logout={null} isGuest={true} />;
};

// --- Main Entry Point ---
const App = () => {
  return (
    <AuthProvider>
        <Routes>
            {/* The root path is the Authenticated "Admin" App */}
            <Route path="/" element={<AuthenticatedRoute />} />
            
            {/* The dynamic path checks for a username */}
            <Route path="/:username" element={<PublicProfileRoute />} />
        </Routes>
    </AuthProvider>
  );
};

export default App;
