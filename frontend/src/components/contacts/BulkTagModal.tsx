import React, { useState } from 'react';
import { Tag as TagIcon, Check, Plus, Minus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { contactsApi } from '../../api';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/errorHandler';
import type { Tag, BulkTagsDTO } from '../../types';

export interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContactIds: string[];
  availableTags: Tag[];
  onSuccess: () => void;
}

export const BulkTagModal: React.FC<BulkTagModalProps> = ({
  isOpen,
  onClose,
  selectedContactIds,
  availableTags,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setSelectedTagIds([]);
    setAction('add');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (selectedTagIds.length === 0) {
      showToast('Please select at least one tag', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload: BulkTagsDTO = {
        contactIds: selectedContactIds,
        tagIds: selectedTagIds,
        action,
      };

      const result = await contactsApi.bulkUpdateTags(payload);
      showToast(
        `Successfully ${action === 'add' ? 'assigned' : 'removed'} ${result.tagCount} tag(s) across ${result.affectedContacts} contact(s)`,
        'success'
      );
      handleClose();
      onSuccess();
    } catch (err: any) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TagIcon className="w-4 h-4" />
          </div>
          <span>Bulk Manage Tags</span>
        </div>
      }
      description={`Apply tag changes to ${selectedContactIds.length} selected contact${
        selectedContactIds.length === 1 ? '' : 's'
      }.`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
            disabled={selectedTagIds.length === 0}
          >
            Apply Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Action Toggle (Add vs Remove) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Action Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('add')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                action === 'add'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tags</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('remove')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                action === 'remove'
                  ? 'border-rose-600 bg-rose-50 text-rose-700 font-semibold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Remove Tags</span>
            </button>
          </div>
        </div>

        {/* Tags Selection List */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Tags to {action === 'add' ? 'Assign' : 'Remove'}
          </label>
          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? action === 'add'
                          ? 'border-blue-600 bg-blue-100/70 text-blue-800 font-semibold shadow-xs'
                          : 'border-rose-600 bg-rose-100/70 text-rose-800 font-semibold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          action === 'add' ? 'text-blue-700' : 'text-rose-700'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No tags available.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BulkTagModal;
