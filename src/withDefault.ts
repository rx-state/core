import type { EffectObservable, withDefault as IWithDefault } from "./index.d"
import { state } from "./state"

export const withDefault: typeof IWithDefault =
  <D>(defaultValue: D) =>
  <T, E>(source$: EffectObservable<T, E>) =>
    state<D | T, E>(source$, defaultValue)
