import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Contacts Table
export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    company: varchar('company', { length: 150 }),
    version: integer('version').default(1).notNull(), // Optimistic Concurrency Control
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft Delete
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('idx_contacts_company').on(table.company),
    index('idx_contacts_created_at').on(table.createdAt),
    index('idx_contacts_deleted_at').on(table.deletedAt),
    // Partial Unique Index: email must be unique among active (non-deleted) contacts
    uniqueIndex('idx_contacts_active_email')
      .on(table.email)
      .where(sql`deleted_at IS NULL AND email IS NOT NULL`),
  ]
);

// Tags Table
export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 20 }).default('#3B82F6'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Contact - Tag Many-to-Many Junction Table
export const contactTags = pgTable(
  'contact_tags',
  {
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.contactId, table.tagId] }),
    index('idx_contact_tags_tag_id').on(table.tagId),
  ]
);

// Contact Activities Table (Audit History)
export const contactActivities = pgTable(
  'contact_activities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(), // 'CONTACT_CREATED' | 'CONTACT_UPDATED' | 'TAG_ADDED' | 'TAG_REMOVED' | 'CONTACT_DELETED'
    description: text('description').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_activities_contact_created').on(table.contactId, table.createdAt),
  ]
);

// Drizzle Relations
export const contactsRelations = relations(contacts, ({ many }) => ({
  tags: many(contactTags),
  activities: many(contactActivities),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  contacts: many(contactTags),
}));

export const contactTagsRelations = relations(contactTags, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactTags.contactId],
    references: [contacts.id],
  }),
  tag: one(tags, {
    fields: [contactTags.tagId],
    references: [tags.id],
  }),
}));

export const contactActivitiesRelations = relations(contactActivities, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactActivities.contactId],
    references: [contacts.id],
  }),
}));

// Inferred TypeScript Types
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type ContactTag = typeof contactTags.$inferSelect;
export type NewContactTag = typeof contactTags.$inferInsert;

export type ContactActivity = typeof contactActivities.$inferSelect;
export type NewContactActivity = typeof contactActivities.$inferInsert;
