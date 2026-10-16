import React, { useState } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { useContacts } from './hooks/useContacts';
import { useTags } from './hooks/useTags';
import { ContactFilters } from './components/contacts/ContactFilters';
import { ContactTable } from './components/contacts/ContactTable';

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

  const { tags } = useTags();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
          onCreateContact={() => {}}
        />

        {/* Full Contacts Table */}
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
          onViewDetails={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      </main>
    </div>
  );
};

export default App;
