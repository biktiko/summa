import React, { useState, useEffect } from 'react';
import { User, Palette, Save, Upload, CheckCircle2, Calendar, LogOut, Moon, Sun, Monitor, Smartphone, Sliders, Shield, Zap, Lock, Copy, Loader2, Check, XCircle, ChevronLeft, ChevronRight, Target, Coins, Activity, Globe } from 'lucide-react';
import { isSignedIn, signInToGoogle, signOutFromGoogle, getUserProfile } from '../../core/services/googleCalendar';

const SettingsModule = ({ userData, updateUser }) => {
    // Mobile Navigation State
    const [mobileView, setMobileView] = useState('menu'); // 'menu' or 'detail'
    const [activeTab, setActiveTab] = useState('profile');
    const [googleUser, setGoogleUser] = useState(null);

    // Ensure we start with 'menu' on mobile if logic requires, 
    // but simplified: if isMobile and activeTab is set, we show detail. 
    // Let's use a clear explicit state for mobile navigation flow.

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setMobileView('detail');
    };

    const handleMobileBack = () => {
        setMobileView('menu');
    };

    // Username Logic
    const [usernameInput, setUsernameInput] = useState(userData.username || '');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState(userData.username ? 'current' : 'idle'); // 'idle', 'checking', 'available', 'taken', 'current'

    const [localData, setLocalData] = useState({
        // Profile
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        gender: userData.gender || 'prefer_not_to_say',
        birthYear: userData.birthYear || '',
        city: userData.city || '',
        phoneNumber: userData.phoneNumber || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        username: userData.username || '',

        // Theme
        themeColor: userData.themeColor || '#3b82f6',
        backgroundColor: userData.backgroundColor || '#020202',
        themePreset: userData.themePreset || 'custom',

        themePreset: userData.themePreset || 'custom',

        // Privacy
        modulePrivacy: userData.modulePrivacy || {},

        // Gameplay
        gameplaySettings: userData.gameplaySettings || { xp: true, coins: true },
        hiddenModules: userData.hiddenModules || []
    });

    useEffect(() => {
        const checkGoogle = async () => {
            if (isSignedIn()) {
                const profile = await getUserProfile();
                setGoogleUser(profile);
            }
        };
        checkGoogle();
    }, []);

    const handleSave = () => {
        updateUser(localData);
        // Maybe show a toast
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalData({ ...localData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            await signInToGoogle();
            const profile = await getUserProfile();
            setGoogleUser(profile);
        } catch (e) {
            console.error(e);
            alert("Failed to connect");
        }
    };

    const handleCheckUsername = () => {
        if (!usernameInput) return;
        if (usernameInput === userData.username) {
            setUsernameStatus('current');
            return;
        }
        setIsCheckingUsername(true);
        setUsernameStatus('checking');

        // Simulate API check
        setTimeout(() => {
            setIsCheckingUsername(false);
            if (usernameInput.toLowerCase() === 'admin' || usernameInput.toLowerCase() === 'sysadmin') {
                setUsernameStatus('taken');
            } else {
                setUsernameStatus('available');
            }
        }, 1500);
    };

    const handleConfirmUsername = () => {
        setLocalData({ ...localData, username: usernameInput });
        setUsernameStatus('current');
    };

    const handleDisconnectGoogle = () => {
        signOutFromGoogle();
        setGoogleUser(null);
    };

    // Theme Presets
    const applyPreset = (preset) => {
        if (preset === 'cyberpunk') {
            setLocalData({ ...localData, themePreset: 'cyberpunk', themeColor: '#f472b6', backgroundColor: '#0f172a' });
        } else if (preset === 'light') {
            setLocalData({ ...localData, themePreset: 'light', themeColor: '#2563eb', backgroundColor: '#f8fafc' });
        } else if (preset === 'dark') {
            setLocalData({ ...localData, themePreset: 'dark', themeColor: '#3b82f6', backgroundColor: '#020202' });
        } else if (preset === 'forest') {
            setLocalData({ ...localData, themePreset: 'forest', themeColor: '#10b981', backgroundColor: '#052e16' });
        }
    };

    const colors = [
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Red', hex: '#ef4444' },
        { name: 'Green', hex: '#10b981' },
        { name: 'Yellow', hex: '#eab308' },
        { name: 'Purple', hex: '#a855f7' },
        { name: 'Pink', hex: '#ec4899' },
        { name: 'Orange', hex: '#f97316' },
        { name: 'Cyan', hex: '#06b6d4' },
    ];

    const backgrounds = [
        { name: 'Void', hex: '#020202' },
        { name: 'Deep Space', hex: '#0f172a' },
        { name: 'Paper', hex: '#f8fafc' },
        { name: 'Midnight', hex: '#1e1b4b' }
    ];

    const renderContent = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {activeTab === 'profile' && (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="space-y-3 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-neutral-800 border-2 border-dashed flex items-center justify-center overflow-hidden relative group" style={{ borderColor: localData.themeColor }}>
                                {localData.avatar ? (
                                    <img src={localData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-neutral-500" />
                                )}
                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Upload className="w-8 h-8 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <span className="text-[10px] text-neutral-500 uppercase font-bold">Profile Photo</span>
                        </div>

                        <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-1">
                                <label className="text-[10px] text-neutral-400 font-bold uppercase">Username / Handle</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-neutral-500">@</div>
                                    <input
                                        value={usernameInput}
                                        onChange={e => {
                                            setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                            setUsernameStatus('idle');
                                        }}
                                        className={`flex-1 bg-black/40 border rounded-lg p-3 text-sm text-white focus:outline-none transition-all ${usernameStatus === 'taken' ? 'border-red-500/50 focus:border-red-500' : usernameStatus === 'available' ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-blue-500/50'}`}
                                        placeholder="unique_username"
                                    />
                                    <button
                                        onClick={usernameStatus === 'available' ? handleConfirmUsername : handleCheckUsername}
                                        disabled={isCheckingUsername || usernameStatus === 'current' || usernameStatus === 'taken' || !usernameInput}
                                        className={`px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${usernameStatus === 'available' ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20' : usernameStatus === 'taken' ? 'bg-red-900/20 text-red-500 border border-red-500/30 cursor-not-allowed' : usernameStatus === 'current' ? 'bg-white/5 text-neutral-500 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
                                    >
                                        {isCheckingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                            usernameStatus === 'available' ? <><Check className="w-4 h-4" /> Claim</> :
                                                usernameStatus === 'taken' ? <><XCircle className="w-4 h-4" /> Taken</> :
                                                    usernameStatus === 'current' ? 'Current' : 'Check'}
                                    </button>
                                </div>
                                {usernameStatus === 'taken' && <p className="text-[10px] text-red-500 mt-1 ml-1">This username is already taken.</p>}
                                {usernameStatus === 'available' && <p className="text-[10px] text-green-500 mt-1 ml-1">Username is available!</p>}

                                {localData.username && (
                                    <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-[10px] text-blue-400 whitespace-nowrap">Guest Link:</span>
                                            <code className="text-[10px] text-blue-300 truncate font-mono select-all">
                                                summa.am/{localData.username}
                                            </code>
                                        </div>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(`summa.am/${localData.username}`)}
                                            className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition-colors"
                                            title="Copy Link"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-bold uppercase">First Name</label>
                                    <input
                                        value={localData.firstName}
                                        onChange={e => setLocalData({ ...localData, firstName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-bold uppercase">Last Name</label>
                                    <input
                                        value={localData.lastName}
                                        onChange={e => setLocalData({ ...localData, lastName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-bold uppercase">Gender</label>
                                    <select
                                        value={localData.gender}
                                        onChange={e => setLocalData({ ...localData, gender: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non_binary">Non-binary</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-bold uppercase">Birth Year</label>
                                    <input
                                        type="number"
                                        value={localData.birthYear}
                                        onChange={e => setLocalData({ ...localData, birthYear: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-bold uppercase">City / Location</label>
                                    <input
                                        value={localData.city}
                                        onChange={e => setLocalData({ ...localData, city: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-bold uppercase">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                                        <input
                                            value={localData.phoneNumber}
                                            onChange={e => setLocalData({ ...localData, phoneNumber: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-sm text-white focus:border-blue-500/50 outline-none"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-neutral-400 font-bold uppercase">Bio / About Me</label>
                                <textarea
                                    value={localData.bio}
                                    onChange={e => setLocalData({ ...localData, bio: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500/50 outline-none min-h-[100px]"
                                    placeholder="Brief description of yourself..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'appearance' && (
                <div className="space-y-10">
                    {/* Presets */}
                    <div>
                        <h3 className="text-sm font-bold text-white mb-4">Theme Presets</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button onClick={() => applyPreset('cyberpunk')} className="p-4 bg-black/40 border border-pink-500/30 rounded-xl hover:border-pink-500 transition-all text-left">
                                <div className="flex items-center gap-2 mb-2 text-pink-500"><Zap className="w-4 h-4" /> Cyberpunk</div>
                                <div className="text-[10px] text-neutral-500">Neon Pink & Dark Blue</div>
                            </button>
                            <button onClick={() => applyPreset('dark')} className="p-4 bg-black border border-white/10 rounded-xl hover:border-white transition-all text-left">
                                <div className="flex items-center gap-2 mb-2 text-white"><Moon className="w-4 h-4" /> Dark Mode</div>
                                <div className="text-[10px] text-neutral-500">Classic Void Black</div>
                            </button>
                            <button onClick={() => applyPreset('light')} className="p-4 bg-white text-black border border-white rounded-xl hover:shadow-lg transition-all text-left">
                                <div className="flex items-center gap-2 mb-2"><Sun className="w-4 h-4" /> Light Mode</div>
                                <div className="text-[10px] text-neutral-600">Clean & Bright</div>
                            </button>
                            <button onClick={() => applyPreset('forest')} className="p-4 bg-[#052e16] border border-green-500/30 rounded-xl hover:border-green-500 transition-all text-left">
                                <div className="flex items-center gap-2 mb-2 text-green-500"><Shield className="w-4 h-4" /> Forest</div>
                                <div className="text-[10px] text-neutral-400">Deep Green & Calm</div>
                            </button>
                        </div>
                    </div>

                    <hr className="border-white/5" />

                    <div>
                        <h3 className="text-sm font-bold text-white mb-4">Accent Color</h3>
                        <div className="flex flex-wrap gap-4">
                            {colors.map(color => (
                                <button
                                    key={color.hex}
                                    onClick={() => setLocalData({ ...localData, themeColor: color.hex, themePreset: 'custom' })}
                                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${localData.themeColor === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:border-white/50'}`}
                                    style={{ backgroundColor: color.hex, boxShadow: localData.themeColor === color.hex ? `0 0 20px ${color.hex}60` : 'none' }}
                                >
                                    {localData.themeColor === color.hex && <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-white mb-4">Background Color</h3>
                        <div className="flex flex-wrap gap-4">
                            {backgrounds.map(bg => (
                                <button
                                    key={bg.hex}
                                    onClick={() => setLocalData({ ...localData, backgroundColor: bg.hex, themePreset: 'custom' })}
                                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${localData.backgroundColor === bg.hex ? 'border-white scale-110' : 'border-white/10 hover:border-white/50'}`}
                                    style={{ backgroundColor: bg.hex }}
                                >
                                    {localData.backgroundColor === bg.hex && <CheckCircle2 className={`w-5 h-5 ${bg.hex === '#f8fafc' ? 'text-black' : 'text-white'}`} />}
                                </button>
                            ))}
                            <div className="relative">
                                <input
                                    type="color"
                                    value={localData.backgroundColor}
                                    onChange={(e) => setLocalData({ ...localData, backgroundColor: e.target.value, themePreset: 'custom' })}
                                    className="w-12 h-12 rounded-xl overflow-hidden cursor-pointer opacity-0 absolute inset-0"
                                />
                                <div className="w-12 h-12 rounded-xl border-2 border-white/10 flex items-center justify-center pointer-events-none" style={{ backgroundColor: localData.backgroundColor }}>
                                    <Palette className="w-4 h-4 mix-blend-difference text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="space-y-8">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white rounded-xl">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Google Calendar</h3>
                                    <p className="text-xs text-neutral-500">Sync routines and tasks with your calendar.</p>
                                </div>
                            </div>
                            {googleUser ? (
                                <button
                                    onClick={handleDisconnectGoogle}
                                    className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all w-full md:w-auto text-center"
                                >
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnectGoogle}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-all w-full md:w-auto text-center"
                                >
                                    Connect
                                </button>
                            )}
                        </div>

                        {googleUser && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <div>
                                        <div className="text-sm font-bold text-white">Connected Successfully</div>
                                        <div className="text-xs text-green-400 font-mono">{googleUser.email}</div>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(34,197,94,0.5)]"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'privacy' && (
                <div className="space-y-8">
                    <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <Lock className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase">Privacy Control Center</h3>
                            <p className="text-xs text-neutral-400">Manage visibility permissions for Guest Mode.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                id: 'career', label: 'Career & Portfolio',
                                subsections: [
                                    { id: 'cv', label: 'CV / Resume' },
                                    { id: 'experience', label: 'Experience' },
                                    { id: 'skills', label: 'Skill Tree' },
                                    { id: 'projects', label: 'Projects' },
                                    { id: 'achievements', label: 'Achievements' },
                                    { id: 'services', label: 'Services' },
                                    { id: 'education', label: 'Education' },
                                    { id: 'languages', label: 'Languages' },
                                    { id: 'protocol', label: 'Routine / Protocol' },
                                    { id: 'tasks', label: 'Active Missions' },
                                    { id: 'goals', label: 'Strategic Goals' },
                                    { id: 'notes', label: 'Notes & Thoughts' }
                                ]
                            },
                            {
                                id: 'finance', label: 'Finance',
                                subsections: [
                                    { id: 'overview', label: 'Balance Overview Chart' },
                                    { id: 'transactions', label: 'Transaction History (Sensitive)' },
                                    { id: 'protocol', label: 'Routine / Protocol' },
                                    { id: 'tasks', label: 'Financial Tasks' },
                                    { id: 'goals', label: 'Strategic Goals' },
                                    { id: 'notes', label: 'Notes' }
                                ]
                            },
                            {
                                id: 'health', label: 'Health',
                                subsections: [
                                    { id: 'metrics', label: 'Body Metrics (Weight, etc.)' },
                                    { id: 'routine', label: 'Routine / Protocol' },
                                    { id: 'tasks', label: 'Mission Tasks' },
                                    { id: 'notes', label: 'Notes' }
                                ]
                            },
                            {
                                id: 'network', label: 'Network',
                                subsections: []
                            }
                        ].map(module => {
                            const moduleKey = module.id;
                            const privacySettings = localData.modulePrivacy || {};
                            const isModulePublic = privacySettings[moduleKey]?.enabled !== false; // Default Public if not set

                            return (
                                <div key={moduleKey} className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
                                    {/* Module Header */}
                                    <div className="p-4 flex items-center justify-between bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isModulePublic ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                <div className="w-4 h-4 rounded-full bg-current" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{module.label}</h4>
                                                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{isModulePublic ? 'Publicly Visible' : 'Hidden for Guests'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const current = privacySettings[moduleKey] || {};
                                                setLocalData({
                                                    ...localData,
                                                    modulePrivacy: {
                                                        ...privacySettings,
                                                        [moduleKey]: { ...current, enabled: !isModulePublic }
                                                    }
                                                });
                                            }}
                                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${isModulePublic ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-red-600 text-white hover:bg-red-500'}`}
                                        >
                                            {isModulePublic ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>

                                    {/* Subsections */}
                                    {isModulePublic && module.subsections.length > 0 && (
                                        <div className="p-4 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-2">
                                            {/* Split subsections into Info and Operational */}
                                            {(() => {
                                                const operationalKeys = ['tasks', 'notes', 'protocol', 'goals'];
                                                const infoItems = module.subsections.filter(s => !operationalKeys.includes(s.id));
                                                const operationalItems = module.subsections.filter(s => operationalKeys.includes(s.id));

                                                const RenderToggle = ({ item }) => {
                                                    const isSubPublic = privacySettings[moduleKey]?.sections?.[item.id] !== false;
                                                    return (
                                                        <div key={item.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                                                            <span className="text-xs text-neutral-400">{item.label}</span>
                                                            <button
                                                                onClick={() => {
                                                                    const currentModule = privacySettings[moduleKey] || { enabled: true, sections: {} };
                                                                    const currentSections = currentModule.sections || {};
                                                                    setLocalData({
                                                                        ...localData,
                                                                        modulePrivacy: {
                                                                            ...privacySettings,
                                                                            [moduleKey]: {
                                                                                ...currentModule,
                                                                                sections: {
                                                                                    ...currentSections,
                                                                                    [item.id]: !isSubPublic
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                                }}
                                                                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${isSubPublic ? 'bg-blue-600' : 'bg-neutral-700'}`}
                                                            >
                                                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isSubPublic ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                                            </button>
                                                        </div>
                                                    );
                                                };

                                                return (
                                                    <div className="space-y-6">
                                                        {infoItems.length > 0 && (
                                                            <div className="space-y-2">
                                                                <h5 className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-2">Profile Data</h5>
                                                                <div className="space-y-1 pl-2 border-l border-white/10">
                                                                    {infoItems.map(item => <RenderToggle key={item.id} item={item} />)}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {operationalItems.length > 0 && (
                                                            <div className="space-y-2">
                                                                <h5 className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-2">Operational Data</h5>
                                                                <div className="space-y-1 pl-2 border-l border-yellow-500/20">
                                                                    {operationalItems.map(item => <RenderToggle key={item.id} item={item} />)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'gameplay' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Mechanics Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            Game Mechanics
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">Experience Points (XP)</h4>
                                    <p className="text-[10px] text-neutral-500">Enable visible leveling, XP rewards, and architect rank.</p>
                                </div>
                                <button
                                    onClick={() => setLocalData({ ...localData, gameplaySettings: { ...localData.gameplaySettings, xp: !localData.gameplaySettings?.xp } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors p-1 ${localData.gameplaySettings?.xp !== false ? 'bg-blue-600' : 'bg-neutral-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localData.gameplaySettings?.xp !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">Internal Currency (Coins)</h4>
                                    <p className="text-[10px] text-neutral-500">Enable coin rewards, wallet, and balance tracking.</p>
                                </div>
                                <button
                                    onClick={() => setLocalData({ ...localData, gameplaySettings: { ...localData.gameplaySettings, coins: !localData.gameplaySettings?.coins } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors p-1 ${localData.gameplaySettings?.coins !== false ? 'bg-yellow-500' : 'bg-neutral-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localData.gameplaySettings?.coins !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Modules Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                             <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Palette className="w-4 h-4 text-purple-500" />
                                Active Modules
                            </h3>
                            <span className="text-[9px] bg-white/10 px-2 py-1 rounded text-neutral-400">Owner Only</span>
                        </div>
                       
                        <p className="text-[10px] text-neutral-500 mb-2">Toggle modules off to hide them from your main navigation. At least one module must remain active.</p>
                        <div className="grid grid-cols-1 gap-3">
                            {['career', 'finance', 'health', 'network'].map(modId => {
                                const isHidden = (localData.hiddenModules || []).includes(modId);
                                return (
                                    <div key={modId} className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${!isHidden ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-60'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${!isHidden ? 'bg-white/10 text-white' : 'bg-white/5 text-neutral-500'}`}>
                                                {modId === 'career' && <Target className="w-4 h-4" />}
                                                {modId === 'finance' && <Coins className="w-4 h-4" />}
                                                {modId === 'health' && <Activity className="w-4 h-4" />}
                                                {modId === 'network' && <Globe className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-white capitalize">{modId}</span>
                                                <p className="text-[9px] text-neutral-500">{!isHidden ? 'Active in Sidebar & Mobile' : 'Hidden from Navigation'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const currentHidden = localData.hiddenModules || [];
                                                if (isHidden) {
                                                    // Unhide
                                                    setLocalData({ ...localData, hiddenModules: currentHidden.filter(id => id !== modId) });
                                                } else {
                                                    // Hide (check if at least one remains)
                                                    const allModules = ['career', 'finance', 'health', 'network'];
                                                    const currentlyActive = allModules.filter(m => !currentHidden.includes(m));
                                                    if (currentlyActive.length <= 1 && currentlyActive.includes(modId)) {
                                                        alert("You must have at least one active module.");
                                                        return;
                                                    }
                                                    setLocalData({ ...localData, hiddenModules: [...currentHidden, modId] });
                                                }
                                            }}
                                            className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all ${!isHidden ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30' : 'bg-neutral-800 text-neutral-500 border border-transparent hover:border-white/10 hover:text-neutral-400'}`}
                                        >
                                            {!isHidden ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button (Mobile & Desktop) */}
            <div className="flex justify-end pt-4 border-t border-white/5 sticky bottom-0 bg-[#0A0A0A]/95 p-4 backdrop-blur-md -mx-4 -mb-4 mt-8 z-10 border-t border-white/10">
                <button
                    onClick={handleSave}
                    className="w-full md:w-auto px-8 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: localData.themeColor, color: '#fff' }}
                >
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>
        </div>
    );

    const menuItems = [
        { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Personal info, identity & bio' },
        { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme, colors & layout' },
        { id: 'integrations', label: 'Integrations', icon: Sliders, desc: 'Connect external services' },
        { id: 'privacy', label: 'Privacy Control', icon: Lock, desc: 'Manage public visibility' },
        { id: 'gameplay', label: 'Gameplay & Modules', icon: CheckCircle2, desc: 'XP, Rewards & Module Visibility' }
    ];

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col max-w-5xl mx-auto">
            <header className="mb-4 md:mb-8 border-b border-white/5 pb-6">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2" style={{ color: localData.themeColor }}>System Settings</h1>
                <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">Configuration & Personalization</p>
            </header>

            {/* Desktop Layout (Standard Sidebar + Content) */}
            <div className="hidden md:flex flex-row gap-8 flex-1">
                {/* Sidebar Navigation */}
                <div className="w-64 flex flex-col gap-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 ${activeTab === item.id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:bg-white/5'}`}
                        >
                            <item.icon className="w-4 h-4" /> {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-8 bg-black/20 p-8 rounded-2xl border border-white/5 h-fit">
                    {renderContent()}
                </div>
            </div>

            {/* Mobile Layout (Navigation Stacks) */}
            <div className="md:hidden flex flex-col flex-1">
                {mobileView === 'menu' ? (
                    <div className="space-y-3">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className="w-full text-left p-4 rounded-2xl bg-neutral-900 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-neutral-400 group-hover:text-white transition-colors">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">{item.label}</h3>
                                        <p className="text-[10px] text-neutral-500">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <button 
                            onClick={handleMobileBack}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-white mb-6"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Settings
                        </button>
                        
                        <div className="flex-1">
                             <div className="mb-4">
                                <h2 className="text-xl font-black text-white uppercase">{menuItems.find(m => m.id === activeTab)?.label}</h2>
                             </div>
                             {renderContent()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsModule;
