import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactFilters } from '../components/contacts/ContactFilters';
import type { Tag } from '../types';

describe('ContactFilters component', () => {
  const mockTags: Tag[] = [
    { id: 'tag-1', name: 'Lead', color: '#3B82F6', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    { id: 'tag-2', name: 'Customer', color: '#10B981', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  ];

  it('handles search input changes', () => {
    const handleSearchChange = vi.fn();
    render(
      <ContactFilters
        searchInput=""
        onSearchChange={handleSearchChange}
        tagId=""
        onTagChange={vi.fn()}
        company=""
        onCompanyChange={vi.fn()}
        sortBy="createdAt"
        sortOrder="desc"
        onSortChange={vi.fn()}
        tags={mockTags}
        hasActiveFilters={false}
        onReset={vi.fn()}
        onCreateContact={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/search by name, email, or phone/i);
    fireEvent.change(input, { target: { value: 'Bruce' } });
    expect(handleSearchChange).toHaveBeenCalledWith('Bruce');
  });

  it('handles tag and company filter changes', () => {
    const handleTagChange = vi.fn();
    const handleCompanyChange = vi.fn();

    render(
      <ContactFilters
        searchInput=""
        onSearchChange={vi.fn()}
        tagId=""
        onTagChange={handleTagChange}
        company=""
        onCompanyChange={handleCompanyChange}
        sortBy="createdAt"
        sortOrder="desc"
        onSortChange={vi.fn()}
        tags={mockTags}
        hasActiveFilters={false}
        onReset={vi.fn()}
        onCreateContact={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const tagSelect = screen.getByDisplayValue('All Tags');
    fireEvent.change(tagSelect, { target: { value: 'tag-1' } });
    expect(handleTagChange).toHaveBeenCalledWith('tag-1');

    const companyInput = screen.getByPlaceholderText(/filter by company/i);
    fireEvent.change(companyInput, { target: { value: 'Wayne' } });
    expect(handleCompanyChange).toHaveBeenCalledWith('Wayne');
  });

  it('renders reset filters button when active filters exist and triggers callback', () => {
    const handleReset = vi.fn();
    render(
      <ContactFilters
        searchInput="Wayne"
        onSearchChange={vi.fn()}
        tagId=""
        onTagChange={vi.fn()}
        company=""
        onCompanyChange={vi.fn()}
        sortBy="createdAt"
        sortOrder="desc"
        onSortChange={vi.fn()}
        tags={mockTags}
        hasActiveFilters={true}
        onReset={handleReset}
        onCreateContact={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const resetBtn = screen.getByText(/reset filters/i);
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
