import React, { useState } from 'react';
import { Users, AlertTriangle, Search } from 'lucide-react';
import { useContacts } from './hooks/useContacts';
import { ContactRow } from './components/contacts/ContactRow';
import { TableRowSkeleton } from './components/common/Skeleton';
import { EmptyState } from './components/common/EmptyState';

export const App: React.FC = () => {
  const {
    contacts,
    meta,
    loading,
    error,
    searchInput,
    setSearchInput,
    refresh,
  } = useContacts();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
        {/* Search Bar Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Name, Email, or Phone..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

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

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center"></th>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Tags</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-4 py-3.5 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <TableRowSkeleton rows={5} cols={8} />
                ) : contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      isSelected={selectedIds.includes(contact.id)}
                      onSelectToggle={handleSelectToggle}
                      onViewDetails={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={searchInput ? 'search' : 'users'}
                        title={searchInput ? 'No matching contacts' : 'No contacts yet'}
                        description={
                          searchInput
                            ? `No contacts found matching "${searchInput}".`
                            : 'Your contact workspace is empty. Get started by adding your first contact.'
                        }
                        actionLabel={searchInput ? 'Clear search' : undefined}
                        onAction={searchInput ? () => setSearchInput('') : undefined}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
