import type { Observable } from "rxjs"
import type { withDefault as IWithDefault } from "./index.d"
import { state } from "./state"

export const withDefault: typeof IWithDefault =
  <D>(defaultValue: D) =>
  <T>(source$: Observable<T>) =>
    state<D | T>(source$, defaultValue)
