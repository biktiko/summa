import React from 'react';
import NotesBoard from '../../components/MissionControl/NotesBoard';
import { FileText } from 'lucide-react';

const BlogModule = ({
    userData,
    notesActions,
    viewMode
}) => {
    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col pt-4">
            <NotesBoard
                notes={userData.notes}
                actions={notesActions}
                viewMode={viewMode}
                moduleId={null} // Global
                isSectionHidden={false}
                toggleSectionVisibility={() => {}}
            />
        </div>
    );
};

export default BlogModule;
