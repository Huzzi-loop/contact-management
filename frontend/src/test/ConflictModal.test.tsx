import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConflictModal } from '../components/contacts/ConflictModal';
import type { OccConflictDetails, ContactWithDetails } from '../types';

describe('ConflictModal component', () => {
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

  it('renders conflict notice without technical jargon or version numbers', () => {
    render(
      <ConflictModal
        isOpen={true}
        onClose={vi.fn()}
        conflictDetails={mockConflictDetails}
        onReloadLatest={vi.fn()}
      />
    );

    expect(screen.getByText('Update Conflict')).toBeInTheDocument();
    expect(screen.getByText(/somebody else made changes/i)).toBeInTheDocument();
    expect(screen.getByText(/someone else updated this contact/i)).toBeInTheDocument();
    expect(screen.getByText('Bruce Wayne')).toBeInTheDocument();
    expect(screen.getByText('Wayne Enterprises')).toBeInTheDocument();
    expect(screen.queryByText(/v2/)).not.toBeInTheDocument();
    expect(screen.queryByText(/v3/)).not.toBeInTheDocument();
    expect(screen.queryByText(/optimistic concurrency control/i)).not.toBeInTheDocument();
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

    const reloadBtn = screen.getByRole('button', { name: /load latest changes/i });
    fireEvent.click(reloadBtn);
    expect(handleReloadLatest).toHaveBeenCalledTimes(1);
  });
});
