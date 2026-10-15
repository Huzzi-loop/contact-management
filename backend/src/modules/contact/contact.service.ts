import {
  ContactRepository,
  contactRepository,
  ContactWithTags,
  ContactWithDetails,
} from './contact.repository';
import { TagRepository, tagRepository } from '../tag/tag.repository';
import { Contact, NewContact } from '../../db/schema';
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

  async getAllContacts(): Promise<ContactWithTags[]> {
    return this.contactRepo.findAllActive();
  }

  async getContacts(optionsOrSearch?: string | GetContactsOptions): Promise<ContactWithTags[]> {
    const options: GetContactsOptions =
      typeof optionsOrSearch === 'string'
        ? { search: optionsOrSearch }
        : optionsOrSearch || {};

    return this.contactRepo.findContacts({
      searchTerm: options.search,
      sortBy: options.sortBy || 'createdAt',
      sortOrder: options.sortOrder || 'desc',
      limit: 10,
    });
  }
}

export const contactService = new ContactService();
