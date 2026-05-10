const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, callback);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            callback(fullPath);
        }
    });
}

function processFile(filePath) {
    let original = fs.readFileSync(filePath, 'utf8');
    let newContent = original;

    if (filePath.endsWith('.css')) {
        newContent = newContent.replace(/color-scheme: dark;/g, 'color-scheme: light;');
        newContent = newContent.replace(/bg-black/g, 'bg-slate-100');
        newContent = newContent.replace(/text-neutral-100/g, 'text-slate-900');
        newContent = newContent.replace(/bg-slate-200/g, 'bg-slate-300');
    }

    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        // GOALS BOARD SPECIFIC CLEANUP (Catching the dark cards and gradients)
        newContent = newContent.replace(/bg-gradient-to-br from-neutral-900\/80 to-black/g, 'bg-white shadow-sm border border-slate-200');
        newContent = newContent.replace(/bg-gradient-to-r from-yellow-900\/20 to-black/g, 'bg-slate-50 border border-slate-200');
        newContent = newContent.replace(/bg-green-900\/10/g, 'bg-green-50');
        newContent = newContent.replace(/from-yellow-900\/20 to-black/g, 'from-slate-50 to-white');
        
        // BACKGROUNDS
        newContent = newContent.replace(/bg-\[\#0A0A0A\]/g, 'bg-white shadow-xl border border-slate-200');
        newContent = newContent.replace(/bg-\[\#020202\]/g, 'bg-slate-50');
        newContent = newContent.replace(/bg-black\/40/g, 'bg-white shadow-sm');
        newContent = newContent.replace(/bg-black\/60/g, 'bg-white border border-slate-200 shadow-md');
        newContent = newContent.replace(/bg-black/g, 'bg-white'); // Fallback for pure bg-black
        newContent = newContent.replace(/bg-neutral-900\/20/g, 'bg-slate-100');
        newContent = newContent.replace(/bg-neutral-900\/80/g, 'bg-white shadow-sm border border-slate-200');
        newContent = newContent.replace(/bg-neutral-900/g, 'bg-white shadow-sm border border-slate-200');
        newContent = newContent.replace(/bg-neutral-800/g, 'bg-slate-200'); 
        
        // HOVERS & LIGHT BGS
        newContent = newContent.replace(/hover:bg-white\/5/g, 'hover:bg-slate-100');
        newContent = newContent.replace(/hover:bg-white\/10/g, 'hover:bg-slate-200');
        newContent = newContent.replace(/bg-white\/5/g, 'bg-slate-50');
        newContent = newContent.replace(/bg-white\/10/g, 'bg-slate-100 border border-slate-200');
        newContent = newContent.replace(/hover:text-white/g, 'hover:text-blue-600');

        // BORDERS
        newContent = newContent.replace(/border-white\/5/g, 'border-slate-200');
        newContent = newContent.replace(/border-white\/10/g, 'border-slate-300');
        newContent = newContent.replace(/border-white\/20/g, 'border-slate-300');
        newContent = newContent.replace(/border-neutral-600/g, 'border-slate-300');
        newContent = newContent.replace(/border-neutral-800/g, 'border-slate-200');
        newContent = newContent.replace(/border-yellow-500\/20/g, 'border-slate-200');
        newContent = newContent.replace(/border-yellow-500\/40/g, 'border-blue-500/40');

        // TEXT COLORS (General)
        newContent = newContent.replace(/text-white/g, 'TEXT_WHITE_MARKER');
        
        // Restore TEXT_WHITE_MARKER in colored contexts
        newContent = newContent.replace(/className=["`'](.*?)["`']/gs, (match, classes) => {
            if (classes.match(/bg-(blue|green|red|purple|pink|orange|emerald|teal|amber|yellow)-[56]00/) || 
                classes.match(/activeTabId\s*===/)) {
                return match.replace(/TEXT_WHITE_MARKER/g, 'text-white');
            }
            return match;
        });
        
        newContent = newContent.replace(/bg-(red|blue|green|purple|pink|orange|neutral)-500 TEXT_WHITE_MARKER/g, 'bg-$1-500 text-white');
        newContent = newContent.replace(/TEXT_WHITE_MARKER/g, 'text-slate-800');

        // Other Text colors
        newContent = newContent.replace(/text-neutral-100/g, 'text-slate-800');
        newContent = newContent.replace(/text-neutral-200/g, 'text-slate-700');
        newContent = newContent.replace(/text-neutral-300/g, 'text-slate-600');
        newContent = newContent.replace(/text-neutral-400/g, 'text-slate-500');
        newContent = newContent.replace(/text-neutral-500/g, 'text-slate-500');
        newContent = newContent.replace(/text-neutral-600/g, 'text-slate-400');

        // Unify "Strategic" colors (Amber/Yellow cleanup)
        newContent = newContent.replace(/text-yellow-500/g, 'text-amber-600');
        newContent = newContent.replace(/text-yellow-400/g, 'text-amber-600');
        newContent = newContent.replace(/border-yellow-500/g, 'border-amber-600');
        newContent = newContent.replace(/bg-yellow-500/g, 'bg-amber-600');
        newContent = newContent.replace(/bg-yellow-600/g, 'bg-amber-600');
        newContent = newContent.replace(/shadow-yellow-900\/20/g, 'shadow-amber-900/10');
        
        // Fix for Settings background default
        newContent = newContent.replace(/backgroundColor: '#020202'/g, "backgroundColor: '#f4f4f5'");
    }

    if (original !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated:', filePath);
    }
}

walk('./src', processFile);
console.log('Final Polish complete.');
