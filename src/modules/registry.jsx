import React from 'react';
import { Target, Activity, Globe, Coins, ShieldAlert, Sliders } from 'lucide-react';
import CareerModule from './Career/CareerModule';
import HealthModule from './Health/HealthModule';
import SettingsModule from '../components/Settings/SettingsModule';
import FinanceModule from './Finance/FinanceModule';

const LocalizationModule = () => <div className="p-8 text-neutral-500 font-mono uppercase">Localization Module // Offline</div>;

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
        id: 'localization',
        label: 'Localization',
        icon: Globe,
        component: LocalizationModule,
        description: 'Languages & Communication'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Sliders,
        component: SettingsModule,
        description: 'System Configuration'
    }
];
