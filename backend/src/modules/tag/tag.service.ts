import { Tag } from '../../db/schema';
import { TagRepository, tagRepository, CreateTagDTO } from './tag.repository';
import { ConflictError, NotFoundError } from '../../utils/apiError';

export class TagService {
  constructor(private readonly repo: TagRepository = tagRepository) {}

  async getAllTags(): Promise<Tag[]> {
    return this.repo.findAll();
  }

  async getTagById(id: string): Promise<Tag> {
    const tag = await this.repo.findById(id);
    if (!tag) {
      throw new NotFoundError(`Tag with ID "${id}" not found`);
    }
    return tag;
  }

  async createTag(data: CreateTagDTO): Promise<Tag> {
    const trimmedName = data.name.trim();

    // Check if tag with the same name already exists
    const existing = await this.repo.findByName(trimmedName);
    if (existing) {
      throw new ConflictError(`Tag "${trimmedName}" already exists`);
    }

    return this.repo.create({
      name: trimmedName,
      color: data.color || '#3B82F6',
    });
  }
}

export const tagService = new TagService();
