import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Building,
  Calendar,
  Tag as TagIcon,
  Plus,
  Edit2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DetailSkeleton } from '../common/Skeleton';
import { ActivityTimeline } from '../activity/ActivityTimeline';
import { useContactDetail } from '../../hooks/useContactDetail';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/formatDate';
import type { Tag, ContactWithDetails } from '../../types';

export interface ContactDetailModalProps {
  contactId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: ContactWithDetails) => void;
  allTags: Tag[];
  onContactModified?: () => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contactId,
  isOpen,
  onClose,
  onEdit,
  allTags,
  onContactModified,
}) => {
  const { contact, loading, error, tagLoading, addTag, removeTag } =
    useContactDetail(isOpen ? contactId : null);
  const { showToast } = useToast();

  const [selectedTagToAdd, setSelectedTagToAdd] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleAddTag = async () => {
    if (!selectedTagToAdd) return;
    try {
      await addTag(selectedTagToAdd);
      showToast('Tag added successfully', 'success');
      setSelectedTagToAdd('');
      onContactModified?.();
    } catch (err: any) {
      showToast(err.message || 'Failed to add tag', 'error');
    }
  };

  const handleRemoveTag = async (tagId: string, tagName: string) => {
    try {
      await removeTag(tagId);
      showToast(`Tag "${tagName}" removed`, 'info');
      onContactModified?.();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove tag', 'error');
    }
  };

  const copyEmailToClipboard = () => {
    if (contact?.email) {
      navigator.clipboard.writeText(contact.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  if (!isOpen) return null;

  // Filter out tags already assigned to this contact
  const assignedTagIds = new Set(contact?.tags.map((t) => t.id) || []);
  const availableTagsToAdd = allTags.filter((t) => !assignedTagIds.has(t.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-400">
            {contact ? `ID: ${contact.id}` : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {contact && (
              <Button
                variant="primary"
                size="sm"
                icon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onEdit(contact);
                }}
              >
                Edit Contact
              </Button>
            )}
          </div>
        </div>
      }
    >
      {loading ? (
        <DetailSkeleton />
      ) : error ? (
        <div className="p-6 text-center text-rose-600 flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : contact ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {`${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {contact.firstName} {contact.lastName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {contact.company ? `${contact.company}` : 'No company specified'}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 space-y-0.5">
              <p>Created: {formatDateTime(contact.createdAt)}</p>
              <p>Updated: {formatDateTime(contact.updatedAt)}</p>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {contact.email || '—'}
                  </p>
                </div>
              </div>
              {contact.email && (
                <button
                  onClick={copyEmailToClipboard}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copy email"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Phone */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </p>
                <p className="text-xs font-medium text-slate-800">
                  {contact.phone || '—'}
                </p>
              </div>
            </div>

            {/* Company */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Company
                </p>
                <p className="text-xs font-medium text-slate-800">
                  {contact.company || '—'}
                </p>
              </div>
            </div>

            {/* Last Activity Date */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Last Updated
                </p>
                <p className="text-xs font-medium text-slate-800">
                  {formatDateTime(contact.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wider">
                <TagIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Assigned Tags</span>
              </div>
              <span className="text-xs text-slate-400">
                {contact.tags.length} assigned
              </span>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-slate-50 rounded-lg border border-slate-100">
              {contact.tags.length > 0 ? (
                contact.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    label={tag.name}
                    color={tag.color}
                    size="md"
                    onRemove={() => handleRemoveTag(tag.id, tag.name)}
                  />
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No tags assigned</span>
              )}
            </div>

            {/* Add Tag Row */}
            {availableTagsToAdd.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={selectedTagToAdd}
                  onChange={(e) => setSelectedTagToAdd(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  disabled={tagLoading}
                >
                  <option value="">Select a tag to add...</option>
                  {availableTagsToAdd.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleAddTag}
                  disabled={!selectedTagToAdd || tagLoading}
                  loading={tagLoading}
                >
                  Add Tag
                </Button>
              </div>
            )}
          </div>

          {/* Activity Audit History Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Recent Activity History
              </h3>
              <span className="text-xs text-slate-400">
                {contact.recentActivities?.length || 0} {contact.recentActivities?.length === 1 ? 'activity' : 'activities'}
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto pr-1">
              <ActivityTimeline activities={contact.recentActivities || []} />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ContactDetailModal;
