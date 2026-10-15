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
      softDelete: vi.fn(),
      findAllActive: vi.fn(),
      searchContacts: vi.fn(),
      findContacts: vi.fn(),
      countContacts: vi.fn(),
      addTag: vi.fn(),
      removeTag: vi.fn(),
      findActiveByIds: vi.fn(),
      bulkAddTags: vi.fn(),
      bulkRemoveTags: vi.fn(),
    };
    mockTagRepo = {
      findByIds: vi.fn(),
      findById: vi.fn(),
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

  describe('deleteContact', () => {
    it('should successfully soft delete contact', async () => {
      (mockContactRepo.softDelete as any).mockResolvedValue({
        id: 'c-100',
        deletedAt: new Date(),
      });

      await expect(contactService.deleteContact('c-100')).resolves.toBeUndefined();
      expect(mockContactRepo.softDelete).toHaveBeenCalledWith('c-100');
    });

    it('should throw NotFoundError if contact is not found or already deleted', async () => {
      (mockContactRepo.softDelete as any).mockResolvedValue(null);

      await expect(contactService.deleteContact('c-missing')).rejects.toThrow(NotFoundError);
      expect(mockContactRepo.softDelete).toHaveBeenCalledWith('c-missing');
    });
  });

  describe('getAllContacts (Basic)', () => {
    it('should return all active contacts with tags from repository', async () => {
      const dummyContacts = [
        {
          id: 'c-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-0001',
          company: 'Acme',
          version: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [{ id: 't-1', name: 'VIP', color: '#10B981', createdAt: new Date(), updatedAt: new Date() }],
        },
        {
          id: 'c-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '555-0002',
          company: 'Globex',
          version: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
        },
      ];

      (mockContactRepo.findAllActive as any).mockResolvedValue(dummyContacts);

      const result = await contactService.getAllContacts();

      expect(mockContactRepo.findAllActive).toHaveBeenCalledOnce();
      expect(result).toHaveLength(2);
      expect(result[0].firstName).toBe('John');
      expect(result[0].tags).toHaveLength(1);
    });
  });

  describe('getContacts (with Search, Sorting, and Pagination)', () => {
    const dummyResults = [
      {
        id: 'c-1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        phone: '555-1234',
        company: 'Acme',
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      },
    ];

    it('should call repository findContacts with search string, default pagination and sorting', async () => {
      (mockContactRepo.countContacts as any).mockResolvedValue(1);
      (mockContactRepo.findContacts as any).mockResolvedValue(dummyResults);

      const result = await contactService.getContacts('Alice');

      expect(mockContactRepo.countContacts).toHaveBeenCalledWith({
        searchTerm: 'Alice',
        tagId: undefined,
        company: undefined,
      });
      expect(mockContactRepo.findContacts).toHaveBeenCalledWith({
        searchTerm: 'Alice',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
        tagId: undefined,
        company: undefined,
      });
      expect(result.data).toEqual(dummyResults);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should call repository findContacts with custom page, limit, sortBy, and sortOrder', async () => {
      (mockContactRepo.countContacts as any).mockResolvedValue(25);
      (mockContactRepo.findContacts as any).mockResolvedValue(dummyResults);

      const result = await contactService.getContacts({
        search: 'Smith',
        sortBy: 'name',
        sortOrder: 'asc',
        page: 2,
        limit: 10,
      });

      expect(mockContactRepo.countContacts).toHaveBeenCalledWith({
        searchTerm: 'Smith',
        tagId: undefined,
        company: undefined,
      });
      expect(mockContactRepo.findContacts).toHaveBeenCalledWith({
        searchTerm: 'Smith',
        sortBy: 'name',
        sortOrder: 'asc',
        page: 2,
        limit: 10,
        tagId: undefined,
        company: undefined,
      });
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3, // Math.ceil(25 / 10) = 3
      });
    });

    it('should call repository with tagId and company filter parameters', async () => {
      (mockContactRepo.countContacts as any).mockResolvedValue(5);
      (mockContactRepo.findContacts as any).mockResolvedValue(dummyResults);

      const result = await contactService.getContacts({
        tagId: 'tag-123',
        company: 'Acme',
      });

      expect(mockContactRepo.countContacts).toHaveBeenCalledWith({
        searchTerm: undefined,
        tagId: 'tag-123',
        company: 'Acme',
      });
      expect(mockContactRepo.findContacts).toHaveBeenCalledWith({
        searchTerm: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
        tagId: 'tag-123',
        company: 'Acme',
      });
      expect(result.meta.total).toBe(5);
    });

    it('should calculate 0 totalPages when total is 0', async () => {
      (mockContactRepo.countContacts as any).mockResolvedValue(0);
      (mockContactRepo.findContacts as any).mockResolvedValue([]);

      const result = await contactService.getContacts();

      expect(mockContactRepo.countContacts).toHaveBeenCalledWith({
        searchTerm: undefined,
        tagId: undefined,
        company: undefined,
      });
      expect(mockContactRepo.findContacts).toHaveBeenCalledWith({
        searchTerm: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
        tagId: undefined,
        company: undefined,
      });
      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('addTagToContact', () => {
    const existingContact = {
      id: 'c-1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      phone: null,
      company: null,
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingTag = {
      id: 't-1',
      name: 'VIP',
      color: '#10B981',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should add tag to contact and log TAG_ADDED activity', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(existingContact);
      (mockTagRepo.findById as any).mockResolvedValue(existingTag);
      (mockContactRepo.addTag as any).mockResolvedValue(true);
      (mockContactRepo.logActivity as any).mockResolvedValue(undefined);

      const result = await contactService.addTagToContact('c-1', 't-1');

      expect(mockContactRepo.findById).toHaveBeenCalledWith('c-1');
      expect(mockTagRepo.findById).toHaveBeenCalledWith('t-1');
      expect(mockContactRepo.addTag).toHaveBeenCalledWith('c-1', 't-1');
      expect(mockContactRepo.logActivity).toHaveBeenCalledWith(
        'c-1',
        'TAG_ADDED',
        'Tag "VIP" added to contact',
        { tagId: 't-1', tagName: 'VIP' }
      );
      expect(result).toEqual(existingTag);
    });

    it('should not log activity if tag was already associated', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(existingContact);
      (mockTagRepo.findById as any).mockResolvedValue(existingTag);
      (mockContactRepo.addTag as any).mockResolvedValue(false); // already existed

      const result = await contactService.addTagToContact('c-1', 't-1');

      expect(mockContactRepo.addTag).toHaveBeenCalledWith('c-1', 't-1');
      expect(mockContactRepo.logActivity).not.toHaveBeenCalled();
      expect(result).toEqual(existingTag);
    });

    it('should throw NotFoundError if contact is not found', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(null);

      await expect(contactService.addTagToContact('c-missing', 't-1')).rejects.toThrow(NotFoundError);
      expect(mockContactRepo.addTag).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if tag is not found', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(existingContact);
      (mockTagRepo.findById as any).mockResolvedValue(null);

      await expect(contactService.addTagToContact('c-1', 't-missing')).rejects.toThrow(NotFoundError);
      expect(mockContactRepo.addTag).not.toHaveBeenCalled();
    });
  });

  describe('removeTagFromContact', () => {
    const existingContact = {
      id: 'c-1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      phone: null,
      company: null,
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingTag = {
      id: 't-1',
      name: 'VIP',
      color: '#10B981',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should remove tag from contact and log TAG_REMOVED activity', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(existingContact);
      (mockTagRepo.findById as any).mockResolvedValue(existingTag);
      (mockContactRepo.removeTag as any).mockResolvedValue(true);
      (mockContactRepo.logActivity as any).mockResolvedValue(undefined);

      await contactService.removeTagFromContact('c-1', 't-1');

      expect(mockContactRepo.findById).toHaveBeenCalledWith('c-1');
      expect(mockTagRepo.findById).toHaveBeenCalledWith('t-1');
      expect(mockContactRepo.removeTag).toHaveBeenCalledWith('c-1', 't-1');
      expect(mockContactRepo.logActivity).toHaveBeenCalledWith(
        'c-1',
        'TAG_REMOVED',
        'Tag "VIP" removed from contact',
        { tagId: 't-1', tagName: 'VIP' }
      );
    });

    it('should throw NotFoundError if contact is not found', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(null);

      await expect(contactService.removeTagFromContact('c-missing', 't-1')).rejects.toThrow(NotFoundError);
      expect(mockContactRepo.removeTag).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if tag is not found', async () => {
      (mockContactRepo.findById as any).mockResolvedValue(existingContact);
      (mockTagRepo.findById as any).mockResolvedValue(null);

      await expect(contactService.removeTagFromContact('c-1', 't-missing')).rejects.toThrow(NotFoundError);
      expect(mockContactRepo.removeTag).not.toHaveBeenCalled();
    });
  });

  describe('bulkUpdateTags', () => {
    const dummyContacts = [
      { id: 'c-1', firstName: 'Alice', lastName: 'Smith' },
      { id: 'c-2', firstName: 'Bob', lastName: 'Jones' },
    ];

    const dummyTags = [
      { id: 't-1', name: 'VIP', color: '#10B981' },
      { id: 't-2', name: 'Lead', color: '#3B82F6' },
    ];

    it('should bulk add tags across contacts', async () => {
      (mockContactRepo.findActiveByIds as any).mockResolvedValue(dummyContacts);
      (mockTagRepo.findByIds as any).mockResolvedValue(dummyTags);
      (mockContactRepo.bulkAddTags as any).mockResolvedValue(undefined);

      const result = await contactService.bulkUpdateTags({
        contactIds: ['c-1', 'c-2'],
        tagIds: ['t-1', 't-2'],
        action: 'add',
      });

      expect(mockContactRepo.findActiveByIds).toHaveBeenCalledWith(['c-1', 'c-2']);
      expect(mockTagRepo.findByIds).toHaveBeenCalledWith(['t-1', 't-2']);
      expect(mockContactRepo.bulkAddTags).toHaveBeenCalledWith(['c-1', 'c-2'], ['t-1', 't-2']);
      expect(result).toEqual({
        affectedContacts: 2,
        tagCount: 2,
        action: 'add',
      });
    });

    it('should bulk remove tags across contacts when action is remove', async () => {
      (mockContactRepo.findActiveByIds as any).mockResolvedValue(dummyContacts);
      (mockTagRepo.findByIds as any).mockResolvedValue(dummyTags);
      (mockContactRepo.bulkRemoveTags as any).mockResolvedValue(undefined);

      const result = await contactService.bulkUpdateTags({
        contactIds: ['c-1', 'c-2'],
        tagIds: ['t-1', 't-2'],
        action: 'remove',
      });

      expect(mockContactRepo.bulkRemoveTags).toHaveBeenCalledWith(['c-1', 'c-2'], ['t-1', 't-2']);
      expect(result.action).toBe('remove');
    });

    it('should throw BadRequestError if any contact is not found or deleted', async () => {
      // Only 1 of 2 contacts found
      (mockContactRepo.findActiveByIds as any).mockResolvedValue([dummyContacts[0]]);

      await expect(
        contactService.bulkUpdateTags({
          contactIds: ['c-1', 'c-2'],
          tagIds: ['t-1'],
        })
      ).rejects.toThrow(BadRequestError);

      expect(mockContactRepo.bulkAddTags).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if any tag is not found', async () => {
      (mockContactRepo.findActiveByIds as any).mockResolvedValue(dummyContacts);
      // Only 1 of 2 tags found
      (mockTagRepo.findByIds as any).mockResolvedValue([dummyTags[0]]);

      await expect(
        contactService.bulkUpdateTags({
          contactIds: ['c-1', 'c-2'],
          tagIds: ['t-1', 't-missing'],
        })
      ).rejects.toThrow(BadRequestError);

      expect(mockContactRepo.bulkAddTags).not.toHaveBeenCalled();
    });
  });
});
