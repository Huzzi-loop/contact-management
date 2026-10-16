import { useState, useEffect, useCallback, useMemo } from 'react';
import { contactsApi } from '../api';
import type {
  ContactWithTags,
  PaginationMeta,
  SortByOption,
  SortOrderOption,
} from '../types';
import { useDebounce } from './useDebounce';
import { parseApiError } from '../utils/errorHandler';

export interface UseContactsOptions {
  initialLimit?: number;
  initialSortBy?: SortByOption;
  initialSortOrder?: SortOrderOption;
}

export function useContacts(options: UseContactsOptions = {}) {
  const [contacts, setContacts] = useState<ContactWithTags[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: options.initialLimit || 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Query States
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce(searchInput, 350);

  const [tagId, setTagId] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortByOption>(options.initialSortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrderOption>(options.initialSortOrder || 'desc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(options.initialLimit || 10);

  // Reset to page 1 whenever search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tagId, company]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contactsApi.getContacts({
        search: debouncedSearch,
        tagId: tagId || undefined,
        company: company || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      setContacts(res.data);
      setMeta(res.meta);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, tagId, company, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSort = useCallback(
    (field: SortByOption) => {
      if (sortBy === field) {
        // Toggle order
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder(field === 'name' ? 'asc' : 'desc');
      }
      setPage(1);
    },
    [sortBy]
  );

  const resetFilters = useCallback(() => {
    setSearchInput('');
    setTagId('');
    setCompany('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Boolean(searchInput.trim() || tagId || company.trim());
  }, [searchInput, tagId, company]);

  return {
    contacts,
    meta,
    loading,
    error,
    // Filters & Sorting state
    searchInput,
    setSearchInput,
    tagId,
    setTagId,
    company,
    setCompany,
    sortBy,
    sortOrder,
    handleSort,
    // Pagination state
    page,
    setPage,
    limit,
    setLimit,
    // Helpers
    resetFilters,
    hasActiveFilters,
    refresh: fetchContacts,
  };
}

export default useContacts;
