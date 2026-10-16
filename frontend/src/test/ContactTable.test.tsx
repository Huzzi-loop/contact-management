import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactTable } from '../components/contacts/ContactTable';
import type { ContactWithTags, PaginationMeta } from '../types';

describe('ContactTable component', () => {
  const mockContacts: ContactWithTags[] = [
    {
      id: 'contact-1',
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@wayne.com',
      phone: '+1 555-0100',
      company: 'Wayne Enterprises',
      version: 1,
      deletedAt: null,
      createdAt: '2026-01-15T10:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
      tags: [{ id: 't1', name: 'VIP', color: '#EF4444', createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
    },
    {
      id: 'contact-2',
      firstName: 'Clark',
      lastName: 'Kent',
      email: 'clark@dailyplanet.com',
      phone: '+1 555-0101',
      company: 'Daily Planet',
      version: 1,
      deletedAt: null,
      createdAt: '2026-01-16T10:00:00.000Z',
      updatedAt: '2026-01-16T10:00:00.000Z',
      tags: [],
    },
  ];

  const mockMeta: PaginationMeta = {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  it('renders contacts table headers and rows', () => {
    render(
      <ContactTable
        contacts={mockContacts}
        meta={mockMeta}
        loading={false}
        sortBy="createdAt"
        sortOrder="desc"
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        selectedIds={[]}
        onSelectToggle={vi.fn()}
        onSelectAllPage={vi.fn()}
        onViewDetails={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        hasActiveFilters={false}
        onResetFilters={vi.fn()}
      />
    );

    expect(screen.getByText('Bruce Wayne')).toBeInTheDocument();
    expect(screen.getByText('Clark Kent')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('triggers onSort when clicking sortable column headers', () => {
    const handleSort = vi.fn();
    render(
      <ContactTable
        contacts={mockContacts}
        meta={mockMeta}
        loading={false}
        sortBy="createdAt"
        sortOrder="desc"
        onSort={handleSort}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        selectedIds={[]}
        onSelectToggle={vi.fn()}
        onSelectAllPage={vi.fn()}
        onViewDetails={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        hasActiveFilters={false}
        onResetFilters={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Name'));
    expect(handleSort).toHaveBeenCalledWith('name');

    fireEvent.click(screen.getByText('Created'));
    expect(handleSort).toHaveBeenCalledWith('createdAt');
  });

  it('renders empty state when there are no contacts', () => {
    render(
      <ContactTable
        contacts={[]}
        meta={{ total: 0, page: 1, limit: 10, totalPages: 0 }}
        loading={false}
        sortBy="createdAt"
        sortOrder="desc"
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        selectedIds={[]}
        onSelectToggle={vi.fn()}
        onSelectAllPage={vi.fn()}
        onViewDetails={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        hasActiveFilters={true}
        onResetFilters={vi.fn()}
      />
    );

    expect(screen.getByText('No matching contacts')).toBeInTheDocument();
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
  });
});
