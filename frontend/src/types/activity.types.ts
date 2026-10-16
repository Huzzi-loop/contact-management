export type ActivityType =
  | 'CONTACT_CREATED'
  | 'CONTACT_UPDATED'
  | 'TAG_ADDED'
  | 'TAG_REMOVED'
  | 'CONTACT_DELETED';

export interface ContactActivity {
  id: string;
  contactId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
}
