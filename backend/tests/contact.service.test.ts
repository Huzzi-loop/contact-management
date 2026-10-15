import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactService } from '../src/modules/contact/contact.service';
import { ContactRepository } from '../src/modules/contact/contact.repository';
import { TagRepository } from '../src/modules/tag/tag.repository';
import { ConflictError, BadRequestError, NotFoundError } from '../src/utils/apiError';
import { ContactWithTags, ContactWithDetails } from '../src/modules/contact/contact.repository';

describe('ContactService Unit Tests - createContact', () => {
  let mockContactRepo: Partial<ContactRepository>;
  let mockTagRepo: Partial<TagRepository>;
  let contactService: ContactService;

  beforeEach(() => {
    mockContactRepo = {
      findActiveByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findByIdWithDetails: vi.fn(),
      updateWithOCC: vi.fn(),
      logActivity: vi.fn(),
    };
    mockTagRepo = {
      findByIds: vi.fn(),
    };
    contactService = new ContactService(
      mockContactRepo as ContactRepository,
      mockTagRepo as TagRepository
    );
  });

  describe('createContact', () => {
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

  describe('getContactById', () => {
    it('should return contact with tags and recent activities when found', async () => {
      const dummyContact: ContactWithDetails = {
        id: 'contact-123',
        firstName: 'Bob',
        lastName: 'Marley',
        email: 'bob@example.com',
        phone: '+1 555-9999',
        company: 'Tuff Gong',
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [{ id: 'tag-1', name: 'Legend', color: '#10B981', createdAt: new Date(), updatedAt: new Date() }],
        recentActivities: [
          {
            id: 'act-1',
            contactId: 'contact-123',
            type: 'CONTACT_CREATED',
            description: 'Contact created',
            metadata: null,
            createdAt: new Date(),
          },
        ],
      };

      (mockContactRepo.findByIdWithDetails as any).mockResolvedValue(dummyContact);

      const result = await contactService.getContactById('contact-123');

      expect(mockContactRepo.findByIdWithDetails).toHaveBeenCalledWith('contact-123');
      expect(result).toEqual(dummyContact);
      expect(result.tags).toHaveLength(1);
      expect(result.recentActivities).toHaveLength(1);
    });

    it('should throw NotFoundError if contact is not found or soft-deleted', async () => {
      (mockContactRepo.findByIdWithDetails as any).mockResolvedValue(null);

      await expect(contactService.getContactById('non-existent-id')).rejects.toThrow(NotFoundError);
      expect(mockContactRepo.findByIdWithDetails).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('updateContact (Optimistic Concurrency Control)', () => {
    const existingContact = {
      id: 'c-100',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@peanuts.com',
      phone: '555-1111',
      company: 'Peanuts Inc',
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully update contact when version matches and log activity', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(existingContact);

      const updatedContact = {
        ...existingContact,
        firstName: 'Charles',
        version: 2,
      };
      (mockContactRepo.updateWithOCC as any).mockResolvedValue(updatedContact);
      (mockContactRepo.logActivity as any).mockResolvedValue(undefined);

      const result = await contactService.updateContact('c-100', {
        version: 1,
        firstName: 'Charles',
      });

      expect(mockContactRepo.findById).toHaveBeenCalledWith('c-100');
      expect(mockContactRepo.updateWithOCC).toHaveBeenCalledWith(
        'c-100',
        1,
        { firstName: 'Charles' }
      );
      expect(mockContactRepo.logActivity).toHaveBeenCalledWith(
        'c-100',
        'CONTACT_UPDATED',
        'Contact updated fields: firstName',
        { updatedFields: ['firstName'] }
      );
      expect(result.version).toBe(2);
      expect(result.firstName).toBe('Charles');
    });

    it('should throw ConflictError (409) if submitted version does not match database version', async () => {
      // Database has version 2, but client submitted stale version 1
      const newerInDb = { ...existingContact, version: 2 };
      (mockContactRepo.findById as any).mockResolvedValue(newerInDb);
      (mockContactRepo.findByIdWithDetails as any).mockResolvedValue(newerInDb);

      await expect(
        contactService.updateContact('c-100', {
          version: 1, // Stale version!
          firstName: 'StaleUpdate',
        })
      ).rejects.toThrow(ConflictError);

      expect(mockContactRepo.updateWithOCC).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if contact does not exist', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(null);

      await expect(
        contactService.updateContact('c-missing', {
          version: 1,
          firstName: 'Ghost',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if updated email is already taken by another contact', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(existingContact);
      (mockContactRepo.findActiveByEmail as any).mockResolvedValue({
        id: 'c-200',
        email: 'taken@other.com',
      });

      await expect(
        contactService.updateContact('c-100', {
          version: 1,
          email: 'taken@other.com',
        })
      ).rejects.toThrow(ConflictError);

      expect(mockContactRepo.updateWithOCC).not.toHaveBeenCalled();
    });
  });
});
