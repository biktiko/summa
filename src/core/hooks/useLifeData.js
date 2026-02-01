import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';

export const useLifeData = (activeUserId, initialViewMode = 'admin') => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(initialViewMode); // 'admin' | 'guest'

    // Use the passed activeUserId if available, otherwise default to 'u1' (for dev)
    const userId = activeUserId || 'u1';

    const refreshData = async () => {
        if (!userId) return;
        const data = await db.getUserData(userId);
        setUserData(data);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await refreshData();
            setLoading(false);
        };
        init();
    }, [userId]);

    // Derived State
    const totalXP = userData ? userData.xp : 0;
    const level = Math.floor(totalXP / 1000) + 1;

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
    // Tasks
    const tasksActions = createCRUD('tasks', db.addTask.bind(db), db.updateTask.bind(db), db.deleteTask.bind(db));
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
            categories: filterForGuest(userData.categories)
        } : {
            skills: [], projects: [], achievements: [],
            services: [], education: [], experience: [], languages: [], tasks: [], goals: [],
            balance: 0,
            transactions: [], categories: []
        },
        loading,
        setUserData,
        totalXP,
        level,

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
        transactionsActions: createCRUD('transactions', (u, d) => db.addTransaction(u, d), (id, d) => db.updateTransaction(id, d), (id) => db.deleteTransaction(id)),
        categoriesActions: createCRUD('categories', (u, d) => db.addCategory(u, d), (id, d) => db.updateCategory(id, d), (id) => db.deleteCategory(id)),

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
