import { eq, and, isNull, ne, desc, sql } from 'drizzle-orm';
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
}

export const contactRepository = new ContactRepository();
