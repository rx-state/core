import type { Observable, ObservedValueOf, UnaryFunction } from "rxjs"

/// Effects
export declare class Effect<T> {
  constructor(value: T)
}

// prettier-ignore
interface PipeEffect<T, ET> {
  (): EffectObservable<T, ET>
  <A, EA = ET>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
  ): EffectObservable<A, EA>
  <A, B, EA = ET, EB = EA>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
  ): EffectObservable<B, EB>
  <A, B, C, EA = ET, EB = EA, EC = EB>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
  ): EffectObservable<C, EC>
  <A, B, C, D, EA = ET, EB = EA, EC = EB, ED = EC>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
  ): EffectObservable<D, ED>
  <A, B, C, D, E, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
  ): EffectObservable<E, EE>
  <A, B, C, D, E, F, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
  ): EffectObservable<F, EF>
  <A, B, C, D, E, F, G, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
  ): EffectObservable<G, EG>
  <A, B, C, D, E, F, G, H, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF, EH = EG>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    op8: EffectOperatorFunction<G, H, EG, EH>,
  ): EffectObservable<H, EH>
  <A, B, C, D, E, F, G, H, I, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF, EH = EG, EI = EH>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    op8: EffectOperatorFunction<G, H, EG, EH>,
    op9: EffectOperatorFunction<H, I, EH, EI>,
  ): EffectObservable<I, EI>
  <A, B, C, D, E, F, G, H, I, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF, EH = EG, EI = EH>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    op8: EffectOperatorFunction<G, H, EG, EH>,
    op9: EffectOperatorFunction<H, I, EH, EI>,
    ...operations: EffectOperatorFunction<any, any, any, any>[]
  ): EffectObservable<unknown, unknown>
}

export interface EffectObservable<T, E> extends Observable<T> {
  __inner?: E
  pipe: PipeEffect<T, E>
}

interface EffectOperatorFunction<T, R, ET, ER>
  extends UnaryFunction<EffectObservable<T, ET>, EffectObservable<R, ER>> {}

export declare function sinkEffects<Args extends Array<any>, T>(
  ...args: Args
): <E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<
  Exclude<T, Args[keyof Args & number]>,
  Args[keyof Args & number] | E
>

export function liftEffects<T>(): <E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<T | E, never>
export function liftEffects<Args extends Array<unknown>, T>(
  ...args: Args
): <E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<
  T | (E & Args[keyof Args & number]),
  Exclude<E, Args[keyof Args & number]>
>

export declare const SUSPENSE: unique symbol
export declare type SUSPENSE = typeof SUSPENSE

/// operator overrides
type ExcludeUnknown<T> = unknown extends T ? never : T
type EffectOf<T> = T extends EffectObservable<any, infer R>
  ? ExcludeUnknown<R>
  : never
declare module "rxjs" {
  function merge<Args extends EffectObservable<unknown, unknown>[]>(
    ...sources: Args
  ): Args extends Array<EffectObservable<infer T, infer E>>
    ? EffectObservable<T, ExcludeUnknown<E>>
    : never
  function merge<Args extends EffectObservable<unknown, unknown>[]>(
    ...sourcesAndConcurrency: [...Args, number?]
  ): Args extends Array<EffectObservable<infer T, infer E>>
    ? EffectObservable<T, ExcludeUnknown<E>>
    : never

  type TupleToValue<A> = {
    [K in keyof A]: ObservedValueOf<A[K]>
  }
  type TupleToEffects<A extends any[]> = ExcludeUnknown<EffectOf<A[number]>>

  function combineLatest<A extends EffectObservable<unknown, unknown>[]>(
    sources: readonly [...A],
  ): EffectObservable<TupleToValue<A>, TupleToEffects<A>>
  function combineLatest<A extends EffectObservable<unknown, unknown>[], R>(
    sources: readonly [...A],
    resultSelector: (...values: TupleToValue<A>) => R,
  ): EffectObservable<R, TupleToEffects<A>>
  export function combineLatest<
    T extends Record<string, EffectObservable<any, any>>,
  >(
    sourcesObject: T,
  ): EffectObservable<
    { [K in keyof T]: ObservedValueOf<T[K]> },
    EffectOf<T[keyof T]>
  >

  export function switchMap<T, ET, O extends EffectObservable<any, any>>(
    project: (value: T, index: number) => O,
  ): EffectOperatorFunction<T, ObservedValueOf<O>, ET, ET | EffectOf<O>>

  export function mergeMap<T, ET, O extends EffectObservable<any, any>>(
    project: (value: T, index: number) => O,
    concurrent?: number,
  ): EffectOperatorFunction<T, ObservedValueOf<O>, ET, ET | EffectOf<O>>

  export function exhaustMap<T, ET, O extends EffectObservable<any, any>>(
    project: (value: T, index: number) => O,
  ): EffectOperatorFunction<T, ObservedValueOf<O>, ET, ET | EffectOf<O>>

  export function concatMap<T, ET, O extends EffectObservable<any, any>>(
    project: (value: T, index: number) => O,
  ): EffectOperatorFunction<T, ObservedValueOf<O>, ET, ET | EffectOf<O>>

  export function withLatestFrom<
    T,
    ET,
    A extends EffectObservable<unknown, unknown>[],
  >(
    ...inputs: readonly [...A]
  ): EffectOperatorFunction<
    T,
    [T, ...TupleToValue<A>],
    ET,
    ET | TupleToEffects<A>
  >

