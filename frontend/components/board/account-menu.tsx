'use client';

import { useEffect, useRef, useState } from 'react';

function LogOutIcon() {
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
      <path d="M12.5 4.5h1.2c.99 0 1.8.81 1.8 1.8v7.4c0 .99-.81 1.8-1.8 1.8h-1.2" />
      <path d="M8 10h8" />
      <path d="m12.7 6.3 3.7 3.7-3.7 3.7" />
      <path d="M10 4.5H6.3c-.99 0-1.8.81-1.8 1.8v7.4c0 .99.81 1.8 1.8 1.8H10" />
    </svg>
  );
}

type Props = {
  userEmail?: string | null;
  userDisplayName?: string | null;
  isSigningOut?: boolean;
  onSignOut: () => Promise<void> | void;
};

export function AccountMenu({
  userEmail,
  userDisplayName,
  isSigningOut,
  onSignOut,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userLabel = userDisplayName || userEmail || 'User';
  const userInitial = userLabel.trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSignOutClick = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open account menu"
        aria-expanded={open}
        title={userLabel}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(237,244,255,0.78))] text-sm font-semibold text-slate-700 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_34px_-24px_rgba(15,23,42,0.46)]"
      >
        {userInitial}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.65rem)] z-20 w-56 overflow-hidden rounded-[22px] border border-white/85 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(236,244,255,0.86)_52%,rgba(245,247,251,0.92))] p-2.5 shadow-[0_0_34px_-14px_rgba(15,23,42,0.22),0_18px_28px_-20px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <div className="rounded-[18px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.64))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Connected as
            </p>
            <p className="mt-1.5 break-all text-sm font-medium leading-5 text-slate-700">
              {userEmail || 'No email available'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOutClick}
            disabled={isSigningOut}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[16px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(245,247,251,0.74))] px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_14px_24px_-22px_rgba(15,23,42,0.38)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_26px_-22px_rgba(15,23,42,0.44)] disabled:opacity-50"
          >
            <LogOutIcon />
            <span>{isSigningOut ? 'Signing out...' : 'Logout'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
