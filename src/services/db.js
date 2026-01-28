/**
 * Mock Database Service
 * Simulates a relational database structure (PostgreSQL ready)
 * Persists to localStorage for now.
 */

const DB_KEY = 'life_os_db_v1';

// Initial Seed Data
const SEED_DATA = {
    users: [
        {
            id: 'u1', username: 'tigran', name: 'Tigran Badalyan', role: 'admin', energy: 85, balance: 1500, xp: 0,
            modulePrivacy: {
                career: {
                    enabled: true,
                    sections: {
                        cv: true, experience: true, skills: true, projects: true,
                        achievements: true, services: true, education: true, languages: true,
                        protocol: false, tasks: false, goals: false, notes: false
                    }
                },
                finance: { enabled: false },
                health: { enabled: false }
            }
        }
    ],
    skills: [
        { id: 's1', userId: 'u1', name: 'Python for Gamedev', level: 45, category: 'Technical', description: 'Core language for backend systems.', links: [] },
        { id: 's2', userId: 'u1', name: 'Writing GDD', level: 35, category: 'Product', description: 'Game Design Document standards.', links: [] },
        { id: 's3', userId: 'u1', name: 'Game Economy', level: 20, category: 'Product', description: 'Balancing sinks and sources.', links: [] },
        { id: 's4', userId: 'u1', name: 'English (Conversational)', level: 40, category: 'Languages', description: 'Daily standups.', links: [] }
    ],
    projects: [
        { id: 'p1', userId: 'u1', name: 'Martin Star Analytics', status: 'Active', impact: '+15% Retention', link: '#' },
        { id: 'p2', userId: 'u1', name: 'Life OS Prototype', status: 'In Development', impact: 'Architecture Stage', link: '#' }
    ],
    achievements: [
        { id: 'a1', userId: 'u1', title: 'Survivor', date: '2020-2023', type: 'Legacy' },
        { id: 'a2', userId: 'u1', title: 'Martin Star Offer', date: '2025', type: 'Career' }
    ],
    backlog: [],
    tasks: [],
    goals: [],
    notes: [],
    protocols: [],
    transactions: [],
    categories: [
        { id: 'c1', userId: 'u1', label: 'Food', type: 'expense', color: '#ef4444' },
        { id: 'c2', userId: 'u1', label: 'Transport', type: 'expense', color: '#3b82f6' },
        { id: 'c3', userId: 'u1', label: 'Entertainment', type: 'expense', color: '#a855f7' },
        { id: 'c4', userId: 'u1', label: 'Utilities', type: 'expense', color: '#eab308' },
        { id: 'c5', userId: 'u1', label: 'Income', type: 'income', color: '#22c55e' }
    ]
};

