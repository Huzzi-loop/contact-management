import React, { useState, useEffect } from 'react';
import { Edit2, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { contactsApi } from '../../api';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/errorHandler';
import type { ContactWithTags, ContactWithDetails, UpdateContactDTO, OccConflictDetails } from '../../types';

export interface EditContactModalProps {
  contact: ContactWithTags | ContactWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onConflict: (conflictDetails?: OccConflictDetails<ContactWithDetails>) => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  contact,
  isOpen,
  onClose,
  onSuccess,
  onConflict,
}) => {
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [version, setVersion] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName || '');
      setLastName(contact.lastName || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setCompany(contact.company || '');
      setVersion(contact.version || 1);
      setErrors({});
    }
  }, [contact]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !validate()) return;

    try {
      setLoading(true);
      const payload: UpdateContactDTO = {
        version,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        company: company.trim() || null,
      };

      await contactsApi.updateContact(contact.id, payload);
      showToast('Contact updated successfully', 'success');
      onClose();
      onSuccess();
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed.isConflict) {
        // OCC Version Mismatch detected!
        onClose();
        onConflict(parsed.conflictDetails);
      } else if (parsed.isValidationError) {
        showToast(parsed.message, 'error');
      } else {
        showToast(parsed.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Edit2 className="w-4 h-4" />
          </div>
          <span>Edit Contact</span>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 ml-auto">
            Base: v{version}
          </span>
        </div>
      }
      description="Update contact details. Changes are protected with optimistic concurrency control."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            required
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            required
            error={errors.lastName}
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={errors.email}
          helperText="Unique among active contacts"
        />

        {/* Phone & Company */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        {/* OCC Notice */}
        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-800 text-[11px] flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            This update will be committed against record version <strong>v{version}</strong>. If another user saves modifications first, you will be notified to review and reload.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default EditContactModal;
