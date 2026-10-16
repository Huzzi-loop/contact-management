import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">CRM Workspace</h1>
        <p className="text-xs text-slate-500">Contact Management & Tagging</p>
      </header>
      <main className="max-w-7xl mx-auto p-6 w-full">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-600">Tailwind CSS configured successfully.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
