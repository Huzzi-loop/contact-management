import { useState, useEffect, useCallback } from 'react';
import { tagsApi } from '../api';
import type { Tag, CreateTagDTO } from '../types';
import { parseApiError } from '../utils/errorHandler';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tagsApi.getTags();
      setTags(data);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (dto: CreateTagDTO): Promise<Tag> => {
    try {
      const newTag = await tagsApi.createTag(dto);
      setTags((prev) => [...prev, newTag]);
      return newTag;
    } catch (err) {
      const parsed = parseApiError(err);
      throw parsed;
    }
  };

  return {
    tags,
    loading,
    error,
    reloadTags: fetchTags,
    createTag,
  };
}

export default useTags;
