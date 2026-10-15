import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactService } from '../src/modules/contact/contact.service';
import { ContactRepository } from '../src/modules/contact/contact.repository';
import { TagRepository } from '../src/modules/tag/tag.repository';
import { ConflictError, BadRequestError } from '../src/utils/apiError';
import { ContactWithTags } from '../src/modules/contact/contact.repository';

describe('ContactService Unit Tests - createContact', () => {
  let mockContactRepo: Partial<ContactRepository>;
  let mockTagRepo: Partial<TagRepository>;
  let contactService: ContactService;

  beforeEach(() => {
    mockContactRepo = {
      findActiveByEmail: vi.fn(),
      create: vi.fn(),
    };
    mockTagRepo = {
      findByIds: vi.fn(),
    };
    contactService = new ContactService(
      mockContactRepo as ContactRepository,
      mockTagRepo as TagRepository
    );
  });

  it('should successfully create contact with trimmed values', async () => {
    const input = {
      firstName: '  Alice  ',
      lastName: '  Walker  ',
      email: 'Alice.Walker@Example.com ',
      phone: ' 555-0100 ',
      company: ' Initech ',
    };

    (mockContactRepo.findActiveByEmail as any).mockResolvedValue(null);

    const expectedCreated: ContactWithTags = {
      id: 'contact-1',
      firstName: 'Alice',
      lastName: 'Walker',
      email: 'alice.walker@example.com',
      phone: '555-0100',
      company: 'Initech',
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };
    (mockContactRepo.create as any).mockResolvedValue(expectedCreated);

    const result = await contactService.createContact(input);

    expect(mockContactRepo.findActiveByEmail).toHaveBeenCalledWith('alice.walker@example.com');
    expect(mockContactRepo.create).toHaveBeenCalledWith(
      {
        firstName: 'Alice',
        lastName: 'Walker',
        email: 'alice.walker@example.com',
        phone: '555-0100',
        company: 'Initech',
      },
      []
    );
    expect(result).toEqual(expectedCreated);
  });

  it('should throw ConflictError if active contact with email already exists', async () => {
    (mockContactRepo.findActiveByEmail as any).mockResolvedValue({
      id: 'existing-id',
      email: 'taken@example.com',
    });

    await expect(
      contactService.createContact({
        firstName: 'John',
        lastName: 'Doe',
        email: 'taken@example.com',
      })
    ).rejects.toThrow(ConflictError);

    expect(mockContactRepo.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError if any requested tag does not exist', async () => {
    (mockContactRepo.findActiveByEmail as any).mockResolvedValue(null);
    // Only 1 tag found out of 2 requested
    (mockTagRepo.findByIds as any).mockResolvedValue([{ id: 'tag-1', name: 'VIP' }]);

    await expect(
      contactService.createContact({
        firstName: 'John',
        lastName: 'Doe',
        tagIds: ['tag-1', 'tag-nonexistent'],
      })
    ).rejects.toThrow(BadRequestError);

    expect(mockContactRepo.create).not.toHaveBeenCalled();
  });
});
