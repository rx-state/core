import type { Observable, OperatorFunction, UnaryFunction } from "rxjs"

// Effects
interface EffectlessOperatorFunction<T, R, TE, RE> {
  (source$: EffectObservable<T, TE>): PipelessEffectObservable<R, RE>
}

interface EffectOperatorFunction<T, R, TE, RE> {
  (source$: EffectObservable<T, TE>): EffectObservable<R, RE>
}

interface PipelessEffectObservable <T, out ET = never> extends Observable<T> {
  __inner?: ET
}

export interface EffectObservable<T, out ET> extends PipelessEffectObservable<T, ET> {
  pipe(): EffectObservable<T, ET>
  pipe<A, EA = ET>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
  ): EffectObservable<A, EA>

  pipe<A, B, EA, EB = EA>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
  ): EffectObservable<B, EB>
}

declare module "rxjs" {
  // prettier-ignore
  interface Observable<T> {
    pipe(): Observable<T>
    pipe<A, EA>(
      op1: EffectlessOperatorFunction<T, A, never, EA>,
    ): EffectObservable<A, EA>
    pipe<A, B, EA, EB = EA>(
      op1: EffectlessOperatorFunction<T, A, never, EA>,
      op2: EffectlessOperatorFunction<A, B, EA, EB>,
    ): EffectObservable<B, EB>
  }

  function merge<Args extends EffectObservable<unknown, unknown>[]>(
    ...sources: Args
  ): Args extends Array<EffectObservable<infer T, infer E>>
    ? EffectObservable<T, E>
    : never
  function merge<Args extends EffectObservable<unknown, unknown>[]>(
    ...sourcesAndConcurrency: [...Args, number?]
  ): Args extends Array<EffectObservable<infer T, infer E>>
    ? EffectObservable<T, E>
    : never
}

// prettier-ignore
interface PipeState<T, ET> {
  <A>(
    defaultOp: WithDefaultOperator<T, A>,
  ): DefaultedStateObservable<T | A, ET>
  <A, EA = ET, B = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    defaultOp: WithDefaultOperator<A, B>,
  ): DefaultedStateObservable<A | B, EA>

  (): StateObservable<T, ET>
  <A, EA = ET>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
  ): StateObservable<A, EA>
  <A, EA = ET, B = unknown, EB = EA>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
  ): StateObservable<B, EB>
}

/*
// prettier-ignore
interface PipeEffect<T, ET = never> {
}
*/

export declare class Effect<T> {
  constructor(value: T)
}
type IsEmpty<T> = unknown extends T ? true : T extends never ? true : false
export declare function sinkEffects<Args extends Array<any>, T, E>(
  ...args: Args
): EffectOperatorFunction<
  T,
  Exclude<T, Args[keyof Args & number]>,
  E,
  Args[keyof Args & number] | E
>

export function liftEffects(): <T, E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<IsEmpty<E> extends true ? T : T | E, never>
export function liftEffects<Args extends Array<unknown>>(
  ...args: Args
): <T, E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<
  | T
  | (IsEmpty<E> extends true
      ? Args[keyof Args & number]
      : E & Args[keyof Args & number]),
  IsEmpty<E> extends true ? never : Exclude<E, Args[keyof Args & number]>
>

export declare const SUSPENSE: unique symbol
export declare type SUSPENSE = typeof SUSPENSE

export declare class StatePromise<T> extends Promise<T> {
  constructor(cb: (res: (value: T) => void, rej: any) => void)
}

export interface StateObservable<T, E = never> extends EffectObservable<T, E> {
  getRefCount: () => number
  getValue: () => Exclude<T, SUSPENSE> | StatePromise<Exclude<T, SUSPENSE>>
  pipe: PipeState<T, E>
}
export interface DefaultedStateObservable<T, E = never>
  extends StateObservable<T, E> {
  getValue: () => Exclude<T, SUSPENSE>
  getDefaultValue: () => T
}

export interface WithDefaultOperator<T, R>
  extends UnaryFunction<Observable<T>, DefaultedStateObservable<T | R, any>> {}
export declare function withDefault<T, D>(
  defaultValue: D,
): WithDefaultOperator<T, D>

export declare class NoSubscribersError extends Error {
  constructor()
}
export declare class EmptyObservableError extends Error {
  constructor()
}

type StateObservableInput<T, E> =
  | EffectObservable<T, E>
  | StateObservable<T, E>
  | DefaultedStateObservable<T, E>

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
export declare function state<T, E = never>(
  observable: StateObservableInput<T, E>,
  defaultValue: T,
): DefaultedStateObservable<T, E>
export declare function state<T, E = never>(
  observable: StateObservableInput<T, E>,
): StateObservable<T, E>
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
export declare function state<A extends unknown[], O, E = never>(
  getObservable: (...args: A) => StateObservableInput<O, E>,
  defaultValue: O | ((...args: A) => O),
): (...args: A) => DefaultedStateObservable<O, E>
export declare function state<A extends unknown[], O, E = never>(
  getObservable: (...args: A) => StateObservableInput<O, E>,
): (...args: A) => StateObservable<O, E>
