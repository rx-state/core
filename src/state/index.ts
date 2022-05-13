import { Observable } from "rxjs"
import stateFactory from "./stateFactory"
import stateSingle from "./stateSingle"
import { EMPTY_VALUE } from "@/internal/empty-value"
import { DefaultedStateObservable, StateObservable } from "@/StateObservable"

/**
 * Creates a StateObservable
 *
 * @param {Observable<T>} observable - Source observable
 * @param {T} [defaultValue] - Default value that will be used if the source
 * has not emitted.
 * @returns A StateObservable, which can be used for composing other streams that
 * depend on it. The shared subscription is closed as soon as there are no
 * subscribers, also the state is cleared.
 *
 * @remarks If the source Observable doesn't synchronously emit a value upon
 * subscription, then the state Observable will synchronously emit the
 * defaultValue if present.
 */
export function state<T>(observable: Observable<T>): StateObservable<T>

export function state<T>(
  observable: Observable<T>,
  defaultValue: T,
): DefaultedStateObservable<T>

/**
 * Creates a factory of StateObservables
 *
 * @param getObservable - Factory of Observables.
 * @param [defaultValue] - Function or value that will be used if the source
 * has not emitted.
 * @returns A function with the same parameters as the factory function, which
 * returns the StateObservable for those arguements, which can be used for
 * composing other streams that depend on it. The shared subscription is closed
 * as soon as there are no subscribers, also the state and all in memory
 * references to the returned Observable are cleared.
 *
 * @remarks If the Observable doesn't synchronously emit a value upon the first
 * subscription, then the state Observable will synchronously emit the
 * defaultValue if present.
 */
export function state<A extends unknown[], O>(
  getObservable: (...args: A) => Observable<O>,
): (...args: A) => StateObservable<O>

export function state<A extends unknown[], O>(
  getObservable: (...args: A) => Observable<O>,
  defaultValue: O | ((...args: A) => O),
): (...args: A) => DefaultedStateObservable<O>

export function state(observable: any, defaultValue?: any) {
  return (
    typeof observable === "function" ? (stateFactory as any) : stateSingle
  )(observable, arguments.length > 1 ? defaultValue : EMPTY_VALUE)
}
