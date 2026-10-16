import React from 'react';
import {
  UserPlus,
  Edit3,
  Tag as TagIcon,
  MinusCircle,
  Trash2,
  Clock,
} from 'lucide-react';
import type { ContactActivity, ActivityType } from '../../types';
import { formatDateTime, formatRelativeTime } from '../../utils/formatDate';

export interface ActivityTimelineProps {
  activities: ContactActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
        <Clock className="w-5 h-5 text-slate-300" />
        <p>No activity history recorded yet.</p>
      </div>
    );
  }

  const renderActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'CONTACT_CREATED':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-3.5 h-3.5" />
          </div>
        );
      case 'CONTACT_UPDATED':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
        );
      case 'TAG_ADDED':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <TagIcon className="w-3.5 h-3.5" />
          </div>
        );
      case 'TAG_REMOVED':
        return (
          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <MinusCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'CONTACT_DELETED':
        return (
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => {
          const isLast = activityIdx === activities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-6">
                {!isLast && (
                  <span
                    className="absolute left-3.5 top-7 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {renderActivityIcon(activity.type)}

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800">
                        {activity.description}
                      </p>
                      <time
                        dateTime={activity.createdAt}
                        title={formatDateTime(activity.createdAt)}
                        className="text-[11px] text-slate-400 shrink-0"
                      >
                        {formatRelativeTime(activity.createdAt)}
                      </time>
                    </div>

                    {/* Metadata rendering if present */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-1 text-[11px] text-slate-600 bg-slate-100/80 rounded-md px-2 py-1 border border-slate-200/80 inline-block font-medium">
                        {activity.metadata.updatedFields ? (
                          <span>Updated: {activity.metadata.updatedFields.join(', ')}</span>
                        ) : activity.metadata.tagName ? (
                          <span>Tag: {activity.metadata.tagName}</span>
                        ) : (
                          <span>{JSON.stringify(activity.metadata)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActivityTimeline;
