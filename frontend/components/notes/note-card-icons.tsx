export function GripDotsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4 fill-current"
    >
      {[
        [4, 4],
        [8, 4],
        [12, 4],
        [4, 8],
        [8, 8],
        [12, 8],
        [4, 12],
        [8, 12],
        [12, 12],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" />
      ))}
    </svg>
  );
}

export function ChevronUpIcon() {
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
      <path d="m5 12 5-5 5 5" />
    </svg>
  );
}

export function ChevronDownIcon() {
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
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 6h11" />
      <path d="M8 6V4.8c0-.44.36-.8.8-.8h2.4c.44 0 .8.36.8.8V6" />
      <path d="M7 8.5v5.5" />
      <path d="M10 8.5v5.5" />
      <path d="M13 8.5v5.5" />
      <path d="m6 6 .55 8.01c.03.55.49.99 1.05.99h4.8c.56 0 1.02-.44 1.05-.99L14 6" />
    </svg>
  );
}
