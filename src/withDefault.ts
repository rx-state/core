import { Observable, UnaryFunction } from "rxjs"
import { state } from "./state"
import { DefaultedStateObservable } from "./StateObservable"

export interface WithDefaultOperator<T, R>
  extends UnaryFunction<Observable<T>, DefaultedStateObservable<T | R>> {}

export function withDefault<T, D>(defaultValue: D): WithDefaultOperator<T, D> {
  return (source$) => state<D | T>(source$, defaultValue)
}
