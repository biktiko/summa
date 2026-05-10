import React, { useState, useMemo } from 'react';
import { Plus, Search, Pin, Globe, Lock, Trash2, Edit2, X, Save, FileText, Tag, MoreVertical } from 'lucide-react';

const TAG_COLORS = [
    { name: 'Red', value: 'bg-red-500 text-white' },
    { name: 'Blue', value: 'bg-blue-500 text-white' },
    { name: 'Green', value: 'bg-green-500 text-white' },
    { name: 'Yellow', value: 'bg-amber-600 text-black' },
    { name: 'Purple', value: 'bg-purple-500 text-white' },
    { name: 'Pink', value: 'bg-pink-500 text-white' },
    { name: 'Orange', value: 'bg-orange-500 text-white' },
    { name: 'Gray', value: 'bg-neutral-500 text-white' },
];

const NoteCard = ({ note, viewMode, startEdit, deleteNote, togglePin, togglePublic }) => {
    return (
        <div className={`group relative bg-white shadow-sm border border-slate-200/40 border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col h-full ${note.isPinned ? 'border-slate-200 bg-yellow-900/5' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-700 leading-tight pr-8">{note.title}</h3>
                {viewMode === 'admin' && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => togglePin(note)}
                            className={`p-1.5 rounded hover:bg-slate-200 ${note.isPinned ? 'text-amber-600' : 'text-slate-500 hover:text-blue-600'}`}
                            title={note.isPinned ? "Unpin" : "Pin"}
                        >
                            <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => startEdit(note)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 mb-4">
                <p className="text-sm text-slate-500 whitespace-pre-wrap line-clamp-[8] font-mono leading-relaxed">
                    {note.content}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200">
                <div className="flex flex-wrap gap-1">
                    {note.tags && note.tags.map((tag, idx) => (
                        <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${tag.color}`}>
                            {tag.text}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {viewMode === 'admin' && (
                        <button
                            onClick={() => togglePublic(note)}
                            className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${note.isPublic ? 'text-green-500 bg-green-50' : 'text-slate-400 bg-white shadow-sm border border-slate-200'}`}
                            title={note.isPublic ? "Public Note" : "Private Note"}
                        >
                            {note.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {note.isPublic ? 'Public' : 'Private'}
                        </button>
                    )}
                    <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

const NotesBoard = ({ notes, actions, viewMode }) => {
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '', content: '', tags: [], isPinned: false, isPublic: false,
        newTagText: '', newTagColor: TAG_COLORS[0].value
    });

    const filteredNotes = useMemo(() => {
        let result = notes || [];

        // Filter by search
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(lowerSearch) ||
                n.content.toLowerCase().includes(lowerSearch) ||
                (n.tags && n.tags.some(t => t.text.toLowerCase().includes(lowerSearch)))
            );
        }

        // Sort: Pinned first, then by date (newest first)
        return result.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [notes, search]);

    const handleAdd = async () => {
        if (!formData.title && !formData.content) return;

        const newNote = {
            title: formData.title,
            content: formData.content,
            tags: formData.tags,
            isPinned: formData.isPinned,
            isPublic: formData.isPublic,

            createdAt: new Date().toISOString()
        };

        if (editingId) {
            await actions.update(editingId, newNote);
            setEditingId(null);
        } else {
            await actions.add(newNote);
        }

        resetForm();
        setIsAdding(false);
    };

    const resetForm = () => {
        setFormData({
            title: '', content: '', tags: [], isPinned: false, isPublic: false,
            newTagText: '', newTagColor: TAG_COLORS[0].value
        });
    };

    const startEdit = (note) => {
        setFormData({
            ...note,
            newTagText: '',
            newTagColor: TAG_COLORS[0].value
        });
        setEditingId(note.id);
        setIsAdding(true);
    };

    const deleteNote = async (id) => {
        if (window.confirm('Delete this note?')) {
            await actions.delete(id);
        }
    };

    const togglePin = async (note) => {
        await actions.update(note.id, { isPinned: !note.isPinned });
    };

    const togglePublic = async (note) => {
        await actions.update(note.id, { isPublic: !note.isPublic });
    };

    const addTag = () => {
        if (formData.newTagText) {
            const newTag = {
                text: formData.newTagText,
                color: formData.newTagColor
            };
            setFormData({
                ...formData,
                tags: [...(formData.tags || []), newTag],
                newTagText: ''
            });
        }
    };

    const removeTag = (index) => {
        const newTags = [...(formData.tags || [])];
        newTags.splice(index, 1);
        setFormData({ ...formData, tags: newTags });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-500" />
                        Notes & Ideas
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        Personal Knowledge Base
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            className="w-full bg-white shadow-sm border border-slate-200/50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-slate-300 outline-none transition-colors"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {viewMode === 'admin' && (
                        <button
                            onClick={() => { resetForm(); setIsAdding(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-white/10"
                        >
                            <Plus className="w-4 h-4" /> New Note
                        </button>
                    )}
                </div>
            </div>

            {/* Edit/Add Modal Overlay */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm border border-slate-200/30">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                {editingId ? 'Edit Note' : 'New Note'}
                            </h3>
                            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-500 hover:text-blue-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            <input
                                className="w-full bg-transparent text-xl font-bold text-slate-800 placeholder-neutral-600 outline-none border-none"
                                placeholder="Note Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                            />

                            <textarea
                                className="w-full bg-transparent text-sm text-slate-600 placeholder-neutral-600 outline-none border-none min-h-[300px] font-mono leading-relaxed resize-none"
                                placeholder="Start typing..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />

                            {/* Tags & Settings */}
                            <div className="pt-4 border-t border-slate-200 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {(formData.tags || []).map((tag, idx) => (
                                        <span key={idx} className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${tag.color}`}>
                                            {tag.text}
                                            <button onClick={() => removeTag(idx)} className="hover:text-blue-600/50"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                    <div className="flex items-center gap-2 bg-white shadow-sm border border-slate-200 rounded-lg p-1 border border-slate-200">
                                        <Tag className="w-3 h-3 text-slate-500 ml-2" />
                                        <input
                                            className="bg-transparent text-xs text-slate-800 outline-none w-24"
                                            placeholder="Add tag..."
                                            value={formData.newTagText}
                                            onChange={e => setFormData({ ...formData, newTagText: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && addTag()}
                                        />
                                        <select
                                            className="bg-transparent text-xs text-slate-500 outline-none w-20"
                                            value={formData.newTagColor}
                                            onChange={e => setFormData({ ...formData, newTagColor: e.target.value })}
                                        >
                                            {TAG_COLORS.map(c => (
                                                <option key={c.name} value={c.value}>{c.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={addTag} className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="w-px h-6 bg-slate-100 border border-slate-200 mx-2" />

                                    <button
                                        onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${formData.isPinned ? 'bg-amber-600/20 text-amber-600' : 'bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600'}`}
                                    >
                                        <Pin className="w-3.5 h-3.5" /> Pin Note
                                    </button>

                                    <button
                                        onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${formData.isPublic ? 'bg-green-500/20 text-green-500' : 'bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600'}`}
                                    >
                                        {formData.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                        {formData.isPublic ? 'Public' : 'Private'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-white shadow-sm border border-slate-200/30 flex justify-end gap-2">
                            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleAdd} className="px-6 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-white/10">
                                {editingId ? 'Save Changes' : 'Create Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                {filteredNotes.map(note => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        viewMode={viewMode}
                        startEdit={startEdit}
                        deleteNote={deleteNote}
                        togglePin={togglePin}
                        togglePublic={togglePublic}
                    />
                ))}

                {filteredNotes.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-slate-200 rounded-2xl">
                        <FileText className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-mono text-sm">No notes found.</p>
                        {viewMode === 'admin' && (
                            <button onClick={() => setIsAdding(true)} className="mt-4 text-xs text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider">
                                Create your first note
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesBoard;
