/**
 * Mock Database Service
 * Simulates a relational database structure (PostgreSQL ready)
 * Persists to localStorage for now.
 */

const DB_KEY = 'life_os_db_v9';

// Initial Seed Data
const SEED_DATA = {
    users: [
        {
            id: 'u1',
            username: 'tigran',
            email: 'btigran02@gmail.com',
            password: '5cf5c7ca60_P',
            name: 'Tigran Badalyan',
            role: 'admin',
            energy: 85,
            balance: 1500,
            xp: 0,
            cvLink: '#',
            portfolioLinks: [
                { id: 'pl1', name: 'GitHub', url: 'https://github.com/tigran' },
                { id: 'pl2', name: 'Behance', url: 'https://behance.net/tigran' }
            ],
            sectionVisibility: {
                cv: true,
                skills: true,
                projects: true,
                services: true,
                education: true,
                experience: true,
                languages: true,
                achievements: true,
                tasks: true,
                goals: true
            }
        }
    ],
    goals: [
        { id: 'g1', userId: 'u1', moduleId: 'career', title: '1 Million Dram Monthly Profit', type: 'numeric', target: 1000000, current: 350000, unit: 'AMD', deadline: '2026-12-31', status: 'active', linkedTaskIds: [], link: '#', linkName: 'Financial Plan', isHidden: false },
        { id: 'g2', userId: 'u1', moduleId: 'career', title: 'Reach Level 50 Architect', type: 'numeric', target: 50, current: 12, unit: 'LVL', deadline: '2026-06-01', status: 'active', linkedTaskIds: [], link: '', linkName: '', isHidden: false },
        { id: 'g3', userId: 'u1', moduleId: 'career', title: 'Launch MVP', type: 'boolean', target: 1, current: 0, unit: '', deadline: '2026-03-01', status: 'active', linkedTaskIds: ['1', '3'], link: '', linkName: '', isHidden: false }
    ],
    skills: [
        { id: 's1', userId: 'u1', name: 'Python for Gamedev', level: 45, category: 'Technical', description: 'Core language for backend systems.', links: [], isHidden: false },
        { id: 's2', userId: 'u1', name: 'Writing GDD', level: 35, category: 'Product', description: 'Game Design Document standards.', links: [], isHidden: false },
        { id: 's3', userId: 'u1', name: 'Game Economy', level: 20, category: 'Product', description: 'Balancing sinks and sources.', links: [], isHidden: false }
    ],
    languages: [
        { id: 'l1', userId: 'u1', name: 'English', level: 'C1 (Advanced)', description: 'Capable of complex technical discussions and documentation.', link: '#', linkName: 'Certificate', isHidden: false },
        { id: 'l2', userId: 'u1', name: 'Russian', level: 'Native', description: 'Full professional and native proficiency.', link: '#', linkName: 'Diplom', isHidden: false },
        { id: 'l3', userId: 'u1', name: 'Armenian', level: 'Native', description: 'Native speaker.', link: '#', linkName: '', isHidden: false }
    ],
    projects: [
        { id: 'p1', userId: 'u1', name: 'Martin Star Analytics', status: 'Active', impact: '+15% Retention', link: '#', linkName: 'Live Dashboard', description: 'Built a custom analytics dashboard tracking real-time player behavior and economy sinks.', isHidden: false },
        { id: 'p2', userId: 'u1', name: 'Life OS Prototype', status: 'In Development', impact: 'Architecture Stage', link: '#', linkName: 'Repo', description: 'Gamified personal management system treating life as a RPG.', isHidden: false }
    ],
    services: [
        { id: 'srv1', userId: 'u1', title: 'Game Economy Design', price: '$50/hr', timeframe: 'Ongoing', description: 'Complete economy balancing, sink/source modeling, and inflation control for F2P games.', link: '#', linkName: 'Book Now', isHidden: false },
        { id: 'srv2', userId: 'u1', title: 'Technical Consultation', price: '$100/hr', timeframe: 'Per Session', description: 'Architecture review for Unity/Unreal projects and backend scalability assessment.', link: '#', linkName: 'Schedule', isHidden: false },
        { id: 'srv3', userId: 'u1', title: 'GDD Creation', price: '$400/doc', timeframe: '1 Week', description: 'Comprehensive Game Design Document creation including mechanics, loops, and monetization.', link: '#', linkName: 'Samples', isHidden: false }
    ],
    education: [
        { id: 'edu1', userId: 'u1', institution: 'Yerevan State University', degree: 'Bachelor of Computer Science', year: '2018-2022', description: 'Specialized in Algorithms, Data Structures, and Software Engineering principles.', link: '#', linkName: 'Diploma', isHidden: false },
        { id: 'edu2', userId: 'u1', institution: 'Game Dev Academy', degree: 'Certificate in Game Design', year: '2021', description: 'Intensive course on level design and player psychology.', link: '#', linkName: 'Certificate', isHidden: false }
    ],
    experience: [
        { id: 'exp1', userId: 'u1', company: 'Martin Star', role: 'Product Manager', duration: '2023 - Present', description: 'Leading a cross-functional team of 10. Responsible for roadmap, sprint planning, and feature delivery. Increased DAU by 20%.', link: '#', linkName: 'Company Site', isHidden: false },
        { id: 'exp2', userId: 'u1', company: 'Indie Studio', role: 'Junior Game Designer', duration: '2021 - 2022', description: 'Designed core mechanics for a mobile puzzle game. Balanced 50+ levels.', link: '#', linkName: 'Game Link', isHidden: false }
    ],
    achievements: [
        { id: 'a1', userId: 'u1', title: 'Startup Survivor', date: '2020-2023', type: 'Legacy', description: 'Navigated a high-growth startup through 3 funding rounds and a market pivot.', link: '#', linkName: 'Press Release', isHidden: false },
        { id: 'a2', userId: 'u1', title: 'Martin Star Offer', date: '2025', type: 'Career', description: 'Secured a lead role at a top gaming company.', link: '#', linkName: 'Offer Letter', isHidden: false },
        { id: 'a3', userId: 'u1', title: 'Hackathon Winner', date: '2022', type: 'Award', description: 'Best Gameplay Mechanics award at Global Game Jam 2022.', link: '#', linkName: 'Devpost', isHidden: false }
    ],
    tasks: [
        { id: '1', userId: 'u1', moduleId: 'career', title: 'Refactor Auth System', status: 'done', priority: 'high', description: 'Move to JWT based auth.', xpReward: 50, coinReward: 100, link: '#', linkName: 'PR Link', isHidden: false },
        { id: '2', userId: 'u1', moduleId: 'career', title: 'Design Task Board', status: 'in_progress', priority: 'medium', description: 'Kanban style board for tasks.', xpReward: 30, coinReward: 50, link: '#', linkName: 'Figma', isHidden: false },
        { id: '3', userId: 'u1', moduleId: 'career', title: 'Mobile Optimization', status: 'todo', priority: 'high', description: 'Fix layout on iPhone SE.', xpReward: 40, coinReward: 80, link: '#', linkName: 'Ticket', isHidden: false, targetValue: 100, currentValue: 20, unit: '%' },
        { id: '4', userId: 'u1', moduleId: 'finance', title: 'Setup Stripe', status: 'todo', priority: 'high', description: 'Integration for payments.' }
    ],
    backlog: [],
    notes: [
        { id: 'n1', userId: 'u1', moduleId: 'career', title: 'Game Idea: Space Trader', content: 'Core loop: Buy low, sell high. Factions: Pirates, Federation, Aliens.', tags: [{ text: 'Idea', color: 'bg-purple-500 text-white' }], isPinned: true, isPublic: false, createdAt: '2026-01-15T10:00:00Z' }
    ],
    protocols: [
        { id: 'pr1', userId: 'u1', title: 'Morning Stretch', isCompleted: false, lastCompletedDate: '' },
        { id: 'pr2', userId: 'u1', title: 'Creatine 5g', isCompleted: false, lastCompletedDate: '' },
        { id: 'pr3', userId: 'u1', title: 'No Sugar', isCompleted: false, lastCompletedDate: '' }
    ],
    biometrics: [
        {
            id: 'bio1', userId: 'u1', name: 'Vitamin D', value: 30, unit: 'ng/mL', category: 'Vitamins & Minerals',
            optimalMin: 30, optimalMax: 100, criticalMin: 20, criticalMax: 150, target: 50,
            description: 'Crucial for bone health and immune function. Levels below 20 are deficient.',
            lastUpdated: '2025-10-10',
            history: [{ date: '2025-10-01', value: 25 }, { date: '2025-10-10', value: 30 }]
        },
        {
            id: 'bio2', userId: 'u1', name: 'Ferritin', value: 15, unit: 'ng/mL', category: 'Blood Panel',
            optimalMin: 30, optimalMax: 400, criticalMin: 10, criticalMax: 500, target: 100,
            description: 'Iron storage protein. Low levels indicate iron deficiency anemia.',
            lastUpdated: '2025-10-10',
            history: []
        },
        {
            id: 'bio3', userId: 'u1', name: 'TSH', value: 2.5, unit: 'mIU/L', category: 'Hormones',
            optimalMin: 0.4, optimalMax: 4.0, criticalMin: 0.1, criticalMax: 10.0, target: 2.0,
            description: 'Thyroid Stimulating Hormone. Key indicator of thyroid function.',
            lastUpdated: '2025-10-10',
            history: []
        }
    ],
    supplements: [
        { id: 'sup1', userId: 'u1', name: 'Magnesium', time: '21:00', isTaken: false, lastTakenDate: '' },
        { id: 'sup2', userId: 'u1', name: 'Omega-3', time: '09:00', isTaken: false, lastTakenDate: '' },
        { id: 'sup3', userId: 'u1', name: 'Vitamin D3', time: '09:00', isTaken: false, lastTakenDate: '' }
    ]
};

