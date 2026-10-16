import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactsApi } from '../api/contacts.api';
import { tagsApi } from '../api/tags.api';
import apiClient from '../api/client';

vi.mock('../api/client');

describe('API service modules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('contactsApi.getContacts queries contacts endpoint with sanitized params', async () => {
    const mockData = {
      data: {
        success: true,
        data: [{ id: 'c1', firstName: 'Alice', lastName: 'Walker' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData as any);

    const result = await contactsApi.getContacts({ search: 'Alice', limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith('/contacts', {
      params: { search: 'Alice', limit: 10 },
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].firstName).toBe('Alice');
  });

  it('tagsApi.getTags fetches all tags', async () => {
    const mockTags = {
      data: {
        success: true,
        data: [{ id: 't1', name: 'VIP', color: '#8B5CF6' }],
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockTags as any);

    const result = await tagsApi.getTags();
    expect(apiClient.get).toHaveBeenCalledWith('/tags');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('VIP');
  });
});
