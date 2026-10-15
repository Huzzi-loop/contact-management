import {
  ContactRepository,
  contactRepository,
  ContactWithTags,
  ContactWithDetails,
} from './contact.repository';
import { TagRepository, tagRepository } from '../tag/tag.repository';
import { Contact, NewContact, Tag } from '../../db/schema';
import { ConflictError, BadRequestError, NotFoundError } from '../../utils/apiError';

export interface CreateContactDTO {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tagIds?: string[];
}

export interface UpdateContactDTO {
  version: number;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
}

export interface GetContactsOptions {
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  tagId?: string;
  company?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedContactsResult {
  data: ContactWithTags[];
  meta: PaginationMeta;
}

export class ContactService {
  constructor(
    private readonly contactRepo: ContactRepository = contactRepository,
    private readonly tagRepo: TagRepository = tagRepository
  ) {}

  async createContact(dto: CreateContactDTO): Promise<ContactWithTags> {
    const trimmedEmail = dto.email ? dto.email.trim().toLowerCase() : null;

    // 1. Check email uniqueness among active contacts if email is present
    if (trimmedEmail) {
      const existing = await this.contactRepo.findActiveByEmail(trimmedEmail);
      if (existing) {
        throw new ConflictError(`A contact with email "${trimmedEmail}" already exists`);
      }
    }

    // 2. Verify all tag IDs exist if provided
    const tagIds = dto.tagIds || [];
    if (tagIds.length > 0) {
      const existingTags = await this.tagRepo.findByIds(tagIds);
      if (existingTags.length !== tagIds.length) {
        throw new BadRequestError('One or more specified tags do not exist');
      }
    }

    // 3. Prepare insert payload
    const newContactData: NewContact = {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: trimmedEmail,
      phone: dto.phone?.trim() || null,
      company: dto.company?.trim() || null,
    };

    return await this.contactRepo.create(newContactData, tagIds);
  }

  async getContactById(id: string): Promise<ContactWithDetails> {
    const contact = await this.contactRepo.findByIdWithDetails(id);
    if (!contact) {
      throw new NotFoundError(`Contact with ID "${id}" not found`);
    }
    return contact;
  }

  async updateContact(id: string, dto: UpdateContactDTO): Promise<Contact> {
    // 1. Fetch current contact to verify existence and OCC version
    const current = await this.contactRepo.findById(id);
    if (!current) {
      throw new NotFoundError(`Contact with ID "${id}" not found`);
    }

    // 2. Check for Optimistic Concurrency Conflict
    if (current.version !== dto.version) {
      const latest = await this.contactRepo.findByIdWithDetails(id);
      throw new ConflictError(
        'The contact was modified by another user. Please reload the latest details.',
        {
          currentVersion: current.version,
          submittedVersion: dto.version,
          latestContact: latest,
        }
      );
    }

    // 3. Check for email collision if email is being updated to a new address
    const newEmail = dto.email !== undefined
      ? (dto.email ? dto.email.trim().toLowerCase() : null)
      : undefined;

    if (newEmail && newEmail !== current.email) {
      const collision = await this.contactRepo.findActiveByEmail(newEmail, id);
      if (collision) {
        throw new ConflictError(`Email "${newEmail}" is already in use by another contact`);
      }
    }

    // 4. Prepare update payload
    const updateData: Partial<NewContact> = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName.trim();
    if (newEmail !== undefined) updateData.email = newEmail;
    if (dto.phone !== undefined) updateData.phone = dto.phone ? dto.phone.trim() : null;
    if (dto.company !== undefined) updateData.company = dto.company ? dto.company.trim() : null;

    // 5. Execute atomic update with version check
    const updated = await this.contactRepo.updateWithOCC(id, dto.version, updateData);
    if (!updated) {
      // Race condition caught: another write committed between our read and write
      const latest = await this.contactRepo.findByIdWithDetails(id);
      throw new ConflictError(
        'Concurrent update conflict detected. Please reload and try again.',
        { latestContact: latest }
      );
    }

    // 6. Record activity history
    const changedFields = Object.keys(updateData);
    await this.contactRepo.logActivity(
      id,
      'CONTACT_UPDATED',
      `Contact updated fields: ${changedFields.join(', ')}`,
      { updatedFields: changedFields }
    );

    return updated;
  }

  async deleteContact(id: string): Promise<void> {
    const deleted = await this.contactRepo.softDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Contact with ID "${id}" not found`);
    }
  }

  async addTagToContact(contactId: string, tagId: string): Promise<Tag> {
    const contact = await this.contactRepo.findById(contactId);
    if (!contact) {
      throw new NotFoundError(`Contact with ID "${contactId}" not found`);
    }

    const tag = await this.tagRepo.findById(tagId);
    if (!tag) {
      throw new NotFoundError(`Tag with ID "${tagId}" not found`);
    }

    const newlyAdded = await this.contactRepo.addTag(contactId, tagId);
    if (newlyAdded) {
      await this.contactRepo.logActivity(
        contactId,
        'TAG_ADDED',
        `Tag "${tag.name}" added to contact`,
        { tagId: tag.id, tagName: tag.name }
      );
    }

    return tag;
  }

  async removeTagFromContact(contactId: string, tagId: string): Promise<void> {
    const contact = await this.contactRepo.findById(contactId);
    if (!contact) {
      throw new NotFoundError(`Contact with ID "${contactId}" not found`);
    }

    const tag = await this.tagRepo.findById(tagId);
    if (!tag) {
      throw new NotFoundError(`Tag with ID "${tagId}" not found`);
    }

    const removed = await this.contactRepo.removeTag(contactId, tagId);
    if (removed) {
      await this.contactRepo.logActivity(
        contactId,
        'TAG_REMOVED',
        `Tag "${tag.name}" removed from contact`,
        { tagId: tag.id, tagName: tag.name }
      );
    }
  }

  async getAllContacts(): Promise<ContactWithTags[]> {
    return this.contactRepo.findAllActive();
  }

  async getContacts(optionsOrSearch?: string | GetContactsOptions): Promise<PaginatedContactsResult> {
    const options: GetContactsOptions =
      typeof optionsOrSearch === 'string'
        ? { search: optionsOrSearch }
        : optionsOrSearch || {};

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 10;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    const searchTerm = options.search;
    const tagId = options.tagId;
    const company = options.company;

    const [total, data] = await Promise.all([
      this.contactRepo.countContacts({ searchTerm, tagId, company }),
      this.contactRepo.findContacts({
        searchTerm,
        sortBy,
        sortOrder,
        page,
        limit,
        tagId,
        company,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

export const contactService = new ContactService();
