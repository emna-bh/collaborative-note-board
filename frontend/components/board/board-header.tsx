'use client';

import { AccountMenu } from './account-menu';

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.2 13.2 16 16" />
    </svg>
  );
}

type Props = {
  filteredCount: number;
  isFiltering: boolean;
  isLoadingNotes: boolean;
  isNotesError: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  userEmail?: string | null;
  userDisplayName?: string | null;
  isSigningOut?: boolean;
  onSignOut: () => Promise<void> | void;
};

export function BoardHeader({
  filteredCount,
  isFiltering,
  isLoadingNotes,
  isNotesError,
  searchQuery,
  onSearchQueryChange,
  userEmail,
  userDisplayName,
  isSigningOut,
  onSignOut,
}: Props) {
  const showSearch = !isLoadingNotes && !isNotesError;

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          Collaborative board
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <h1 className="min-w-0 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
            Shared Notes Board
          </h1>

          {showSearch && (
            <div className="flex w-full flex-wrap items-center gap-2 lg:max-w-xl lg:justify-end">
              <label className="flex min-w-[16rem] flex-1 items-center gap-3 rounded-full border border-white/75 bg-white/82 px-4 py-2.5 text-sm text-slate-600 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.25)] backdrop-blur-sm">
                <SearchIcon />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  placeholder="Search by title or content"
                  className="w-full min-w-0 border-none bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <span className="rounded-full border border-white/75 bg-white/72 px-3 py-1.5 text-xs font-medium text-slate-500">
                {filteredCount} {filteredCount === 1 ? 'note' : 'notes'}
              </span>
              {isFiltering && (
                <span className="rounded-full border border-white/75 bg-white/72 px-3 py-1.5 text-xs font-medium text-slate-500">
                  Reorder paused while filtering
                </span>
              )}
            </div>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Create, edit and collaborate on notes in real time.
        </p>
      </div>

      <AccountMenu
        userEmail={userEmail}
        userDisplayName={userDisplayName}
        isSigningOut={isSigningOut}
        onSignOut={onSignOut}
      />
    </div>
  );
}
