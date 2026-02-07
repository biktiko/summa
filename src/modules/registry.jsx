/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Target, Activity, Globe, Coins, ShieldAlert, Sliders } from 'lucide-react';
import CareerModule from './Career/CareerModule';
import HealthModule from './Health/HealthModule';
import SettingsModule from '../components/Settings/SettingsModule';
import FinanceModule from './Finance/FinanceModule';


const NetworkModule = () => <div className="p-8 text-neutral-500 font-mono uppercase">Network Module // Offline</div>;

export const MODULES = [
    {
        id: 'career',
        label: 'Career',
        icon: Target,
        component: CareerModule,
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