export class MockDatabase {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
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
            skills: db.skills.filter(s => s.userId === userId),
            languages: db.languages ? db.languages.filter(s => s.userId === userId) : [],
            projects: db.projects.filter(s => s.userId === userId),
            services: db.services ? db.services.filter(s => s.userId === userId) : [],
            education: db.education ? db.education.filter(s => s.userId === userId) : [],
            experience: db.experience ? db.experience.filter(s => s.userId === userId) : [],
            achievements: db.achievements.filter(s => s.userId === userId),
            tasks: db.tasks ? db.tasks.filter(s => s.userId === userId) : [],
            goals: db.goals ? db.goals.filter(s => s.userId === userId) : [],
            backlog: db.backlog ? db.backlog.filter(s => s.userId === userId) : [],
            notes: db.notes ? db.notes.filter(s => s.userId === userId) : [],
            protocols: db.protocols ? db.protocols.filter(s => s.userId === userId) : [],
            biometrics: db.biometrics ? db.biometrics.filter(s => s.userId === userId) : [],
            supplements: db.supplements ? db.supplements.filter(s => s.userId === userId) : []
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
    async _addItem(collection, userId, itemData) {
        const db = this._getDb();
        if (!db[collection]) db[collection] = [];

        let newItemId;
        if (collection === 'tasks') {
            // Find max numeric ID
            const maxId = db[collection].reduce((max, item) => {
                const numId = parseInt(item.id);
                return !isNaN(numId) && numId > max ? numId : max;
            }, 0);
            newItemId = (maxId + 1).toString();
        } else {
            newItemId = Date.now().toString();
        }

        const newItem = { id: newItemId, userId, ...itemData };
        db[collection].push(newItem);
        this._saveDb(db);
        return newItem;
    }

