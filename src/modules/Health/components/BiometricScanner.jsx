import React, { useState } from 'react';
import { Activity, AlertTriangle, Plus, Trash2, Edit2, X, Check, Folder, Target, Info, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

const BiometricScanner = ({ biometrics, actions, viewMode, isSectionHidden, toggleSectionVisibility }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);

    // Extended Data Model
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        unit: '',
        category: 'General',
        optimalMin: '',
        optimalMax: '',
        criticalMin: '',
        criticalMax: '',
        target: '',
        description: ''
    });

    const categories = ['General', 'Blood Panel', 'Hormones', 'Vitamins & Minerals', 'Cardiovascular', 'Metabolic', 'Other'];

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.value) return;

        const data = {
            name: formData.name,
            value: parseFloat(formData.value),
            unit: formData.unit,
            category: formData.category || 'General',
            optimalMin: parseFloat(formData.optimalMin) || 0,
            optimalMax: parseFloat(formData.optimalMax) || 0,
            criticalMin: parseFloat(formData.criticalMin) || 0,
            criticalMax: parseFloat(formData.criticalMax) || 0,
            target: parseFloat(formData.target) || null,
            description: formData.description,
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        if (editingId) {
            await actions.update(editingId, data);
        } else {
            await actions.add(data);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '', value: '', unit: '', category: 'General',
            optimalMin: '', optimalMax: '', criticalMin: '', criticalMax: '',
            target: '', description: ''
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (item) => {
        setFormData({
            ...item,
            target: item.target || '',
            description: item.description || ''
        });
        setEditingId(item.id);
        setIsAdding(true);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this metric?')) {
            actions.delete(id);
        }
    };

    const groupedBiometrics = biometrics.reduce((acc, item) => {
        const cat = item.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    // Helper to determine status color and text
    const getStatus = (val, optMin, optMax, critMin, critMax) => {
        if (val >= optMin && val <= optMax) return { color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', label: 'OPTIMAL' };
        if (val < critMin || val > critMax) return { color: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500', label: 'CRITICAL' };
        return { color: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-600', label: 'WARNING' };
    };

    if (isSectionHidden && viewMode !== 'admin') {
        return null; // Completely hidden for guests
    }

    return (
        <div className={`h-full flex flex-col ${isSectionHidden ? 'opacity-50 grayscale' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-1">Bio-Telemetry {isSectionHidden && <span className="text-xs text-red-500 ml-2">(HIDDEN)</span>}</h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Comprehensive Health Diagnostics</p>
                </div>
                {viewMode === 'admin' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSectionVisibility}
                            className={`p-2 rounded-xl transition-colors backdrop-blur-sm ${isSectionHidden ? 'bg-red-500/20 text-red-500' : 'bg-slate-50 text-slate-500 hover:text-blue-600'}`}
                            title={isSectionHidden ? "Show to Guests" : "Hide from Guests"}
                        >
                            {isSectionHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => { resetForm(); setIsAdding(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold uppercase text-xs rounded-lg hover:bg-neutral-200 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Metric
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-12 pb-20">
                {Object.keys(groupedBiometrics).length === 0 && !isAdding && (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-3xl bg-slate-100">
                        <Activity className="w-12 h-12 text-neutral-700 mb-4" />
                        <p className="text-slate-500 text-sm uppercase tracking-widest">System Offline: No Data</p>
                    </div>
                )}

                {Object.entries(groupedBiometrics).map(([category, items]) => (
                    <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
                            <Folder className="w-4 h-4 text-slate-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{category}</h3>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{items.length}</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {items.map(item => {
                                const status = getStatus(item.value, item.optimalMin, item.optimalMax, item.criticalMin, item.criticalMax);
                                const isExpanded = expandedItem === item.id;

                                // Visualization Math
                                const totalRangeMin = Math.min(item.criticalMin, item.value) * 0.9;
                                const totalRangeMax = Math.max(item.criticalMax, item.value) * 1.1;
                                const totalSpan = totalRangeMax - totalRangeMin;

                                const getPercent = (val) => Math.min(100, Math.max(0, ((val - totalRangeMin) / totalSpan) * 100));

                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white shadow-sm border border-slate-200/40 border ${status.border}/20 rounded-2xl overflow-hidden transition-all hover:border-${status.color.split('-')[1]}-500/50 group`}
                                    >
                                        {/* Main Row */}
                                        <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                            {/* Info */}
                                            <div className="w-full md:w-1/4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{item.name}</h4>
                                                    {item.description && <Info className="w-3 h-3 text-slate-400" />}
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-3xl font-black tracking-tighter ${status.color}`}>
                                                        {item.value}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-mono font-bold">{item.unit}</span>
                                                </div>
                                            </div>

                                            {/* Visualization Bar */}
                                            <div className="flex-1 relative h-12 flex items-center">
                                                <div className="w-full h-3 bg-slate-200 rounded-full relative overflow-hidden">
                                                    {/* Critical Low Zone */}
                                                    <div className="absolute top-0 bottom-0 bg-red-900/30" style={{ left: '0%', width: `${getPercent(item.criticalMin)}%` }} />
                                                    {/* Warning Low Zone */}
                                                    <div className="absolute top-0 bottom-0 bg-yellow-900/30" style={{ left: `${getPercent(item.criticalMin)}%`, width: `${getPercent(item.optimalMin) - getPercent(item.criticalMin)}%` }} />
                                                    {/* Optimal Zone */}
                                                    <div className="absolute top-0 bottom-0 bg-emerald-900/40 border-x border-emerald-500/20" style={{ left: `${getPercent(item.optimalMin)}%`, width: `${getPercent(item.optimalMax) - getPercent(item.optimalMin)}%` }} />
                                                    {/* Warning High Zone */}
                                                    <div className="absolute top-0 bottom-0 bg-yellow-900/30" style={{ left: `${getPercent(item.optimalMax)}%`, width: `${getPercent(item.criticalMax) - getPercent(item.optimalMax)}%` }} />
                                                    {/* Critical High Zone */}
                                                    <div className="absolute top-0 bottom-0 bg-red-900/30" style={{ left: `${getPercent(item.criticalMax)}%`, width: `${100 - getPercent(item.criticalMax)}%` }} />

                                                    {/* Markers */}
                                                    {/* Target Marker */}
                                                    {item.target && (
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                                                            style={{ left: `${getPercent(item.target)}%` }}
                                                        >
                                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-500 uppercase tracking-wider">Target</div>
                                                        </div>
                                                    )}

                                                    {/* Current Value Marker */}
                                                    <div
                                                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#020202] ${status.bg} shadow-[0_0_10px_currentColor] z-20 transition-all duration-500`}
                                                        style={{ left: `calc(${getPercent(item.value)}% - 8px)` }}
                                                    />
                                                </div>

                                                {/* Labels underneath */}
                                                <div className="absolute -bottom-1 w-full flex justify-between text-[9px] text-slate-400 font-mono uppercase">
                                                    <span style={{ left: `${getPercent(item.criticalMin)}%`, position: 'absolute', transform: 'translateX(-50%)' }}>Crit {item.criticalMin}</span>
                                                    <span style={{ left: `${getPercent(item.optimalMin)}%`, position: 'absolute', transform: 'translateX(-50%)' }} className="text-emerald-700">Min {item.optimalMin}</span>
                                                    <span style={{ left: `${getPercent(item.optimalMax)}%`, position: 'absolute', transform: 'translateX(-50%)' }} className="text-emerald-700">Max {item.optimalMax}</span>
                                                    <span style={{ left: `${getPercent(item.criticalMax)}%`, position: 'absolute', transform: 'translateX(-50%)' }}>Crit {item.criticalMax}</span>
                                                </div>
                                            </div>

                                            {/* Status Badge & Actions */}
                                            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4">
                                                <div className={`px-3 py-1 rounded-full border ${status.border} ${status.bg}/10 text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                                    {status.label}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                    {viewMode === 'admin' && (
                                                        <>
                                                            <button onClick={() => startEdit(item)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="px-6 pb-6 pt-0 border-t border-slate-200 mt-2 animate-in slide-in-from-top-2">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                                    <div className="bg-white/20 p-4 rounded-xl border border-slate-200">
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Analysis</h5>
                                                        <p className="text-sm text-slate-600 leading-relaxed">
                                                            {item.description || "No detailed analysis provided for this metric."}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/20 p-4 rounded-xl border border-slate-200">
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Target Strategy</h5>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-slate-500">Goal Value</span>
                                                            <span className="text-sm font-bold text-blue-400">{item.target || '--'} {item.unit}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-slate-500">Gap to Target</span>
                                                            <span className="text-sm font-bold text-slate-800">
                                                                {item.target ? (item.target - item.value).toFixed(1) : '--'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/20 p-4 rounded-xl border border-slate-200">
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Reference Ranges</h5>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs"><span className="text-emerald-500">Optimal</span> <span className="text-slate-600">{item.optimalMin} - {item.optimalMax}</span></div>
                                                            <div className="flex justify-between text-xs"><span className="text-amber-600">Warning</span> <span className="text-slate-600">&lt; {item.optimalMin} or &gt; {item.optimalMax}</span></div>
                                                            <div className="flex justify-between text-xs"><span className="text-red-500">Critical</span> <span className="text-slate-600">&lt; {item.criticalMin} or &gt; {item.criticalMax}</span></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* History Graph */}
                                                {item.history && item.history.length > 1 && (
                                                    <div className="mt-6 bg-white/20 p-4 rounded-xl border border-slate-200">
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-4">Historical Trend</h5>
                                                        <div className="h-32 w-full relative">
                                                            {(() => {
                                                                const data = [...item.history, { date: 'Now', value: item.value }];
                                                                const values = data.map(d => d.value);
                                                                const min = Math.min(...values, item.optimalMin) * 0.95;
                                                                const max = Math.max(...values, item.optimalMax) * 1.05;
                                                                const range = max - min;

                                                                const points = data.map((d, i) => {
                                                                    const x = (i / (data.length - 1)) * 100;
                                                                    const y = 100 - ((d.value - min) / range) * 100;
                                                                    return `${x},${y}`;
                                                                }).join(' ');

                                                                return (
                                                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                                        {/* Optimal Range Band */}
                                                                        <rect
                                                                            x="0"
                                                                            y={`${100 - ((item.optimalMax - min) / range) * 100}%`}
                                                                            width="100%"
                                                                            height={`${((item.optimalMax - item.optimalMin) / range) * 100}%`}
                                                                            fill="#10b981"
                                                                            fillOpacity="0.1"
                                                                        />

                                                                        {/* Line */}
                                                                        <polyline
                                                                            points={points}
                                                                            fill="none"
                                                                            stroke="#3b82f6"
                                                                            strokeWidth="2"
                                                                            vectorEffect="non-scaling-stroke"
                                                                        />

                                                                        {/* Points */}
                                                                        {data.map((d, i) => {
                                                                            const x = (i / (data.length - 1)) * 100;
                                                                            const y = 100 - ((d.value - min) / range) * 100;
                                                                            return (
                                                                                <g key={i} className="group/point">
                                                                                    <circle cx={`${x}%`} cy={`${y}%`} r="3" fill="#3b82f6" />
                                                                                    <foreignObject x={`${x}%`} y={`${y}%`} width="100" height="100" className="overflow-visible">
                                                                                        <div className="transform -translate-x-1/2 -translate-y-full pb-2 opacity-0 group-hover/point:opacity-100 transition-opacity">
                                                                                            <div className="bg-white shadow-sm border border-slate-200 text-[10px] p-1 rounded border border-slate-300 whitespace-nowrap">
                                                                                                <div className="font-bold text-slate-800">{d.value} {item.unit}</div>
                                                                                                <div className="text-slate-500">{d.date}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </foreignObject>
                                                                                </g>
                                                                            );
                                                                        })}
                                                                    </svg>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-4 text-[10px] text-slate-400 font-mono text-right">
                                                    Last Updated: {item.lastUpdated}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider">{editingId ? 'Edit Metric' : 'New Metric'}</h3>
                            <button onClick={resetForm} className="text-slate-500 hover:text-blue-600 transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest border-b border-blue-500/20 pb-2">Basic Information</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Metric Name</label>
                                        <input
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Vitamin D"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Category</label>
                                        <select
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors appearance-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Current Value</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors font-mono"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Unit</label>
                                        <input
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors font-mono"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="e.g. ng/mL"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ranges */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-500/20 pb-2">Reference Ranges</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-red-500 uppercase block mb-2">Critical Min</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-red-500 transition-colors font-mono"
                                            value={formData.criticalMin}
                                            onChange={e => setFormData({ ...formData, criticalMin: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-emerald-500 uppercase block mb-2">Optimal Min</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-emerald-500 transition-colors font-mono"
                                            value={formData.optimalMin}
                                            onChange={e => setFormData({ ...formData, optimalMin: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-emerald-500 uppercase block mb-2">Optimal Max</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-emerald-500 transition-colors font-mono"
                                            value={formData.optimalMax}
                                            onChange={e => setFormData({ ...formData, optimalMax: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-red-500 uppercase block mb-2">Critical Max</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-red-500 transition-colors font-mono"
                                            value={formData.criticalMax}
                                            onChange={e => setFormData({ ...formData, criticalMax: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest border-b border-purple-500/20 pb-2">Strategy & Notes</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Target Goal (Optional)</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-purple-500 transition-colors font-mono"
                                            value={formData.target}
                                            onChange={e => setFormData({ ...formData, target: e.target.value })}
                                            placeholder="Specific target value..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Description / Notes</label>
                                        <textarea
                                            className="w-full bg-white shadow-sm border border-slate-200 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-purple-500 transition-colors min-h-[100px]"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Add context, doctor's notes, or analysis..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-sm rounded-xl hover:bg-neutral-200 transition-all shadow-lg shadow-white/10">
                                Save Telemetry Data
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BiometricScanner;
