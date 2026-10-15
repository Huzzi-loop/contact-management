import { db, pool, checkDbConnection } from './index';
import {
  contacts,
  tags,
  contactTags,
  contactActivities,
  NewContact,
  NewTag,
  Tag,
} from './schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';

const INITIAL_TAGS: NewTag[] = [
  { name: 'Customer', color: '#10B981' },   // Emerald
  { name: 'Lead', color: '#3B82F6' },       // Blue
  { name: 'VIP', color: '#F59E0B' },        // Amber
  { name: 'Partner', color: '#8B5CF6' },    // Purple
  { name: 'Prospect', color: '#06B6D4' },   // Cyan
  { name: 'Enterprise', color: '#EC4899' }, // Pink
  { name: 'Churn Risk', color: '#EF4444' }, // Red
  { name: 'Tier 1', color: '#6366F1' },     // Indigo
];

const INITIAL_CONTACTS: {
  contact: NewContact;
  tagNames: string[];
}[] = [
  {
    contact: {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 's.connor@cyberdyne.com',
      phone: '+1 (555) 234-5678',
      company: 'Cyberdyne Systems',
    },
    tagNames: ['VIP', 'Customer'],
  },
  {
    contact: {
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@wayneenterprises.com',
      phone: '+1 (555) 987-6543',
      company: 'Wayne Enterprises',
    },
    tagNames: ['VIP', 'Enterprise', 'Partner'],
  },
  {
    contact: {
      firstName: 'Tony',
      lastName: 'Stark',
      email: 'tony@starkindustries.com',
      phone: '+1 (555) 432-1098',
      company: 'Stark Industries',
    },
    tagNames: ['VIP', 'Enterprise'],
  },
  {
    contact: {
      firstName: 'Peter',
      lastName: 'Parker',
      email: 'p.parker@dailybugle.net',
      phone: '+1 (555) 345-6789',
      company: 'Daily Bugle',
    },
    tagNames: ['Lead', 'Prospect'],
  },
  {
    contact: {
      firstName: 'Diana',
      lastName: 'Prince',
      email: 'diana@themyscira.org',
      phone: '+1 (555) 567-8901',
      company: 'Museum of Antiquities',
    },
    tagNames: ['Partner'],
  },
  {
    contact: {
      firstName: 'Richard',
      lastName: 'Hendricks',
      email: 'richard@piedpiper.com',
      phone: '+1 (555) 876-5432',
      company: 'Pied Piper',
    },
    tagNames: ['Customer', 'Tier 1'],
  },
  {
    contact: {
      firstName: 'Dina',
      lastName: 'Morales',
      email: 'dina.morales@initech.com',
      phone: '+1 (555) 654-3210',
      company: 'Initech',
    },
    tagNames: ['Churn Risk'],
  },
  {
    contact: {
      firstName: 'Gavin',
      lastName: 'Belson',
      email: 'gavin@hooli.com',
      phone: '+1 (555) 789-0123',
      company: 'Hooli',
    },
    tagNames: ['Enterprise'],
  },
  {
    contact: {
      firstName: 'Pam',
      lastName: 'Beesly',
      email: 'pam@dundermifflin.com',
      phone: '+1 (555) 890-1234',
      company: 'Dunder Mifflin',
    },
    tagNames: ['Customer'],
  },
  {
    contact: {
      firstName: 'Jim',
      lastName: 'Halpert',
      email: 'jim@dundermifflin.com',
      phone: '+1 (555) 901-2345',
      company: 'Dunder Mifflin',
    },
    tagNames: ['Customer'],
  },
  {
    contact: {
      firstName: 'Michael',
      lastName: 'Scott',
      email: 'michael.scott@dundermifflin.com',
      phone: '+1 (555) 012-3456',
      company: 'Dunder Mifflin',
    },
    tagNames: ['VIP', 'Partner'],
  },
  {
    contact: {
      firstName: 'Walter',
      lastName: 'White',
      email: 'walter@graymatter.com',
      phone: '+1 (555) 123-9999',
      company: 'Gray Matter Tech',
    },
    tagNames: ['Lead'],
  },
  {
    contact: {
      firstName: 'Jesse',
      lastName: 'Pinkman',
      email: 'jesse@vamonospest.com',
      phone: '+1 (555) 234-8888',
      company: 'Vamonos Pest',
    },
    tagNames: ['Prospect'],
  },
  {
    contact: {
      firstName: 'Kim',
      lastName: 'Wexler',
      email: 'kim@wexlerlaw.com',
      phone: '+1 (555) 345-7777',
      company: 'Schweikart & Cokely',
    },
    tagNames: ['VIP', 'Customer'],
  },
  {
    contact: {
      firstName: 'Jimmy',
      lastName: 'McGill',
      email: 'jimmy@saulgoodman.com',
      phone: '+1 (555) 505-5000',
      company: 'Saul Goodman & Associates',
    },
    tagNames: ['Lead'],
  },
  {
    contact: {
      firstName: 'Elliot',
      lastName: 'Alderson',
      email: 'elliot@allsafe.com',
      phone: '+1 (555) 456-1122',
      company: 'Allsafe Cybersecurity',
    },
    tagNames: ['Tier 1', 'Partner'],
  },
  {
    contact: {
      firstName: 'Angela',
      lastName: 'Moss',
      email: 'angela@e-corp.com',
      phone: '+1 (555) 567-2233',
      company: 'E Corp',
    },
    tagNames: ['Enterprise'],
  },
  {
    contact: {
      firstName: 'Tyrell',
      lastName: 'Wellick',
      email: 'tyrell@e-corp.com',
      phone: '+1 (555) 678-3344',
      company: 'E Corp',
    },
    tagNames: ['Enterprise', 'Churn Risk'],
  },
  {
    contact: {
      firstName: 'Leslie',
      lastName: 'Knope',
      email: 'leslie@pawnee.gov',
      phone: '+1 (555) 789-4455',
      company: 'City of Pawnee',
    },
    tagNames: ['Customer', 'Partner'],
  },
  {
    contact: {
      firstName: 'Ron',
      lastName: 'Swanson',
      email: null,
      phone: '+1 (555) 890-5566',
      company: 'Very Good Building Co',
    },
    tagNames: [],
  },
];

