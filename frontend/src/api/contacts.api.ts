import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResult,
  ContactWithTags,
  ContactWithDetails,
  Contact,
  CreateContactDTO,
  UpdateContactDTO,
  GetContactsParams,
  BulkTagsDTO,
  BulkTagsResult,
  Tag,
} from '../types';

export const contactsApi = {
  /**
   * Fetch paginated list of contacts with search, sorting, and filters
   */
  async getContacts(params?: GetContactsParams): Promise<PaginatedResult<ContactWithTags>> {
    // Clean up empty params
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.search?.trim()) cleanParams.search = params.search.trim();
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.tagId) cleanParams.tagId = params.tagId;
      if (params.company?.trim()) cleanParams.company = params.company.trim();
    }

    const response = await apiClient.get<ApiResponse<ContactWithTags[]>>('/contacts', {
      params: cleanParams,
    });

    return {
      data: response.data.data,
      meta: response.data.meta!,
    };
  },

  /**
   * Fetch a single contact with tags and recent activity history
   */
  async getContactById(id: string): Promise<ContactWithDetails> {
    const response = await apiClient.get<ApiResponse<ContactWithDetails>>(`/contacts/${id}`);
    return response.data.data;
  },

  /**
   * Create a new contact
   */
  async createContact(dto: CreateContactDTO): Promise<ContactWithTags> {
    const response = await apiClient.post<ApiResponse<ContactWithTags>>('/contacts', dto);
    return response.data.data;
  },

  /**
   * Update contact with Optimistic Concurrency Control (OCC)
   */
  async updateContact(id: string, dto: UpdateContactDTO): Promise<Contact> {
    const response = await apiClient.patch<ApiResponse<Contact>>(`/contacts/${id}`, dto);
    return response.data.data;
  },

  /**
   * Soft delete a contact
   */
  async deleteContact(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/contacts/${id}`);
    return response.data.data;
  },

  /**
   * Add a single tag to a contact
   */
  async addTagToContact(contactId: string, tagId: string): Promise<Tag> {
    const response = await apiClient.post<ApiResponse<Tag>>(`/contacts/${contactId}/tags`, {
      tagId,
    });
    return response.data.data;
  },

  /**
   * Remove a single tag from a contact
   */
  async removeTagFromContact(contactId: string, tagId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/contacts/${contactId}/tags/${tagId}`);
  },

  /**
   * Bulk add or remove tags for multiple contacts
   */
  async bulkUpdateTags(dto: BulkTagsDTO): Promise<BulkTagsResult> {
    const response = await apiClient.post<ApiResponse<BulkTagsResult>>('/contacts/bulk-tags', dto);
    return response.data.data;
  },
};

export default contactsApi;
