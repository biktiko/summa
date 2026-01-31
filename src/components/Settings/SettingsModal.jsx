import React, { useState } from 'react';
import { X, Save, User, Palette, Upload, Lock, CheckCircle2, Copy } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, userData, updateUser }) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('profile');
    const [localData, setLocalData] = useState({
        // Profile
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        gender: userData.gender || 'prefer_not_to_say',
        birthYear: userData.birthYear || '',
        city: userData.city || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',

        // Theme
        themeColor: userData.themeColor || '#3b82f6', // Default blue-500
        accentColor: userData.accentColor || '#10b981', // Default green-500

        // Privacy
        modulePrivacy: userData.modulePrivacy || {},

        // Gameplay & Visibility
        gameplaySettings: userData.gameplaySettings || { xp: true, coins: true },
        hiddenModules: userData.hiddenModules || []
    });

    const handleSave = () => {
        updateUser(localData);
        onClose();
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

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex bg-black/40 border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'profile' ? 'text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" /> Profile Settings
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('theme')}
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'theme' ? 'text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Theme Customization
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'privacy' ? 'text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Privacy
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('gameplay')}
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'gameplay' ? 'text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Gameplay
                        </div>
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-6">
                                <div className="space-y-3 flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden relative group">
                                        {localData.avatar ? (
                                            <img src={localData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-neutral-500" />
                                        )}
                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Upload className="w-6 h-6 text-white" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                        </label>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Profile Photo</span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-neutral-400 font-bold uppercase">Username / Handle</label>
                                        <div className="flex gap-2">
                                            <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-neutral-500">@</div>
                                            <input
                                                value={localData.username || ''}
                                                onChange={e => setLocalData({ ...localData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                                placeholder="unique_username"
                                            />
                                        </div>
                                        {localData.username && (
                                            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="text-[10px] text-blue-400 whitespace-nowrap">Guest Link:</span>
                                                    <code className="text-[10px] text-blue-300 truncate font-mono select-all">
                                                        t.me/newTig/{localData.username}
                                                    </code>
                                                </div>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(`t.me/newTig/${localData.username}`)}
                                                    className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition-colors"
                                                    title="Copy Link"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-neutral-400 font-bold uppercase">First Name</label>
                                            <input
                                                value={localData.firstName}
                                                onChange={e => setLocalData({ ...localData, firstName: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-neutral-400 font-bold uppercase">Last Name</label>
                                            <input
                                                value={localData.lastName}
                                                onChange={e => setLocalData({ ...localData, lastName: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-neutral-400 font-bold uppercase">Gender</label>
                                            <select
                                                value={localData.gender}
                                                onChange={e => setLocalData({ ...localData, gender: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
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
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] text-neutral-400 font-bold uppercase">City / Location</label>
                                        <input
                                            value={localData.city}
                                            onChange={e => setLocalData({ ...localData, city: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-neutral-400 font-bold uppercase">Bio / About Me</label>
                                <textarea
                                    value={localData.bio}
                                    onChange={e => setLocalData({ ...localData, bio: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none min-h-[100px]"
                                    placeholder="Brief description of yourself..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white">Primary Theme Color</h3>
                                <div className="flex flex-wrap gap-4">
                                    {colors.map(color => (
                                        <button
                                            key={color.hex}
                                            onClick={() => setLocalData({ ...localData, themeColor: color.hex })}
                                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${localData.themeColor === color.hex ? 'border-white scale-110 shadow-lg shadow-' + color.name.toLowerCase() + '-500/50' : 'border-transparent hover:border-white/50'}`}
                                            style={{ backgroundColor: color.hex }}
                                        >
                                            {localData.themeColor === color.hex && <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-neutral-900/50 rounded-xl border border-white/5 space-y-2">
                                <h4 className="text-xs font-black uppercase text-neutral-400">Preview</h4>
                                <div
                                    className="p-4 rounded-lg text-white font-bold text-center"
                                    style={{ backgroundColor: localData.themeColor }}
                                >
                                    Theme Primary Color
                                </div>
                                <div className="flex gap-2">
                                    <div
                                        className="flex-1 p-2 rounded text-[10px] bg-black border"
                                        style={{ borderColor: localData.themeColor, color: localData.themeColor }}
                                    >
                                        Border & Text
                                    </div>
                                    <div
                                        className="flex-1 p-2 rounded text-[10px] bg-black relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: localData.themeColor }}></div>
                                        <span className="relative z-10" style={{ color: localData.themeColor }}>Background Tint</span>
                                    </div>
                                </div>
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
                                        id: 'career', label: 'Career & Portfolio', icon: User,
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
                                        id: 'finance', label: 'Finance', icon: User, // Using generic icon as I don't import others here
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
                                        id: 'health', label: 'Health', icon: User,
                                        subsections: [
                                            { id: 'metrics', label: 'Body Metrics (Weight, etc.)' },
                                            { id: 'routine', label: 'Routine / Protocol' },
                                            { id: 'tasks', label: 'Mission Tasks' },
                                            { id: 'notes', label: 'Notes' }
                                        ]
                                    },
                                    {
                                        id: 'network', label: 'Network', icon: User,
                                        subsections: [] // Network has no subsections yet
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
                                                        {/* Icon placeholder if needed */}
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
                                                <div className="p-4 space-y-3 border-t border-white/5 animate-in slide-in-from-top-2">
                                                    {module.subsections.map(sub => {
                                                        const subKey = sub.id;
                                                        const isSubPublic = privacySettings[moduleKey]?.sections?.[subKey] !== false; // Default true if module is public

                                                        return (
                                                            <div key={subKey} className="flex items-center justify-between pl-11">
                                                                <span className="text-xs text-neutral-400">{sub.label}</span>
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
                                                                                        [subKey]: !isSubPublic
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
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'gameplay' && (
                        <div className="space-y-8">
                             {/* Mechanics Section */}
                             <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    Game Mechanics
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">Experience Points (XP)</h4>
                                            <p className="text-[10px] text-neutral-500">Enable visible leveling and XP rewards.</p>
                                        </div>
                                        <button
                                            onClick={() => setLocalData({ ...localData, gameplaySettings: { ...localData.gameplaySettings, xp: !localData.gameplaySettings?.xp } })}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localData.gameplaySettings?.xp !== false ? 'bg-blue-600' : 'bg-neutral-700'}`}
                                        >
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${localData.gameplaySettings?.xp !== false ? 'translate-x-4.5' : 'translate-x-1'}`} style={{ transform: localData.gameplaySettings?.xp !== false ? 'translateX(18px)' : 'translateX(4px)' }} />
                                        </button>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">Internal Currency (Coins)</h4>
                                            <p className="text-[10px] text-neutral-500">Enable coin rewards and balance tracking.</p>
                                        </div>
                                        <button
                                            onClick={() => setLocalData({ ...localData, gameplaySettings: { ...localData.gameplaySettings, coins: !localData.gameplaySettings?.coins } })}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localData.gameplaySettings?.coins !== false ? 'bg-yellow-500' : 'bg-neutral-700'}`}
                                        >
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`} style={{ transform: localData.gameplaySettings?.coins !== false ? 'translateX(18px)' : 'translateX(4px)' }} />
                                        </button>
                                    </div>
                                </div>
                             </div>

                             {/* Modules Section */}
                             <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-purple-500" />
                                    Active Modules
                                </h3>
                                <p className="text-[10px] text-neutral-500 mb-2">Toggle modules off to hide them from your main navigation. At least one module must remain active.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {['career', 'finance', 'health', 'network'].map(modId => {
                                        const isHidden = (localData.hiddenModules || []).includes(modId);
                                        return (
                                            <div key={modId} className={`p-4 rounded-xl border transition-all ${!isHidden ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-white capitalize">{modId}</span>
                                                    <button
                                                        onClick={() => {
                                                            const currentHidden = localData.hiddenModules || [];
                                                            if (isHidden) {
                                                                // Unhide
                                                                setLocalData({ ...localData, hiddenModules: currentHidden.filter(id => id !== modId) });
                                                            } else {
                                                                // Hide (check if at least one remains)
                                                                const activeCount = 4 - currentHidden.length; // Approximate
                                                                // Better: count how many are NOT hidden from the list
                                                                const allModules = ['career', 'finance', 'health', 'network'];
                                                                const currentlyActive = allModules.filter(m => !currentHidden.includes(m));
                                                                if (currentlyActive.length <= 1 && currentlyActive.includes(modId)) {
                                                                    alert("You must have at least one active module.");
                                                                    return;
                                                                }
                                                                setLocalData({ ...localData, hiddenModules: [...currentHidden, modId] });
                                                            }
                                                        }}
                                                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${!isHidden ? 'bg-green-500/20 text-green-500' : 'bg-neutral-700 text-neutral-400'}`}
                                                    >
                                                        {!isHidden ? 'Active' : 'Hidden'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                        style={{ backgroundColor: localData.themeColor !== '#3b82f6' ? localData.themeColor : undefined }}
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
