import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityTimeline } from '../components/activity/ActivityTimeline';
import type { ContactActivity } from '../types';

describe('ActivityTimeline component', () => {
  it('renders empty message when no activities exist', () => {
    render(<ActivityTimeline activities={[]} />);
    expect(screen.getByText('No activity history recorded yet.')).toBeInTheDocument();
  });

  it('renders activities with descriptions, icons, and metadata', () => {
    const mockActivities: ContactActivity[] = [
      {
        id: 'act-1',
        contactId: 'c-1',
        type: 'CONTACT_CREATED',
        description: 'Contact created',
        metadata: {},
        createdAt: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'act-2',
        contactId: 'c-1',
        type: 'TAG_ADDED',
        description: 'Assigned tag "VIP"',
        metadata: { tagId: 't-1', tagName: 'VIP' },
        createdAt: '2026-01-12T10:00:00.000Z',
      },
      {
        id: 'act-3',
        contactId: 'c-1',
        type: 'CONTACT_UPDATED',
        description: 'Updated contact details',
        metadata: { updatedFields: ['phone', 'company'] },
        createdAt: '2026-01-14T10:00:00.000Z',
      },
    ];

    render(<ActivityTimeline activities={mockActivities} />);

    expect(screen.getByText('Contact created')).toBeInTheDocument();
    expect(screen.getByText('Assigned tag "VIP"')).toBeInTheDocument();
    expect(screen.getByText('Updated contact details')).toBeInTheDocument();
    expect(screen.getByText(/Updated: phone, company/i)).toBeInTheDocument();
    expect(screen.getByText(/Tag: VIP/i)).toBeInTheDocument();
  });
});
