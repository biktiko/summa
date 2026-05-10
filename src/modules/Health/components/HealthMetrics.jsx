import React, { useState } from 'react';
import { Activity, Scale, Ruler, TrendingUp, Plus, X, Settings, Target, Edit2, Trash2, Calendar, Eye, EyeOff } from 'lucide-react';

const HealthMetrics = ({ userData, updateUser, viewMode, isSectionHidden, toggleSectionVisibility }) => {
    const [isEditingWeight, setIsEditingWeight] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const [newWeight, setNewWeight] = useState('');
    const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);

    // Settings State
    const [settingsHeight, setSettingsHeight] = useState(userData.height || '');
    const [settingsTargetWeight, setSettingsTargetWeight] = useState(userData.targetWeight || '');
    const [settingsBodyFat, setSettingsBodyFat] = useState(userData.bodyFat || '');

    const currentWeight = userData.weight || 0;
    const height = userData.height || 0;
    const targetWeight = userData.targetWeight || 0;
    const weightHistory = userData.weightHistory || [];

    // ... (keep existing handlers: handleSaveWeightEntry, handleDeleteEntry, openAddModal, openEditModal, handleSaveSettings, openSettings, renderGraph)

    const handleSaveWeightEntry = () => {
        if (!newWeight) return;

        const entry = {
            date: weightDate,
            weight: parseFloat(newWeight)
        };

        let updatedHistory;
        if (editingIndex !== null) {
            // Update existing
            updatedHistory = [...weightHistory];
            updatedHistory[editingIndex] = entry;
        } else {
            // Add new
            updatedHistory = [...weightHistory, entry];
        }

        // Sort by date ascending (oldest first) for the graph logic to work easily
        updatedHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Update current weight to the latest entry
        const latestWeight = updatedHistory.length > 0 ? updatedHistory[updatedHistory.length - 1].weight : 0;

        updateUser({
            weight: latestWeight,
            weightHistory: updatedHistory
        });

        setIsEditingWeight(false);
        setEditingIndex(null);
        setNewWeight('');
    };

    const handleDeleteEntry = (index) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        const updatedHistory = weightHistory.filter((_, i) => i !== index);

        // Update current weight to the latest entry (or 0 if empty)
        const latestWeight = updatedHistory.length > 0 ? updatedHistory[updatedHistory.length - 1].weight : 0;

        updateUser({
            weight: latestWeight,
            weightHistory: updatedHistory
        });
    };

    const openAddModal = () => {
        setEditingIndex(null);
        setNewWeight('');
        setWeightDate(new Date().toISOString().split('T')[0]);
        setIsEditingWeight(true);
    };

    const openEditModal = (index) => {
        const entry = weightHistory[index];
        setEditingIndex(index);
        setNewWeight(entry.weight);
        setWeightDate(entry.date);
        setIsEditingWeight(true);
    };

    const handleSaveSettings = () => {
        updateUser({
            height: parseFloat(settingsHeight),
            targetWeight: parseFloat(settingsTargetWeight),
            bodyFat: parseFloat(settingsBodyFat)
        });
        setIsEditingSettings(false);
    };

    const openSettings = () => {
        setSettingsHeight(userData.height || '');
        setSettingsTargetWeight(userData.targetWeight || '');
        setSettingsBodyFat(userData.bodyFat || '');
        setIsEditingSettings(true);
    };

    // Enhanced Graph Visualization
    const renderGraph = () => {
        if (weightHistory.length < 2 && targetWeight === 0) return (
            <div className="w-full h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-white/20">
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Not enough data for graph</p>
            </div>
        );

        const weights = weightHistory.map(w => w.weight);
        if (targetWeight > 0) weights.push(targetWeight);

        const maxWeight = Math.max(...weights) + 2;
        const minWeight = Math.min(...weights) - 2;
        const range = maxWeight - minWeight;
        const effectiveRange = range === 0 ? 10 : range;

        // Generate points for the line
        const points = weightHistory.map((entry, index) => {
            const x = (index / (weightHistory.length - 1 || 1)) * 100;
            const y = 100 - ((entry.weight - minWeight) / effectiveRange) * 100;
            return `${x},${y}`;
        }).join(' ');

        // Generate area path (closed loop)
        const areaPoints = `0,100 ${points} 100,100`;

        // Target Line Y position
        let targetLineY = null;
        if (targetWeight > 0) {
            targetLineY = 100 - ((targetWeight - minWeight) / effectiveRange) * 100;
        }

        return (
            <div className="w-full h-96 mt-8 relative group/graph">
                {/* Y-Axis Labels (Left) */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-slate-400 font-mono py-2 pointer-events-none">
                    <span>{Math.round(maxWeight)}kg</span>
                    <span>{Math.round(minWeight + range / 2)}kg</span>
                    <span>{Math.round(minWeight)}kg</span>
                </div>

                <div className="absolute inset-0 ml-8">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                        <line x1="0" y1="100%" x2="100%" y2="100%" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                        {/* Target Line */}
                        {targetLineY !== null && (
                            <line
                                x1="0"
                                y1={`${targetLineY}%`}
                                x2="100%"
                                y2={`${targetLineY}%`}
                                stroke="#eab308"
                                strokeWidth="1"
                                strokeDasharray="4"
                                opacity="0.4"
                            />
                        )}

                        {/* Area Fill */}
                        {weightHistory.length > 1 && (
                            <polygon
                                points={areaPoints}
                                fill="url(#graphGradient)"
                            />
                        )}

                        {/* Graph Line */}
                        {weightHistory.length > 1 && (
                            <polyline
                                points={points}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                                className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            />
                        )}

                        {/* Interactive Points (Only visible on hover) */}
                        {weightHistory.map((entry, index) => {
                            const x = (index / (weightHistory.length - 1 || 1)) * 100;
                            const y = 100 - ((entry.weight - minWeight) / effectiveRange) * 100;
                            return (
                                <g key={index} className="group/point">
                                    <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="6"
                                        fill="transparent"
                                        className="cursor-pointer"
                                    />
                                    <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="3"
                                        fill="#ef4444"
                                        className="opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none"
                                    />
                                    {/* Tooltip */}
                                    <foreignObject x={`${x}%`} y={`${y}%`} width="100" height="50" className="overflow-visible opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
                                        <div className="transform -translate-x-1/2 -translate-y-full pb-2">
                                            <div className="bg-white shadow-sm border border-slate-200 border border-slate-300 rounded px-2 py-1 text-[10px] whitespace-nowrap text-slate-800 shadow-xl">
                                                <span className="font-bold">{entry.weight}kg</span>
                                                <span className="text-slate-500 ml-1">{entry.date}</span>
                                            </div>
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[9px] text-slate-400 mt-4 font-mono uppercase ml-8">
                    <span>{weightHistory[0]?.date}</span>
                    <span>{weightHistory[weightHistory.length - 1]?.date}</span>
                </div>
            </div>
        );
    };

    if (isSectionHidden && viewMode !== 'admin') {
        return null; // Completely hidden for guests
    }

    return (
        <div className={`w-full space-y-6 ${isSectionHidden ? 'opacity-50 grayscale' : ''}`}>
            {/* Main Stats Card */}
            <div className="bg-white shadow-sm border border-slate-200/30 border border-slate-200 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {viewMode === 'admin' && (
                        <>
                            <button
                                onClick={toggleSectionVisibility}
                                className={`p-2 rounded-xl transition-colors backdrop-blur-sm ${isSectionHidden ? 'bg-red-500/20 text-red-500' : 'bg-slate-50 text-slate-500 hover:text-blue-600'}`}
                                title={isSectionHidden ? "Show to Guests" : "Hide from Guests"}
                            >
                                {isSectionHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={openSettings}
                                className="p-2 bg-slate-50 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-blue-600 transition-colors backdrop-blur-sm"
                                title="Body Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                onClick={openAddModal}
                                className="p-2 bg-slate-50 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-blue-600 transition-colors backdrop-blur-sm"
                                title="Log Weight"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/10">
                        <Activity className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Body Metrics {isSectionHidden && <span className="text-xs text-red-500 ml-2">(HIDDEN)</span>}</h2>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Physical Status & Trajectory</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Weight */}
                    <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 hover:border-red-500/30 transition-colors group/stat">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2 group-hover/stat:text-red-500 transition-colors">
                            <Scale className="w-4 h-4" /> Current Weight
                        </div>
                        <div className="text-5xl font-black text-slate-800 tracking-tighter">
                            {currentWeight} <span className="text-lg text-slate-500 font-bold">kg</span>
                        </div>
                    </div>

                    {/* Target Weight */}
                    <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 hover:border-amber-600/30 transition-colors group/stat">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2 group-hover/stat:text-amber-600 transition-colors">
                            <Target className="w-4 h-4" /> Target Goal
                        </div>
                        <div className="text-5xl font-black text-amber-600 tracking-tighter">
                            {targetWeight || '--'} <span className="text-lg text-amber-600/50 font-bold">kg</span>
                        </div>
                    </div>

                    {/* Height */}
                    <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 hover:border-blue-500/30 transition-colors group/stat">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2 group-hover/stat:text-blue-500 transition-colors">
                            <Ruler className="w-4 h-4" /> Height
                        </div>
                        <div className="text-5xl font-black text-slate-800 tracking-tighter">
                            {height || '--'} <span className="text-lg text-slate-500 font-bold">cm</span>
                        </div>
                    </div>

                    {/* Body Fat */}
                    <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 hover:border-purple-500/30 transition-colors group/stat">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2 group-hover/stat:text-purple-500 transition-colors">
                            <Activity className="w-4 h-4" /> Body Fat
                        </div>
                        <div className="text-5xl font-black text-slate-800 tracking-tighter">
                            {userData.bodyFat || '--'} <span className="text-lg text-slate-500 font-bold">%</span>
                        </div>
                    </div>
                </div>

                {renderGraph()}
            </div>

            {/* History Table */}
            {weightHistory.length > 0 && (
                <div className="bg-white shadow-sm border border-slate-200/30 border border-slate-200 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">History Log</h3>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <th className="p-4 border-b border-slate-200">Date</th>
                                    <th className="p-4 border-b border-slate-200">Weight</th>
                                    <th className="p-4 border-b border-slate-200 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[...weightHistory].reverse().map((entry, index) => {
                                    // We reversed the array for display (newest first), so we need to calculate the original index
                                    const originalIndex = weightHistory.length - 1 - index;
                                    return (
                                        <tr key={index} className="group hover:bg-slate-100 transition-colors">
                                            <td className="p-4 text-sm font-mono text-slate-600">{entry.date}</td>
                                            <td className="p-4 text-sm font-bold text-slate-800">{entry.weight} kg</td>
                                            <td className="p-4 text-right">
                                                {viewMode === 'admin' && (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(originalIndex)}
                                                            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEntry(originalIndex)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Weight Modal */}
            {isEditingWeight && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-3xl shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                                {editingIndex !== null ? 'Edit Entry' : 'Log Weight'}
                            </h3>
                            <button onClick={() => setIsEditingWeight(false)} className="text-slate-500 hover:text-blue-600 transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Weight (kg)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-4 text-slate-800 text-lg outline-none focus:border-red-500 transition-colors font-mono"
                                    value={newWeight}
                                    onChange={e => setNewWeight(e.target.value)}
                                    autoFocus
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-4 text-slate-800 text-lg outline-none focus:border-red-500 transition-colors font-mono"
                                    value={weightDate}
                                    onChange={e => setWeightDate(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleSaveWeightEntry}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-wider text-sm transition-all shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {editingIndex !== null ? 'Update Entry' : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isEditingSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-3xl shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Body Settings</h3>
                            <button onClick={() => setIsEditingSettings(false)} className="text-slate-500 hover:text-blue-600 transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Height (cm)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-4 text-slate-800 text-lg outline-none focus:border-blue-500 transition-colors font-mono"
                                    value={settingsHeight}
                                    onChange={e => setSettingsHeight(e.target.value)}
                                    placeholder="180"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Target Weight (kg)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-4 text-slate-800 text-lg outline-none focus:border-amber-600 transition-colors font-mono"
                                    value={settingsTargetWeight}
                                    onChange={e => setSettingsTargetWeight(e.target.value)}
                                    placeholder="75"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Body Fat (%)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-4 text-slate-800 text-lg outline-none focus:border-purple-500 transition-colors font-mono"
                                    value={settingsBodyFat}
                                    onChange={e => setSettingsBodyFat(e.target.value)}
                                    placeholder="15"
                                />
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                className="w-full py-4 bg-white text-black hover:bg-neutral-200 font-black rounded-xl uppercase tracking-wider text-sm transition-all shadow-lg shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthMetrics;
