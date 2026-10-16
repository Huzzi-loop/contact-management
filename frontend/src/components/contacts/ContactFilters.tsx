import React from 'react';
import { Search, RotateCcw, Filter, UserPlus, Tag as TagIcon } from 'lucide-react';
import { Button } from '../common/Button';
import type { Tag, SortByOption, SortOrderOption } from '../../types';

export interface ContactFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  tagId: string;
  onTagChange: (value: string) => void;
  company: string;
  onCompanyChange: (value: string) => void;
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
  onSortChange: (sortBy: SortByOption, sortOrder: SortOrderOption) => void;
  tags: Tag[];
  hasActiveFilters: boolean;
  onReset: () => void;
  onCreateContact: () => void;
  onCreateTag?: () => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  searchInput,
  onSearchChange,
  tagId,
  onTagChange,
  company,
  onCompanyChange,
  sortBy,
  sortOrder,
  onSortChange,
  tags,
  hasActiveFilters,
  onReset,
  onCreateContact,
  onCreateTag,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 space-y-3">
      {/* Top row: Search + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Name, Email, or Phone..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
          />
          {searchInput && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Buttons: New Tag & Add Contact */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onCreateTag && (
            <Button
              variant="outline"
              icon={<TagIcon className="w-4 h-4 text-blue-600" />}
              onClick={onCreateTag}
              className="border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs font-semibold"
            >
              New Tag
            </Button>
          )}

          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={onCreateContact}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Bottom row: Filters & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          {/* Tag Filter */}
          <select
            value={tagId}
            onChange={(e) => onTagChange(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          {/* Company Filter */}
          <input
            type="text"
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
            placeholder="Filter by company..."
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44 placeholder-slate-400"
          />

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-slate-400">Sort:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sBy, sOrder] = e.target.value.split('-') as [SortByOption, SortOrderOption];
              onSortChange(sBy, sOrder);
            }}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ContactFilters;
