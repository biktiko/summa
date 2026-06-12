import React, { useState, useMemo } from 'react';
import { 
    ShoppingBag, Plus, Filter, Search, Edit2, Trash2, Tag, ChevronDown, Check,
    Heart, DollarSign, Wallet, Target, Activity, MoreVertical
} from 'lucide-react';

const WishlistModule = ({ 
    userData, 
    viewMode, 
    wishlistActions,
    updateUser
}) => {
    const { wishlists = [], balance = 0, accounts = [] } = userData || {};

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('Wanted');
    
    // Sort logic
    const [sortBy, setSortBy] = useState('priority'); // 'price_desc', 'price_asc', 'priority'

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        tags: '',
        price: '',
        maxPrice: '',
        priority: 'Medium',
        status: 'Wanted',
        link: ''
    });

    const categories = useMemo(() => {
        return [...new Set(wishlists.map(w => w.category).filter(Boolean))].sort();
    }, [wishlists]);

    const filteredItems = useMemo(() => {
        let items = wishlists.filter(w => {
            if (statusFilter !== 'All' && w.status !== statusFilter) return false;
            if (categoryFilter !== 'All' && w.category !== categoryFilter) return false;
            if (priorityFilter !== 'All' && w.priority !== priorityFilter) return false;
            if (searchTerm && !w.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });

        // Sort
        items.sort((a, b) => {
            const priceA = Number(a.price) || Number(a.maxPrice) || 0;
            const priceB = Number(b.price) || Number(b.maxPrice) || 0;
            if (sortBy === 'price_desc') return priceB - priceA;
            if (sortBy === 'price_asc') {
                if (priceA === 0) return 1; // Put unpriced items at the end
                if (priceB === 0) return -1;
                return priceA - priceB;
            }
            if (sortBy === 'priority') {
                const pVals = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return (pVals[b.priority] || 0) - (pVals[a.priority] || 0);
            }
            return 0;
        });

        return items;
    }, [wishlists, statusFilter, categoryFilter, priorityFilter, searchTerm, sortBy]);

    const targetCostRange = useMemo(() => {
        let minSum = 0;
        let maxSum = 0;
        let hasAnyRange = false;
        
        filteredItems.forEach(item => {
            if (item.status === 'Purchased') return;
            
            const minVal = Number(item.price) || 0;
            const maxVal = Number(item.maxPrice) || minVal;
            
            minSum += minVal;
            maxSum += maxVal;
            
            if (item.maxPrice && Number(item.maxPrice) > minVal) {
                hasAnyRange = true;
            }
        });
        
        return { minSum, maxSum, hasAnyRange };
    }, [filteredItems]);

    const totalPurchasedCost = useMemo(() => {
        return wishlists.filter(i => i.status === 'Purchased').reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    }, [wishlists]);

    const openForm = (item = null) => {
        if (viewMode === 'guest') return;
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || '',
                category: item.category || '',
                tags: (item.tags || []).join(', '),
                price: item.price || '',
                maxPrice: item.maxPrice || '',
                priority: item.priority || 'Medium',
                status: item.status || 'Wanted',
                link: item.link || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                category: categories[0] || 'Uncategorized',
                tags: '',
                price: '',
                maxPrice: '',
                priority: 'Medium',
                status: 'Wanted',
                link: ''
            });
        }
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (viewMode === 'guest') return;

        const processedData = {
            ...formData,
            price: formData.price === '' ? null : Number(formData.price),
            maxPrice: formData.maxPrice === '' ? null : Number(formData.maxPrice),
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        if (editingItem) {
            await wishlistActions.update(editingItem.id, processedData);
        } else {
            await wishlistActions.add(processedData);
        }
        closeForm();
    };

    const handleDelete = async (id) => {
        if (viewMode === 'guest') return;
        if (window.confirm('Are you sure you want to delete this item?')) {
            await wishlistActions.delete(id);
            closeForm();
        }
    };

    const handleStatusToggle = async (item, newStatus) => {
        if (viewMode === 'guest') return;
        await wishlistActions.update(item.id, { status: newStatus });
    };

    const formatMoney = (minPrice, maxPrice) => {
        const hasMin = minPrice !== null && minPrice !== undefined && minPrice !== '';
        const hasMax = maxPrice !== null && maxPrice !== undefined && maxPrice !== '';
        
        if (!hasMin && !hasMax) return 'Price TBA';
        
        const minVal = Number(minPrice) || 0;
        const maxVal = Number(maxPrice) || 0;
        
        if (hasMin && hasMax && maxVal > minVal) {
            return `֏ ${minVal.toLocaleString()} - ${maxVal.toLocaleString()}`;
        }
        
        if (hasMin) {
            return `֏ ${minVal.toLocaleString()}`;
        }
        
        return `֏ ${maxVal.toLocaleString()}`;
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in max-w-7xl mx-auto">
            
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-1">
                            <ShoppingBag className="w-5 h-5 text-blue-500" />
                            Wishlist
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-6">Product Management</p>
                    </div>
                    {viewMode === 'admin' && (
                        <button 
                            onClick={() => openForm()}
                            className="w-full bg-blue-600 text-white font-bold uppercase tracking-wider text-xs py-3 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    )}
                </div>

                <div className="md:col-span-3 grid grid-cols-1 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Target className="w-3.5 h-3.5 text-rose-500" /> Target Cost
                        </div>
                        <div className="text-2xl font-black text-slate-800">
                            {targetCostRange.hasAnyRange 
                                ? `֏ ${targetCostRange.minSum.toLocaleString()} - ${targetCostRange.maxSum.toLocaleString()}`
                                : `֏ ${targetCostRange.minSum.toLocaleString()}`
                            }
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total estimated cost of priced items</div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center z-20">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search items..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:border-blue-500"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Wanted">Wanted</option>
                    <option value="Planning">Planning</option>
                    <option value="Purchased">Purchased</option>
                </select>

                <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:border-blue-500"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:border-blue-500"
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:border-blue-500"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                >
                    <option value="priority">Sort by Priority</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="price_asc">Price: Low to High</option>
                </select>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="flex-1 bg-white border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    <ShoppingBag className="w-16 h-16 mb-4 text-slate-200" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-slate-600 mb-2">No Items Found</h3>
                    <p className="text-xs font-bold max-w-sm">Try adjusting your filters or add a new item to your wishlist.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between min-h-[140px]">
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 flex-1 min-h-[32px]">
                                        {item.link ? (
                                            <a href={item.link} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">{item.name}</a>
                                        ) : item.name}
                                    </h3>
                                    {viewMode === 'admin' && (
                                        <button onClick={() => openForm(item)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shrink-0">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-between items-baseline mb-2">
                                    <div className={`text-sm font-black text-slate-800 ${(!item.price && !item.maxPrice) ? 'italic text-slate-400 font-bold text-xs' : ''}`}>
                                        {formatMoney(item.price, item.maxPrice)}
                                    </div>
                                    <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${
                                        item.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                                        item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {item.priority}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-2">
                                    <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-150 text-slate-500 text-[8px] font-bold uppercase tracking-wider rounded">
                                        {item.category || 'Uncategorized'}
                                    </span>
                                    {item.tags && item.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50/50 text-blue-600 text-[8px] font-bold uppercase tracking-wider rounded">
                                            <Tag className="w-2 h-2" />
                                            {tag}
                                        </span>
                                    ))}
                                    {item.tags && item.tags.length > 2 && (
                                        <span className="px-1 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-bold rounded">
                                            +{item.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-1">
                                <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                    item.status === 'Purchased' ? 'text-emerald-500' :
                                    item.status === 'Planning' ? 'text-blue-500' : 'text-slate-400'
                                }`}>
                                    {item.status === 'Purchased' && <Check className="w-3 h-3" />}
                                    {item.status}
                                </div>
                                {viewMode === 'admin' && (
                                    item.status === 'Purchased' ? (
                                        <button 
                                            type="button"
                                            onClick={() => handleStatusToggle(item, 'Wanted')}
                                            className="text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors"
                                        >
                                            Undo
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={() => handleStatusToggle(item, 'Purchased')}
                                            className="text-[9px] font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-emerald-500 px-2 py-1 rounded transition-colors shadow-sm"
                                        >
                                            Mark Bought
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-blue-500" />
                                {editingItem ? 'Edit Item' : 'New Wishlist Item'}
                            </h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Item Name</label>
                                <input 
                                    type="text" required autoFocus
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. MacBook Pro M3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Min Price (AMD)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                                        placeholder="0 or empty"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Max Price (AMD)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={formData.maxPrice} onChange={e => setFormData({...formData, maxPrice: e.target.value})}
                                        placeholder="Optional range"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Category</label>
                                <input 
                                    type="text" required list="categories"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                    placeholder="Electronics"
                                />
                                <datalist id="categories">
                                    {categories.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Priority</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                        value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Status</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="Wanted">Wanted</option>
                                        <option value="Planning">Planning</option>
                                        <option value="Purchased">Purchased</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Tags (comma separated)</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                                    placeholder="gadgets, work, travel"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Link (Optional)</label>
                                <input 
                                    type="url"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
                                    placeholder="https://"
                                />
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                {editingItem ? (
                                    <button 
                                        type="button" 
                                        onClick={() => handleDelete(editingItem.id)}
                                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                ) : <div />}
                                <div className="flex gap-2">
                                    <button 
                                        type="button" onClick={closeForm}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
                                    >
                                        {editingItem ? 'Save Changes' : 'Add Item'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishlistModule;
