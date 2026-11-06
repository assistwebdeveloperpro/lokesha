import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

// False while rendering on the server and during hydration, true afterwards
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
