import React, { useState } from 'react';
import type { ContactWithTags } from './types';
import { formatDateOnly } from './utils/formatDate';

// Mock contacts for initial UI layout verification
const MOCK_CONTACTS: ContactWithTags[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah.connor@cyberdyne.com',
    phone: '+1 555-0199',
    company: 'Resistance HQ',
    version: 1,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [
      { id: 't1', name: 'VIP', color: '#8B5CF6', createdAt: '', updatedAt: '' },
      { id: 't2', name: 'Customer', color: '#10B981', createdAt: '', updatedAt: '' },
    ],
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@acme.inc',
    phone: '+1 555-0142',
    company: 'Acme Corp',
    version: 1,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [
      { id: 't3', name: 'Lead', color: '#3B82F6', createdAt: '', updatedAt: '' },
    ],
  },
];

export const App: React.FC = () => {
  const [contacts] = useState<ContactWithTags[]>(MOCK_CONTACTS);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">CRM Workspace</h1>
            <p className="text-xs text-slate-500">Contact Management & Tagging</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {contacts.length} Contacts (Mock Preview)
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Tags</th>
                <th className="px-4 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{contact.email}</td>
                  <td className="px-4 py-3.5 text-slate-600">{contact.phone}</td>
                  <td className="px-4 py-3.5 text-slate-700">{contact.company}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {contact.tags.map((t) => (
                        <span
                          key={t.id}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${t.color}20`,
                            color: t.color,
                          }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">
                    {formatDateOnly(contact.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default App;
