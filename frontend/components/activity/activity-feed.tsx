'use client';

import { useEffect, useRef, useState } from 'react';
import { ACTIVITY_FEED_VISIBLE_COUNT } from '@/features/activity/query-keys';
import type { Activity } from '@/features/activity/types';

type Props = {
  activities: Activity[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
};

function formatActor(activity: Activity) {
  return activity.userName || activity.userEmail || activity.userId;
}

function formatVerb(type: Activity['type']) {
  if (type === 'created') return 'created';
  if (type === 'edited') return 'edited';
  return 'deleted';
}

function formatInitial(activity: Activity) {
  const label = formatActor(activity).trim();
  return label.charAt(0).toUpperCase() || 'U';
}

function getActivityTheme(type: Activity['type']) {
  if (type === 'created') {
    return {
      iconClass: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
      cardClass:
        'border-emerald-100/75 bg-[linear-gradient(120deg,rgba(248,255,251,0.98)_0%,rgba(241,253,246,0.94)_26%,rgba(252,255,254,0.98)_72%,rgba(255,255,255,0.99)_100%)]',
    };
  }

  if (type === 'edited') {
    return {
      iconClass: 'border-amber-200/80 bg-amber-50 text-amber-700',
      cardClass:
        'border-amber-100/75 bg-[linear-gradient(120deg,rgba(255,252,239,0.98)_0%,rgba(255,248,223,0.92)_26%,rgba(255,254,248,0.98)_72%,rgba(255,255,255,0.99)_100%)]',
    };
  }

  return {
    iconClass: 'border-rose-200/80 bg-rose-50 text-rose-700',
    cardClass:
      'border-rose-100/75 bg-[linear-gradient(120deg,rgba(255,245,247,0.98)_0%,rgba(255,236,240,0.92)_26%,rgba(255,250,251,0.98)_72%,rgba(255,255,255,0.99)_100%)]',
  };
}

function ActivityTypeIcon({ type }: Pick<Activity, 'type'>) {
  if (type === 'created') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5 stroke-current"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 4.5v11" />
        <path d="M4.5 10h11" />
      </svg>
    );
  }

  if (type === 'edited') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5 stroke-current"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 14.8 5 12l7.5-7.5 2.8 2.8-7.5 7.5-2.8.5Z" />
        <path d="m11.7 5.3 2.8 2.8" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 6.5h9" />
      <path d="M7.2 6.5V5.2c0-.39.31-.7.7-.7h4.2c.39 0 .7.31.7.7v1.3" />
      <path d="m6.7 8.2.5 6.1c.03.38.35.67.73.67h4.2c.38 0 .7-.29.73-.67l.5-6.1" />
      <path d="M8.6 9.4v4" />
      <path d="M11.4 9.4v4" />
    </svg>
  );
}

