import { eq, and, isNull, ne, desc, asc, sql, inArray, ilike, or } from 'drizzle-orm';
import { db } from '../../db';
import {
  contacts,
  contactTags,
  tags,
  contactActivities,
  Contact,
  NewContact,
  Tag,
  ContactActivity,
} from '../../db/schema';

export interface ContactWithTags extends Contact {
  tags: Tag[];
}

export interface ContactWithDetails extends Contact {
  tags: Tag[];
  recentActivities: ContactActivity[];
}

export interface ContactFindOptions {
  searchTerm?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export class ContactRepository {
  async findActiveByEmail(email: string, excludeId?: string): Promise<Contact | null> {
    const conditions = [
      eq(contacts.email, email),
      isNull(contacts.deletedAt),
    ];

    if (excludeId) {
      conditions.push(ne(contacts.id, excludeId));
    }

    const result = await db
      .select()
      .from(contacts)
      .where(and(...conditions));

    return result[0] || null;
  }

  async findById(id: string): Promise<Contact | null> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), isNull(contacts.deletedAt)));

    return contact || null;
  }

  async findByIdWithDetails(id: string): Promise<ContactWithDetails | null> {
    // 1. Fetch active contact
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), isNull(contacts.deletedAt)));

    if (!contact) return null;

    // 2. Fetch associated tags
    const assignedTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
      })
      .from(contactTags)
      .innerJoin(tags, eq(contactTags.tagId, tags.id))
      .where(eq(contactTags.contactId, id));

    // 3. Fetch recent activities (latest 10)
    const recentActivities = await db
      .select()
      .from(contactActivities)
      .where(eq(contactActivities.contactId, id))
      .orderBy(desc(contactActivities.createdAt))
      .limit(10);

    return {
      ...contact,
      tags: assignedTags,
      recentActivities,
    };
  }

  async create(data: NewContact, tagIds: string[] = []): Promise<ContactWithTags> {
    return await db.transaction(async (tx) => {
      // 1. Insert contact record
      const [newContact] = await tx
        .insert(contacts)
        .values(data)
        .returning();

      // 2. Associate tags if provided
      let associatedTags: Tag[] = [];
      if (tagIds.length > 0) {
        await tx.insert(contactTags).values(
          tagIds.map((tagId) => ({
            contactId: newContact.id,
            tagId,
          }))
        );

        // Fetch associated tags for response
        associatedTags = await tx
          .select({
            id: tags.id,
            name: tags.name,
            color: tags.color,
            createdAt: tags.createdAt,
            updatedAt: tags.updatedAt,
          })
          .from(contactTags)
          .innerJoin(tags, eq(contactTags.tagId, tags.id))
          .where(eq(contactTags.contactId, newContact.id));
      }

      // 3. Log initial CONTACT_CREATED activity
      await tx.insert(contactActivities).values({
        contactId: newContact.id,
        type: 'CONTACT_CREATED',
        description: `Contact ${newContact.firstName} ${newContact.lastName} was created`,
        metadata: { tagCount: tagIds.length },
      });

      return {
        ...newContact,
        tags: associatedTags,
      };
    });
  }

  async updateWithOCC(
    id: string,
    expectedVersion: number,
    data: Partial<NewContact>
  ): Promise<Contact | null> {
    const result = await db
      .update(contacts)
      .set({
        ...data,
        version: sql`${contacts.version} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(contacts.id, id),
          eq(contacts.version, expectedVersion),
          isNull(contacts.deletedAt)
        )
      )
      .returning();

    return result[0] || null;
  }

  async logActivity(
    contactId: string,
    type: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    await db.insert(contactActivities).values({
      contactId,
      type,
      description,
      metadata,
    });
  }

  async softDelete(id: string): Promise<Contact | null> {
    return await db.transaction(async (tx) => {
      const [deletedContact] = await tx
        .update(contacts)
        .set({
          deletedAt: new Date(),
        })
        .where(and(eq(contacts.id, id), isNull(contacts.deletedAt)))
        .returning();

      if (!deletedContact) return null;

      // Log CONTACT_DELETED activity
      await tx.insert(contactActivities).values({
        contactId: id,
        type: 'CONTACT_DELETED',
        description: 'Contact was archived / deleted',
      });

      return deletedContact;
    });
  }

  async findAllActive(): Promise<ContactWithTags[]> {
    const contactList = await db
      .select()
      .from(contacts)
      .where(isNull(contacts.deletedAt));

    if (contactList.length === 0) return [];

    // Batch fetch tags for all contacts to eliminate N+1 queries
    const contactIds = contactList.map((c) => c.id);
    const tagRows = await db
      .select({
        contactId: contactTags.contactId,
        tag: {
          id: tags.id,
          name: tags.name,
          color: tags.color,
          createdAt: tags.createdAt,
          updatedAt: tags.updatedAt,
        },
      })
      .from(contactTags)
      .innerJoin(tags, eq(contactTags.tagId, tags.id))
      .where(inArray(contactTags.contactId, contactIds));

    // Group tags by contactId
    const tagMap = new Map<string, Tag[]>();
    for (const row of tagRows) {
      const existing = tagMap.get(row.contactId) || [];
      existing.push(row.tag);
      tagMap.set(row.contactId, existing);
    }

    return contactList.map((c) => ({
      ...c,
      tags: tagMap.get(c.id) || [],
    }));
  }

  async findContacts(options: ContactFindOptions = {}): Promise<ContactWithTags[]> {
    const { searchTerm, sortBy = 'createdAt', sortOrder = 'desc', limit = 10 } = options;
    const conditions = [isNull(contacts.deletedAt)];

    if (searchTerm && searchTerm.trim().length > 0) {
      const term = searchTerm.trim();
      conditions.push(
        or(
          ilike(contacts.firstName, `%${term}%`),
          ilike(contacts.lastName, `%${term}%`),
          ilike(contacts.email, `%${term}%`),
          ilike(contacts.phone, `%${term}%`),
          sql`LOWER(${contacts.firstName} || ' ' || ${contacts.lastName}) LIKE LOWER(${'%' + term + '%'})`
        )!
      );
    }

    const orderFn = sortOrder === 'asc' ? asc : desc;
    const orderByClause =
      sortBy === 'name'
        ? [orderFn(contacts.firstName), orderFn(contacts.lastName)]
        : [orderFn(contacts.createdAt)];

    const contactList = await db
      .select()
      .from(contacts)
      .where(and(...conditions))
      .orderBy(...orderByClause)
      .limit(limit);

    if (contactList.length === 0) return [];

    // Batch fetch tags for all contacts to eliminate N+1 queries
    const contactIds = contactList.map((c) => c.id);
    const tagRows = await db
      .select({
        contactId: contactTags.contactId,
        tag: {
          id: tags.id,
          name: tags.name,
          color: tags.color,
          createdAt: tags.createdAt,
          updatedAt: tags.updatedAt,
        },
      })
      .from(contactTags)
      .innerJoin(tags, eq(contactTags.tagId, tags.id))
      .where(inArray(contactTags.contactId, contactIds));

    // Group tags by contactId
    const tagMap = new Map<string, Tag[]>();
    for (const row of tagRows) {
      const existing = tagMap.get(row.contactId) || [];
      existing.push(row.tag);
      tagMap.set(row.contactId, existing);
    }

    return contactList.map((c) => ({
      ...c,
      tags: tagMap.get(c.id) || [],
    }));
  }

  async searchContacts(searchTerm?: string, limit: number = 10): Promise<ContactWithTags[]> {
    return this.findContacts({ searchTerm, limit });
  }
}

export const contactRepository = new ContactRepository();
