import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';

export const useLifeData = (activeUserId, initialViewMode = 'admin') => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(initialViewMode); // 'admin' | 'guest'

    // Use the passed activeUserId if available, otherwise default to 'u1' (for dev)
    const userId = activeUserId || 'u1';

    const refreshData = useCallback(async () => {
        if (!userId) return;
        const data = await db.getUserData(userId);
        
        // Month End Gamification Reconciliation
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        let needsUpdate = false;
        let updateData = {};
        
        if (data.financeLastProcessedMonth && data.financeLastProcessedMonth !== currentMonth) {
            const monthToProcess = data.financeLastProcessedMonth;
            let xpReward = 0;
            let coinsReward = 0;
            
            const categories = data.categories || [];
            const transactions = data.transactions || [];
            
            categories.forEach(cat => {
                if (cat.budget && cat.budget > 0) {
                    const spent = transactions
                        .filter(t => t.type === 'expense' && t.categoryId === cat.id && t.date.startsWith(monthToProcess))
                        .reduce((sum, t) => sum + Number(t.amount), 0);
                        
                    if (spent <= cat.budget) {
                        xpReward += 50;
                        coinsReward += 1;
                    }
                }
            });
            
            if (xpReward > 0 || coinsReward > 0) {
                await db.addXP(userId, xpReward);
                updateData.balance = (data.balance || 0) + coinsReward;
            }
            
            updateData.financeLastProcessedMonth = currentMonth;
            needsUpdate = true;
        } else if (!data.financeLastProcessedMonth) {
            updateData.financeLastProcessedMonth = currentMonth;
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            await db.updateUser(userId, updateData);
            const freshData = await db.getUserData(userId);
            setUserData(freshData);
        } else {
            setUserData(data);
        }
    }, [userId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await refreshData();
            setLoading(false);
        };
        init();
    }, [refreshData]);

    // Derived State
    const totalXP = userData ? userData.xp : 0;
    
    // Leveling Algorithm: Arithmetic Progression (Step = 100)
    // Level 1 -> 2: 100 XP
    // Level 2 -> 3: 200 XP
    // Level 3 -> 4: 300 XP
    // Total XP to reach Level L = (L-1)/2 * (2*100 + (L-2)*100) ... Sum of arithmetic series 100, 200...
    // Sum = 100 * (L*(L-1)/2) = 50 * L * (L-1)
    // Inverse: L^2 - L - (TotalXP / 50) = 0
    // L = (1 + sqrt(1 + 4 * (TotalXP/50))) / 2 = (1 + sqrt(1 + 0.08 * TotalXP)) / 2
    
    const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 0.08 * totalXP)) / 2));
    
    // Calculate Progress within current level
    const xpStartOfCurrentLevel = 50 * level * (level - 1);
    const xpRequiredForNextLevel = level * 100; // Delta required to level up
    const xpProgressInLevel = totalXP - xpStartOfCurrentLevel;

    // --- Actions ---

    const createCRUD = (entityName, addFn, updateFn, deleteFn) => {
        return {
            add: async (data) => {
                if (viewMode === 'guest') return;
                await addFn(userId, data);
                refreshData();
            },
            update: async (id, updates) => {
                if (viewMode === 'guest') return;
                await updateFn(id, updates);
                refreshData();
            },
            delete: async (id) => {
                if (viewMode === 'guest') return;
                await deleteFn(id);
                refreshData();
            }
        };
    };

    // Skills
    const skillsActions = createCRUD('skills', db.addSkill.bind(db), db.updateSkill.bind(db), db.deleteSkill.bind(db));
    // Projects
    const projectsActions = createCRUD('projects', db.addProject.bind(db), db.updateProject.bind(db), db.deleteProject.bind(db));
    // Services
    const servicesActions = createCRUD('services', db.addService.bind(db), db.updateService.bind(db), db.deleteService.bind(db));
    // Education
    const educationActions = createCRUD('education', db.addEducation.bind(db), db.updateEducation.bind(db), db.deleteEducation.bind(db));
    // Experience
    const experienceActions = createCRUD('experience', db.addExperience.bind(db), db.updateExperience.bind(db), db.deleteExperience.bind(db));
    // Languages
    const languagesActions = createCRUD('languages', db.addLanguage.bind(db), db.updateLanguage.bind(db), db.deleteLanguage.bind(db));
    // Achievements
    const achievementsActions = createCRUD('achievements', db.addAchievement.bind(db), db.updateAchievement.bind(db), db.deleteAchievement.bind(db));
    // Tasks (Optimistic)
    const tasksActions = {
        add: async (data) => {
            if (viewMode === 'guest') return;
            const tempId = 'opt-' + Date.now();
            const optimisticTask = { ...data, id: tempId, isOptimistic: true };
            
            // Optimistic Update
            setUserData(prev => ({
                ...prev,
                tasks: [...(prev.tasks || []), optimisticTask]
            }));

            try {
                await db.addTask(userId, data);
                // Refresh to get real ID
                refreshData();
            } catch (e) {
                console.error("Add task failed", e);
                // Revert
                setUserData(prev => ({
                    ...prev,
                    tasks: prev.tasks.filter(t => t.id !== tempId)
                }));
            }
        },
        update: async (id, updates) => {
            if (viewMode === 'guest') return;
            
            // Snapshot for revert
            const previousTasks = userData.tasks;
            
            // Optimistic Update
            setUserData(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
            }));

            try {
                await db.updateTask(id, updates);
                // Silent refresh to ensure consistency
                refreshData();
            } catch (e) {
                console.error("Update task failed", e);
                // Revert
                setUserData(prev => ({
                    ...prev,
                    tasks: previousTasks
                }));
            }
        },
        delete: async (id) => {
            if (viewMode === 'guest') return;
            
            const previousTasks = userData.tasks;
            
            // Optimistic
            setUserData(prev => ({
                ...prev,
                tasks: prev.tasks.filter(t => t.id !== id)
            }));

            try {
                await db.deleteTask(id);
                refreshData();
            } catch (e) {
                console.error("Delete task failed", e);
                setUserData(prev => ({
                    ...prev,
                    tasks: previousTasks
                }));
            }
        }
    };
    // Goals
    const goalsActions = createCRUD('goals', db.addGoal.bind(db), db.updateGoal.bind(db), db.deleteGoal.bind(db));
    // Notes
    const notesActions = createCRUD('notes', db.addNote.bind(db), db.updateNote.bind(db), db.deleteNote.bind(db));
    // Protocols
    const protocolsActions = createCRUD('protocols', db.addProtocol.bind(db), db.updateProtocol.bind(db), db.deleteProtocol.bind(db));

    // Legacy Support (for existing SkillTree component if not refactored yet)
    const updateSkillLevel = async (id, amount) => {
        if (viewMode === 'guest') return;
        const skill = userData.skills.find(s => s.id === id);
        if (skill) {
            await db.updateSkill(id, { level: Math.min(100, Math.max(0, skill.level + amount)) });
            refreshData();
        }
    };

    const addNewSkill = async (skillData) => {
        if (viewMode === 'guest') return;
        await db.addSkill(userId, skillData);
        refreshData();
    };

    const updateSkillDetails = async (id, updates) => {
        if (viewMode === 'guest') return;
        await db.updateSkill(id, updates);
        refreshData();
    };

    const deleteSkill = async (id) => {
        if (viewMode === 'guest') return;
        await db.deleteSkill(id);
        refreshData();
    };

    const processTask = async (task) => {
        if (viewMode === 'guest') return;

        // Add Rewards
        if (task.xpReward) await db.addXP(userId, parseInt(task.xpReward));
        if (task.coinReward) {
            const user = await db.getUserData(userId);
            await db.updateUser(userId, { balance: (user.balance || 0) + parseInt(task.coinReward) });
        }

        refreshData();
    };

    const updateUserCv = async (link) => {
        if (viewMode === 'guest') return;
        await db.updateUser(userId, { cvLink: link });
        refreshData();
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'admin' ? 'guest' : 'admin');
    };

    // Filter data for Guest Mode
    const filterForGuest = (items) => {
        if (viewMode === 'admin') return items;
        return items ? items.filter(item => !item.isHidden) : [];
    };

    return {
        userData: userData ? {
            ...userData,
            skills: filterForGuest(userData.skills),
            projects: filterForGuest(userData.projects),
            services: filterForGuest(userData.services),
            education: filterForGuest(userData.education),
            experience: filterForGuest(userData.experience),
            languages: filterForGuest(userData.languages),
            achievements: filterForGuest(userData.achievements),
            tasks: filterForGuest(userData.tasks),
            goals: filterForGuest(userData.goals),
            notes: filterForGuest(userData.notes),
            protocols: filterForGuest(userData.protocols),
            biometrics: filterForGuest(userData.biometrics),
            supplements: filterForGuest(userData.supplements),
            transactions: filterForGuest(userData.transactions),
            categories: filterForGuest(userData.categories),
            accounts: filterForGuest(userData.accounts),
            wishlists: filterForGuest(userData.wishlists)
        } : {
            skills: [], projects: [], achievements: [],
            services: [], education: [], experience: [], languages: [], tasks: [], goals: [],
            balance: 0,
            transactions: [], categories: [], accounts: [], wishlists: []
        },
        loading,
        setUserData,
        totalXP,
        level,
        xpRequiredForNextLevel,
        xpProgressInLevel,

        // Actions
        updateSkillLevel,
        addNewSkill,
        updateSkillDetails,
        deleteSkill,
        updateUserCv,

        // Expose CRUDs
        skillsActions,
        projectsActions,
        servicesActions,
        educationActions,
        experienceActions,
        languagesActions,
        achievementsActions,
        tasksActions,
        goalsActions,
        notesActions,
        protocolsActions,
        biometricsActions: createCRUD('biometrics', (u, d) => db.addBiometric(u, d), (id, d) => db.updateBiometric(id, d), (id) => db.deleteBiometric(id)),
        supplementsActions: createCRUD('supplements', (u, d) => db.addSupplement(u, d), (id, d) => db.updateSupplement(id, d), (id) => db.deleteSupplement(id)),
        categoriesActions: {
            add: async (data) => {
                if (viewMode === 'guest') return;
                await db.addCategory(userId, data);
                await db.addXP(userId, 10);
                refreshData();
            },
            update: async (id, data) => {
                if (viewMode === 'guest') return;
                await db.updateCategory(id, data);
                refreshData();
            },
            delete: async (id) => {
                if (viewMode === 'guest') return;
                await db.deleteCategory(id);
                await db.addXP(userId, -10);
                refreshData();
            }
        },
        transactionsActions: {
            add: async (data) => {
                if (viewMode === 'guest') return;
                
                if (data.type === 'expense' && data.categoryId) {
                    const category = userData.categories?.find(c => c.id === data.categoryId);
                    if (category && category.budget && category.budget > 0) {
                        const currentMonth = new Date().toISOString().slice(0, 7);
                        const penaltyKey = `${data.categoryId}-${currentMonth}`;
                        const penalties = userData.overbudgetPenalties || {};
                        
                        if (!penalties[penaltyKey]) {
                            const spentSoFar = (userData.transactions || [])
                                .filter(t => t.type === 'expense' && t.categoryId === data.categoryId && t.date.startsWith(currentMonth))
                                .reduce((sum, t) => sum + Number(t.amount), 0);
                                
                            const newTotal = spentSoFar + Number(data.amount);
                            
                            if (newTotal >= category.budget * 1.1) {
                                await db.addXP(userId, -100);
                                penalties[penaltyKey] = true;
                                await db.updateUser(userId, { overbudgetPenalties: penalties });
                            }
                        }
                    }
                }
                
                await db.addTransaction(userId, data);
                await db.addXP(userId, 5);
                refreshData();
            },
            update: async (id, data) => {
                if (viewMode === 'guest') return;
                await db.updateTransaction(id, data);
                refreshData();
            },
            delete: async (id) => {
                if (viewMode === 'guest') return;
                await db.deleteTransaction(id);
                await db.addXP(userId, -5);
                refreshData();
            }
        },
        accountsActions: createCRUD('accounts', (u, d) => db.addAccount(u, d), (id, d) => db.updateAccount(id, d), (id) => db.deleteAccount(id)),
        wishlistActions: createCRUD('wishlists', (u, d) => db.addWishlist(u, d), (id, d) => db.updateWishlist(id, d), (id) => db.deleteWishlist(id)),

        processTask,
        viewMode,
        toggleViewMode,
        userId,
        updateUser: async (data) => {
            if (viewMode === 'guest') return;
            await db.updateUser(userId, data);
            refreshData();
        }
    };
};
