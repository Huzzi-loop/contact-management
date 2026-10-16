import React from 'react';
import { Eye, Edit2, Trash2, Mail, Phone as PhoneIcon, Building } from 'lucide-react';
import type { ContactWithTags } from '../../types';
import { Badge } from '../common/Badge';
import { formatDateOnly } from '../../utils/formatDate';

export interface ContactRowProps {
  contact: ContactWithTags;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
  onViewDetails: (id: string) => void;
  onEdit: (contact: ContactWithTags) => void;
  onDelete: (contact: ContactWithTags) => void;
}

export const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  isSelected,
  onSelectToggle,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase();

  return (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
        isSelected ? 'bg-blue-50/50' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectToggle(contact.id)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
          aria-label={`Select ${fullName}`}
        />
      </td>

      {/* Name with Avatar */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onViewDetails(contact.id)}
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0 group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            {initials || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
              {fullName}
            </p>
            <p className="text-xs text-slate-400">v{contact.version}</p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-600">
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px]">{contact.email}</span>
          </a>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>

      {/* Phone */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
        {contact.phone ? (
          <span className="flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{contact.phone}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Company */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700">
        {contact.company ? (
          <span className="flex items-center gap-1.5 font-medium">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[140px]">{contact.company}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Tags */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
          {contact.tags && contact.tags.length > 0 ? (
            contact.tags.map((tag) => (
              <Badge key={tag.id} label={tag.name} color={tag.color} size="sm" />
            ))
          ) : (
            <span className="text-xs text-slate-400">No tags</span>
          )}
        </div>
      </td>

      {/* Created Date */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
        {formatDateOnly(contact.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onViewDetails(contact.id)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details & Activity"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Contact"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ContactRow;
