import { useState, useEffect, useCallback } from 'react';
import { contactsApi } from '../api';
import type { ContactWithDetails } from '../types';
import { parseApiError } from '../utils/errorHandler';

export function useContactDetail(contactId: string | null) {
  const [contact, setContact] = useState<ContactWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tagLoading, setTagLoading] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!contactId) {
      setContact(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await contactsApi.getContactById(contactId);
      setContact(data);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const addTag = async (tagId: string) => {
    if (!contactId) return;
    try {
      setTagLoading(true);
      await contactsApi.addTagToContact(contactId, tagId);
      // Re-fetch detail to capture updated tags and new activity entry
      await fetchDetail();
    } catch (err) {
      const parsed = parseApiError(err);
      throw parsed;
    } finally {
      setTagLoading(false);
    }
  };

  const removeTag = async (tagId: string) => {
    if (!contactId) return;
    try {
      setTagLoading(true);
      await contactsApi.removeTagFromContact(contactId, tagId);
      // Re-fetch detail to capture updated tags and new activity entry
      await fetchDetail();
    } catch (err) {
      const parsed = parseApiError(err);
      throw parsed;
    } finally {
      setTagLoading(false);
    }
  };

  return {
    contact,
    loading,
    error,
    tagLoading,
    refresh: fetchDetail,
    addTag,
    removeTag,
  };
}

export default useContactDetail;