export async function seed(): Promise<void> {
  console.log('🌱 Starting CRM database seeding...\n');

  const isConnected = await checkDbConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to PostgreSQL database.');
    console.error('   Please ensure PostgreSQL is running and DATABASE_URL in your .env is correct.');
    console.error('   Example: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db"\n');
    process.exit(1);
  }

  try {
    // 1. Seed Tags
    console.log('🏷️  Seeding tags...');
    for (const tagData of INITIAL_TAGS) {
      await db.insert(tags).values(tagData).onConflictDoNothing();
    }

    const allTags = await db.select().from(tags);
    const tagMap = new Map<string, Tag>();
    for (const tag of allTags) {
      tagMap.set(tag.name, tag);
    }
    console.log(`   ✓ ${allTags.length} tags ready in database.`);

    // 2. Seed Contacts
    console.log('👥 Seeding contacts with tags and activity history...');
    let seededContactsCount = 0;
    let seededActivitiesCount = 0;

    for (const item of INITIAL_CONTACTS) {
      // Check if contact with email already exists (if email is non-null)
      if (item.contact.email) {
        const existing = await db
          .select()
          .from(contacts)
          .where(and(eq(contacts.email, item.contact.email), isNull(contacts.deletedAt)));

        if (existing.length > 0) {
          continue; // Skip already seeded contact
        }
      }

      await db.transaction(async (tx) => {
        // Insert contact
        const [newContact] = await tx
          .insert(contacts)
          .values(item.contact)
          .returning();

        seededContactsCount++;

        // Associate tags
        const tagIds = item.tagNames
          .map((name) => tagMap.get(name)?.id)
          .filter((id): id is string => Boolean(id));

        if (tagIds.length > 0) {
          await tx.insert(contactTags).values(
            tagIds.map((tagId) => ({
              contactId: newContact.id,
              tagId,
            }))
          );
        }

        // Log initial CONTACT_CREATED activity
        await tx.insert(contactActivities).values({
          contactId: newContact.id,
          type: 'CONTACT_CREATED',
          description: `Contact ${newContact.firstName} ${newContact.lastName} was created`,
          metadata: { company: newContact.company },
        });
        seededActivitiesCount++;

        // Log TAG_ADDED activities
        for (const tagName of item.tagNames) {
          const tag = tagMap.get(tagName);
          if (tag) {
            await tx.insert(contactActivities).values({
              contactId: newContact.id,
              type: 'TAG_ADDED',
              description: `Tag "${tag.name}" added to contact`,
              metadata: { tagId: tag.id, tagName: tag.name },
            });
            seededActivitiesCount++;
          }
        }
      });
    }

    console.log(`   ✓ ${seededContactsCount} new contacts seeded.`);
    console.log(`   ✓ ${seededActivitiesCount} activity history entries recorded.`);
    console.log('\n🎉 CRM Database seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute directly if run as main script
if (require.main === module || process.argv[1]?.includes('seed')) {
  seed();
}
