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

    // Calculate total liquid assets (similar to FinanceModule logic)
    const totalLiquidAssets = useMemo(() => {
        return accounts.reduce((sum, acc) => sum + (Number(acc.balance) || Number(acc.initialBalance) || 0), 0) + (Number(balance) || 0);
    }, [accounts, balance]);

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
            if (sortBy === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
            if (sortBy === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
            if (sortBy === 'priority') {
                const pVals = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return (pVals[b.priority] || 0) - (pVals[a.priority] || 0);
            }
            return 0;
        });

        return items;
    }, [wishlists, statusFilter, categoryFilter, priorityFilter, searchTerm, sortBy]);

    const totalEstimatedCost = useMemo(() => {
        return filteredItems.filter(i => i.status !== 'Purchased').reduce((sum, item) => sum + (Number(item.price) || 0), 0);
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
            price: Number(formData.price) || 0,
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

    const formatMoney = (amount) => {
        return `֏ ${(Number(amount) || 0).toLocaleString()}`;
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

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Target className="w-3.5 h-3.5 text-rose-500" /> Target Cost
                        </div>
                        <div className="text-2xl font-black text-slate-800">
                            {formatMoney(totalEstimatedCost)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Pending items in view</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Liquid Assets
                        </div>
                        <div className="text-2xl font-black text-slate-800">
                            {formatMoney(totalLiquidAssets)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cash + Accounts</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Activity className="w-3.5 h-3.5 text-blue-500" /> Affordability
                        </div>
                        <div className="text-2xl font-black text-slate-800">
                            {totalEstimatedCost === 0 ? '0%' : `${Math.min(100, Math.floor((totalLiquidAssets / totalEstimatedCost) * 100))}%`}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${totalLiquidAssets >= totalEstimatedCost ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (totalLiquidAssets / (totalEstimatedCost || 1)) * 100)}%` }}
                            />
                        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
                                    item.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                                    item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {item.priority}
                                </span>
                                {viewMode === 'admin' && (
                                    <button onClick={() => openForm(item)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            
                            <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 min-h-[40px]">
                                {item.link ? (
                                    <a href={item.link} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">{item.name}</a>
                                ) : item.name}
                            </h3>
                            
                            <div className="text-xl font-black text-slate-800 mb-4">
                                {formatMoney(item.price)}
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded">
                                    {item.category || 'Uncategorized'}
                                </span>
                                {item.tags && item.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded">
                                        <Tag className="w-2.5 h-2.5" />
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                    item.status === 'Purchased' ? 'text-emerald-500' :
                                    item.status === 'Planning' ? 'text-blue-500' : 'text-slate-400'
                                }`}>
                                    {item.status === 'Purchased' && <Check className="w-3.5 h-3.5" />}
                                    {item.status}
                                </div>
                                {viewMode === 'admin' && item.status !== 'Purchased' && (
                                    <button 
                                        onClick={() => handleStatusToggle(item, 'Purchased')}
                                        className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                    >
                                        Mark Bought
                                    </button>
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
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Price (AMD)</label>
                                    <input 
                                        type="number" required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                                        placeholder="0"
                                    />
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
