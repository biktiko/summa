import React, { useState } from 'react';
import HealthMetrics from './components/HealthMetrics';
import BiometricScanner from './components/BiometricScanner';
import { Activity, Dna } from 'lucide-react';

const HealthModule = ({
    userData,
    updateUser,
    biometricsActions,
    viewMode
}) => {
    const [statusTab, setStatusTab] = useState('metrics'); // 'metrics' | 'telemetry'

    // --- Privacy Logic ---
    const getModulePrivacy = () => userData.modulePrivacy?.health || {};
    const isModuleEnabled = getModulePrivacy().enabled !== false;

    const isSectionVisible = (sectionKey) => {
        if (!isModuleEnabled) return false;
        return getModulePrivacy().sections?.[sectionKey] !== false;
    };

    const toggleSectionVisibility = (sectionKey) => {
        const currentPrivacy = userData.modulePrivacy || {};
        const currentModule = currentPrivacy.health || {};
        const currentSections = currentModule.sections || {};

        const newState = {
            ...currentPrivacy,
            health: {
                ...currentModule,
                sections: {
                    ...currentSections,
                    [sectionKey]: !isSectionVisible(sectionKey)
                }
            }
        };
        updateUser({ modulePrivacy: newState });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Module Top Navigation (Tab Switcher only) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
                 {/* No Title */}
                 
                 {/* Internal Navigation */}
                 <div className="flex items-center gap-6 pb-1 overflow-x-auto">
                        <button
                            onClick={() => setStatusTab('metrics')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${statusTab === 'metrics' ? 'text-emerald-500' : 'text-slate-500 hover:text-blue-600'}`}
                        >
                            Body Metrics
                            {statusTab === 'metrics' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setStatusTab('telemetry')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${statusTab === 'telemetry' ? 'text-blue-500' : 'text-slate-500 hover:text-blue-600'}`}
                        >
                            Bio-Telemetry
                            {statusTab === 'telemetry' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
                        </button>
                 </div>
            </div>

            {/* Content, using statusTab */}
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex-1">
                        {statusTab === 'metrics' ? (
                            <HealthMetrics
                                userData={userData}
                                updateUser={updateUser}
                                viewMode={viewMode}
                                isSectionHidden={!isSectionVisible('metrics')}
                                toggleSectionVisibility={() => toggleSectionVisibility('metrics')}
                            />
                        ) : (
                            <BiometricScanner
                                biometrics={userData.biometrics || []}
                                actions={biometricsActions}
                                viewMode={viewMode}
                                isSectionHidden={!isSectionVisible('metrics')}
                                toggleSectionVisibility={() => toggleSectionVisibility('metrics')}
                            />
                        )}
                    </div>
            </div>
        </div>
    );
};

export default HealthModule;
