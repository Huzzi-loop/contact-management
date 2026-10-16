import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactRow } from '../components/contacts/ContactRow';
import type { ContactWithTags } from '../types';

describe('ContactRow component', () => {
  const mockContact: ContactWithTags = {
    id: 'contact-1',
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bruce@wayne.com',
    phone: '+1 555-0100',
    company: 'Wayne Enterprises',
    version: 3,
    deletedAt: null,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T12:00:00.000Z',
    tags: [
      { id: 'tag-1', name: 'VIP', color: '#EF4444', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      { id: 'tag-2', name: 'Customer', color: '#10B981', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ],
  };

  it('renders contact details correctly', () => {
    render(
      <table>
        <tbody>
          <ContactRow
            contact={mockContact}
            isSelected={false}
            onSelectToggle={vi.fn()}
            onViewDetails={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Bruce Wayne')).toBeInTheDocument();
    expect(screen.getByText('bruce@wayne.com')).toBeInTheDocument();
    expect(screen.getByText('+1 555-0100')).toBeInTheDocument();
    expect(screen.getByText('Wayne Enterprises')).toBeInTheDocument();
    expect(screen.getByText('BW')).toBeInTheDocument(); // Initials
    expect(screen.queryByText('v3')).not.toBeInTheDocument(); // Version removed from UI
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });

  it('triggers selection toggle on checkbox click', () => {
    const handleSelectToggle = vi.fn();
    render(
      <table>
        <tbody>
          <ContactRow
            contact={mockContact}
            isSelected={false}
            onSelectToggle={handleSelectToggle}
            onViewDetails={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    const checkbox = screen.getByRole('checkbox', { name: /select bruce wayne/i });
    fireEvent.click(checkbox);
    expect(handleSelectToggle).toHaveBeenCalledWith('contact-1');
  });

  it('triggers onViewDetails, onEdit, and onDelete action buttons', () => {
    const handleViewDetails = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <table>
        <tbody>
          <ContactRow
            contact={mockContact}
            isSelected={false}
            onSelectToggle={vi.fn()}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </tbody>
      </table>
    );

    const viewBtn = screen.getByTitle('View Details & Activity');
    fireEvent.click(viewBtn);
    expect(handleViewDetails).toHaveBeenCalledWith('contact-1');

    const editBtn = screen.getByTitle('Edit Contact');
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockContact);

    const deleteBtn = screen.getByTitle('Delete Contact');
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(mockContact);
  });
});
