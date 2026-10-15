import {
  ContactRepository,
  contactRepository,
  ContactWithTags,
  ContactWithDetails,
} from './contact.repository';
import { TagRepository, tagRepository } from '../tag/tag.repository';
import { NewContact } from '../../db/schema';
import { ConflictError, BadRequestError, NotFoundError } from '../../utils/apiError';

export interface CreateContactDTO {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tagIds?: string[];
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
}

export const contactService = new ContactService();
