import React, { useState } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, Link as LinkIcon, Trash2, Save, ArrowUpRight, Eye, EyeOff } from 'lucide-react';

const SkillCard = ({ skill, updateSkillLevel, updateSkillDetails, deleteSkill, viewMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editDesc, setEditDesc] = useState(skill.description || '');
    const [newLink, setNewLink] = useState({ label: '', url: '' });

    // Sync local state with props when skill updates
    React.useEffect(() => {
        setEditDesc(skill.description || '');
    }, [skill.description]);

    const handleSaveDetails = (e) => {
        e.stopPropagation();
        updateSkillDetails(skill.id, { description: editDesc });
    };

    const handleAddLink = (e) => {
        e.stopPropagation();
        if (newLink.label && newLink.url) {
            updateSkillDetails(skill.id, {
                links: [...(skill.links || []), newLink]
            });
            setNewLink({ label: '', url: '' });
        }
    };

    const handleRemoveLink = (index, e) => {
        e.stopPropagation();
        const updatedLinks = [...(skill.links || [])];
        updatedLinks.splice(index, 1);
        updateSkillDetails(skill.id, { links: updatedLinks });
    };

    const handleDeleteSkill = (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete ${skill.name}?`)) {
            deleteSkill(skill.id);
        }
    };

    const handleLevelChange = (amount, e) => {
        e.stopPropagation();
        updateSkillLevel(skill.id, amount);
    };

    const toggleVisibility = (e) => {
        e.stopPropagation();
        updateSkillDetails(skill.id, { isHidden: !skill.isHidden });
    };

    return (
        <div className={`p-5 bg-neutral-900/40 rounded-2xl border transition-all relative overflow-hidden ${isExpanded ? 'border-blue-500/40 bg-neutral-900/80' : 'border-white/5 hover:border-blue-500/20'} ${skill.isHidden ? 'opacity-60 border-red-900/30' : ''}`}>
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300 block">{skill.name}</span>
                        <span className="text-[8px] font-bold uppercase text-neutral-600">{skill.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {viewMode === 'admin' && (
                            <>
                                <button onClick={toggleVisibility} className={`p-1 rounded ${skill.isHidden ? 'text-red-500 bg-red-900/20' : 'text-neutral-600 hover:text-white'}`} title="Toggle Visibility">
                                    {skill.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button onClick={handleDeleteSkill} className="text-neutral-600 hover:text-red-500 transition-colors p-1">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </>
                        )}
                        <div className="text-neutral-500 hover:text-blue-500 transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-[8px] font-bold uppercase mb-1 text-blue-400">
                        <span>Level Progress</span>
                        <span>{skill.level}%</span>
                    </div>
                    <div className="h-1 bg-black rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500"
                            style={{ width: `${skill.level}%` }}
                        />
                    </div>
                </div>

                {/* Always Visible Content (Description & Links) */}
                <div className="space-y-3">
                    {skill.description && (
                        <p className="text-[10px] text-neutral-400 leading-relaxed border-l-2 border-white/10 pl-3">
                            {skill.description}
                        </p>
                    )}

                    {skill.links && skill.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {skill.links.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-blue-900/10 border border-blue-500/20 px-2 py-1 rounded-md group">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase text-blue-400 hover:text-blue-300 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <ArrowUpRight className="w-3 h-3" /> {link.label}
                                    </a>
                                    {viewMode === 'admin' && (
                                        <button onClick={(e) => handleRemoveLink(idx, e)} className="text-neutral-600 hover:text-red-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-2 h-2" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expanded Controls (Admin Only) */}
                {isExpanded && viewMode === 'admin' && (
                    <div className="mt-6 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 space-y-4" onClick={(e) => e.stopPropagation()}>
                        {/* Level Controls */}
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                            <span className="text-[9px] font-bold text-neutral-500 uppercase">Adjust Proficiency</span>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => handleLevelChange(-5, e)} className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                                <button onClick={(e) => handleLevelChange(5, e)} className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                            </div>
                        </div>

                        {/* Description Edit */}
                        <div className="space-y-2">
                            <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] text-neutral-300 focus:border-blue-500/50 outline-none min-h-[60px]"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                placeholder="Update description..."
                            />
                            <button onClick={handleSaveDetails} className="w-full py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white text-[9px] font-bold uppercase rounded transition-colors flex items-center justify-center gap-1">
                                <Save className="w-3 h-3" /> Save Changes
                            </button>
                        </div>

                        {/* Add Link */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <span className="text-[9px] font-bold text-neutral-500 uppercase block">Add Resource Link</span>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 rounded p-1.5 text-[10px] text-white focus:border-blue-500/50 outline-none"
                                    placeholder="Label (e.g. GitHub)"
                                    value={newLink.label}
                                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                                />
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 rounded p-1.5 text-[10px] text-white focus:border-blue-500/50 outline-none"
                                    placeholder="URL"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                />
                                <button onClick={handleAddLink} className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white rounded transition-colors">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SkillTree = ({ skills, updateSkillLevel, addNewSkill, updateSkillDetails, deleteSkill, viewMode, isSectionHidden, toggleSectionVisibility }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('Technical');

    if (viewMode === 'guest' && isSectionHidden) return null;

    const handleAdd = () => {
        if (newSkillName) {
            addNewSkill({ name: newSkillName, category: newSkillCategory, level: 10, description: '', links: [], isHidden: false });
            setNewSkillName('');
            setIsAdding(false);
        }
    };

    // Group skills by category
    const categories = [...new Set(skills.map(s => s.category))];

    return (
        <div className={`space-y-6 ${isSectionHidden ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-300">Skill Matrix</h3>
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
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                        >
                            <Plus className="w-3 h-3" /> Initialize Protocol
                        </button>
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="p-4 bg-neutral-900/50 border border-blue-500/30 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <input
                        placeholder="Skill Name"
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                    />
                    <select
                        className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500/50 outline-none"
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value)}
                    >
                        <option value="Technical">Technical</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Soft Skills">Soft Skills</option>
                    </select>
                    <button onClick={handleAdd} className="px-4 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">ADD</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {skills.map(skill => (
                    <SkillCard
                        key={skill.id}
                        skill={skill}
                        updateSkillLevel={updateSkillLevel}
                        updateSkillDetails={updateSkillDetails}
                        deleteSkill={deleteSkill}
                        viewMode={viewMode}
                    />
                ))}
            </div>
        </div>
    );
};

export default SkillTree;
