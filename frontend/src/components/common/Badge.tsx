import React from 'react';
import { X } from 'lucide-react';

export interface BadgeProps {
  label: string;
  color?: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = '#3B82F6',
  onRemove,
  size = 'md',
  className = '',
}) => {
  const sizeClasses =
    size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full transition-all border shrink-0 ${sizeClasses} ${className}`}
      style={{
        backgroundColor: `${color}18`, // ~10% opacity background
        borderColor: `${color}40`,     // ~25% opacity border
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="truncate max-w-[120px]">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 rounded-full p-0.5 ml-0.5 transition-opacity"
          aria-label={`Remove tag ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default Badge;
