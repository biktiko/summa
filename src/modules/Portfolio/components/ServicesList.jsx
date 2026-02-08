import React, { useState } from 'react';
import { Plus, Trash2, Save, Edit2, X, Eye, EyeOff, Globe } from 'lucide-react';

const ServicesList = ({ services, actions, viewMode, isSectionHidden, toggleSectionVisibility }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newService, setNewService] = useState({ title: '', price: '', timeframe: '', description: '', link: '', linkName: '', isHidden: false });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    if (viewMode === 'guest' && isSectionHidden) return null;

    return (
        <div className={`space-y-6 ${isSectionHidden ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">🛠️ Services</h3>
                    {viewMode === 'admin' && isSectionHidden && (
                        <span className="text-[9px] font-bold text-red-500 uppercase border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Hidden Section</span>
                    )}
                </div>
                {viewMode === 'admin' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSectionVisibility}
                            className={`p-2 rounded-lg transition-all ${isSectionHidden ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-neutral-600 hover:text-white'}`}
                            title={isSectionHidden ? "Show Section" : "Hide Section"}
                        >
                            {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="p-4 bg-neutral-900/50 border border-blue-500/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input
                        placeholder="Service Title"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                        value={newService.title}
                        onChange={e => setNewService({ ...newService, title: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <input
                            placeholder="Price (e.g. $50/hr)"
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                            value={newService.price}
                            onChange={e => setNewService({ ...newService, price: e.target.value })}
                        />
                        <input
                            placeholder="Timeframe"
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                            value={newService.timeframe}
                            onChange={e => setNewService({ ...newService, timeframe: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            placeholder="Link URL (Optional)"
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                            value={newService.link}
                            onChange={e => setNewService({ ...newService, link: e.target.value })}
                        />
                        <input
                            placeholder="Link Name (e.g. Book Now)"
                            className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500/50 outline-none"
                            value={newService.linkName}
                            onChange={e => setNewService({ ...newService, linkName: e.target.value })}
                        />
                    </div>
                    <textarea
                        placeholder="Description"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-neutral-400 focus:border-blue-500/50 outline-none min-h-[60px]"
                        value={newService.description}
                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-neutral-500 hover:text-white">Cancel</button>
                        <button onClick={handleAdd} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500">Add Service</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {services.map(service => (
                    <div key={service.id} className={`group relative p-5 bg-neutral-900/30 border rounded-2xl transition-all flex flex-col h-full ${service.isHidden ? 'border-red-900/30 opacity-60 hover:opacity-100' : 'border-white/5 hover:border-white/10'}`}>
                        {editingId === service.id ? (
                            <div className="space-y-3 z-10 relative flex-1">
                                <input
                                    className="w-full bg-black/40 border border-blue-500/30 rounded p-1 text-sm font-bold text-white"
                                    value={editData.title}
                                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 bg-black/40 border border-blue-500/30 rounded p-1 text-xs text-yellow-500"
                                        value={editData.price}
                                        onChange={e => setEditData({ ...editData, price: e.target.value })}
                                    />
                                    <input
                                        className="flex-1 bg-black/40 border border-blue-500/30 rounded p-1 text-xs text-neutral-400"
                                        value={editData.timeframe}
                                        onChange={e => setEditData({ ...editData, timeframe: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 bg-black/40 border border-blue-500/30 rounded p-1 text-xs text-blue-400"
                                        placeholder="Link URL..."
                                        value={editData.link || ''}
                                        onChange={e => setEditData({ ...editData, link: e.target.value })}
                                    />
                                    <input
                                        className="w-1/3 bg-black/40 border border-blue-500/30 rounded p-1 text-xs text-blue-400"
                                        placeholder="Link Name..."
                                        value={editData.linkName || ''}
                                        onChange={e => setEditData({ ...editData, linkName: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    className="w-full bg-black/40 border border-blue-500/30 rounded p-1 text-xs text-neutral-300 min-h-[60px]"
                                    value={editData.description}
                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                />
                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        onClick={() => setEditData({ ...editData, isHidden: !editData.isHidden })}
                                        className={`p-1 rounded ${editData.isHidden ? 'text-red-500 bg-red-900/20' : 'text-neutral-500 hover:text-white'}`}
                                        title="Toggle Visibility"
                                    >
                                        {editData.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingId(null)} className="p-1 text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
                                        <button onClick={saveEdit} className="p-1 text-blue-500 hover:text-blue-400"><Save className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-base text-neutral-200 pr-6">{service.title}</h4>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/20">{service.price}</div>
                                            <div className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">{service.timeframe}</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-500 leading-relaxed mb-4">{service.description}</p>
                                </div>

                                {service.link && service.link !== '#' && (
                                    <div className="mt-auto pt-4 border-t border-white/5">
                                        <a href={service.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider transition-colors">
                                            <Globe className="w-3 h-3" />
                                            {service.linkName || 'View Service'}
                                        </a>
                                    </div>
                                )}

                                {viewMode === 'admin' && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 flex gap-1 bg-black/80 rounded p-1">
                                        <button onClick={() => startEdit(service)} className="text-neutral-400 hover:text-blue-500 p-1"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => actions.delete(service.id)} className="text-neutral-400 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    async function handleAdd() {
        if (!newService.title) return;
        await actions.add(newService);
        setIsAdding(false);
        setNewService({ title: '', price: '', timeframe: '', description: '', link: '', linkName: '', isHidden: false });
    }

    function startEdit(service) {
        setEditingId(service.id);
        setEditData(service);
    }

    async function saveEdit() {
        await actions.update(editingId, editData);
        setEditingId(null);
    }
};

export default ServicesList;
