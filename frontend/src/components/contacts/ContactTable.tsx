import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type {
  ContactWithTags,
  PaginationMeta,
  SortByOption,
  SortOrderOption,
} from '../../types';
import { ContactRow } from './ContactRow';
import { TableRowSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';

export interface ContactTableProps {
  contacts: ContactWithTags[];
  meta: PaginationMeta;
  loading: boolean;
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
  onSort: (field: SortByOption) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllPage: () => void;
  onViewDetails: (id: string) => void;
  onEdit: (contact: ContactWithTags) => void;
  onDelete: (contact: ContactWithTags) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  meta,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onLimitChange,
  selectedIds,
  onSelectToggle,
  onSelectAllPage,
  onViewDetails,
  onEdit,
  onDelete,
  hasActiveFilters,
  onResetFilters,
}) => {
  const isAllPageSelected =
    contacts.length > 0 && contacts.every((c) => selectedIds.includes(c.id));
  const isSomePageSelected =
    contacts.some((c) => selectedIds.includes(c.id)) && !isAllPageSelected;

  const renderSortIcon = (field: SortByOption) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50/75 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <tr>
              {/* Bulk select checkbox */}
              <th scope="col" className="px-4 py-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomePageSelected;
                  }}
                  onChange={onSelectAllPage}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                  aria-label="Select all contacts on this page"
                />
              </th>

              {/* Name (Sortable) */}
              <th
                scope="col"
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* Email */}
              <th scope="col" className="px-4 py-3.5">
                Email
              </th>

              {/* Phone */}
              <th scope="col" className="px-4 py-3.5">
                Phone
              </th>

              {/* Company */}
              <th scope="col" className="px-4 py-3.5">
                Company
              </th>

              {/* Tags */}
              <th scope="col" className="px-4 py-3.5">
                Tags
              </th>

              {/* Created Date (Sortable) */}
              <th
                scope="col"
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                onClick={() => onSort('createdAt')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Created</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>

              {/* Actions */}
              <th scope="col" className="px-4 py-3.5 text-right w-24">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white text-sm">
            {loading ? (
              <TableRowSkeleton rows={meta.limit || 5} cols={8} />
            ) : contacts.length > 0 ? (
              contacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedIds.includes(contact.id)}
                  onSelectToggle={onSelectToggle}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={hasActiveFilters ? 'search' : 'users'}
                    title={hasActiveFilters ? 'No matching contacts' : 'No contacts yet'}
                    description={
                      hasActiveFilters
                        ? 'Try adjusting your search criteria, company filter, or tag filter.'
                        : 'Your contact workspace is empty. Get started by adding your first contact.'
                    }
                    actionLabel={hasActiveFilters ? 'Clear all filters' : undefined}
                    onAction={hasActiveFilters ? onResetFilters : undefined}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && contacts.length > 0 && (
        <Pagination
          meta={meta}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};

export default ContactTable;
