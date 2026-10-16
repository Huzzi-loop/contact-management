import React from 'react';

export const TableRowSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 7,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-slate-100 animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="px-4 py-4 whitespace-nowrap">
              <div
                className="h-4 bg-slate-200 rounded"
                style={{
                  width: `${Math.max(40, (cIdx * 23 + (rIdx * 17)) % 70 + 30)}%`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="h-8 bg-slate-200 rounded" />
        <div className="h-8 bg-slate-200 rounded" />
      </div>
      <div className="h-24 bg-slate-200 rounded" />
    </div>
  );
};