    async _updateItem(collection, itemId, updates) {
        const db = this._getDb();
        if (!db[collection]) return null;
        const index = db[collection].findIndex(i => i.id === itemId);
        if (index !== -1) {
            db[collection][index] = { ...db[collection][index], ...updates };
            this._saveDb(db);
            return db[collection][index];
        }
        return null;
    }

    async _deleteItem(collection, itemId) {
        const db = this._getDb();
        if (!db[collection]) return false;
        db[collection] = db[collection].filter(i => i.id !== itemId);
        this._saveDb(db);
        return true;
    }

    // --- Specific Methods (Wrappers) ---

    // Skills
    async addSkill(userId, data) { return this._addItem('skills', userId, data); }
    async updateSkill(id, data) { return this._updateItem('skills', id, data); }
    async deleteSkill(id) { return this._deleteItem('skills', id); }

    // Projects
    async addProject(userId, data) { return this._addItem('projects', userId, data); }
    async updateProject(id, data) { return this._updateItem('projects', id, data); }
    async deleteProject(id) { return this._deleteItem('projects', id); }

    // Services
    async addService(userId, data) { return this._addItem('services', userId, data); }
    async updateService(id, data) { return this._updateItem('services', id, data); }
    async deleteService(id) { return this._deleteItem('services', id); }