class MockDatabase {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
        } else {
            // Migration: Ensure new arrays exist
            const db = JSON.parse(localStorage.getItem(DB_KEY));
            let changed = false;
            ['tasks', 'goals', 'notes', 'protocols', 'transactions', 'categories'].forEach(key => {
                if (!db[key]) {
                    db[key] = SEED_DATA[key] || [];
                    changed = true;
                }
            });
            if (changed) {
                localStorage.setItem(DB_KEY, JSON.stringify(db));
            }
        }
    }

    _getDb() {
        return JSON.parse(localStorage.getItem(DB_KEY) || JSON.stringify(SEED_DATA));
    }

    _saveDb(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    // --- Generic Helpers ---

    async getUserData(userId) {
        const db = this._getDb();
        const user = db.users.find(u => u.id === userId);
        if (!user) return null;

        return {
            ...user,
            skills: (db.skills || []).filter(s => s.userId === userId),
            projects: (db.projects || []).filter(s => s.userId === userId),
            achievements: (db.achievements || []).filter(s => s.userId === userId),
            backlog: (db.backlog || []).filter(s => s.userId === userId),
            tasks: (db.tasks || []).filter(s => s.userId === userId),
            goals: (db.goals || []).filter(s => s.userId === userId),
            notes: (db.notes || []).filter(s => s.userId === userId),
            protocols: (db.protocols || []).filter(s => s.userId === userId),
            transactions: (db.transactions || []).filter(s => s.userId === userId),
            categories: (db.categories || []).filter(s => s.userId === userId)
        };
    }

    async updateUser(userId, updates) {
        const db = this._getDb();
        const index = db.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            db.users[index] = { ...db.users[index], ...updates };
            this._saveDb(db);
            return db.users[index];
        }
        return null;
    }

    // --- Generic CRUD Helper ---
    _addItem(collection, userId, data) {
        const db = this._getDb();
        if (!db[collection]) db[collection] = [];
        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            userId,
            createdAt: new Date().toISOString(),
            ...data
        };
        db[collection].push(newItem);
        this._saveDb(db);
        return newItem;
    }

    _updateItem(collection, id, updates) {
        const db = this._getDb();
        if (!db[collection]) return null;
        const index = db[collection].findIndex(i => i.id === id);
        if (index !== -1) {
            db[collection][index] = { ...db[collection][index], ...updates };
            this._saveDb(db);
            return db[collection][index];
        }
        return null;
    }

    _deleteItem(collection, id) {
        const db = this._getDb();
        if (!db[collection]) return false;
        db[collection] = db[collection].filter(i => i.id !== id);
        this._saveDb(db);
        return true;
    }

    // --- Skills ---
    async addSkill(userId, data) { return this._addItem('skills', userId, { level: 0, links: [], ...data }); }
    async updateSkill(id, updates) { return this._updateItem('skills', id, updates); }
    async deleteSkill(id) { return this._deleteItem('skills', id); }

    // --- Projects ---
    async addProject(userId, data) { return this._addItem('projects', userId, data); }
    async updateProject(id, updates) { return this._updateItem('projects', id, updates); }
    async deleteProject(id) { return this._deleteItem('projects', id); }

    // --- Services ---
    async addService(userId, data) { return this._addItem('services', userId, data); }
    async updateService(id, updates) { return this._updateItem('services', id, updates); }
    async deleteService(id) { return this._deleteItem('services', id); }

    // --- Education ---
    async addEducation(userId, data) { return this._addItem('education', userId, data); }
    async updateEducation(id, updates) { return this._updateItem('education', id, updates); }
    async deleteEducation(id) { return this._deleteItem('education', id); }

    // --- Experience ---
    async addExperience(userId, data) { return this._addItem('experience', userId, data); }
    async updateExperience(id, updates) { return this._updateItem('experience', id, updates); }
    async deleteExperience(id) { return this._deleteItem('experience', id); }

    // --- Languages ---
    async addLanguage(userId, data) { return this._addItem('languages', userId, data); }
    async updateLanguage(id, updates) { return this._updateItem('languages', id, updates); }
    async deleteLanguage(id) { return this._deleteItem('languages', id); }

    // --- Achievements ---
    async addAchievement(userId, data) { return this._addItem('achievements', userId, data); }
    async updateAchievement(id, updates) { return this._updateItem('achievements', id, updates); }
    async deleteAchievement(id) { return this._deleteItem('achievements', id); }

    // --- Tasks ---
    async addTask(userId, data) { return this._addItem('tasks', userId, { status: 'todo', ...data }); }
    async updateTask(id, updates) { return this._updateItem('tasks', id, updates); }
    async deleteTask(id) { return this._deleteItem('tasks', id); }

    // --- Goals ---
    async addGoal(userId, data) { return this._addItem('goals', userId, { progress: 0, ...data }); }
    async updateGoal(id, updates) { return this._updateItem('goals', id, updates); }
    async deleteGoal(id) { return this._deleteItem('goals', id); }

    // --- Notes ---
    async addNote(userId, data) { return this._addItem('notes', userId, data); }
    async updateNote(id, updates) { return this._updateItem('notes', id, updates); }
    async deleteNote(id) { return this._deleteItem('notes', id); }

    // --- Protocols ---
    async addProtocol(userId, data) { return this._addItem('protocols', userId, { isCompleted: false, streak: 0, ...data }); }
    async updateProtocol(id, updates) { return this._updateItem('protocols', id, updates); }
    async deleteProtocol(id) { return this._deleteItem('protocols', id); }

    // --- Biometrics & Supplements ---
    async addBiometric(userId, data) { return this._addItem('biometrics', userId, data); }
    async updateBiometric(id, updates) { return this._updateItem('biometrics', id, updates); }
    async deleteBiometric(id) { return this._deleteItem('biometrics', id); }

    async addSupplement(userId, data) { return this._addItem('supplements', userId, data); }
    async updateSupplement(id, updates) { return this._updateItem('supplements', id, updates); }
    async deleteSupplement(id) { return this._deleteItem('supplements', id); }

    // --- Finance (Transactions & Categories) ---
    async addTransaction(userId, data) { return this._addItem('transactions', userId, data); }
    async updateTransaction(id, updates) { return this._updateItem('transactions', id, updates); }
    async deleteTransaction(id) { return this._deleteItem('transactions', id); }

    async addCategory(userId, data) { return this._addItem('categories', userId, data); }
    async updateCategory(id, updates) { return this._updateItem('categories', id, updates); }
    async deleteCategory(id) { return this._deleteItem('categories', id); }

    // --- Generic XP ---

    async addXP(userId, amount) {
        const db = this._getDb();
        const user = db.users.find(u => u.id === userId);
        if (user) {
            user.xp = (user.xp || 0) + amount;
            this._saveDb(db);
            return user.xp;
        }
        return 0;
    }
}

export const db = new MockDatabase();