  export function withLatestFrom<
    T,
    ET,
    A extends EffectObservable<unknown, unknown>[],
    R,
  >(
    ...inputs: readonly [...A, (...value: [T, ...TupleToValue<A>]) => R]
  ): EffectOperatorFunction<T, R, ET, ET | TupleToEffects<A>>
}

/// StateObservable
export declare class StatePromise<T> extends Promise<T> {
  constructor(cb: (res: (value: T) => void, rej: any) => void)
}

// prettier-ignore
interface PipeState<T, ET> {
  <A>(
    defaultOp: WithDefaultOperator<T, A>,
  ): DefaultedStateObservable<A, ET>
  <A, B, EA = ET>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    defaultOp: WithDefaultOperator<A, B>,
  ): DefaultedStateObservable<B, EA>
  <A, B, C, EA = ET, EB = EA>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    defaultOp: WithDefaultOperator<B, C>,
  ): DefaultedStateObservable<C, EB>
  <A, B, C, D, EA = ET, EB = EA, EC = EB>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    defaultOp: WithDefaultOperator<C, D>,
  ): DefaultedStateObservable<D, EC>
  <A, B, C, D, E, EA = ET, EB = EA, EC = EB, ED = EC>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    defaultOp: WithDefaultOperator<D, E>,
  ): DefaultedStateObservable<E, ED>
  <A, B, C, D, E, F, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    defaultOp: WithDefaultOperator<E, F>,
  ): DefaultedStateObservable<F, EE>
  <A, B, C, D, E, F, G, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    defaultOp: WithDefaultOperator<F, G>,
  ): DefaultedStateObservable<G, EF>
  <A, B, C, D, E, F, G, H, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    defaultOp: WithDefaultOperator<G, H>,
  ): DefaultedStateObservable<H, EG>
  <A, B, C, D, E, F, G, H, I, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF, EH = EG>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    op8: EffectOperatorFunction<G, H, EG, EH>,
    defaultOp: WithDefaultOperator<H, I>,
  ): DefaultedStateObservable<I, EH>
 
  (): StateObservable<T, ET>
  <A, EA = ET>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
  ): StateObservable<A, EA>
  <A, B, EA = ET, EB = EA>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
  ): StateObservable<B, EB>
  <A, B, C, EA = ET, EB = EA, EC = EB>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
  ): StateObservable<C, EC>
  <A, B, C, D, EA = ET, EB = EA, EC = EB, ED = EC>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
  ): StateObservable<D, ED>
  <A, B, C, D, E, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
  ): StateObservable<E, EE>
  <A, B, C, D, E, F, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
  ): StateObservable<F, EF>
  <A, B, C, D, E, F, G, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
  ): StateObservable<G, EG>
  <A, B, C, D, E, F, G, H, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF, EH = EG>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    op8: EffectOperatorFunction<G, H, EG, EH>,
  ): StateObservable<H, EH>
  <A, B, C, D, E, F, G, H, I, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF, EH = EG, EI = EH>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    op8: EffectOperatorFunction<G, H, EG, EH>,
    op9: EffectOperatorFunction<H, I, EH, EI>,
  ): StateObservable<I, EI>
  <A, B, C, D, E, F, G, H, I, EA = ET, EB = EA, EC = EB, ED = EC, EE = ED, EF = EE, EG = EF, EH = EG, EI = EH>(
    op1: EffectOperatorFunction<T, A, ET, EA>,
    op2: EffectOperatorFunction<A, B, EA, EB>,
    op3: EffectOperatorFunction<B, C, EB, EC>,
    op4: EffectOperatorFunction<C, D, EC, ED>,
    op5: EffectOperatorFunction<D, E, ED, EE>,
    op6: EffectOperatorFunction<E, F, EE, EF>,
    op7: EffectOperatorFunction<F, G, EF, EG>,
    op8: EffectOperatorFunction<G, H, EG, EH>,
    op9: EffectOperatorFunction<H, I, EH, EI>,
    ...operations: EffectOperatorFunction<any, any, any, any>[]
  ): StateObservable<unknown, unknown>
}

export interface StateObservable<T, E = never> extends EffectObservable<T, E> {
  getRefCount: () => number
  getValue: () => Exclude<T, SUSPENSE> | StatePromise<Exclude<T, SUSPENSE>>
  pipeState: PipeState<T, E>
}
export interface DefaultedStateObservable<T, E = never>
  extends StateObservable<T, E> {
  getValue: () => Exclude<T, SUSPENSE>
  getDefaultValue: () => T
}

export interface WithDefaultOperator<T, D>
  extends UnaryFunction<Observable<T>, DefaultedStateObservable<D, never>> {}
export declare function withDefault<T, D>(
  defaultValue: D,
): <E = never>(
  source$: EffectObservable<T, E> | Observable<T>,
) => DefaultedStateObservable<T | D, E>

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
export declare function state<T, E = never>(
  observable: EffectObservable<T, E>,
  defaultValue: T,
): DefaultedStateObservable<T, E>
export declare function state<T, E = never>(
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
export declare function state<A extends unknown[], O, E = never>(
  getObservable: (...args: A) => EffectObservable<O, E>,
  defaultValue: O | ((...args: A) => O),
): (...args: AddStopArg<A>) => DefaultedStateObservable<O, E>
export declare function state<A extends unknown[], O, E = never>(
  getObservable: (...args: A) => EffectObservable<O, E>,
): (...args: AddStopArg<A>) => StateObservable<O, E>

// Adds an additional "stop" argument to prevent using factory functions
// inside high-order-functions directly (e.g. switchMap(factory$))
type AddStopArg<A extends Array<any>> = number extends A["length"]
  ? A
  : [...args: A, _stop?: undefined]