    // Languages
    async addLanguage(userId, data) { return this._addItem('languages', userId, data); }
    async updateLanguage(id, data) { return this._updateItem('languages', id, data); }
    async deleteLanguage(id) { return this._deleteItem('languages', id); }

    // Education
    async addEducation(userId, data) { return this._addItem('education', userId, data); }
    async updateEducation(id, data) { return this._updateItem('education', id, data); }
    async deleteEducation(id) { return this._deleteItem('education', id); }

    // Experience
    async addExperience(userId, data) { return this._addItem('experience', userId, data); }
    async updateExperience(id, data) { return this._updateItem('experience', id, data); }
    async deleteExperience(id) { return this._deleteItem('experience', id); }

    // Achievements
    async addAchievement(userId, data) { return this._addItem('achievements', userId, data); }
    async updateAchievement(id, data) { return this._updateItem('achievements', id, data); }
    async deleteAchievement(id) { return this._deleteItem('achievements', id); }

    // Tasks
    async addTask(userId, data) { return this._addItem('tasks', userId, data); }
    async updateTask(id, data) { return this._updateItem('tasks', id, data); }
    async deleteTask(id) { return this._deleteItem('tasks', id); }

    // Goals
    async addGoal(userId, data) { return this._addItem('goals', userId, data); }
    async updateGoal(id, data) { return this._updateItem('goals', id, data); }
    async deleteGoal(id) { return this._deleteItem('goals', id); }

    // Notes
    async addNote(userId, data) { return this._addItem('notes', userId, data); }
    async updateNote(id, data) { return this._updateItem('notes', id, data); }
    async deleteNote(id) { return this._deleteItem('notes', id); }

    // Protocols
    async addProtocol(userId, data) { return this._addItem('protocols', userId, data); }
    async updateProtocol(id, data) { return this._updateItem('protocols', id, data); }
    async deleteProtocol(id) { return this._deleteItem('protocols', id); }

    // Biometrics
    async addBiometric(userId, data) { return this._addItem('biometrics', userId, data); }
    async updateBiometric(id, data) {
        const db = this._getDb();
        const index = db.biometrics.findIndex(b => b.id === id);
        if (index !== -1) {
            const oldItem = db.biometrics[index];
            // Create history entry if value changed
            if (data.value !== undefined && data.value !== oldItem.value) {
                const historyEntry = {
                    date: new Date().toISOString().split('T')[0],
                    value: oldItem.value // Save old value
                };
                data.history = [...(oldItem.history || []), historyEntry];
            }
            return this._updateItem('biometrics', id, data);
        }
        return null;
    }
    async deleteBiometric(id) { return this._deleteItem('biometrics', id); }

    // Supplements
    async addSupplement(userId, data) { return this._addItem('supplements', userId, data); }
    async updateSupplement(id, data) { return this._updateItem('supplements', id, data); }
    async deleteSupplement(id) { return this._deleteItem('supplements', id); }


    // --- Auth ---

    async authenticateUser(email, password) {
        const db = this._getDb();
        const user = db.users.find(u => u.email === email && u.password === password);
        return user || null;
    }

    async createUser(email, password, name) {
        const db = this._getDb();

        // Check if exists
        if (db.users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: 'u' + Date.now(),
            email,
            password,
            name,
            role: 'user',
            energy: 100,
            balance: 0,
            xp: 0
        };

        db.users.push(newUser);
        this._saveDb(db);
        return newUser;
    }

    // --- Generic XP / Tasks ---

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
