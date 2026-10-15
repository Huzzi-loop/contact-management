import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagService } from '../src/services/tag.service';
import { TagRepository } from '../src/repositories/tag.repository';
import { ConflictError, NotFoundError } from '../src/utils/apiError';
import { Tag } from '../src/db/schema';

describe('TagService Unit Tests', () => {
  let mockRepo: Partial<TagRepository>;
  let tagService: TagService;

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      create: vi.fn(),
    };
    tagService = new TagService(mockRepo as TagRepository);
  });

  it('getAllTags should return all tags from repository', async () => {
    const dummyTags: Tag[] = [
      { id: '1', name: 'Customer', color: '#10B981', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Lead', color: '#F59E0B', createdAt: new Date(), updatedAt: new Date() },
    ];
    (mockRepo.findAll as any).mockResolvedValue(dummyTags);

    const result = await tagService.getAllTags();
    expect(result).toEqual(dummyTags);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it('getTagById should return tag when found', async () => {
    const dummyTag: Tag = {
      id: 'tag-1',
      name: 'VIP',
      color: '#8B5CF6',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockRepo.findById as any).mockResolvedValue(dummyTag);

    const result = await tagService.getTagById('tag-1');
    expect(result).toEqual(dummyTag);
    expect(mockRepo.findById).toHaveBeenCalledWith('tag-1');
  });

  it('getTagById should throw NotFoundError when tag is not found', async () => {
    (mockRepo.findById as any).mockResolvedValue(null);

    await expect(tagService.getTagById('unknown-id')).rejects.toThrow(NotFoundError);
  });

  it('createTag should successfully create a tag with trimmed name', async () => {
    const input = { name: '  Prospect  ', color: '#EC4899' };
    (mockRepo.findByName as any).mockResolvedValue(null);
    (mockRepo.create as any).mockResolvedValue({
      id: 'tag-new',
      name: 'Prospect',
      color: '#EC4899',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await tagService.createTag(input);
    expect(mockRepo.findByName).toHaveBeenCalledWith('Prospect');
    expect(mockRepo.create).toHaveBeenCalledWith({
      name: 'Prospect',
      color: '#EC4899',
    });
    expect(result.name).toBe('Prospect');
  });

  it('createTag should throw ConflictError when tag name already exists', async () => {
    (mockRepo.findByName as any).mockResolvedValue({ id: 'existing', name: 'Lead' });

    await expect(tagService.createTag({ name: 'Lead' })).rejects.toThrow(ConflictError);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
