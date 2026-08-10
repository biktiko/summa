import * as XLSX from 'xlsx';

export const exportTransactionsToExcel = (transactions, categories, accounts, dateLabel) => {
    const data = transactions.map(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const fromAcc = accounts.find(a => a.id === t.accountId);
        const toAcc = accounts.find(a => a.id === t.toAccountId);
        
        return {
            Date: new Date(t.createdAt).toLocaleDateString(),
            Time: new Date(t.createdAt).toLocaleTimeString(),
            Type: t.type === 'income' ? 'Income' : t.type === 'expense' ? 'Expense' : 'Transfer',
            Amount: Number(t.amount),
            Category: cat ? cat.label : (t.type === 'transfer' ? 'Transfer' : 'Uncategorized'),
            "Source Account": fromAcc ? fromAcc.label : '',
            "Destination Account": toAcc ? toAcc.label : '',
            Project: t.projectId || '',
            Description: t.description || ''
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Summa_Transactions_${dateLabel.replace(/\s+/g, '_')}.xlsx`);
};

export const exportAnalyticsToExcel = (dailyActivity, categoryBreakdown, balanceHistoryData, activeDays, dateLabel) => {
    const wb = XLSX.utils.book_new();

    // 1. Cash Flow Dynamics
    const flowData = dailyActivity.map(d => {
        let income = 0;
        let expense = 0;
        Object.keys(d).forEach(k => {
            if (k.startsWith('IN_')) income += Number(d[k]);
            if (k.startsWith('OUT_')) expense += Math.abs(Number(d[k]));
        });
        return {
            Period: d.day,
            Income: income,
            Expense: expense,
            "Net Flow": income - expense
        };
    });
    const flowWs = XLSX.utils.json_to_sheet(flowData);
    XLSX.utils.book_append_sheet(wb, flowWs, "Cash Flow Dynamics");

    // 2. Category Breakdown
    const total = categoryBreakdown.reduce((sum, i) => sum + i.value, 0);
    const catData = categoryBreakdown.slice().sort((a,b) => b.value - a.value).map(c => {
        const percent = total > 0 ? ((c.value / total) * 100).toFixed(1) : 0;
        const dailyAvg = c.value / activeDays;
        return {
            Category: c.name,
            Amount: c.value,
            "% of Total": `${percent}%`,
            "Daily Average": dailyAvg
        };
    });
    const catWs = XLSX.utils.json_to_sheet(catData);
    XLSX.utils.book_append_sheet(wb, catWs, "Category Breakdown");

    // 3. Balance History
    const balanceData = balanceHistoryData.map(b => ({
        Date: b.fullDate || b.label,
        Balance: b.balance,
        "Net Flow": b.netFlow || 0
    }));
    const balanceWs = XLSX.utils.json_to_sheet(balanceData);
    XLSX.utils.book_append_sheet(wb, balanceWs, "Balance History");

    XLSX.writeFile(wb, `Summa_Analytics_${dateLabel.replace(/\s+/g, '_')}.xlsx`);
};

export const exportBudgetToExcel = (categories, monthTransactions, dateLabel, selectedMonth) => {
    const data = categories.map(cat => {
        // Calculate planned
        const activeMonths = cat.activeMonths || Array.from({length: 12}, (_, i) => i);
        let planned = 0;
        
        // Only count if category is active in the selected month (if month is provided)
        if (selectedMonth === undefined || activeMonths.includes(selectedMonth)) {
            const amount = Number(cat.amount) || 0;
            const period = Number(cat.period) || 30;
            planned = (amount * 30) / period;
        }

        // Calculate actuals
        const actual = monthTransactions
            .filter(t => t.categoryId === cat.id)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const diff = actual - planned;
        const percent = planned > 0 ? (actual / planned) * 100 : 0;

        return {
            Category: cat.label,
            Type: cat.type === 'income' ? 'Income' : 'Expense',
            "Planned Amount": planned,
            "Actual Amount": actual,
            [cat.type === 'income' ? 'Shortfall/Surplus' : 'Remaining/Overage']: cat.type === 'expense' ? planned - actual : actual - planned,
            "% Achieved": `${percent.toFixed(1)}%`
        };
    }).sort((a, b) => a.Type.localeCompare(b.Type)); // Group by type

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Budget vs Actuals");
    XLSX.writeFile(wb, `Summa_Budget_${dateLabel.replace(/\s+/g, '_')}.xlsx`);
};

export const exportProjectsToExcel = (projects, transactions, dateLabel) => {
    const data = projects.map(proj => {
        // Calculate actuals
        const projTransactions = transactions.filter(t => t.projectId === proj.id);
        const actualIncome = projTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const actualExpense = projTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        const expectedIncome = Number(proj.expectedIncome || 0);
        const netProfit = actualIncome - actualExpense;
        const profitMargin = actualIncome > 0 ? (netProfit / actualIncome) * 100 : 0;

        return {
            "Project Name": proj.name || 'Untitled',
            Client: proj.client || 'Unknown',
            Status: proj.status || 'Active',
            "Expected Income": expectedIncome,
            "Gross Received": actualIncome,
            "Total Expenses": actualExpense,
            "Net Profit": netProfit,
            "Profit Margin %": `${profitMargin.toFixed(1)}%`
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, `Summa_Projects_${dateLabel.replace(/\s+/g, '_')}.xlsx`);
};
