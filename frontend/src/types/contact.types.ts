import type { Tag } from './tag.types';
import type { ContactActivity } from './activity.types';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactWithTags extends Contact {
  tags: Tag[];
}

export interface ContactWithDetails extends Contact {
  tags: Tag[];
  recentActivities: ContactActivity[];
}

export interface CreateContactDTO {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tagIds?: string[];
}

export interface UpdateContactDTO {
  version: number;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
}

export type SortByOption = 'name' | 'createdAt';
export type SortOrderOption = 'asc' | 'desc';

export interface GetContactsParams {
  search?: string;
  sortBy?: SortByOption;
  sortOrder?: SortOrderOption;
  page?: number;
  limit?: number;
  tagId?: string;
  company?: string;
}

export interface BulkTagsDTO {
  contactIds: string[];
  tagIds: string[];
  action: 'add' | 'remove';
}

export interface BulkTagsResult {
  affectedContacts: number;
  tagCount: number;
  action: 'add' | 'remove';
}
