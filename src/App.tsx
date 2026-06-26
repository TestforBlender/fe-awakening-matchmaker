import { useEffect, useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { CharacterGallery } from '@/components/gallery/CharacterGallery';

function useTheme() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('fe-theme', dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

export default function App() {
  const { dark, toggle } = useTheme();
  const state = useAppData();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-edge/60 bg-surface-raised/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-goldtext">
              Fire Emblem Awakening
            </p>
            <h1 className="font-display text-xl font-semibold leading-tight sm:text-2xl">
              Matchmaker
            </h1>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="rounded-panel border border-edge bg-surface px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-gold hover:text-ink"
            aria-pressed={dark}
          >
            {dark ? '\u263e Dark' : '\u2600 Light'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        {state.status === 'loading' && (
          <p className="text-ink-soft">Loading roster\u2026</p>
        )}

        {state.status === 'error' && (
          <div className="rounded-panel border border-crimson/60 bg-crimson/10 p-4 text-sm">
            <p className="font-semibold text-crimson">Couldn&rsquo;t load data.</p>
            <p className="mt-1 text-ink-soft">{state.error}</p>
          </div>
        )}

        {state.status === 'ready' && (
          <CharacterGallery data={state.data} />
        )}
      </main>
    </div>
  );
}
