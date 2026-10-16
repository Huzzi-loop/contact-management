import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { ContactWithDetails, OccConflictDetails } from '../../types';

export interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictDetails?: OccConflictDetails<ContactWithDetails>;
  onReloadLatest: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  onClose,
  conflictDetails,
  onReloadLatest,
}) => {
  if (!isOpen) return null;

  const latest = conflictDetails?.latestContact;
  const currentVer = conflictDetails?.currentVersion ?? latest?.version;
  const submittedVer = conflictDetails?.submittedVersion;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Concurrent Update Conflict</span>
        </div>
      }
      description="Another user or session modified this contact while you were viewing or editing it."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onReloadLatest}
          >
            Reload Latest Version
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
          <p className="font-semibold mb-1">
            Optimistic Concurrency Control (OCC) Protected Overwrite
          </p>
          <p>
            Your form was loaded with version <strong>v{submittedVer || '1'}</strong>, but the database has already been updated to version <strong>v{currentVer || '2'}</strong>.
            To avoid accidentally overwriting their changes, please reload the latest data.
          </p>
        </div>

        {/* Server's Latest Snapshot */}
        {latest && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Latest Data on Server:
            </h4>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-medium text-slate-900">
                  {latest.firstName} {latest.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-medium text-slate-900">{latest.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-slate-900">{latest.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-medium text-slate-900">{latest.company || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Record Version:</span>
                <span className="font-semibold text-blue-600">v{latest.version}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ConflictModal;
