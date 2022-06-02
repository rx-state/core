import { from, map, Observable, filter } from "rxjs"
import { expectAssignable, expectNotAssignable, expectType } from "tsd"
import {
  EffectObservable,
  liftEffects,
  sinkEffects,
  StateObservable,
} from "./index.d"

// Regular Observable
{
  const source$ = from([1, 2, 3] as const)

  const onlySink$ = source$.pipe(sinkEffects(1 as const))
  expectType<Observable<2 | 3>>(onlySink$)

  const onlyLift$ = source$.pipe(liftEffects())
  expectType<Observable<unknown>>(onlyLift$)

  const liftExplicit$ = source$.pipe(liftEffects(4 as const))
  expectType<Observable<1 | 2 | 3 | 4>>(liftExplicit$)
}

// EffectObservable
{
  const source$: EffectObservable<1 | 2, 3> = null as any

  expectAssignable<Observable<1 | 2>>(source$)
  expectNotAssignable<Observable<1>>(source$)
  expectAssignable<EffectObservable<1 | 2, 3>>(from([1, 2] as const))
  expectNotAssignable<EffectObservable<1, 3>>(from([1, 2] as const))

  expectAssignable<EffectObservable<1 | 2, 3 | 4>>(source$)
  expectNotAssignable<EffectObservable<1 | 2, 4>>(source$)
  expectNotAssignable<EffectObservable<2, 3>>(source$)

  const onlySink$ = source$.pipe(sinkEffects(1 as const))
  expectType<EffectObservable<2, 1 | 3>>(onlySink$)

  const onlyLift$ = source$.pipe(liftEffects())
  expectType<EffectObservable<1 | 2 | 3, never>>(onlyLift$)

  const sinkExplicitLift$ = source$.pipe(
    sinkEffects(1 as const),
    liftEffects(1 as const),
  )
  expectType<EffectObservable<1 | 2, 3>>(sinkExplicitLift$)

  const sinkImplicitLift$ = source$.pipe(sinkEffects(1 as const), liftEffects())
  expectType<EffectObservable<1 | 2 | 3, never>>(sinkImplicitLift$)

  const sinkMapLift$ = source$.pipe(
    sinkEffects(1 as const),
    map((v) => `${v}`),
    liftEffects(1 as const),
  )
  expectType<EffectObservable<1 | string, 3>>(sinkMapLift$)

  const filterSinkMapLift$ = source$.pipe(
    filter((v) => v < 10),
    sinkEffects(1 as const),
    map((v) => `${v}`),
    liftEffects(1 as const),
    filter((v) => v < 10),
  )
  expectType<EffectObservable<1 | string, 3>>(filterSinkMapLift$)
}

// StateObservable
{
  const source$: StateObservable<1 | 2, 3> = null as any

  expectAssignable<Observable<1 | 2>>(source$)
  expectNotAssignable<Observable<1>>(source$)

  expectAssignable<StateObservable<1 | 2, 3 | 4>>(source$)
  expectNotAssignable<StateObservable<1 | 2, 4>>(source$)
  expectNotAssignable<StateObservable<2, 3>>(source$)

  const onlySink$ = source$.pipe(sinkEffects(1 as const))
  expectType<StateObservable<2, 1 | 3>>(onlySink$)

  const onlyLift$ = source$.pipe(liftEffects())
  expectType<StateObservable<1 | 2 | 3, never>>(onlyLift$)

  const sinkExplicitLift$ = source$.pipe(
    sinkEffects(1 as const),
    liftEffects(1 as const),
  )
  expectType<StateObservable<1 | 2, 3>>(sinkExplicitLift$)

  const sinkImplicitLift$ = source$.pipe(sinkEffects(1 as const), liftEffects())
  expectType<StateObservable<1 | 2 | 3, never>>(sinkImplicitLift$)

  const sinkMapLift$ = source$.pipe(
    sinkEffects(1 as const),
    map((v) => `${v}`),
    liftEffects(1 as const),
  )
  expectType<StateObservable<1 | string, 3>>(sinkMapLift$)

  const filterSinkMapLift$ = source$.pipe(
    filter((v) => v < 10),
    sinkEffects(1 as const),
    map((v) => `${v}`),
    liftEffects(1 as const),
    filter((v) => v < 10),
  )
  expectType<StateObservable<1 | string, 3>>(filterSinkMapLift$)
}
