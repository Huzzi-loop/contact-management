import React, { useState } from 'react';
import { Tag as TagIcon, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../hooks/useToast';
import type { CreateTagDTO, Tag } from '../../types';

export interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (dto: CreateTagDTO) => Promise<Tag>;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export const CreateTagModal: React.FC<CreateTagModalProps> = ({
  isOpen,
  onClose,
  onCreateTag,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setColor('#3B82F6');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setLoading(true);
      await onCreateTag({ name: name.trim(), color });
      showToast(`Tag "${name.trim()}" created successfully`, 'success');
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TagIcon className="w-4 h-4" />
          </div>
          <span>Create New Tag</span>
        </div>
      }
      description="Define a new tag with custom label and color."
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
          >
            Create Tag
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tag Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. VIP, Prospect, Lead"
          required
          error={error}
          autoFocus
        />

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Color
          </label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              >
                {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Preview */}
        <div className="pt-2">
          <span className="block text-xs font-semibold text-slate-500 mb-1.5">Preview:</span>
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border"
            style={{
              backgroundColor: `${color}18`,
              borderColor: `${color}40`,
              color: color,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span>{name.trim() || 'Sample Tag'}</span>
          </span>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTagModal;
