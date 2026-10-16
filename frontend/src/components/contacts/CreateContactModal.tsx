import React, { useState } from 'react';
import { UserPlus, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { contactsApi } from '../../api';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/errorHandler';
import type { Tag, CreateContactDTO } from '../../types';

export interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableTags: Tag[];
}

export const CreateContactModal: React.FC<CreateContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableTags,
}) => {
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSelectedTagIds([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

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
    if (!validate()) return;

    try {
      setLoading(true);
      const payload: CreateContactDTO = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      };

      await contactsApi.createContact(payload);
      showToast(
        `Contact "${payload.firstName} ${payload.lastName}" created successfully`,
        'success'
      );
      handleClose();
      onSuccess();
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed.isConflict) {
        setErrors((prev) => ({ ...prev, email: parsed.message }));
      } else {
        showToast(parsed.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
          <span>Create New Contact</span>
        </div>
      }
      description="Add a new contact to your CRM workspace."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
          >
            Create Contact
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
            placeholder="John"
            required
            error={errors.firstName}
            autoFocus
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            placeholder="Doe"
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
          placeholder="john.doe@example.com"
          error={errors.email}
          helperText="Email is unique per active contact"
        />

        {/* Phone & Company */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555-0199"
          />
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
          />
        </div>

        {/* Initial Tags Selector */}
        {availableTags.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Assign Initial Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateContactModal;
