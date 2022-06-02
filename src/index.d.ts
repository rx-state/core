import type { Observable, UnaryFunction } from "rxjs"

interface EffectOperatorFunction<T, ET, R, ER>
  extends UnaryFunction<EffectObservable<T, ET>, EffectObservable<R, ER>> {}

// prettier-ignore
export interface PipeState<T, ET> {
  <A>(
    defaultOp: WithDefaultOperator<T, A>,
  ): DefaultedStateObservable<T | A, ET>
  <A, EA = ET, B = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    defaultOp: WithDefaultOperator<A, B>,
  ): DefaultedStateObservable<A | B, EA>
  <A, EA = ET, B = unknown, EB = EA, C = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    defaultOp: WithDefaultOperator<B, C>,
  ): DefaultedStateObservable<B | C, EB>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    defaultOp: WithDefaultOperator<C, D>,
  ): DefaultedStateObservable<C | D, EC>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    defaultOp: WithDefaultOperator<D, E>,
  ): DefaultedStateObservable<D | E, ED>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    defaultOp: WithDefaultOperator<E, F>,
  ): DefaultedStateObservable<E | F, EE>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    defaultOp: WithDefaultOperator<F, G>,
  ): DefaultedStateObservable<F | G, EF>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
    defaultOp: WithDefaultOperator<G, H>,
  ): DefaultedStateObservable<G | H, EG>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown, EH = EG, I = unknown>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
    op8: EffectOperatorFunction<G, EG, H, EH>,
    defaultOp: WithDefaultOperator<H, I>,
  ): DefaultedStateObservable<H | I, EH>
 
  (): StateObservable<T, ET>
  <A, EA = ET>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
  ): StateObservable<A, EA>
  <A, EA = ET, B = unknown, EB = EA>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
  ): StateObservable<B, EB>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
  ): StateObservable<C, EC>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
  ): StateObservable<D, ED>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
  ): StateObservable<E, EE>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
  ): StateObservable<F, EF>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
  ): StateObservable<G, EG>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown, EH = EG>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
    op8: EffectOperatorFunction<G, EG, H, EH>,
  ): StateObservable<H, EH>
  <A, EA = ET, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown, EH = EG, I = unknown, EI = EH>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
    op8: EffectOperatorFunction<G, EG, H, EH>,
    op9: EffectOperatorFunction<H, EH, I, EI>,
  ): StateObservable<I, EI>
}

export declare class Effect<T> {
  constructor(value: T)
}
type IsEmpty<T> = unknown extends T ? true : T extends never ? true : false
export declare function sinkEffects<Args extends Array<any>>(
  ...args: Args
): <T, E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<
  IsEmpty<Args[keyof Args & number]> extends true
    ? T
    : Exclude<T, Args[keyof Args & number]>,
  IsEmpty<E> extends true
    ? Args[keyof Args & number]
    : Args[keyof Args & number] | E
>

export function liftEffects(): <T, E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<T | E, never>
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

interface EffectObservable<T, E> extends Observable<T> {
  _inner?: E
}
export interface StateObservable<T, E> extends EffectObservable<T, E> {
  getRefCount: () => number
  getValue: () => Exclude<T, SUSPENSE> | StatePromise<Exclude<T, SUSPENSE>>
  pipe: PipeState<T, E>
}
export interface DefaultedStateObservable<T, E> extends StateObservable<T, E> {
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
export declare function state<T, E>(
  observable: StateObservableInput<T, E>,
  defaultValue: T,
): DefaultedStateObservable<T, E>
export declare function state<T, E>(
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
export declare function state<A extends unknown[], O, E>(
  getObservable: (...args: A) => StateObservableInput<O, E>,
  defaultValue: O | ((...args: A) => O),
): (...args: A) => DefaultedStateObservable<O, E>
export declare function state<A extends unknown[], O, E>(
  getObservable: (...args: A) => StateObservableInput<O, E>,
): (...args: A) => StateObservable<O, E>
