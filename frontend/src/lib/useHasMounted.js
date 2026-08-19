import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Returns false on the server and on the client's first render (matching
// the statically-exported "guest" HTML), then true from the next render
// onward. Used to defer client-only state (e.g. an auth token read from
// localStorage) until after hydration, avoiding a mismatch against the
// pre-rendered markup.
export function useHasMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
