/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Target, Activity, Globe, Coins, Sliders, CheckSquare, FileText, LayoutDashboard } from 'lucide-react';
import PortfolioModule from './Portfolio/PortfolioModule';
import HealthModule from './Health/HealthModule';
import SettingsModule from '../components/Settings/SettingsModule';
import FinanceModule from './Finance/FinanceModule';
import TasksModule from './Tasks/TasksModule';
import BlogModule from './Blog/BlogModule';
import ProjectsModule from './Projects/ProjectsModule';


const NetworkModule = () => <div className="p-8 text-slate-500 font-mono uppercase">Network Module // Offline</div>;

export const MODULES = [
    {
        id: 'projects',
        label: 'Projects',
        icon: LayoutDashboard,
        component: ProjectsModule,
        description: 'Project & Client Hub'
    },
    {
        id: 'tasks',
        label: 'Tasks',
        icon: CheckSquare,
        component: TasksModule,
        description: 'Mission Control & Strategic Goals'
    },
    {
        id: 'blog',
        label: 'Blog',
        icon: FileText, // Used to be Notes
        component: BlogModule,
        description: 'Personal Knowledge Base'
    },
    {
        id: 'career', // Keeping ID as career for data compatibility
        label: 'Portfolio',
        icon: LayoutDashboard, // Was Target
        component: PortfolioModule,
        description: 'Skill Trees & Project Management'
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: Coins,
        component: FinanceModule,
        description: 'Wealth & Asset Management'
    },
    {
        id: 'health',
        label: 'Health',
        icon: Activity,
        component: HealthModule,
        description: 'Physical Health & Biometrics'
    },
    {
        id: 'network',
        label: 'Network',
        icon: Globe,
        component: NetworkModule,
        description: 'Connections & Communications'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Sliders,
        component: SettingsModule,
        description: 'System Configuration'
    }
];
