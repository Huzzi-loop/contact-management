import React from 'react';
import { Tag as TagIcon, X, CheckSquare } from 'lucide-react';
import { Button } from '../common/Button';

export interface BulkActionBarProps {
  selectedCount: number;
  onManageTags: () => void;
  onClearSelection: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onManageTags,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-xl shadow-2xl px-4 sm:px-5 py-2.5 sm:py-3 border border-slate-700 flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[calc(100vw-2rem)] w-auto">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
          <CheckSquare className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold">
          {selectedCount} contact{selectedCount === 1 ? '' : 's'} selected
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={<TagIcon className="w-3.5 h-3.5" />}
          onClick={onManageTags}
        >
          Assign / Remove Tags
        </Button>

        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
