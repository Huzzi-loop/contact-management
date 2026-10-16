import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConflictModal } from '../components/contacts/ConflictModal';
import type { OccConflictDetails, ContactWithDetails } from '../types';

describe('ConflictModal component (Optimistic Concurrency Control)', () => {
  const mockConflictDetails: OccConflictDetails<ContactWithDetails> = {
    currentVersion: 3,
    submittedVersion: 2,
    latestContact: {
      id: 'c-1',
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@wayne.com',
      phone: '+1 555-0100',
      company: 'Wayne Enterprises',
      version: 3,
      deletedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      tags: [],
      recentActivities: [],
    },
  };

  it('renders conflict notice with versions and server snapshot', () => {
    render(
      <ConflictModal
        isOpen={true}
        onClose={vi.fn()}
        conflictDetails={mockConflictDetails}
        onReloadLatest={vi.fn()}
      />
    );

    expect(screen.getByText('Concurrent Update Conflict')).toBeInTheDocument();
    expect(screen.getByText(/v2/)).toBeInTheDocument(); // submitted version
    expect(screen.getAllByText(/v3/).length).toBeGreaterThanOrEqual(1); // current version
    expect(screen.getByText('Bruce Wayne')).toBeInTheDocument();
    expect(screen.getByText('Wayne Enterprises')).toBeInTheDocument();
  });

  it('triggers onReloadLatest when clicking the reload action button', () => {
    const handleReloadLatest = vi.fn();
    render(
      <ConflictModal
        isOpen={true}
        onClose={vi.fn()}
        conflictDetails={mockConflictDetails}
        onReloadLatest={handleReloadLatest}
      />
    );

    const reloadBtn = screen.getByRole('button', { name: /reload latest version/i });
    fireEvent.click(reloadBtn);
    expect(handleReloadLatest).toHaveBeenCalledTimes(1);
  });
});