function formatRelativeTime(value: string, now: number) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  const diffMs = date.getTime() - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 45) {
    return 'just now';
  }

  const diffMinutes = Math.round(diffSeconds / 60);

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: ACTIVITY_FEED_VISIBLE_COUNT }).map((_, index) => (
        <div
          key={index}
          className="rounded-[22px] border border-slate-200/80 bg-white/82 p-3 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.4)]"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-slate-200/80" />
            <div className="flex-1">
              <div className="h-2.5 w-16 rounded-full bg-slate-200/80" />
              <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-200/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed({
  activities,
  isLoading,
  isError,
  error,
  onRetry,
}: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const hasLoadedRef = useRef(false);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const highlightTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const highlightTimeouts = highlightTimeoutsRef.current;

    return () => {
      highlightTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      highlightTimeouts.clear();
    };
  }, []);

  useEffect(() => {
    if (!activities.length) {
      knownIdsRef.current = new Set();
      hasLoadedRef.current = false;
      return;
    }

    const nextIds = new Set(activities.map((activity) => activity.id));

    if (!hasLoadedRef.current) {
      knownIdsRef.current = nextIds;
      hasLoadedRef.current = true;
      return;
    }

    const freshVisibleIds = activities
      .slice(0, ACTIVITY_FEED_VISIBLE_COUNT)
      .map((activity) => activity.id)
      .filter((id) => !knownIdsRef.current.has(id));

    if (freshVisibleIds.length > 0) {
      setHighlightedIds((current) =>
        Array.from(new Set([...freshVisibleIds, ...current]))
      );

      freshVisibleIds.forEach((id) => {
        const existingTimeout = highlightTimeoutsRef.current.get(id);

        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeoutId = setTimeout(() => {
          setHighlightedIds((current) =>
            current.filter((activityId) => activityId !== id)
          );
          highlightTimeoutsRef.current.delete(id);
        }, 2200);

        highlightTimeoutsRef.current.set(id, timeoutId);
      });
    }

    knownIdsRef.current = nextIds;
  }, [activities]);

  const feedHeightClass =
    ACTIVITY_FEED_VISIBLE_COUNT === 3 ? 'max-h-[21rem]' : 'max-h-[24rem]';

  return (
    <aside className="xl:sticky xl:top-8">
      <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-[0_28px_60px_-38px_rgba(15,23,42,0.42)] backdrop-blur-sm">
        <div className="border-b border-slate-200/70 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-900">
                Activity feed
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Latest note actions, newest first.
          </p>
        </div>

        <div className="px-3 py-3 sm:px-4 sm:py-4">
          {isLoading ? <ActivityFeedSkeleton /> : null}

          {!isLoading && isError ? (
            <div className="rounded-[20px] border border-red-200/80 bg-red-50/85 p-3.5">
              <p className="text-xs text-red-700">
                {error instanceof Error
                  ? error.message
                  : 'Failed to load activity feed'}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition duration-200 hover:-translate-y-0.5"
              >
                Retry
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && activities.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-white/80 p-4 text-xs leading-5 text-slate-500">
              Activity will appear here as soon as someone changes a note.
            </div>
          ) : null}

          {!isLoading && !isError && activities.length > 0 ? (
            <div
              className={`${feedHeightClass} space-y-2.5 overflow-y-auto pr-1 [scrollbar-gutter:stable]`}
            >
              {activities.map((activity) => (
                (() => {
                  const theme = getActivityTheme(activity.type);
                  const isHighlighted = highlightedIds.includes(activity.id);

                  return (
                    <article
                      key={activity.id}
                      className={`group relative overflow-hidden rounded-[22px] border p-2 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_-26px_rgba(15,23,42,0.2)] ${theme.cardClass} ${isHighlighted ? 'activity-feed-item-new ring-1 ring-sky-200/80 ring-inset' : ''}`}
                    >
                      <div className="relative flex items-start gap-3 pl-2">
                        <div className="relative shrink-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(237,244,255,0.78))] text-[11px] font-semibold text-slate-700 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] backdrop-blur-sm">
                            {formatInitial(activity)}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border bg-white shadow-[0_10px_18px_-14px_rgba(15,23,42,0.35)] ${theme.iconClass}`}
                          >
                            <ActivityTypeIcon type={activity.type} />
                          </div>
                        </div>

                        <div className="relative min-w-0 flex-1 pl-1 pr-24">
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-slate-900">
                              {formatActor(activity)}
                            </p>
                          </div>

                          <div className="absolute right-0 top-0 flex items-end gap-1.5 pt-0.5">
                            {isHighlighted && (
                              <span className="inline-flex rounded-full border border-sky-200/90 bg-sky-50/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                                New
                              </span>
                            )}
                            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">
                              {formatRelativeTime(activity.createdAt, now)}
                            </p>
                          </div>

                          <p className="mt-2 text-[12px] leading-5 text-slate-600">
                            <span className="text-slate-600">
                              {formatVerb(activity.type)} note
                            </span>{' '}
                            <span className="font-semibold text-slate-900">
                              {activity.noteTitle}
                            </span>
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })()
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </aside>
  );
}
