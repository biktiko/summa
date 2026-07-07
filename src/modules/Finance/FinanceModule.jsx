import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard, DollarSign, PieChart, TrendingUp, TrendingDown,
    CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownRight, Filter,
    Download, Settings, CheckSquare, Eye, EyeOff, Trash2, X, ChevronDown,
    Calendar, Calculator, Edit3, Save as SaveIcon, Maximize2, Target, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar, ReferenceLine
} from 'recharts';
import { 
    exportTransactionsToExcel, 
    exportAnalyticsToExcel, 
    exportBudgetToExcel, 
    exportProjectsToExcel 
} from './utils/financeExport';
import HistoryTab from './tabs/HistoryTab';
import OverviewTab from './tabs/OverviewTab';
import TransactionModal from './modals/TransactionModal';
import CategoryModal from './modals/CategoryModal';
import AccountModal from './modals/AccountModal';
import DateRangePicker from './components/DateRangePicker';
import CustomTooltip from './components/CustomTooltip';
import StatCard from './components/StatCard';
import BudgetRow from './components/BudgetRow';
import CustomBalanceTooltip from './components/CustomBalanceTooltip';
import { CURRENCIES, getLocalYYYYMMDD, formatDateToDDMMYYYY } from './utils/financeHelpers';


// --- Helper Components ---











