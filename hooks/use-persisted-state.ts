import { useCallback, useEffect, useMemo, useState } from "react";

function loadStored<T>(key: string): T | undefined {
  const loaded = window.localStorage.getItem(key);

  return loaded ? (JSON.parse(loaded) as T) : undefined;
}

/**
 * Persist state in local storage. The initial value is only used if no state has been stored.
 *
 * The stored value is applied after mount, never during the first render: a
 * render that reads local storage disagrees with the server's HTML, and the
 * whole editor used to be hidden until hydration to paper over that — which cost
 * a layout shift of the entire page. `hydrated` reports when the stored value
 * has landed, for components that take it as an initial value and need to be
 * remounted once it has.
 *
 * @param key
 * @param initialValue
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored<T>(key);

    if (stored) {
      setValue(stored);
    }

    setHydrated(true);
  }, [key]);

  const setAndPersistValue = useCallback(
    (value: T) => {
      // Until the stored value has been read, every write still carries the
      // defaults — and child effects run before this hook's, so persisting them
      // would overwrite the very state we are about to load.
      if (hydrated && value) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }

      setValue(value);
    },
    [hydrated, key],
  );

  return useMemo(
    () => [value, setAndPersistValue, hydrated],
    [value, setAndPersistValue, hydrated],
  );
}
