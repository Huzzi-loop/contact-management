import React, { useState } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { useContacts } from './hooks/useContacts';
import { useTags } from './hooks/useTags';
import { useToast } from './hooks/useToast';
import {
  ContactFilters,
  ContactTable,
  ContactDetailModal,
  CreateContactModal,
  EditContactModal,
  ConflictModal,
  BulkActionBar,
  BulkTagModal,
  CreateTagModal,
} from './components/contacts';
import { Modal, Button } from './components/common';
import { contactsApi } from './api';
import { parseApiError } from './utils/errorHandler';
import type { ContactWithTags, ContactWithDetails, OccConflictDetails } from './types';

export const App: React.FC = () => {
  const {
    contacts,
    meta,
    loading,
    error,
    searchInput,
    setSearchInput,
    tagId,
    setTagId,
    company,
    setCompany,
    sortBy,
    sortOrder,
    handleSort,
    setPage,
    setLimit,
    resetFilters,
    hasActiveFilters,
    refresh,
  } = useContacts();

  const { tags, createTag, reloadTags } = useTags();
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedContactIdForDetails, setSelectedContactIdForDetails] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [editContactTarget, setEditContactTarget] = useState<ContactWithTags | ContactWithDetails | null>(null);
  const [conflictDetails, setConflictDetails] = useState<OccConflictDetails<ContactWithDetails> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactWithTags | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPage = () => {
    const pageIds = contacts.map((c) => c.id);
    const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleReloadConflict = () => {
    if (conflictDetails?.latestContact) {
      setEditContactTarget(conflictDetails.latestContact);
    }
    setConflictDetails(null);
    refresh();
    showToast('Loaded latest contact record from server. Please review and save.', 'info');
  };

  const handleDeleteContact = async () => {
    if (!deleteTarget) return;
    const fullName = `${deleteTarget.firstName} ${deleteTarget.lastName}`.trim();
    try {
      setIsDeleting(true);
      await contactsApi.deleteContact(deleteTarget.id);
      showToast(`Contact "${fullName}" deleted successfully`, 'success');
      setDeleteTarget(null);
      refresh();
    } catch (err: any) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                CRM Workspace
              </h1>
              <p className="text-xs text-slate-500">Contact Management & Tagging</p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {meta.total} {meta.total === 1 ? 'Contact' : 'Contacts'}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refresh}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <ContactFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          tagId={tagId}
          onTagChange={setTagId}
          company={company}
          onCompanyChange={setCompany}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            if (sortBy === newSortBy && sortOrder === newSortOrder) return;
            handleSort(newSortBy);
          }}
          tags={tags}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
          onCreateContact={() => setIsCreateModalOpen(true)}
          onCreateTag={() => setIsCreateTagModalOpen(true)}
        />

        {/* Contacts Table */}
        <ContactTable
          contacts={contacts}
          meta={meta}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={setPage}
          onLimitChange={setLimit}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
          onSelectAllPage={handleSelectAllPage}
          onViewDetails={(id) => setSelectedContactIdForDetails(id)}
          onEdit={(contact) => setEditContactTarget(contact)}
          onDelete={(contact) => setDeleteTarget(contact)}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      </main>

      {/* Floating Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onManageTags={() => setIsBulkTagModalOpen(true)}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Bulk Tag Modal */}
      <BulkTagModal
        isOpen={isBulkTagModalOpen}
        onClose={() => setIsBulkTagModalOpen(false)}
        selectedContactIds={selectedIds}
        availableTags={tags}
        onSuccess={() => {
          setSelectedIds([]);
          refresh();
        }}
      />

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={isCreateTagModalOpen}
        onClose={() => setIsCreateTagModalOpen(false)}
        onCreateTag={createTag}
        onSuccess={reloadTags}
      />

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refresh}
        availableTags={tags}
      />

      {/* Edit Contact Modal with OCC Version Checking */}
      <EditContactModal
        contact={editContactTarget}
        isOpen={Boolean(editContactTarget)}
        onClose={() => setEditContactTarget(null)}
        onSuccess={() => {
          refresh();
          if (selectedContactIdForDetails) {
            setSelectedContactIdForDetails(editContactTarget?.id || null);
          }
        }}
        onConflict={(details) => setConflictDetails(details || null)}
      />

      {/* 409 OCC Conflict Resolution Modal */}
      <ConflictModal
        isOpen={Boolean(conflictDetails)}
        onClose={() => setConflictDetails(null)}
        conflictDetails={conflictDetails || undefined}
        onReloadLatest={handleReloadConflict}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contactId={selectedContactIdForDetails}
        isOpen={Boolean(selectedContactIdForDetails)}
        onClose={() => setSelectedContactIdForDetails(null)}
        allTags={tags}
        onContactModified={refresh}
        onEdit={(detailContact: ContactWithDetails) => setEditContactTarget(detailContact)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="sm"
        title="Delete Contact"
        description={`Are you sure you want to delete ${deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}`.trim() : 'this contact'}? This contact will be soft-deleted and can be recovered if necessary.`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteContact}
              loading={isDeleting}
            >
              Delete Contact
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          This will move <strong className="text-slate-900">{deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}`.trim() : 'this contact'}</strong> to the archive. All associated activity logs and tags will be retained for audit purposes.
        </p>
      </Modal>
    </div>
  );
};

export default App;
