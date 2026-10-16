import apiClient from './client';
import type { ApiResponse, Tag, CreateTagDTO } from '../types';

export const tagsApi = {
  /**
   * Fetch all tags
   */
  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<ApiResponse<Tag[]>>('/tags');
    return response.data.data;
  },

  /**
   * Fetch a single tag by ID
   */
  async getTagById(id: string): Promise<Tag> {
    const response = await apiClient.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data.data;
  },

  /**
   * Create a new tag
   */
  async createTag(dto: CreateTagDTO): Promise<Tag> {
    const response = await apiClient.post<ApiResponse<Tag>>('/tags', dto);
    return response.data.data;
  },
};

export default tagsApi;
