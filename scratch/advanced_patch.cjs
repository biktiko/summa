const fs = require('fs');

const path = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `                        const lookbackExpenses = lookbackTx.filter(t => {
                            if (t.type === 'expense') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.accountId === planningAccountId) return true;
                            return false;
                        });
                        const lookbackIncomes = lookbackTx.filter(t => {
                            if (t.type === 'income') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.toAccountId === planningAccountId) return true;
                            return false;
                        });

                        const filteredLookbackExpenses = excludedPredictionCategories.length > 0 
                            ? lookbackExpenses.filter(t => !excludedPredictionCategories.includes(t.categoryId))
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
                        }`;

const replace1 = `                        const lookbackExpenses = lookbackTx.filter(t => {
                            if (t.type === 'expense') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.accountId === planningAccountId) return true;
                            return false;
                        });
                        const lookbackIncomes = lookbackTx.filter(t => {
                            if (t.type === 'income') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.toAccountId === planningAccountId) return true;
                            return false;
                        });

                        const filteredLookbackExpenses = excludedPredictionCategories.length > 0 
                            ? lookbackExpenses.filter(t => !excludedPredictionCategories.includes(t.categoryId))
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
                        
                        // --- ADVANCED MODE PRE-CALCULATION ---
                        // Group lookback expenses by category
                        const categoryLookbackSpend = {};
                        const smartDailySpendByCategory = {};
                        
                        filteredLookbackExpenses.forEach(t => {
                            const catId = t.categoryId || 'unassigned';
                            if (!categoryLookbackSpend[catId]) {
                                categoryLookbackSpend[catId] = 0;
                                smartDailySpendByCategory[catId] = Array(32).fill(0);
                            }
                            categoryLookbackSpend[catId] += (Number(t.amount) || 0);
                            
                            const d = new Date(t.date || t.createdAt);
                            smartDailySpendByCategory[catId][d.getDate()] += (Number(t.amount) || 0);
                        });
                        
                        Object.keys(smartDailySpendByCategory).forEach(catId => {
                            for (let i = 1; i <= 31; i++) {
                                smartDailySpendByCategory[catId][i] = dayOccurrences[i] > 0 ? (smartDailySpendByCategory[catId][i] / dayOccurrences[i]) : 0;
                            }
                        });
                        
                        // Include overridden categories even if no lookback history exists
                        const allRelevantCategories = new Set([...Object.keys(categoryLookbackSpend), ...Object.keys(categoryOverrides)]);
                        allRelevantCategories.forEach(catId => {
                            if (!categoryLookbackSpend[catId]) {
                                categoryLookbackSpend[catId] = 0;
                                smartDailySpendByCategory[catId] = Array(32).fill(0);
                            }
                        });

                        const predictionDaysCount = Math.max(1, Math.ceil((predictionEnd - predictionStart) / (1000 * 60 * 60 * 24)));
                        const categoryExpectedSpend = {}; // Baseline expected spend for prediction window
                        
                        allRelevantCategories.forEach(catId => {
                            if (projectionMethod === 'smart') {
                                let smartTotal = 0;
                                for (let i = 0; i <= predictionDaysCount; i++) { // loop matches chart generation loop exactly
                                    const d = new Date(predictionStart);
                                    d.setDate(d.getDate() + i);
                                    if (d > today) {
                                        const dDay = d.getDate();
                                        const maxDaysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                                        let daySpend = smartDailySpendByCategory[catId][dDay] || 0;
                                        if (dDay === maxDaysInMonth) {
                                            for (let extra = maxDaysInMonth + 1; extra <= 31; extra++) {
                                                daySpend += (smartDailySpendByCategory[catId][extra] || 0);
                                            }
                                        }
                                        smartTotal += daySpend;
                                    }
                                }
                                categoryExpectedSpend[catId] = smartTotal;
                            } else {
                                // Average method baseline
                                categoryExpectedSpend[catId] = (categoryLookbackSpend[catId] / lookbackDays) * predictionDaysCount;
                            }
                        });
                        
                        // Fallback global smart daily spend for backward compatibility
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
                        }`;

const target2 = `                                    if (projectionMethod === 'smart') {
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
                                    }`;

const replace2 = `                                    if (projectionMethod === 'smart') {
                                        const dDay = d.getDate();
                                        const maxDaysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                                        
                                        if (isAdvancedMode) {
                                            dayAvgSpend = 0;
                                            allRelevantCategories.forEach(catId => {
                                                if (excludedPredictionCategories.includes(catId)) return;
                                                
                                                let baseDaySpend = smartDailySpendByCategory[catId][dDay] || 0;
                                                if (dDay === maxDaysInMonth) {
                                                    for (let extra = maxDaysInMonth + 1; extra <= 31; extra++) {
                                                        baseDaySpend += (smartDailySpendByCategory[catId][extra] || 0);
                                                    }
                                                }
                                                
                                                if (categoryOverrides[catId] !== undefined && categoryOverrides[catId] !== '') {
                                                    const overrideVal = Number(categoryOverrides[catId]);
                                                    const expectedBase = categoryExpectedSpend[catId];
                                                    if (expectedBase > 0) {
                                                        dayAvgSpend += baseDaySpend * (overrideVal / expectedBase);
                                                    } else {
                                                        // Fallback evenly if no history
                                                        dayAvgSpend += overrideVal / predictionDaysCount;
                                                    }
                                                } else {
                                                    dayAvgSpend += baseDaySpend;
                                                }
                                            });
                                        } else {
                                            dayAvgSpend = smartDailySpend[dDay] || 0;
                                            if (dDay === maxDaysInMonth) {
                                                for (let extra = maxDaysInMonth + 1; extra <= 31; extra++) {
                                                    dayAvgSpend += (smartDailySpend[extra] || 0);
                                                }
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
                                        if (isAdvancedMode) {
                                            dayAvgSpend = 0;
                                            allRelevantCategories.forEach(catId => {
                                                if (excludedPredictionCategories.includes(catId)) return;
                                                
                                                let baseDaySpend = categoryLookbackSpend[catId] / lookbackDays;
                                                if (categoryOverrides[catId] !== undefined && categoryOverrides[catId] !== '') {
                                                    const overrideVal = Number(categoryOverrides[catId]);
                                                    const expectedBase = categoryExpectedSpend[catId];
                                                    if (expectedBase > 0) {
                                                        dayAvgSpend += baseDaySpend * (overrideVal / expectedBase);
                                                    } else {
                                                        dayAvgSpend += overrideVal / predictionDaysCount;
                                                    }
                                                } else {
                                                    dayAvgSpend += baseDaySpend;
                                                }
                                            });
                                        }
                                        if (planningMode === 'history' && isMain) {
                                            dayRecurringInc = dailyRecurringIncome;
                                        }
                                    }`;

if (!content.includes(target1)) {
    console.error("Target 1 not found!");
} else {
    content = content.replace(target1, replace1);
    console.log("Target 1 replaced.");
}

if (!content.includes(target2)) {
    console.error("Target 2 not found!");
} else {
    content = content.replace(target2, replace2);
    console.log("Target 2 replaced.");
}

fs.writeFileSync(path, content, 'utf8');
