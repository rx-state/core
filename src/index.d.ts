import type { Observable, UnaryFunction } from "rxjs"

interface EffectOperatorFunction<T, ET, R, ER>
  extends UnaryFunction<EffectObservable<T, ET>, EffectObservable<R, ER>> {}

// prettier-ignore
export interface PipeState<T, ET> {
  <A, EA>(
    defaultOp: WithDefaultOperator<T, ET, A>,
  ): DefaultedStateObservable<T | A, EA>
  <A, EA, B = unknown, EB = EA>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    defaultOp: WithDefaultOperator<A, EA, B>,
  ): DefaultedStateObservable<A | B, EB>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    defaultOp: WithDefaultOperator<B, EB, C>,
  ): DefaultedStateObservable<B | C, EC>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    defaultOp: WithDefaultOperator<C, EC, D>,
  ): DefaultedStateObservable<C | D, ED>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    defaultOp: WithDefaultOperator<D, ED, E>,
  ): DefaultedStateObservable<D | E, EE>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    defaultOp: WithDefaultOperator<E, EE, F>,
  ): DefaultedStateObservable<E | F, EF>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    defaultOp: WithDefaultOperator<F, EF, G>,
  ): DefaultedStateObservable<F | G, EG>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown, EH = EG>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
    defaultOp: WithDefaultOperator<G, EG, H>,
  ): DefaultedStateObservable<G | H, EH>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown, EH = EG, I = unknown, EI = EH>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
    op8: EffectOperatorFunction<G, EG, H, EH>,
    defaultOp: WithDefaultOperator<H, EH, I>,
  ): DefaultedStateObservable<H | I, EI>

  (): StateObservable<T, ET>
  <A, EA>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
  ): StateObservable<A, EA>
  <A, EA, B = unknown, EB = EA>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
  ): StateObservable<B, EB>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
  ): StateObservable<C, EC>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
  ): StateObservable<D, ED>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
  ): StateObservable<E, EE>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
  ): StateObservable<F, EF>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
  ): StateObservable<G, EG>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown, EH = EG>(
    op1: EffectOperatorFunction<T, ET, A, EA>,
    op2: EffectOperatorFunction<A, EA, B, EB>,
    op3: EffectOperatorFunction<B, EB, C, EC>,
    op4: EffectOperatorFunction<C, EC, D, ED>,
    op5: EffectOperatorFunction<D, ED, E, EE>,
    op6: EffectOperatorFunction<E, EE, F, EF>,
    op7: EffectOperatorFunction<F, EF, G, EG>,
    op8: EffectOperatorFunction<G, EG, H, EH>,
  ): StateObservable<H, EH>
  <A, EA, B = unknown, EB = EA, C = unknown, EC = EB, D = unknown, ED = EC, E = unknown, EE = ED, F = unknown, EF = EE, G = unknown, EG = EF, H = unknown, EH = EG, I = unknown, EI = EH>(
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

export declare const SUSPENSE: unique symbol
export declare type SUSPENSE = typeof SUSPENSE

export declare class StatePromise<T> extends Promise<T> {
  constructor(cb: (res: (value: T) => void, rej: any) => void)
}

// type Drop<E> = any & E // Only purpose is to help EffectObservable use `E` without effecting the underlying interface
interface EffectObservable<T, E> extends Observable<T> {}
export interface StateObservable<T, E> extends EffectObservable<T, E> {
  getRefCount: () => number
  getValue: () => Exclude<T, SUSPENSE> | StatePromise<Exclude<T, SUSPENSE>>
  pipe: PipeState<T, E>
}
export interface DefaultedStateObservable<T, E> extends EffectObservable<T, E> {
  getValue: () => Exclude<T, SUSPENSE>
  getDefaultValue: () => T
  pipe: PipeState<T, E>
}

export interface WithDefaultOperator<T, ET, R>
  extends UnaryFunction<
    EffectObservable<T, ET>,
    DefaultedStateObservable<T | R, ET>
  > {}
export declare function withDefault<T, E, D>(
  defaultValue: D,
): WithDefaultOperator<T, E, D>

export declare class NoSubscribersError extends Error {
  constructor()
}
export declare class EmptyObservableError extends Error {
  constructor()
}

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
  observable: EffectObservable<T, E>,
  defaultValue: T,
): DefaultedStateObservable<T, E>
export declare function state<T, E>(
  observable: EffectObservable<T, E>,
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
  getObservable: (...args: A) => EffectObservable<O, E>,
  defaultValue: O | ((...args: A) => O),
): (...args: A) => DefaultedStateObservable<O, E>
export declare function state<A extends unknown[], O, E>(
  getObservable: (...args: A) => EffectObservable<O, E>,
): (...args: A) => StateObservable<O, E>
