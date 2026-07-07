import React, { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

const DateRangePicker = ({ label, range, setRange, presets }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCustom, setIsCustom] = useState(false);

    let activePreset = presets.find(p => !p.isCustom && p.getRange().start === range.start && p.getRange().end === range.end)?.label;
    if (!activePreset) activePreset = isCustom ? 'Custom Range' : `${new Date(range.start).toLocaleDateString()} - ${new Date(range.end).toLocaleDateString()}`;

    return (
        <div className="flex-[1.5] space-y-1 w-full relative z-40">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold cursor-pointer flex justify-between items-center h-[38px] transition-all ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
            >
                <span className="truncate flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {activePreset}
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
            </div>
            {isOpen && (
                <div className="absolute top-[60px] left-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden w-72 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Quick Select</div>
                        <div className="grid grid-cols-2 gap-1">
                            {presets.filter(p => !p.isCustom).map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => { setRange(p.getRange()); setIsCustom(false); setIsOpen(false); }}
                                    className={`text-[10px] p-2 rounded-lg font-bold transition-colors text-left ${activePreset === p.label ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-600'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex justify-between items-center">
                            <span>Custom Range</span>
                            <button onClick={() => setIsCustom(true)} className="text-blue-500 hover:text-blue-700">Select</button>
                        </div>
                        {isCustom && (
                            <div className="flex flex-col gap-2">
                                <input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-bold" />
                                <div className="text-center text-slate-300 font-black text-xs">TO</div>
                                <input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-bold" />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {isOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
};

export default DateRangePicker;
