import React, { useState } from 'react';
import { Plus, Trash2, Save, Edit2, X, GraduationCap, Briefcase, Globe, Trophy, Eye, EyeOff, ExternalLink, ChevronDown } from 'lucide-react';
// --- Generic Editable List Component ---
const EditableList = ({ title, icon: Icon, items, actions, viewMode, fields, variant, isSectionHidden, toggleSectionVisibility, renderItem }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState(fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), { link: '', linkName: '', isHidden: false }));
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // If guest and section is hidden, return null
    if (viewMode === 'guest' && isSectionHidden) return null;

    const isGold = variant === 'gold';
    const containerClass = isGold
        ? `space-y-6 p-6 rounded-3xl bg-gradient-to-br from-yellow-900/10 to-transparent border border-slate-200 shadow-[0_0_30px_rgba(234,179,8,0.05)] ${isSectionHidden ? 'border-red-900/30' : ''}`
        : `space-y-6`;
    const titleClass = isGold
        ? "text-sm font-black uppercase tracking-widest text-amber-600 drop-shadow-sm"
        : "text-sm font-black uppercase tracking-widest text-slate-600";
    const iconClass = isGold ? "w-5 h-5 text-amber-600" : "w-5 h-5 text-blue-500";
    const itemClass = (isHidden) => isGold
        ? `group relative p-5 bg-white shadow-sm border rounded-2xl transition-all shadow-lg flex flex-col h-full ${isHidden ? 'border-red-900/30' : 'border-amber-600/10 hover:border-amber-600/30'}`
        : `group relative p-5 bg-white shadow-sm border border-slate-200/30 border rounded-2xl transition-all flex flex-col h-full ${isHidden ? 'border-red-900/30' : 'border-slate-200 hover:border-slate-300'}`;

    const handleAdd = async () => {
        if (!newItem[fields[0].key]) return; // First field is required
        await actions.add(newItem);
        setIsAdding(false);
        setNewItem(fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), { link: '', linkName: '', isHidden: false }));
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditData(item);
    };

    const saveEdit = async () => {
        await actions.update(editingId, editData);
        setEditingId(null);
    };

    return (
        <div className={containerClass}>
            <div className={`flex items-center justify-between ${!isGold && 'border-b border-slate-200 pb-4'}`}>
                <div className="flex items-center gap-3">
                    {Icon && <Icon className={iconClass} />}
                    <h3 className={titleClass}>{title}</h3>
                    {viewMode === 'admin' && isSectionHidden && (
                        <span className="text-[9px] font-bold text-red-500 uppercase border border-red-900/50 px-2 py-0.5 rounded bg-red-900/20">Hidden Section</span>
                    )}
                </div>
                {viewMode === 'admin' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSectionVisibility}
                            className={`p-2 rounded-lg transition-all ${isSectionHidden ? 'text-red-500 bg-red-900/20 hover:bg-red-900/40' : 'text-slate-400 hover:text-blue-600'}`}
                            title={isSectionHidden ? "Show Section" : "Hide Section"}
                        >
                            {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className={`p-2 rounded-lg transition-all ${isGold ? 'bg-amber-600/10 text-amber-600 hover:bg-amber-600 hover:text-black' : 'bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-blue-600'}`}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="p-4 bg-white shadow-sm border border-slate-200/50 border border-blue-500/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    {fields.map(field => (
                        <div key={field.key} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{field.label}</label>
                                {field.key === 'endDate' && (
                                    <label className="flex items-center gap-1.5 cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                                            checked={!newItem[field.key]}
                                            onChange={(e) => setNewItem({ ...newItem, [field.key]: e.target.checked ? '' : new Date().toISOString().slice(0, 7) })}
                                        />
                                        <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-500 uppercase transition-colors">Present</span>
                                    </label>
                                )}
                            </div>
                            {field.type === 'textarea' ? (
                                <textarea
                                    className="w-full bg-white shadow-sm border border-slate-300 rounded-lg p-2 text-xs text-slate-500 focus:border-blue-500/50 outline-none min-h-[60px]"
                                    value={newItem[field.key]}
                                    onChange={e => setNewItem({ ...newItem, [field.key]: e.target.value })}
                                />
                            ) : field.type === 'select' ? (
                                <div className="relative">
                                     <select
                                        className="w-full bg-white shadow-sm border border-slate-300 rounded-lg p-2 text-sm text-slate-800 focus:border-blue-500/50 outline-none appearance-none"
                                        value={newItem[field.key]}
                                        onChange={e => setNewItem({ ...newItem, [field.key]: e.target.value })}
                                    >
                                        <option value="" disabled>Select {field.label}</option>
                                        {field.options && field.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    disabled={field.key === 'endDate' && !newItem[field.key]}
                                    className={`w-full bg-white shadow-sm border border-slate-300 rounded-lg p-2 text-sm text-slate-800 focus:border-blue-500/50 outline-none transition-opacity ${field.key === 'endDate' && !newItem[field.key] ? 'opacity-30' : ''}`}
                                    value={newItem[field.key]}
                                    onChange={e => setNewItem({ ...newItem, [field.key]: e.target.value })}
                                />
                            )}
                        </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Link URL</label>
                            <input
                                placeholder="Optional"
                                className="w-full bg-white shadow-sm border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:border-blue-500/50 outline-none"
                                value={newItem.link}
                                onChange={e => setNewItem({ ...newItem, link: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Link Name</label>
                            <input
                                placeholder="e.g. Certificate"
                                className="w-full bg-white shadow-sm border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:border-blue-500/50 outline-none"
                                value={newItem.linkName}
                                onChange={e => setNewItem({ ...newItem, linkName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-slate-500 hover:text-blue-600">Cancel</button>
                        <button onClick={handleAdd} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 uppercase tracking-wider">Add Item</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`}>
                {items.map(item => (
                    <div key={item.id} className={itemClass(item.isHidden)}>
                        {editingId === item.id ? (
                            <div className="space-y-4 z-10 relative flex-1">
                                {fields.map(field => (
                                    <div key={field.key} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{field.label}</label>
                                            {field.key === 'endDate' && (
                                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                                    <input 
                                                        type="checkbox"
                                                        className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                                                        checked={!editData[field.key]}
                                                        onChange={(e) => setEditData({ ...editData, [field.key]: e.target.checked ? '' : new Date().toISOString().slice(0, 7) })}
                                                    />
                                                    <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-500 uppercase transition-colors">Present</span>
                                                </label>
                                            )}
                                        </div>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                className="w-full bg-white shadow-sm border border-blue-500/30 rounded p-2 text-xs text-slate-600 min-h-[60px] outline-none focus:border-blue-500"
                                                value={editData[field.key]}
                                                onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                                            />
                                        ) : field.type === 'select' ? (
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-white shadow-sm border border-blue-500/30 rounded p-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 appearance-none"
                                                    value={editData[field.key]}
                                                    onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                                                >
                                                     {field.options && field.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type || 'text'}
                                                disabled={field.key === 'endDate' && !editData[field.key]}
                                                className={`w-full bg-white shadow-sm border border-blue-500/30 rounded p-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition-opacity ${field.key === 'endDate' && !editData[field.key] ? 'opacity-30' : ''}`}
                                                value={editData[field.key]}
                                                onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Link URL</label>
                                        <input
                                            className="w-full bg-white shadow-sm border border-blue-500/30 rounded p-2 text-xs text-blue-400 outline-none focus:border-blue-500"
                                            value={editData.link || ''}
                                            onChange={e => setEditData({ ...editData, link: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Link Name</label>
                                        <input
                                            className="w-full bg-white shadow-sm border border-blue-500/30 rounded p-2 text-xs text-blue-400 outline-none focus:border-blue-500"
                                            value={editData.linkName || ''}
                                            onChange={e => setEditData({ ...editData, linkName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        onClick={() => setEditData({ ...editData, isHidden: !editData.isHidden })}
                                        className={`p-1 rounded ${editData.isHidden ? 'text-red-500 bg-red-900/20' : 'text-slate-500 hover:text-blue-600'}`}
                                        title="Toggle Visibility"
                                    >
                                        {editData.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingId(null)} className="p-1 text-slate-500 hover:text-blue-600"><X className="w-4 h-4" /></button>
                                        <button onClick={saveEdit} className="p-1 text-blue-500 hover:text-blue-400"><Save className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {renderItem ? renderItem(item, isGold) : (
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-base mb-1 ${isGold ? 'text-yellow-100' : 'text-slate-700'}`}>{item[fields[0].key]}</h4>
                                        {fields.slice(1).map(field => (
                                            <p key={field.key} className={`text-xs mb-2 ${field.type === 'textarea' ? 'text-slate-500 line-clamp-3' : 'text-slate-500 font-mono'}`}>
                                                {item[field.key]}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Link Display */}
                                {item.link && item.link !== '#' && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${isGold ? 'text-amber-600 hover:text-amber-600' : 'text-blue-500 hover:text-blue-400'}`}>
                                            <Globe className="w-3 h-3" />
                                            {item.linkName || 'Open Link'}
                                        </a>
                                    </div>
                                )}

                                {viewMode === 'admin' && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 flex gap-1 bg-white/80 rounded p-1">
                                        <button onClick={() => startEdit(item)} className="text-slate-500 hover:text-blue-500 p-1"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => actions.delete(item.id)} className="text-slate-500 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
};

const calculateDuration = (start, end) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + (endDate.getDate() >= startDate.getDate() ? 0 : -1);
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    if (diffMonths < 0) return '';
    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(' ') : '1 mo';
};

const DateRangeRenderer = ({ item, isGold, titleField, subtitleField, descField }) => (
    <div className="flex-1">
        <h4 className={`font-bold text-base mb-1 ${isGold ? 'text-yellow-100' : 'text-slate-700'}`}>{item[titleField]}</h4>
        {subtitleField && <p className="text-xs text-slate-500 font-bold mb-2">{item[subtitleField]}</p>}
        
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-blue-400 mb-3 bg-blue-500/5 py-1 px-2 rounded w-fit">
             <span>{formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : 'Present'}</span>
             <span className="w-1 h-1 rounded-full bg-neutral-600" />
             <span className="text-slate-500">{calculateDuration(item.startDate, item.endDate)}</span>
        </div>

        {descField && (
            <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {item[descField]}
            </p>
        )}
    </div>
);

export const EducationSection = (props) => (
    <EditableList
        title="Education"
        icon={GraduationCap}
        fields={[
            { key: 'degree', label: 'Degree / Certificate' },
            { key: 'institution', label: 'Institution' },
            { key: 'startDate', label: 'Start Date', type: 'month' },
            { key: 'endDate', label: 'End Date', type: 'month' },
            { key: 'description', label: 'Description', type: 'textarea' }
        ]}
        renderItem={(item) => <DateRangeRenderer item={item} titleField="degree" subtitleField="institution" descField="description" />}
        {...props}
    />
);

export const ExperienceSection = (props) => (
    <EditableList
        title="Experience Data"
        icon={Briefcase}
        fields={[
            { key: 'role', label: 'Role / Position' },
            { key: 'company', label: 'Company' },
            { key: 'startDate', label: 'Start Date', type: 'month' },
            { key: 'endDate', label: 'End Date', type: 'month' },
            { key: 'description', label: 'Responsibilities', type: 'textarea' }
        ]}
        renderItem={(item) => <DateRangeRenderer item={item} titleField="role" subtitleField="company" descField="description" />}
        {...props}
    />
);

export const LanguagesSection = (props) => (
    <EditableList
        title="Language Modules"
        icon={Globe}
        fields={[
            { 
                key: 'name', 
                label: 'Language', 
                type: 'select', 
                options: ['Armenian', 'Russian', 'English', 'German', 'French', 'Spanish', 'Italian', 'Chinese', 'Japanese'] 
            },
            { 
                key: 'level', 
                label: 'Proficiency Level', 
                type: 'select',
                options: ['Native', 'Fluent', 'Professional', 'Intermediate', 'Beginner']
            },
            { key: 'description', label: 'Notes', type: 'textarea' }
        ]}
        {...props}
    />
);

export const AchievementsSection = (props) => (
    <EditableList
        title="Trophies & Achievements"
        icon={Trophy}
        variant="gold"
        fields={[
            { key: 'title', label: 'Achievement Title' },
            { key: 'type', label: 'Type (Award, Career, etc.)' },
            { key: 'date', label: 'Date' },
            { key: 'description', label: 'Description', type: 'textarea' }
        ]}
        {...props}
    />
);
