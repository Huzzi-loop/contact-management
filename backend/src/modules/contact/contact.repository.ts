import { eq, and, isNull, ne } from 'drizzle-orm';
import { db } from '../../db';
import {
  contacts,
  contactTags,
  tags,
  contactActivities,
  Contact,
  NewContact,
  Tag,
} from '../../db/schema';

export interface ContactWithTags extends Contact {
  tags: Tag[];
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
}

export const contactRepository = new ContactRepository();
