import { eq, inArray, asc } from 'drizzle-orm';
import { db } from '../../db';
import { tags, Tag } from '../../db/schema';

export interface CreateTagDTO {
  name: string;
  color?: string;
}

export class TagRepository {
  async findAll(): Promise<Tag[]> {
    return db.select().from(tags).orderBy(asc(tags.name));
  }

  async findById(id: string): Promise<Tag | null> {
    const result = await db.select().from(tags).where(eq(tags.id, id));
    return result[0] || null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const result = await db.select().from(tags).where(eq(tags.name, name));
    return result[0] || null;
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) return [];
    return db.select().from(tags).where(inArray(tags.id, ids));
  }

  async create(data: CreateTagDTO): Promise<Tag> {
    const result = await db.insert(tags).values(data).returning();
    return result[0];
  }
}

export const tagRepository = new TagRepository();
