import { useEffect, useState } from 'react';
import { loadAppData, type AppData } from '@/lib/data';

type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: AppData };

/** Loads and assembles all app data once on mount. */
export function useAppData(): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadAppData()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
