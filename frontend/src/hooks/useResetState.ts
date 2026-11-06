import { useState, type Dispatch, type SetStateAction } from "react";

const hasChanged = (previous: readonly unknown[], next: readonly unknown[]) =>
  previous.length !== next.length || next.some((value, index) => !Object.is(value, previous[index]));

// Local state that starts over whenever deps change, adjusted during render instead of in an effect
export function useResetState<T>(init: () => T, deps: readonly unknown[]): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(init);
  const [previousDeps, setPreviousDeps] = useState(deps);

  if (hasChanged(previousDeps, deps)) {
    setPreviousDeps(deps);
    setState(init());
  }

  return [state, setState];
}