const FinanceModule = ({
    userData,
    updateUser,
    transactionsActions, categoriesActions, accountsActions,
    viewMode,
    activeView, setActiveView
}) => {


    // --- State ---
    const [dashboardTab, setDashboardTab] = useState('history'); // overview | budget | history
    const [isAddingTransaction, setIsAddingTransaction] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [analyticsSource, setAnalyticsSource] = useState('actual'); // 'actual' | 'budget'
    const [pieChartMode, setPieChartMode] = useState('expense'); // 'expense' | 'income'
    const [dateFilterType, setDateFilterType] = useState('month'); // 'month' | 'all' | 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [recurringExpensesSort, setRecurringExpensesSort] = useState('actual');

    // Currency Persistence
    const currentCurrencyCode = userData.gameplaySettings?.currency || 'AMD';
    const setCurrency = (code) => updateUser({ gameplaySettings: { ...userData.gameplaySettings, currency: code } });
    const currencySymbol = CURRENCIES[currentCurrencyCode]?.symbol || '֏';
    
    const getLocalYYYYMMDD = (dateOrStr) => {
        const d = dateOrStr ? new Date(dateOrStr) : new Date();
        if (isNaN(d.getTime())) return '';
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    const formatMoney = (amount) => {
        const val = Number(amount);
        const absVal = Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const space = currencySymbol === '֏' ? '\u00a0' : '';
        if (val < 0) {
            return `-${currencySymbol}${space}${absVal}`;
        }
        return `${currencySymbol}${space}${absVal}`;
    };

    const getMonthLabel = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const getDateRangeLabel = () => {
        if (dateFilterType === 'month') {
            return getMonthLabel(selectedDate);
        }
        if (dateFilterType === 'all') {
            return 'All Time';
        }
        if (dateFilterType === 'custom') {
            const formatD = (dStr) => {
                if (!dStr) return '?';
                const d = new Date(dStr);
                return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            };
            return `${formatD(customStartDate)} - ${formatD(customEndDate)}`;
        }
        return '';
    };
    const adjustMonth = (delta) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedDate(newDate);
    };

    // Category Management State
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editingCategoryData, setEditingCategoryData] = useState(null);

    // Account Management State
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [editingAccountData, setEditingAccountData] = useState(null);
    const [selectedAnalyticAccounts, setSelectedAnalyticAccounts] = useState(null);

    // Category dropdown search state
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [categorySearchQuery, setCategorySearchQuery] = useState('');

    // Analytics Chart Expansion
    const [expandedChart, setExpandedChart] = useState(null);

    // History Filters
    const [historyFilter, setHistoryFilter] = useState({ categoryId: 'all', type: 'all', accountId: 'all', minAmount: '', maxAmount: '' });

    // Daily Spending Chart Filters
    const [dailyChartCategoryFilter, setDailyChartCategoryFilter] = useState('all');

    // New state for Analytics improvements
    const [showDailyAvgBreakdown, setShowDailyAvgBreakdown] = useState(false);
    const [balanceGrouping, setBalanceGrouping] = useState('day'); // 'day' | 'week' | 'month'
    const [spendingGrouping, setSpendingGrouping] = useState('day'); // 'day' | 'week' | 'month'
    const [balanceChartMode, setBalanceChartMode] = useState('net_worth'); // 'net_worth' | 'net_flow'

    // Transaction Management State
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'expense',
        categoryId: '',
        accountId: '',
        toAccountId: '',
        projectId: '',
        projectStageId: '',
        description: '',
        date: getLocalYYYYMMDD()
    });

    // Projects Analytics State
    
    const exportBalanceHistoryToExcel = () => {
        const data = balanceHistoryData.map(d => ({
            'Date': formatDateToDDMMYYYY(d.fullDate),
            'Income': d.income,
            'Expense': d.expense,
            'Net Flow': d.netFlow,
            'Balance': d.balance
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Balance_History");
        XLSX.writeFile(wb, `Balance_History.xlsx`);
    };

    const [projectClientFilter, setProjectClientFilter] = useState('all');
    const [projectStatusFilter, setProjectStatusFilter] = useState('all');

    // Planning/Coming Analytics State
    const [planningMode, setPlanningMode] = useState('project'); // 'history' | 'project'
    const [projectionMethod, setProjectionMethod] = useState('average'); // 'average' | 'smart'
    
    // Default prediction target: 30 days from now
    const defaultTarget = new Date();
    defaultTarget.setDate(defaultTarget.getDate() + 30);
    const [predictionDateRange, setPredictionDateRange] = useState({ start: getLocalYYYYMMDD(), end: getLocalYYYYMMDD(defaultTarget) });
    
    // Default lookback start: 15 days ago
    const defaultLookback = new Date();
    defaultLookback.setDate(defaultLookback.getDate() - 15);
    const [lookbackDateRange, setLookbackDateRange] = useState({ start: defaultLookback.toISOString().slice(0, 10), end: getLocalYYYYMMDD() });
    
    const [selectedPredictionCategories, setSelectedPredictionCategories] = useState([]); // array of category IDs, empty means all
    const [planningAccountId, setPlanningAccountId] = useState('all');
    const [isAddingExpected, setIsAddingExpected] = useState(false);
    const [isEditingExpectedId, setIsEditingExpectedId] = useState(null);
    const [expectedForm, setExpectedForm] = useState({ date: getLocalYYYYMMDD(defaultTarget), description: '', amount: '', type: 'expense', categoryId: '' });

    // --- Data Processing (Month-Aware) ---
    const transactions = useMemo(() => userData.transactions || [], [userData.transactions]);
    const projects = useMemo(() => userData.projects || [], [userData.projects]);
    const categories = useMemo(() => userData.categories || [], [userData.categories]);
    const accounts = useMemo(() => userData.accounts || [], [userData.accounts]);
    const expectedTransactions = useMemo(() => userData.expectedTransactions || [], [userData.expectedTransactions]);

    const filterAccountsList = useMemo(() => {
        const list = [...accounts];
        const hasLegacy = transactions.some(t => !t.accountId);
        if (hasLegacy) {
            list.push({ id: 'legacy', label: 'Unallocated', color: '#64748b' });
        }
        return list;
    }, [accounts, transactions]);

    const activeAnalyticAccountIds = useMemo(() => {
        if (selectedAnalyticAccounts === null) {
            return filterAccountsList.map(a => a.id);
        }
        return selectedAnalyticAccounts;
    }, [filterAccountsList, selectedAnalyticAccounts]);
    
    const resolvedDateRange = useMemo(() => {
        let start = new Date();
        let end = new Date();
        
        if (dateFilterType === 'month') {
            start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        } else if (dateFilterType === 'all') {
            const dates = transactions.map(t => new Date(t.createdAt)).filter(d => !isNaN(d.getTime()));
            if (dates.length > 0) {
                start = new Date(Math.min(...dates));
                end = new Date(); // Calculate up to today
            } else {
                start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            }
        } else if (dateFilterType === 'custom') {
            if (customStartDate) start = new Date(customStartDate);
            else start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            
            if (customEndDate) end = new Date(customEndDate);
            else end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        }
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }, [dateFilterType, selectedDate, customStartDate, customEndDate, transactions]);

    // 1. Month Actuals (Range-aware)
    const monthTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate >= resolvedDateRange.start && tDate <= resolvedDateRange.end;
        });
    }, [transactions, resolvedDateRange]);

    const filteredMonthTransactions = useMemo(() => {
        const list = [];
        monthTransactions.forEach(t => {
            if (t.type === 'transfer') {
                const isSourceSelected = activeAnalyticAccountIds.includes(t.accountId);
                const isDestSelected = activeAnalyticAccountIds.includes(t.toAccountId);
                if (isSourceSelected && !isDestSelected) {
                    list.push({ ...t, type: 'expense', description: `${t.description || 'Transfer'} (Out)` });
                } else if (!isSourceSelected && isDestSelected) {
                    list.push({ ...t, type: 'income', description: `${t.description || 'Transfer'} (In)` });
                }
            } else {
                const accId = t.accountId || 'legacy';
                if (activeAnalyticAccountIds.includes(accId)) {
                    list.push(t);
                }
            }
        });
        return list;
    }, [monthTransactions, activeAnalyticAccountIds]);

    // Transactions filtered strictly for the selected month (used in Planning/Budget tab)
    const planningMonthTransactions = useMemo(() => {
        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        
        const list = [];
        transactions.forEach(t => {
            const tDate = new Date(t.createdAt);
            if (tDate >= start && tDate <= end) {
                if (t.type === 'transfer') {
                    const isSourceSelected = activeAnalyticAccountIds.includes(t.accountId);
                    const isDestSelected = activeAnalyticAccountIds.includes(t.toAccountId);
                    if (isSourceSelected && !isDestSelected) {
                        list.push({ ...t, type: 'expense', description: `${t.description || 'Transfer'} (Out)` });
                    } else if (!isSourceSelected && isDestSelected) {
                        list.push({ ...t, type: 'income', description: `${t.description || 'Transfer'} (In)` });
                    }
                } else {
                    const accId = t.accountId || 'legacy';
                    if (activeAnalyticAccountIds.includes(accId)) {
                        list.push(t);
                    }
                }
            }
        });
        return list;
    }, [transactions, selectedDate, activeAnalyticAccountIds]);

    const monthActualIncome = filteredMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const monthActualExpense = filteredMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    
    const activeDaysInMonth = useMemo(() => {
        const totalDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        
        if (filteredMonthTransactions.length === 0) return totalDays;
        
        const dates = filteredMonthTransactions
            .map(t => new Date(t.createdAt))
            .filter(d => !isNaN(d.getTime()));
            
        if (dates.length === 0) return totalDays;
        
        const earliestDate = new Date(Math.min(...dates));
        
        if (earliestDate.getFullYear() === selectedDate.getFullYear() && earliestDate.getMonth() === selectedDate.getMonth()) {
            const startDay = earliestDate.getDate();
            
            const today = new Date();
            let endDay = totalDays;
            if (today.getFullYear() === selectedDate.getFullYear() && today.getMonth() === selectedDate.getMonth()) {
                endDay = today.getDate();
            }
            
            const activeDays = endDay - startDay + 1;
            return activeDays > 0 ? activeDays : 1;
        }
        
        return totalDays;
    }, [filteredMonthTransactions, selectedDate]);
    // monthNetBalance removed (unused)

    // 2. Global Budget (Projected/Baseline)
    const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

    const sortedExpenseCategories = useMemo(() => {
        const list = [...expenseCategories];
        
        const getActualSpent = (catId) => {
            return planningMonthTransactions
                .filter(t => t.type === 'expense' && t.categoryId === catId)
                .reduce((sum, t) => sum + Number(t.amount), 0);
        };
        
        const getPlannedMonthly = (item) => {
            const amount = Number(item.amount) || 0;
            const period = Number(item.period) || 30;
            return (amount * 30) / period;
        };

        return list.sort((a, b) => {
            if (recurringExpensesSort === 'actual') {
                const actualA = getActualSpent(a.id);
                const actualB = getActualSpent(b.id);
                return actualB - actualA;
            } else if (recurringExpensesSort === 'planned') {
                const plannedA = getPlannedMonthly(a);
                const plannedB = getPlannedMonthly(b);
                
                if (plannedA === 0 && plannedB > 0) return 1;
                if (plannedB === 0 && plannedA > 0) return -1;
                if (plannedA === 0 && plannedB === 0) {
                    return getActualSpent(b.id) - getActualSpent(a.id);
                }
                
                return plannedB - plannedA;
            }
            return 0;
        });
    }, [expenseCategories, planningMonthTransactions, recurringExpensesSort]);

    const calculateMonthlyProjection = (items) => items.reduce((acc, item) => {
        // Filter by Active Month
        const activeMonths = item.activeMonths || Array.from({length: 12}, (_, i) => i);
        if (!activeMonths.includes(selectedDate.getMonth())) return acc;

        const amount = Number(item.amount) || 0;
        const period = Number(item.period) || 30;
        return acc + ((amount * 30) / period);
    }, 0);

    const projectedMonthlyIncome = calculateMonthlyProjection(incomeCategories);
    const projectedMonthlyExpense = calculateMonthlyProjection(expenseCategories);
    const projectedFreeCashFlow = projectedMonthlyIncome - projectedMonthlyExpense;

    const totalRemainingExpense = useMemo(() => {
        return expenseCategories.reduce((sum, cat) => {
            const activeMonths = cat.activeMonths || Array.from({length: 12}, (_, i) => i);
            if (!activeMonths.includes(selectedDate.getMonth())) return sum;

            const amount = Number(cat.amount) || 0;
            const period = Number(cat.period) || 30;
            const plannedMonthly = (amount * 30) / period;

            const actualSpent = planningMonthTransactions
                .filter(t => t.type === 'expense' && t.categoryId === cat.id)
                .reduce((acc, t) => acc + Number(t.amount), 0);

            const remaining = Math.max(0, plannedMonthly - actualSpent);
            return sum + remaining;
        }, 0);
    }, [expenseCategories, planningMonthTransactions, selectedDate]);
    // burnRateDaily removed (unused)

    // 3. Analytics Data Source Switcher
    const activeIncome = analyticsSource === 'actual' ? monthActualIncome : projectedMonthlyIncome;
    const activeExpense = analyticsSource === 'actual' ? monthActualExpense : projectedMonthlyExpense;
    const activeBalance = activeIncome - activeExpense;

    const activeDays = useMemo(() => {
        if (dateFilterType === 'month') {
            return activeDaysInMonth;
        }
        const diffTime = Math.abs(resolvedDateRange.end - resolvedDateRange.start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    }, [dateFilterType, activeDaysInMonth, resolvedDateRange]);

    const dailyAvgCategoryBreakdown = useMemo(() => {
        const activeDaysCount = activeDays;
        
        // 1. Calculate for all defined expense categories
        const breakdown = expenseCategories.map(cat => {
            const actualTotal = filteredMonthTransactions
                .filter(t => t.type === 'expense' && t.categoryId === cat.id)
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const actualDaily = actualTotal / activeDaysCount;
            const plannedDaily = (Number(cat.amount) || 0) / (Number(cat.period) || 30);
            return {
                id: cat.id,
                label: cat.label,
                color: cat.color || '#ef4444',
                actualDaily,
                plannedDaily,
                actualTotal,
                percent: plannedDaily > 0 ? (actualDaily / plannedDaily) * 100 : 0
            };
        });
        
        // 2. Also calculate for any "Other/Uncategorized" expenses
        const uncategorizedTotal = filteredMonthTransactions
            .filter(t => t.type === 'expense' && (!t.categoryId || !expenseCategories.some(c => c.id === t.categoryId)))
            .reduce((sum, t) => sum + Number(t.amount), 0);
            
        if (uncategorizedTotal > 0) {
            const actualDaily = uncategorizedTotal / activeDaysCount;
            breakdown.push({
                id: 'uncategorized',
                label: 'Other / Uncategorized',
                color: '#64748b',
                actualDaily,
                plannedDaily: 0,
                actualTotal: uncategorizedTotal,
                percent: 0
            });
        }
        
        return breakdown.sort((a, b) => b.actualDaily - a.actualDaily);
    }, [expenseCategories, filteredMonthTransactions, activeDays]);

    const balanceHistoryData = useMemo(() => {
        let currentBal = 0;
        const today = new Date();
        
        // 1. Calculate start balance before resolvedDateRange.start
        activeAnalyticAccountIds.forEach(accId => {
            if (accId === 'legacy') {
                // Legacy unallocated
            } else {
                const account = accounts.find(a => a.id === accId);
                if (account) {
                    currentBal += Number(account.initialBalance) || 0;
                }
            }
        });

        transactions.forEach(t => {
            if (new Date(t.createdAt) < resolvedDateRange.start) {
                const amount = Number(t.amount) || 0;
                if (t.type === 'income') {
                    const accId = t.accountId || 'legacy';
                    if (activeAnalyticAccountIds.includes(accId)) {
                        currentBal += amount;
                    }
                } else if (t.type === 'expense') {
                    const accId = t.accountId || 'legacy';
                    if (activeAnalyticAccountIds.includes(accId)) {
                        currentBal -= amount;
                    }
                } else if (t.type === 'transfer') {
                    if (activeAnalyticAccountIds.includes(t.accountId)) {
                        currentBal -= amount;
                    }
                    if (activeAnalyticAccountIds.includes(t.toAccountId)) {
                        currentBal += amount;
                    }
                }
            }
        });

        // 2. Filter transactions that are within resolvedDateRange
        const rangeTx = transactions
            .filter(t => {
                const d = new Date(t.createdAt);
                return d >= resolvedDateRange.start && d <= resolvedDateRange.end;
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // 3. Generate points based on grouping
        const points = [];
        const start = new Date(resolvedDateRange.start);
        const end = new Date(resolvedDateRange.end);

        if (balanceGrouping === 'day') {
            let curr = new Date(start);
            while (curr <= end) {
                if (curr > today) break;
                const dayStr = getLocalYYYYMMDD(curr);
                const dayTransactions = rangeTx.filter(t => getLocalYYYYMMDD(t.createdAt) === dayStr);
                
                let prevBal = currentBal;
                  let dayIncome = 0;
                  let dayExpense = 0;
                  dayTransactions.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    if (t.type === 'income') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) { currentBal += amount; dayIncome += amount; }
                    } else if (t.type === 'expense') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) { currentBal -= amount; dayExpense += amount; }
                    } else if (t.type === 'transfer') {
                        if (activeAnalyticAccountIds.includes(t.accountId)) currentBal -= amount;
                        if (activeAnalyticAccountIds.includes(t.toAccountId)) currentBal += amount;
                    }
                });

                points.push({
                      label: String(curr.getDate()).padStart(2, '0') + '.' + String(curr.getMonth() + 1).padStart(2, '0'),
                      fullDate: dayStr,
                      balance: currentBal,
                      netFlow: currentBal - prevBal,
                      income: dayIncome,
                      expense: dayExpense
                  });
                
                curr.setDate(curr.getDate() + 1);
            }
        } else if (balanceGrouping === 'week') {
            let curr = new Date(start);
            const dayOfWeek = curr.getDay();
            const diff = curr.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            curr.setDate(diff); // Set to Monday of that week
            
            while (curr <= end) {
                const weekStart = new Date(curr);
                if (weekStart > today) break;
                const weekEnd = new Date(curr);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                const weekTransactions = rangeTx.filter(t => {
                    const d = new Date(t.createdAt);
                    return d >= weekStart && d <= weekEnd;
                });

                let prevBal = currentBal;
                  let dayIncome = 0;
                  let dayExpense = 0;
                  weekTransactions.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    if (t.type === 'income') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) { currentBal += amount; dayIncome += amount; }
                    } else if (t.type === 'expense') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) { currentBal -= amount; dayExpense += amount; }
                    } else if (t.type === 'transfer') {
                        if (activeAnalyticAccountIds.includes(t.accountId)) currentBal -= amount;
                        if (activeAnalyticAccountIds.includes(t.toAccountId)) currentBal += amount;
                    }
                });

                const labelStr = `${weekStart.getDate()} ${weekStart.toLocaleDateString(undefined, {month:'short'})}`;
                points.push({
                      label: labelStr,
                      fullDate: getLocalYYYYMMDD(weekStart),
                      balance: currentBal,
                      netFlow: currentBal - prevBal,
                      income: dayIncome,
                      expense: dayExpense
                  });
                curr.setDate(curr.getDate() + 7);
            }
        } else {
            let curr = new Date(start);
            curr.setDate(1);
            
            while (curr <= end) {
                if (curr > today) break;
                const monthStr = getLocalYYYYMMDD(curr).slice(0, 7);
                const nextMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 1);
                const monthTransactionsList = rangeTx.filter(t => getLocalYYYYMMDD(t.createdAt).startsWith(monthStr));

                let prevBal = currentBal;
                  let dayIncome = 0;
                  let dayExpense = 0;
                  monthTransactionsList.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    if (t.type === 'income') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) { currentBal += amount; dayIncome += amount; }
                    } else if (t.type === 'expense') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) { currentBal -= amount; dayExpense += amount; }
                    } else if (t.type === 'transfer') {
                        if (activeAnalyticAccountIds.includes(t.accountId)) currentBal -= amount;
                        if (activeAnalyticAccountIds.includes(t.toAccountId)) currentBal += amount;
                    }
                });

                const labelStr = curr.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                points.push({
                      label: labelStr,
                      fullDate: monthStr,
                      balance: currentBal,
                      netFlow: currentBal - prevBal,
                      income: dayIncome,
                      expense: dayExpense
                  });

                curr = nextMonth;
            }
        }

        return points;
    }, [transactions, accounts, activeAnalyticAccountIds, resolvedDateRange, balanceGrouping]);

    // Calculate Account Balances
    const getAccountBalance = React.useCallback((accountId) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;
        let balance = Number(account.initialBalance) || 0;
        transactions.forEach(t => {
            if (t.accountId === accountId) {
                if (t.type === 'income') balance += Number(t.amount);
                else if (t.type === 'expense') balance -= Number(t.amount);
                else if (t.type === 'transfer') balance -= Number(t.amount);
            }
            if (t.toAccountId === accountId && t.type === 'transfer') {
                balance += Number(t.amount);
            }
        });
        return balance;
    }, [accounts, transactions]);

    const totalCurrentLiquidity = useMemo(() => {
        let balance = 0;
        activeAnalyticAccountIds.forEach(accId => {
            if (accId === 'legacy') {
                balance += transactions.filter(t => !t.accountId).reduce((acc, t) => acc + (t.type === 'income' ? 1 : -1) * Number(t.amount), 0);
            } else {
                balance += getAccountBalance(accId);
            }
        });
        return balance;
    }, [activeAnalyticAccountIds, getAccountBalance, transactions]);

    // 4. Pie Chart Data (Dynamic)
    const categoryBreakdown = useMemo(() => {
        if (analyticsSource === 'actual') {
            const map = {};
            filteredMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
                const catId = t.categoryId || 'uncategorized';
                map[catId] = (map[catId] || 0) + Number(t.amount);
            });
            return Object.keys(map).map(id => {
                const cat = categories.find(c => c.id === id);
                return { id, name: cat ? cat.label : 'Other', value: map[id], color: cat ? cat.color : '#555' };
            }).filter(i => i.value > 0);
        } else {
            // Budget Source
            return expenseCategories.map(c => ({
                id: c.id,
                name: c.label,
                value: (Number(c.amount) * 30) / (Number(c.period) || 30),
                color: c.color
            })).filter(i => i.value > 0);
        }
    }, [analyticsSource, monthTransactions, categories, expenseCategories]);

    // 5. Daily Bar Chart (Range View)
    const dailyActivity = useMemo(() => {
        if (analyticsSource === 'budget') return []; // Budget has no daily distribution
        
        const days = [];
        
        if (spendingGrouping === 'day') {
            let current = new Date(resolvedDateRange.start);
            while (current <= resolvedDateRange.end) {
                const dayStr = getLocalYYYYMMDD(current); // "YYYY-MM-DD"
                const dayLabel = dateFilterType === 'month' ? current.getDate().toString() : String(current.getDate()).padStart(2, '0') + '.' + String(current.getMonth() + 1).padStart(2, '0');
                const dayData = { day: dayLabel, income: 0, expense: 0, fullDate: dayStr };
                
                // Filter transactions for this day
                const dayTransactions = filteredMonthTransactions.filter(t => 
                    getLocalYYYYMMDD(t.createdAt) === dayStr && 
                    (dailyChartCategoryFilter === 'all' || t.categoryId === dailyChartCategoryFilter)
                );
                
                dayTransactions.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    const cat = categories.find(c => c.id === t.categoryId);
                    const categoryLabel = cat ? cat.label : 'Other';
                    
                    if (t.type === 'income') {
                        dayData.income += amount;
                        dayData[`IN_${categoryLabel}`] = (dayData[`IN_${categoryLabel}`] || 0) + amount;
                    } else if (t.type === 'expense') {
                        dayData.expense += amount;
                        dayData[`OUT_${categoryLabel}`] = (dayData[`OUT_${categoryLabel}`] || 0) - amount; // Negative!
                    }
                });
                
                dayData.net = dayData.income - dayData.expense;
                days.push(dayData);
                current.setDate(current.getDate() + 1);
            }
        } else if (spendingGrouping === 'week') {
            let current = new Date(resolvedDateRange.start);
            // Move to Monday of the current week
            const dayOfWeek = current.getDay();
            const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            current.setDate(current.getDate() + distanceToMonday);
            current.setHours(0, 0, 0, 0);

            while (current <= resolvedDateRange.end) {
                const weekStart = new Date(current);
                const weekEnd = new Date(current);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                const weekLabel = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                const weekData = { day: weekLabel, income: 0, expense: 0, fullDate: getLocalYYYYMMDD(weekStart) };

                const weekTransactions = filteredMonthTransactions.filter(t => {
                    const tDate = new Date(t.createdAt);
                    return tDate >= weekStart && tDate <= weekEnd &&
                           (dailyChartCategoryFilter === 'all' || t.categoryId === dailyChartCategoryFilter);
                });

                weekTransactions.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    const cat = categories.find(c => c.id === t.categoryId);
                    const categoryLabel = cat ? cat.label : 'Other';

                    if (t.type === 'income') {
                        weekData.income += amount;
                        weekData[`IN_${categoryLabel}`] = (weekData[`IN_${categoryLabel}`] || 0) + amount;
                    } else if (t.type === 'expense') {
                        weekData.expense += amount;
                        weekData[`OUT_${categoryLabel}`] = (weekData[`OUT_${categoryLabel}`] || 0) - amount; // Negative!
                    }
                });

                weekData.net = weekData.income - weekData.expense;
                if (weekEnd >= resolvedDateRange.start && weekStart <= resolvedDateRange.end) {
                    days.push(weekData);
                }

                current.setDate(current.getDate() + 7);
            }
        } else if (spendingGrouping === 'month') {
            let current = new Date(resolvedDateRange.start);
            current.setDate(1);
            current.setHours(0, 0, 0, 0);

            while (current <= resolvedDateRange.end) {
                const monthStart = new Date(current);
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
                monthEnd.setHours(23, 59, 59, 999);

                const monthStr = getLocalYYYYMMDD(monthStart).slice(0, 7); // "YYYY-MM"
                const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                const monthData = { day: monthLabel, income: 0, expense: 0, fullDate: monthStr };

                const monthTransactionsList = filteredMonthTransactions.filter(t => {
                    const tDate = new Date(t.createdAt);
                    return tDate >= monthStart && tDate <= monthEnd &&
                           (dailyChartCategoryFilter === 'all' || t.categoryId === dailyChartCategoryFilter);
                });

                monthTransactionsList.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    const cat = categories.find(c => c.id === t.categoryId);
                    const categoryLabel = cat ? cat.label : 'Other';

                    if (t.type === 'income') {
                        monthData.income += amount;
                        monthData[`IN_${categoryLabel}`] = (monthData[`IN_${categoryLabel}`] || 0) + amount;
                    } else if (t.type === 'expense') {
                        monthData.expense += amount;
                        monthData[`OUT_${categoryLabel}`] = (monthData[`OUT_${categoryLabel}`] || 0) - amount; // Negative!
                    }
                });

                monthData.net = monthData.income - monthData.expense;
                days.push(monthData);
                current.setMonth(current.getMonth() + 1);
            }
        }
        
        return days;
    }, [analyticsSource, filteredMonthTransactions, resolvedDateRange, dailyChartCategoryFilter, categories, spendingGrouping]);


    // --- Export Actions ---
    const handleExport = () => {
        const dateLabel = getDateRangeLabel();
        if (dashboardTab === 'history') {
            const filteredList = monthTransactions.filter(t => {
                if (historyFilter.type !== 'all' && t.type !== historyFilter.type) return false;
                if (historyFilter.categoryId !== 'all' && t.categoryId !== historyFilter.categoryId) return false;
                if (historyFilter.accountId !== 'all') {
                    if (t.type === 'transfer') {
                        if (t.accountId !== historyFilter.accountId && t.toAccountId !== historyFilter.accountId) return false;
                    } else {
                        const accId = t.accountId || '';
                        if (accId !== historyFilter.accountId) return false;
                    }
                }
                const amount = Number(t.amount);
                if (historyFilter.minAmount !== '' && amount < Number(historyFilter.minAmount)) return false;
                if (historyFilter.maxAmount !== '' && amount > Number(historyFilter.maxAmount)) return false;
                return true;
            }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            exportTransactionsToExcel(filteredList, categories, accounts, dateLabel);
        } else if (dashboardTab === 'overview') {
            exportAnalyticsToExcel(dailyActivity, categoryBreakdown, balanceHistoryData, activeDaysInMonth, dateLabel);
        } else if (dashboardTab === 'budget') {
            exportBudgetToExcel(categories, planningMonthTransactions, dateLabel, selectedDate.getMonth());
        } else if (dashboardTab === 'projects') {
            let filteredProjects = projects;
            if (projectStatusFilter !== 'all') {
                filteredProjects = filteredProjects.filter(p => p.status === projectStatusFilter);
            }
            if (projectClientFilter !== 'all') {
                filteredProjects = filteredProjects.filter(p => p.client === projectClientFilter);
            }
            if (dateFilterType === 'month') {
                const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
                filteredProjects = filteredProjects.filter(p => {
                    const d = new Date(p.receivedAt || p.createdAt || p.id);
                    return d >= startOfMonth && d <= endOfMonth;
                });
            } else if (dateFilterType === 'custom') {
                const start = customStartDate ? new Date(customStartDate) : null;
                const end = customEndDate ? new Date(customEndDate) : null;
                if (start) start.setHours(0,0,0,0);
                if (end) end.setHours(23,59,59,999);
                filteredProjects = filteredProjects.filter(p => {
                    const d = new Date(p.receivedAt || p.createdAt || p.id);
                    if (start && d < start) return false;
                    if (end && d > end) return false;
                    return true;
                });
            }
            exportProjectsToExcel(filteredProjects, transactions, dateLabel);
        }
    };


    // --- Actions ---
    
    const handleAddExpectedTransaction = (e) => {
        e.preventDefault();
        if (!expectedForm.date || !expectedForm.amount || !expectedForm.description) return;
        
        if (isEditingExpectedId) {
            updateUser({
                expectedTransactions: expectedTransactions.map(t => 
                    t.id === isEditingExpectedId ? { ...t, ...expectedForm } : t
                )
            });
            setIsEditingExpectedId(null);
        } else {
            const newTx = { ...expectedForm, id: Date.now().toString() };
            updateUser({ expectedTransactions: [...expectedTransactions, newTx] });
        }
        
        setExpectedForm({ date: expectedForm.date, description: '', amount: '', type: 'expense', categoryId: '' });
        setIsAddingExpected(false);
    };

    const handleDeleteExpectedTransaction = (id) => {
        updateUser({ expectedTransactions: expectedTransactions.filter(t => t.id !== id) });
    };

    const handleConfirmExpectedTransaction = (et) => {
        setNewTransaction({
            type: et.type,
            amount: et.amount,
            categoryId: et.categoryId || '',
            accountId: accounts[0]?.id || '',
            toAccountId: '',
            description: et.description,
            date: et.date,
            projectId: '',
            projectStageId: '',
            _fromExpectedTxId: et.id
        });
        setIsAddingTransaction(true);
    };
    const handleSaveAccount = async (e) => {
        e.preventDefault();
        if (!editingAccountData.label) return;

        const payload = {
            ...editingAccountData,
            initialBalance: parseFloat(editingAccountData.initialBalance) || 0
        };

        if (payload.id) {
            await accountsActions.update(payload.id, payload);
        } else {
            await accountsActions.add(payload);
        }
        setIsEditingAccount(false);
        setEditingAccountData(null);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!editingCategoryData.label) return;

        const payload = {
            ...editingCategoryData,
            amount: parseFloat(editingCategoryData.amount) || 0,
            period: parseInt(editingCategoryData.period) || 30,
            dayOfTransfer: parseInt(editingCategoryData.dayOfTransfer) || 1
        };

        if (payload.id) {
            await categoriesActions.update(payload.id, payload);
        } else {
            await categoriesActions.add(payload);
        }
        setIsEditingCategory(false);
        setEditingCategoryData(null);
    };
    
    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!newTransaction.amount) return;

        if (newTransaction.type === 'transfer' && newTransaction.accountId === newTransaction.toAccountId) {
            alert("Source and Destination accounts must be different.");
            return;
        }

        let description = newTransaction.description;
        if (!description || !description.trim()) {
            if (newTransaction.type === 'transfer') {
                const fromAcc = accounts.find(a => a.id === newTransaction.accountId);
                const toAcc = accounts.find(a => a.id === newTransaction.toAccountId);
                description = `Transfer ${fromAcc?.label || ''} ➔ ${toAcc?.label || ''}`;
            } else {
                const cat = categories.find(c => c.id === newTransaction.categoryId);
                description = cat ? cat.label : 'Transaction';
            }
        }

        const today = new Date();
        let createdAtDate;
        const selectedDateStr = newTransaction.date;
        const todayDateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        
        if (selectedDateStr === todayDateStr) {
            createdAtDate = today;
        } else {
            const parts = selectedDateStr.split('-').map(Number);
            createdAtDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        }

        const payload = {
            ...newTransaction,
            description,
            amount: parseFloat(newTransaction.amount),
            createdAt: createdAtDate.toISOString()
        };

        if (newTransaction.id) {
            await transactionsActions.update(newTransaction.id, payload);
        } else {
            await transactionsActions.add(payload);
        }

        if (newTransaction._fromExpectedTxId) {
            handleDeleteExpectedTransaction(newTransaction._fromExpectedTxId);
        }

        setIsAddingTransaction(false);
        setNewTransaction({ ...newTransaction, id: undefined, amount: '', description: '', toAccountId: '', projectId: '', projectStageId: '', _fromExpectedTxId: undefined });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-2 md:pb-6 mb-2 md:mb-8 gap-3 md:gap-4">
                <div className="w-full md:w-auto">
                    <div className="flex items-center justify-between gap-4 w-full md:w-auto">
                        {/* Currency Selector */}
                        <div className="relative group">
                            <button className="text-lg md:text-xl font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                {CURRENCIES[currentCurrencyCode].symbol} <span className="text-[10px] uppercase align-top">{currentCurrencyCode}</span>
                            </button>
                            <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl overflow-hidden hidden group-hover:block w-32 z-50">
                                {Object.entries(CURRENCIES).map(([code, info]) => (
                                    <button 
                                        key={code}
                                        onClick={() => setCurrency(code)}
                                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-200 ${currentCurrencyCode === code ? 'text-green-500' : 'text-slate-500'}`}
                                    >
                                        {info.symbol} {code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Filter Type Tabs (Side-by-side with Currency on mobile) */}
                        {dashboardTab !== 'budget' && (
                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                <button 
                                    onClick={() => setDateFilterType('month')} 
                                    className={`px-2.5 py-1 rounded-md transition-all ${dateFilterType === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Month
                                </button>
                                <button 
                                    onClick={() => setDateFilterType('all')} 
                                    className={`px-2.5 py-1 rounded-md transition-all ${dateFilterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setDateFilterType('custom')} 
                                    className={`px-2.5 py-1 rounded-md transition-all ${dateFilterType === 'custom' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Custom
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Date Selector Month Switcher */}
                    {(dashboardTab === 'budget' || (dashboardTab !== 'budget' && dateFilterType === 'month')) && (
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-2 bg-slate-50/50 md:bg-transparent py-1 px-3 md:p-0 rounded-lg w-full md:w-auto">
                            <button onClick={() => adjustMonth(-1)} className="text-slate-500 hover:text-blue-600 transition-colors"><ArrowDownRight className="w-4 h-4 rotate-45" /></button>
                            <span className="text-xs md:text-sm font-mono font-bold text-green-500 uppercase tracking-widest min-w-[125px] md:min-w-[140px] text-center">
                                {getMonthLabel(selectedDate)}
                            </span>
                            <button onClick={() => adjustMonth(1)} className="text-slate-500 hover:text-blue-600 transition-colors"><ArrowUpRight className="w-4 h-4 rotate-45" /></button>
                        </div>
                    )}

                    {/* Custom Date Inputs if Custom Selected */}
                    {dashboardTab !== 'budget' && dateFilterType === 'custom' && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 flex-wrap w-full md:w-auto">
                            <input 
                                type="date" 
                                value={customStartDate} 
                                onChange={e => setCustomStartDate(e.target.value)} 
                                className="bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                            />
                            <span className="text-[9px] font-bold uppercase text-slate-400">to</span>
                            <input 
                                type="date" 
                                value={customEndDate} 
                                onChange={e => setCustomEndDate(e.target.value)} 
                                className="bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0 flex-wrap w-full md:w-auto justify-center md:justify-end">
                    <button onClick={handleExport} title="Export to Excel" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm shrink-0 flex items-center justify-center text-slate-600 hover:text-green-600 group h-full">
                        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider hidden md:inline">Export</span>
                    </button>
                    {/* Navigation Tabs - Match Task/Portfolio Style */}
                    <div className="flex bg-white shadow-sm border border-slate-200/50 p-1 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar w-full md:w-auto self-start md:self-end">
                    {[
                        { id: 'history', label: 'History', color: 'bg-blue-600 text-white shadow-lg' },
                        { id: 'overview', label: 'Analytics', color: 'bg-green-600 text-white shadow-lg' },
                        { id: 'budget', label: 'Planning', color: 'bg-amber-600 text-white shadow-lg' },
                        { id: 'projects', label: 'Coming', color: 'bg-indigo-600 text-white shadow-lg' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setDashboardTab(t.id)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${dashboardTab === t.id ? t.color : 'text-slate-500 hover:text-blue-600'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 flex flex-col">
                    {/* Source Toggle for Analytics */}
                    {dashboardTab === 'overview' && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 mb-8 gap-4">
                            <div className="flex bg-white shadow-sm border border-slate-200 rounded-lg p-1 border border-slate-200 mb-1 self-start md:self-auto w-full md:w-auto">
                                <button onClick={() => setAnalyticsSource('actual')} className={`flex-1 md:flex-none px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'actual' ? 'bg-green-600 text-slate-800' : 'text-slate-500'}`}>Actuals</button>
                                <button onClick={() => setAnalyticsSource('budget')} className={`flex-1 md:flex-none px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'budget' ? 'bg-amber-600 text-slate-800' : 'text-slate-500'}`}>Budget Plan</button>
                            </div>
                        </div>
                    )}

                    {/* --- BUDGET VIEW (Planning) --- */}
                    {dashboardTab === 'budget' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in">
                            {/* Projections based on PLAN */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard title="Projected Income" amount={projectedMonthlyIncome} subtext="Baseline Configuration" icon={TrendingUp} color="#3b82f6" formatMoney={formatMoney} />
                                <StatCard title="Projected Expense" amount={projectedMonthlyExpense} subtext="Baseline Configuration" icon={TrendingDown} color="#ef4444" isNegative formatMoney={formatMoney} />
                                <StatCard title="Projected Cash Flow" amount={projectedFreeCashFlow} subtext="Potential Saving" icon={Wallet} color="#10b981" formatMoney={formatMoney} />
                                <StatCard title="Remaining to Spend" amount={totalRemainingExpense} subtext="Left in current budget" icon={Calculator} color="#f59e0b" formatMoney={formatMoney} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Income Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-500/20">
                                        <h3 className="text-sm font-black text-green-500 uppercase tracking-widest">Recurring Income Sources</h3>
                                        <button 
                                            onClick={() => { setEditingCategoryData({ type: 'income', label: '', amount: '', period: 30, color: '#10b981' }); setIsEditingCategory(true); }}
                                            className="p-2 bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-blue-600 rounded-lg transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-4">
                                        <div className="col-span-3">Source</div>
                                        <div className="col-span-3 pl-2">Budget Plan</div>
                                        <div className="col-span-6">Actual vs Planned Progress</div>
                                    </div>
                                    <div className="space-y-3">
                                        {incomeCategories.map(cat => (
                                            <BudgetRow 
                                                key={cat.id} item={cat} isExpense={false} 
                                                onEdit={(item) => { setEditingCategoryData(item); setIsEditingCategory(true); }}
                                                onDelete={categoriesActions.delete}
                                                currencySymbol={currencySymbol}
                                                actualAmount={planningMonthTransactions.filter(t => t.type === 'income' && t.categoryId === cat.id).reduce((sum, t) => sum + Number(t.amount), 0)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Expense Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-red-900/10 p-4 rounded-xl border border-red-500/20">
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Recurring Expenses</h3>
                                            <span className="text-[10px] text-red-400 font-bold mt-0.5">
                                                Remaining to spend: {formatMoney(totalRemainingExpense)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={recurringExpensesSort}
                                                onChange={e => setRecurringExpensesSort(e.target.value)}
                                                className="bg-white/80 border border-red-500/20 text-[10px] font-bold text-red-700 uppercase tracking-wider rounded-lg px-2.5 py-1.5 outline-none focus:border-red-500/50 cursor-pointer animate-in fade-in"
                                            >
                                                <option value="actual">By Spent</option>
                                                <option value="planned">By Budget</option>
                                            </select>
                                            <button 
                                                onClick={() => { setEditingCategoryData({ type: 'expense', label: '', amount: '', period: 30, color: '#ef4444' }); setIsEditingCategory(true); }}
                                                className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-blue-600 rounded-lg transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-4">
                                        <div className="col-span-3">Category</div>
                                        <div className="col-span-3 pl-2">Budget Limit</div>
                                        <div className="col-span-6">Actual vs Planned Progress</div>
                                    </div>
                                    <div className="space-y-3">
                                        {sortedExpenseCategories.map(cat => (
                                            <BudgetRow 
                                                key={cat.id} item={cat} isExpense={true} 
                                                onEdit={(item) => { setEditingCategoryData(item); setIsEditingCategory(true); }}
                                                onDelete={categoriesActions.delete}
                                                currencySymbol={currencySymbol}
                                                actualAmount={planningMonthTransactions.filter(t => t.type === 'expense' && t.categoryId === cat.id).reduce((sum, t) => sum + Number(t.amount), 0)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- HISTORY VIEW --- */}
                    {/* --- COMING VIEW --- */}
                    {dashboardTab === 'projects' && (() => {
                        // Current Balance
                        // --- PREDICTIVE CASH FLOW ENGINE ---
                        
                        const currentBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
                        
                        const formatDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        
                        const lookbackStart = new Date(lookbackDateRange.start + 'T00:00:00');
                        const lookbackEnd = new Date(lookbackDateRange.end + 'T23:59:59');
                        
                        const predictionStart = new Date(predictionDateRange.start + 'T00:00:00');
                        const predictionEnd = new Date(predictionDateRange.end + 'T23:59:59');
                        const daysInWindow = Math.max(1, Math.floor((predictionEnd - predictionStart) / (1000 * 60 * 60 * 24)));
                        
                        // 1. Calculate Daily Average Spend & Income (Lookback)
                        const lookbackTx = transactions.filter(t => {
                            const d = new Date(t.date || t.createdAt);
                            if (d < lookbackStart || d > lookbackEnd) return false;
                            
                            if (planningAccountId !== 'all') {
                                if (t.type === 'transfer') {
                                    if (t.accountId !== planningAccountId && t.toAccountId !== planningAccountId) return false;
                                } else {
                                    const accId = t.accountId || 'legacy';
                                    if (accId !== planningAccountId) return false;
                                }
                            }
                            
                            return true;
                        });
                        
                        let effectiveLookbackStart = lookbackStart;
                        if (lookbackTx.length > 0) {
                            const firstTxDate = new Date(Math.min(...lookbackTx.map(t => new Date(t.date || t.createdAt))));
                            if (firstTxDate > effectiveLookbackStart) {
                                effectiveLookbackStart = firstTxDate;
                                effectiveLookbackStart.setHours(0,0,0,0);
                            }
                        }
                        
                        const lookbackDays = Math.max(1, Math.floor((lookbackEnd - effectiveLookbackStart) / (1000 * 60 * 60 * 24)) + 1);
                        
                        const lookbackExpenses = lookbackTx.filter(t => {
                            if (t.type === 'expense') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.accountId === planningAccountId) return true;
                            return false;
                        });
                        const lookbackIncomes = lookbackTx.filter(t => {
                            if (t.type === 'income') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.toAccountId === planningAccountId) return true;
                            return false;
                        });

                        const filteredLookbackExpenses = selectedPredictionCategories.length > 0 
                            ? lookbackExpenses.filter(t => selectedPredictionCategories.includes(t.categoryId))
                            : lookbackExpenses;
                            
                        const totalLookbackSpend = filteredLookbackExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                        const dailyAverageSpend = totalLookbackSpend / lookbackDays;
                        
                        // Smart Projection Logic: Group by day of month (1-31)
                        const dayOccurrences = Array(32).fill(0);
                        let currDate = new Date(effectiveLookbackStart);
                        currDate.setHours(0,0,0,0);
                        let maxEndD = new Date(lookbackEnd);
                        if (lookbackTx.length > 0) {
                            const lastTxDate = new Date(Math.max(...lookbackTx.map(t => new Date(t.date || t.createdAt))));
                            if (lastTxDate < maxEndD) {
                                maxEndD = lastTxDate;
                            }
                        } else {
                            if (new Date() < maxEndD) maxEndD = new Date();
                        }
                        maxEndD.setHours(23,59,59,999);
                        while (currDate <= maxEndD) {
                            dayOccurrences[currDate.getDate()]++;
                            currDate.setDate(currDate.getDate() + 1);
                        }
                        
                        const smartDailySpend = Array(32).fill(0);
                        filteredLookbackExpenses.forEach(t => {
                            const d = new Date(t.date || t.createdAt);
                            smartDailySpend[d.getDate()] += (Number(t.amount) || 0);
                        });
                        for (let i = 1; i <= 31; i++) {
                            smartDailySpend[i] = dayOccurrences[i] > 0 ? (smartDailySpend[i] / dayOccurrences[i]) : 0;
                        }
                        
                        const smartDailyIncome = Array(32).fill(0);
                        lookbackIncomes.forEach(t => {
                            const d = new Date(t.date || t.createdAt);
                            smartDailyIncome[d.getDate()] += (Number(t.amount) || 0);
                        });
                        for (let i = 1; i <= 31; i++) {
                            smartDailyIncome[i] = dayOccurrences[i] > 0 ? (smartDailyIncome[i] / dayOccurrences[i]) : 0;
                        }

                        const expectedIncomeEvents = [];
                        const expectedExpenseEvents = [];
                        
                        let dailyRecurringIncome = 0;
                        if (planningMode === 'history') {
                            const totalLookbackIncome = lookbackIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                            const dailyAverageIncome = totalLookbackIncome / lookbackDays;
                            dailyRecurringIncome = dailyAverageIncome;
                        } else {
                            // Project / Expected Mode
                            // Income:
                            projects.filter(p => p.status !== 'Rejected' && p.status !== 'Archived').forEach(p => {
                                p.stages?.forEach(s => {
                                    if (s.status === 'Rejected' || s.status === 'Not Started') return;
                                    
                                    const expDate = s.expectedPaymentDate ? new Date(s.expectedPaymentDate) : today;
                                    let effectiveDate = expDate < today ? today : expDate; // Overdue is expected today
                                    
                                    if (effectiveDate >= today && effectiveDate <= predictionEnd) {
                                        const stageIncome = transactions.filter(t => t.projectStageId === s.id && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                                        const totalExpected = Number(s.expectedNetIncome) || 0;
                                        const remainingNet = Math.max(0, totalExpected - stageIncome);
                                        
                                        if (remainingNet > 0) {
                                            expectedIncomeEvents.push({
                                                date: formatDateStr(effectiveDate),
                                                amount: remainingNet,
                                                label: `${p.name} - ${s.name} (Overdue/Expected)`
                                            });
                                        }
                                    }
                                });
                            });
                            
                            // Expenses: Expected History
                            expectedTransactions.forEach(et => {
                                const etDate = new Date(et.date + 'T00:00:00');
                                let effectiveDate = etDate < today ? today : etDate;
                                if (effectiveDate >= today && effectiveDate <= predictionEnd) {
                                    if (et.type === 'expense') {
                                        expectedExpenseEvents.push({
                                            date: formatDateStr(effectiveDate),
                                            amount: Number(et.amount),
                                            label: et.description || 'Expected Expense'
                                        });
                                    } else {
                                        expectedIncomeEvents.push({
                                            date: formatDateStr(effectiveDate),
                                            amount: Number(et.amount),
                                            label: et.description || 'Expected Income'
                                        });
                                    }
                                }
                            });
                        }
                        
                        // 2. Generate Chart Data & Summary Stats in the target window
                        const chartData = [];
                        
                        // We need to calculate running balance correctly. 
                        // If predictionStart < today, we need historical balance. 
                        // The easiest way is to calculate from initial accounts balance up to predictionStart, then run loop.
                        let runningBalance = 0;
                        accounts.forEach(a => {
                            if (planningAccountId === 'all' || a.id === planningAccountId) {
                                runningBalance += (Number(a.initialBalance) || 0);
                            }
                        });
                        const txList = [...transactions].sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
                        
                        // Fast forward balance up to predictionStart
                        predictionStart.setHours(0,0,0,0);
                        txList.forEach(t => {
                            const d = new Date(t.date || t.createdAt);
                            d.setHours(0,0,0,0);
                            if (d < predictionStart) {
                                if (planningAccountId !== 'all') {
                                    if (t.type === 'transfer') {
                                        if (t.accountId === planningAccountId) runningBalance -= Number(t.amount);
                                        if (t.toAccountId === planningAccountId) runningBalance += Number(t.amount);
                                    } else {
                                        const accId = t.accountId || 'legacy';
                                        if (accId === planningAccountId) {
                                            if (t.type === 'income') runningBalance += Number(t.amount);
                                            if (t.type === 'expense') runningBalance -= Number(t.amount);
                                        }
                                    }
                                } else {
                                    if (t.type === 'income') runningBalance += Number(t.amount);
                                    if (t.type === 'expense') runningBalance -= Number(t.amount);
                                }
                            }
                        });
                        
                        let windowStartingBalance = runningBalance;
                        let windowExpectedIncome = 0;
                        let windowPredictedExpenses = 0;
                        
                        // Add the starting point to the graph (1 day before the window starts)
                        const startPointDate = new Date(predictionStart);
                        startPointDate.setDate(startPointDate.getDate() - 1);
                        chartData.push({
                            date: formatDateStr(startPointDate),
                            balance: windowStartingBalance,
                            shortDate: dateFilterType === 'month' ? startPointDate.getDate().toString() : String(startPointDate.getDate()).padStart(2, '0') + '.' + String(startPointDate.getMonth() + 1).padStart(2, '0')
                        });
                        
                        for (let i = 0; i <= daysInWindow; i++) {
                            const d = new Date(predictionStart);
                            d.setDate(d.getDate() + i);
                            d.setHours(0,0,0,0);
                            const dateStr = formatDateStr(d);
                            
                            // 1. Real history (past and today)
                            if (d <= today) {
                                const todaysTx = txList.filter(t => {
                                    const td = new Date(t.date || t.createdAt);
                                    return formatDateStr(td) === dateStr;
                                });
                                let dayInc = 0;
                                let dayExp = 0;
                                todaysTx.forEach(t => {
                                    if (planningAccountId !== 'all') {
                                        if (t.type === 'transfer') {
                                            if (t.accountId === planningAccountId) {
                                                runningBalance -= Number(t.amount);
                                                dayExp += Number(t.amount);
                                            }
                                            if (t.toAccountId === planningAccountId) {
                                                runningBalance += Number(t.amount);
                                                dayInc += Number(t.amount);
                                            }
                                        } else {
                                            const accId = t.accountId || 'legacy';
                                            if (accId === planningAccountId) {
                                                if (t.type === 'income') { dayInc += Number(t.amount); runningBalance += Number(t.amount); }
                                                if (t.type === 'expense') { dayExp += Number(t.amount); runningBalance -= Number(t.amount); }
                                            }
                                        }
                                    } else {
                                        if (t.type === 'income') { dayInc += Number(t.amount); runningBalance += Number(t.amount); }
                                        if (t.type === 'expense') { dayExp += Number(t.amount); runningBalance -= Number(t.amount); }
                                    }
                                });
                                windowExpectedIncome += dayInc;
                                windowPredictedExpenses += dayExp;
                            }
                            
                            // 2. Prediction baselines (strictly future)
                            if (d > today) {
                                let dayRecurringInc = 0;
                                let dayAvgSpend = dailyAverageSpend;
                                
                                const accountObj = accounts.find(a => a.id === planningAccountId);
                                const isMain = planningAccountId === 'all' || (accountObj && accountObj.label.toLowerCase().includes('main'));
                                
                                if (projectionMethod === 'smart') {
                                    const dDay = d.getDate();
                                    const maxDaysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                                    
                                    dayAvgSpend = smartDailySpend[dDay] || 0;
                                    if (dDay === maxDaysInMonth) {
                                        for (let extra = maxDaysInMonth + 1; extra <= 31; extra++) {
                                            dayAvgSpend += (smartDailySpend[extra] || 0);
                                        }
                                    }
                                    
                                    if (planningMode === 'history' && isMain) {
                                        dayRecurringInc = smartDailyIncome[dDay] || 0;
                                        if (dDay === maxDaysInMonth) {
                                            for (let extra = maxDaysInMonth + 1; extra <= 31; extra++) {
                                                dayRecurringInc += (smartDailyIncome[extra] || 0);
                                            }
                                        }
                                    }
                                } else {
                                    if (planningMode === 'history' && isMain) {
                                        dayRecurringInc = dailyRecurringIncome;
                                    }
                                }
                                
                                // In Expected mode, we always use categories for income
                                if (planningMode === 'project' && isMain) {
                                    const activeIncomeCategories = categories.filter(c => c.type === 'income');
                                    activeIncomeCategories.forEach(c => {
                                        const transferDay = Number(c.dayOfTransfer) || 1;
                                        const maxDaysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                                        const actualTransferDay = Math.min(transferDay, maxDaysInMonth);
                                        
                                        if (d.getDate() === actualTransferDay) {
                                            dayRecurringInc += (Number(c.amount) || 0);
                                        }
                                    });
                                }
                                
                                runningBalance += dayRecurringInc;
                                runningBalance -= dayAvgSpend;
                                windowExpectedIncome += dayRecurringInc;
                                windowPredictedExpenses += dayAvgSpend;
                            }
                            
                            // 3. Expected Specific Events (today and future)
                            if (d >= today && planningMode === 'project') {
                                const accountObj = accounts.find(a => a.id === planningAccountId);
                                const isMain = planningAccountId === 'all' || (accountObj && accountObj.label.toLowerCase().includes('main'));
                                
                                const todaysIncEvents = expectedIncomeEvents.filter(e => e.date === dateStr);
                                todaysIncEvents.forEach(e => {
                                    if (isMain) {
                                        runningBalance += e.amount;
                                        windowExpectedIncome += e.amount;
                                    }
                                });
                                
                                const todaysExpEvents = expectedExpenseEvents.filter(e => e.date === dateStr);
                                todaysExpEvents.forEach(e => {
                                    if (isMain) {
                                        runningBalance -= e.amount;
                                        windowPredictedExpenses += e.amount;
                                    }
                                });
                            }
                            
                            chartData.push({
                                date: dateStr,
                                balance: runningBalance,
                                shortDate: dateFilterType === 'month' ? d.getDate().toString() : String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0')
                            });
                        }

                        // Determine safety color
                        const projectedEndBalance = runningBalance;
                        const isSafe = projectedEndBalance >= 0;
                        const balanceColorClass = isSafe ? 'text-indigo-700' : 'text-red-600';
                        const balanceBgClass = isSafe ? 'bg-indigo-50/30 border-indigo-200' : 'bg-red-50/30 border-red-200';

                        return (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in relative">
                                
                                {/* Control Panel */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end relative z-30">
                                    <div className="flex-1 space-y-1 w-full">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planning Mode</label>
                                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 flex font-bold text-xs h-[38px]">
                                            <button 
                                                className={`flex-1 rounded-md transition-colors ${planningMode === 'history' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                                onClick={() => setPlanningMode('history')}
                                            >
                                                History
                                            </button>
                                            <button 
                                                className={`flex-1 rounded-md transition-colors ${planningMode === 'project' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                                onClick={() => setPlanningMode('project')}
                                            >
                                                Expected
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1 w-full">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Method</label>
                                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 flex font-bold text-xs h-[38px]">
                                            <button 
                                                className={`flex-1 rounded-md transition-colors ${projectionMethod === 'average' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                                onClick={() => setProjectionMethod('average')}
                                            >
                                                Average
                                            </button>
                                            <button 
                                                className={`flex-1 rounded-md transition-colors ${projectionMethod === 'smart' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                                onClick={() => setProjectionMethod('smart')}
                                            >
                                                Smart
                                            </button>
                                        </div>
                                    </div>
                                    <DateRangePicker 
                                        label="Lookback Window" 
                                        range={lookbackDateRange} 
                                        setRange={setLookbackDateRange} 
                                        presets={[
                                            { label: 'This Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth(), 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }}},
                                            { label: 'Last Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth() - 1, 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth(), 0)) }}},
                                            { label: 'Last 30 Days', getRange: () => { const d = new Date(); const prev = new Date(d); prev.setDate(prev.getDate() - 30); return { start: formatDateStr(prev), end: formatDateStr(d) }}},
                                            { label: 'Last 90 Days', getRange: () => { const d = new Date(); const prev = new Date(d); prev.setDate(prev.getDate() - 90); return { start: formatDateStr(prev), end: formatDateStr(d) }}},
                                            { label: 'All Time (Past)', getRange: () => { const d = new Date(); const prev = new Date(d); prev.setFullYear(prev.getFullYear() - 1); return { start: formatDateStr(prev), end: formatDateStr(d) }}},
                                            { label: 'Custom', isCustom: true }
                                        ]} 
                                    />
                                    <DateRangePicker 
                                        label="Prediction Window" 
                                        range={predictionDateRange} 
                                        setRange={setPredictionDateRange} 
                                        presets={[
                                            { label: 'This Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth(), 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }}},
                                            { label: 'Next Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 2, 0)) }}},
                                            { label: 'Next 30 Days', getRange: () => { const d = new Date(); const next = new Date(d); next.setDate(next.getDate() + 30); return { start: formatDateStr(d), end: formatDateStr(next) }}},
                                            { label: 'Next 90 Days', getRange: () => { const d = new Date(); const next = new Date(d); next.setDate(next.getDate() + 90); return { start: formatDateStr(d), end: formatDateStr(next) }}},
                                            { label: 'All Time (Future)', getRange: () => { const d = new Date(); const next = new Date(d); next.setFullYear(next.getFullYear() + 1); return { start: formatDateStr(d), end: formatDateStr(next) }}},
                                            { label: 'Custom', isCustom: true }
                                        ]} 
                                    />
                                    <div className="flex-[2] space-y-1 w-full md:w-auto">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planning Account</label>
                                        <select 
                                            value={planningAccountId}
                                            onChange={e => setPlanningAccountId(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 h-[38px] outline-none focus:border-blue-500"
                                        >
                                            <option value="all">All Accounts</option>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-[2] space-y-1 w-full relative group">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expense Categories</label>
                                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold cursor-pointer flex justify-between items-center h-[38px]">
                                            <span className="truncate">
                                                {selectedPredictionCategories.length === 0 
                                                    ? 'All Expense Categories' 
                                                    : `${selectedPredictionCategories.length} Categories Selected`}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                        </div>
                                        <div className="absolute top-[60px] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 hidden group-hover:block max-h-64 overflow-y-auto p-2">
                                            <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase px-2">Filter Predicted Expenses</div>
                                            <div 
                                                className={`p-2 rounded-lg cursor-pointer text-xs font-bold mb-1 ${selectedPredictionCategories.length === 0 ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'}`}
                                                onClick={() => setSelectedPredictionCategories([])}
                                            >
                                                All Categories
                                            </div>
                                            {categories.filter(c => c.type === 'expense').map(c => (
                                                <div 
                                                    key={c.id} 
                                                    className={`p-2 rounded-lg cursor-pointer text-xs font-bold flex items-center justify-between mb-1 ${selectedPredictionCategories.includes(c.id) ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'}`}
                                                    onClick={() => {
                                                        if (selectedPredictionCategories.includes(c.id)) {
                                                            setSelectedPredictionCategories(selectedPredictionCategories.filter(id => id !== c.id));
                                                        } else {
                                                            setSelectedPredictionCategories([...selectedPredictionCategories, c.id]);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}}></div>
                                                        {c.label}
                                                    </div>
                                                    {selectedPredictionCategories.includes(c.id) && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden bg-slate-50/50">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Window Starting Balance</div>
                                        <div className="text-2xl font-black text-slate-700">
                                            {formatMoney(windowStartingBalance)}
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-bold mt-1">On {new Date(predictionDateRange.start).toLocaleDateString()}</div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden bg-blue-50/30">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Window Expected Income</div>
                                        <div className="text-2xl font-black text-blue-600">
                                            {formatMoney(windowExpectedIncome)}
                                        </div>
                                        <div className="text-[9px] text-blue-400 font-bold mt-1">Based on {formatMoney(windowExpectedIncome / (daysInWindow + 1))}/day avg</div>
                                        <Target className="w-12 h-12 absolute -right-3 -bottom-3 text-blue-100 opacity-50" />
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden bg-red-50/30">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Window Predicted Expenses</div>
                                        <div className="text-2xl font-black text-red-600">
                                            {formatMoney(windowPredictedExpenses)}
                                        </div>
                                        <div className="text-[9px] text-red-400 font-bold mt-1">{formatMoney(windowPredictedExpenses / (daysInWindow + 1))}/day avg</div>
                                        <TrendingDown className="w-12 h-12 absolute -right-3 -bottom-3 text-red-100 opacity-50" />
                                    </div>
                                    <div className={`bg-white p-5 rounded-2xl border shadow-sm relative overflow-hidden ${balanceBgClass}`}>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Projected End Balance</div>
                                        <div className={`text-2xl font-black ${balanceColorClass}`}>
                                            {formatMoney(projectedEndBalance)}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-[9px] text-slate-500 font-bold">On {new Date(predictionDateRange.end).toLocaleDateString()}</div>
                                            <div className={`text-[9px] font-bold ${projectedEndBalance - windowStartingBalance > 0 ? 'text-green-500' : (projectedEndBalance - windowStartingBalance < 0 ? 'text-red-500' : 'text-slate-400')}`}>
                                                ({projectedEndBalance - windowStartingBalance > 0 ? '+' : ''}{formatMoney(projectedEndBalance - windowStartingBalance)})
                                            </div>
                                        </div>
                                        <Wallet className={`w-12 h-12 absolute -right-3 -bottom-3 opacity-50 ${isSafe ? 'text-indigo-100' : 'text-red-100'}`} />
                                    </div>
                                </div>

                                {/* Main Chart */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Cash Flow Projection</h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Projected Balance</div>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={isSafe ? '#6366f1' : '#ef4444'} stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor={isSafe ? '#6366f1' : '#ef4444'} stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} tickFormatter={(val) => `֏${(val/1000)}k`} />
                                                <RechartsTooltip content={<CustomBalanceTooltip formatMoney={formatMoney} balanceChartMode={balanceChartMode} />} />
                                                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="balance" 
                                                    name="Balance"
                                                    stroke={isSafe ? '#6366f1' : '#ef4444'} 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorBalance)" 
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: isSafe ? '#6366f1' : '#ef4444' }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Expected History Section */}
                                {planningMode === 'project' && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-10 mt-6">
                                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Expected History</h3>
                                            <button 
                                                onClick={() => {
                                                    if (isAddingExpected) {
                                                        setIsEditingExpectedId(null);
                                                        setExpectedForm({ date: expectedForm.date, description: '', amount: '', type: 'expense', categoryId: '' });
                                                    }
                                                    setIsAddingExpected(!isAddingExpected);
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1"
                                            >
                                                {isAddingExpected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                {isAddingExpected ? 'Cancel' : 'Plan Transaction'}
                                            </button>
                                        </div>
                                        
                                        {isAddingExpected && (
                                            <div className="p-4 bg-blue-50/50 border-b border-slate-200">
                                                <form onSubmit={handleAddExpectedTransaction} className="flex flex-wrap items-end gap-3">
                                                    <div className="flex-1 min-w-[150px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                                                        <input type="date" required value={expectedForm.date} onChange={e => setExpectedForm({...expectedForm, date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-[150px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                                                        <select value={expectedForm.type} onChange={e => setExpectedForm({...expectedForm, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500">
                                                            <option value="expense">Expense</option>
                                                            <option value="income">Income</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-[2] min-w-[200px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                                                        <input type="text" required placeholder="e.g. Taxes, Vacation, New Laptop" value={expectedForm.description} onChange={e => setExpectedForm({...expectedForm, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-[150px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                                                        <select value={expectedForm.categoryId} onChange={e => setExpectedForm({...expectedForm, categoryId: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500">
                                                            <option value="">Uncategorized</option>
                                                            {categories.filter(c => c.type === expectedForm.type).map(c => (
                                                                <option key={c.id} value={c.id}>{c.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex-1 min-w-[120px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Amount</label>
                                                        <input type="number" required placeholder="0" value={expectedForm.amount} onChange={e => setExpectedForm({...expectedForm, amount: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                                                    </div>
                                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors h-[34px]">
                                                        {isEditingExpectedId ? 'Save' : 'Add'}
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                        
                                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto no-scrollbar">
                                            {expectedTransactions.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">No planned transactions</div>
                                            ) : (
                                                [...expectedTransactions].sort((a,b) => new Date(a.date) - new Date(b.date)).map((et) => {
                                                    const cat = categories.find(c => c.id === et.categoryId);
                                                    return (
                                                    <div key={et.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#94a3b8' }} />
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-800">{et.description}</div>
                                                                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
                                                                    <Calendar className="w-3 h-3"/> {et.date} {cat && `• ${cat.label}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex items-center gap-4">
                                                            <div className={`text-sm font-black ${et.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                {et.type === 'expense' ? '-' : '+'}{formatMoney(et.amount)}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => {
                                                                    setExpectedForm({
                                                                        date: et.date,
                                                                        description: et.description,
                                                                        amount: et.amount,
                                                                        type: et.type || 'expense',
                                                                        categoryId: et.categoryId || ''
                                                                    });
                                                                    setIsEditingExpectedId(et.id);
                                                                    setIsAddingExpected(true);
                                                                }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                                                                    <Edit3 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleConfirmExpectedTransaction(et)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Confirm (Move to real history)">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDeleteExpectedTransaction(et.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Delete">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )})
                                            )}
                                        </div>
                                    </div>
                                )}


                            </div>
                        );
                    })()}

            {dashboardTab === 'history' && (
                <HistoryTab formatMoney={formatMoney}
                    accounts={accounts}
                    categories={categories}
                    historyFilter={historyFilter}
                    setHistoryFilter={setHistoryFilter}
                    setNewTransaction={setNewTransaction}
                    setIsAddingTransaction={setIsAddingTransaction}
                    transactionsActions={transactionsActions}
                    getLocalYYYYMMDD={getLocalYYYYMMDD}
                    setEditingAccountData={setEditingAccountData}
                    setIsEditingAccount={setIsEditingAccount}
                    getAccountBalance={getAccountBalance}
                    getDateRangeLabel={getDateRangeLabel}
                    viewMode={viewMode}
                    monthTransactions={monthTransactions}
                />
            )}
                     {/* --- ANALYTICS VIEW --- */}
                     {dashboardTab === 'overview' && (
                     <OverviewTab 
                         filterAccountsList={filterAccountsList}
                         activeAnalyticAccountIds={activeAnalyticAccountIds}
                         setSelectedAnalyticAccounts={setSelectedAnalyticAccounts}
                         analyticsSource={analyticsSource}
                         activeIncome={activeIncome}
                         activeExpense={activeExpense}
                         activeDays={activeDays}
                         monthActualExpense={monthActualExpense}
                         projectedMonthlyExpense={projectedMonthlyExpense}
                         showDailyAvgBreakdown={showDailyAvgBreakdown}
                         setShowDailyAvgBreakdown={setShowDailyAvgBreakdown}
                         totalCurrentLiquidity={totalCurrentLiquidity}
                         dailyAvgCategoryBreakdown={dailyAvgCategoryBreakdown}
                         formatMoney={formatMoney}
                         getDateRangeLabel={getDateRangeLabel}
                         balanceChartMode={balanceChartMode}
                         setBalanceChartMode={setBalanceChartMode}
                         balanceGrouping={balanceGrouping}
                         setBalanceGrouping={setBalanceGrouping}
                         balanceHistoryData={balanceHistoryData}
                         setExpandedChart={setExpandedChart}
                         exportBalanceHistoryToExcel={exportBalanceHistoryToExcel}
                         spendingGrouping={spendingGrouping}
                         setSpendingGrouping={setSpendingGrouping}
                         dailyChartCategoryFilter={dailyChartCategoryFilter}
                         setDailyChartCategoryFilter={setDailyChartCategoryFilter}
                         categories={categories}
                         pieChartMode={pieChartMode}
                         setPieChartMode={setPieChartMode}
                         categoryBreakdown={categoryBreakdown}
                         dailyActivity={dailyActivity}
                         currencySymbol={currencySymbol}
                         getMonthLabel={getMonthLabel}
                         incomeCategories={incomeCategories}
                         expenseCategories={expenseCategories}
                         selectedDate={selectedDate}
                         expandedChart={expandedChart}
                         setHistoryFilter={setHistoryFilter}
                         setDashboardTab={setDashboardTab}
                         formatDateToDDMMYYYY={formatDateToDDMMYYYY}
                     />
                     )}
            
            {/* --- MODALS --- */}

            {/* Category/Budget Modal */}
            <CategoryModal
                isEditingCategory={isEditingCategory}
                setIsEditingCategory={setIsEditingCategory}
                editingCategoryData={editingCategoryData}
                setEditingCategoryData={setEditingCategoryData}
                handleSaveCategory={handleSaveCategory}
            />

            {/* Account Modal */}
            <AccountModal
                isEditingAccount={isEditingAccount}
                setIsEditingAccount={setIsEditingAccount}
                editingAccountData={editingAccountData}
                setEditingAccountData={setEditingAccountData}
                handleSaveAccount={handleSaveAccount}
            />
             
            {/* Transaction Modal */}
            <TransactionModal
                isAddingTransaction={isAddingTransaction}
                setIsAddingTransaction={setIsAddingTransaction}
                handleAddTransaction={handleAddTransaction}
                newTransaction={newTransaction}
                setNewTransaction={setNewTransaction}
                accounts={accounts}
                categories={categories}
                isCategoryDropdownOpen={isCategoryDropdownOpen}
                setIsCategoryDropdownOpen={setIsCategoryDropdownOpen}
                categorySearchQuery={categorySearchQuery}
                setCategorySearchQuery={setCategorySearchQuery}
                setEditingCategoryData={setEditingCategoryData}
                setIsEditingCategory={setIsEditingCategory}
                projects={projects}
            />
            {/* Expanded Chart Modal */}
            {expandedChart && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-in fade-in zoom-in-95 p-4 md:p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-6 shrink-0 gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                {expandedChart === 'pie' ? <PieChart className="w-6 h-6 md:w-8 md:h-8 text-purple-500" /> : <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />}
                                {expandedChart === 'pie' ? (analyticsSource === 'actual' ? 'Breakdown (Actual)' : 'Allocation (Planned)') : 'Spending Flow'}
                            </h2>
                            {expandedChart === 'pie' && (
                                <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-300 ml-2 shadow-inner">
                                    <button onClick={() => setPieChartMode('expense')} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${pieChartMode === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Expense</button>
                                    <button onClick={() => setPieChartMode('income')} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${pieChartMode === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Income</button>
                                </div>
                            )}
                            {expandedChart === 'bar' && (
                                <>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm ml-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category:</span>
                                        <select
                                            value={dailyChartCategoryFilter}
                                            onChange={e => setDailyChartCategoryFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-1 outline-none focus:border-blue-500 max-w-[180px] truncate"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grouping:</span>
                                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                            <button 
                                                type="button"
                                                onClick={() => setSpendingGrouping('day')} 
                                                className={`px-2 py-1 rounded-md transition-all ${spendingGrouping === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Days
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setSpendingGrouping('week')} 
                                                className={`px-2 py-1 rounded-md transition-all ${spendingGrouping === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Weeks
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setSpendingGrouping('month')} 
                                                className={`px-2 py-1 rounded-md transition-all ${spendingGrouping === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Months
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={() => setExpandedChart(null)} className="p-3 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center shrink-0">
                            <X className="w-6 h-6 text-slate-800" />
                        </button>
                    </div>

                    <div className="flex-1 w-full h-full min-h-0 bg-white border border-slate-200 rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden">
                        
                        {expandedChart === 'pie' && categoryBreakdown.length > 0 && (
                            <>
                                {/* Chart Section */}
                                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0 h-[40vh] md:h-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={categoryBreakdown}
                                                cx="50%" cy="50%"
                                                innerRadius="50%" outerRadius="80%"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#555'} stroke="none" />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px' }} itemStyle={{ color: '#fff' }} formatter={(val) => formatMoney(val)} />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Details List Section */}
                                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-slate-50/50">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 sticky top-0 bg-slate-50/90 backdrop-blur pb-2 z-10">Detailed Breakdown</h3>
                                    <div className="space-y-3">
                                        {categoryBreakdown.slice().sort((a,b) => b.value - a.value).map((item, idx) => {
                                            const total = categoryBreakdown.reduce((sum, i) => sum + i.value, 0);
                                            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                                            const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
                                            const daysForAvg = analyticsSource === 'actual' ? activeDaysInMonth : daysInMonth;
                                            const dailyAvg = item.value / daysForAvg;

                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => {
                                                        if (item.id) {
                                                            setHistoryFilter({ type: analyticsSource === 'budget' ? 'expense' : 'all', categoryId: item.id, accountId: 'all', minAmount: '', maxAmount: '' });
                                                            setDashboardTab('history');
                                                            setExpandedChart(null);
                                                        }
                                                    }}
                                                    className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-purple-300 hover:bg-slate-50 transition-colors group ${item.id ? 'cursor-pointer' : ''}`}
                                                >
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                                        <PieChart className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-bold text-slate-800 truncate pr-2">{item.name}</div>
                                                            <div className="font-black text-slate-800 whitespace-nowrap">{formatMoney(item.value)}</div>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 mb-2">
                                                            <span>{percent}% of total</span>
                                                            <span>~{formatMoney(dailyAvg)} / day</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {expandedChart === 'area' && balanceHistoryData.length > 0 && (
                            <div className="flex flex-col w-full h-full">
                                {/* Chart Section */}
                                <div className="w-full h-full p-6 md:p-12">
                                     <ResponsiveContainer width="100%" height="100%">
                                         <AreaChart data={balanceHistoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                             <defs>
                                                 <linearGradient id="balanceGradExpand" x1="0" y1="0" x2="0" y2="1">
                                                     <stop offset="5%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0.2}/>
                                                     <stop offset="95%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
                                                 </linearGradient>
                                             </defs>
                                             <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                             <XAxis 
                                                 dataKey="label" 
                                                 stroke="#94a3b8" 
                                                 fontSize={12} 
                                                 fontWeight={600}
                                                 tickLine={false} 
                                                 axisLine={false} 
                                                 tickMargin={12}
                                             />
                                             <YAxis 
                                                 stroke="#94a3b8" 
                                                 fontSize={12} 
                                                 fontWeight={600}
                                                 tickLine={false} 
                                                 axisLine={false} 
                                                 tickFormatter={val => formatMoney(val)}
                                                 tickMargin={12}
                                             />
                                             <RechartsTooltip content={<CustomBalanceTooltip formatMoney={formatMoney} balanceChartMode={balanceChartMode} />} />
                                             <Area 
                                                 type="monotone" 
                                                 dataKey={balanceChartMode === 'net_worth' ? "balance" : "netFlow"} 
                                                 stroke={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} 
                                                 strokeWidth={3}
                                                 fillOpacity={1} 
                                                 fill="url(#balanceGradExpand)" 
                                             />
                                         </AreaChart>
                                     </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {expandedChart === 'bar' && dailyActivity.length > 0 && (
                            <div className="flex flex-col w-full h-full">
                                {/* Chart Section */}
                                <div className="w-full h-full p-6 md:p-12">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dailyActivity} stackOffset="sign" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} interval={spendingGrouping === 'day' ? 2 : 0} />
                                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `${currencySymbol}${val}`} tickMargin={8} />
                                                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                                                <RechartsTooltip content={<CustomTooltip selectedDate={selectedDate} getMonthLabel={getMonthLabel} formatMoney={formatMoney} categories={categories} />} />
                                                {incomeCategories.map(c => (
                                                    <Bar key={c.id} dataKey={`IN_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#10b981'} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                ))}
                                                <Bar dataKey="IN_Other" name="Other Income" stackId="spending" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                
                                                {expenseCategories.map(c => (
                                                    <Bar key={c.id} dataKey={`OUT_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#ef4444'} radius={[0, 0, 4, 4]} maxBarSize={40} />
                                                ))}
                                                <Bar dataKey="OUT_Other" name="Other Expense" stackId="spending" fill="#475569" radius={[0, 0, 4, 4]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            </div>
        </div>
    );
};

export default FinanceModule;
