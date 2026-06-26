import { useEffect, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Debounced search box. Mirrors the controlled value but only propagates
 *  changes after a short pause to keep filtering smooth. */
export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const [local, setLocal] = useState(value);

  // Keep local in sync if the parent resets the value (e.g. clear-all).
  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 150);
    return () => clearTimeout(t);
    // Intentionally depends only on `local`: we debounce the user's typing and
    // deliberately don't re-fire when the parent's value/onChange identity changes.
  }, [local]);

  return (
    <div className="relative">
      <label htmlFor="char-search" className="sr-only">
        Search characters
      </label>
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
        aria-hidden="true"
      >
        ⌕
      </span>
      <input
        id="char-search"
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder ?? 'Search by name, class, or tag…'}
        className="w-full rounded-panel border border-edge bg-surface py-2 pl-9 pr-9 text-sm text-ink placeholder:text-ink-soft/70 focus:border-gold"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal('');
            onChange('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-ink-soft hover:text-ink"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
