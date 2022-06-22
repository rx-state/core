import {
  from,
  map,
  Observable,
  filter,
  merge,
  of,
  combineLatest,
  startWith,
  OperatorFunction,
} from "rxjs"
import { expectAssignable, expectNotAssignable, expectType } from "tsd"
import {
  DefaultedStateObservable,
  EffectObservable,
  liftEffects,
  sinkEffects,
  StateObservable,
  withDefault,
  WithDefaultOperator,
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

  expectAssignable<StateObservable<1 | 2, 3 | 4>>(
    null as any as DefaultedStateObservable<1 | 2, 3 | 4>,
  )
  expectNotAssignable<DefaultedStateObservable<2, 3>>(source$)

  const noOperator$ = source$.pipeState()
  expectType<StateObservable<1 | 2, 3>>(noOperator$)

  // withDefault operator
  const operator = withDefault<number, "default">("default")
  expectAssignable<WithDefaultOperator<number, number | "default">>(operator)
  expectAssignable<OperatorFunction<number, number | "default">>(operator)
  expectNotAssignable<WithDefaultOperator<any, any>>(startWith<1 | 2>(null))

  const withDefaultAtEnd$ = source$.pipeState(
    map((v) => v),
    withDefault("default"),
  )
  expectType<DefaultedStateObservable<1 | 2 | string, 3>>(withDefaultAtEnd$)

  const withDefaultAtMiddle$ = source$.pipeState(
    map((v) => v),
    withDefault("default"),
    map((v) => v),
  )
  expectType<StateObservable<1 | 2 | string, 3>>(withDefaultAtMiddle$)

  // Pipe with effects
  const onlySink$ = source$.pipeState(sinkEffects(1 as const))
  expectType<StateObservable<2, 1 | 3>>(onlySink$)

  const onlyLift$ = source$.pipeState(liftEffects())
  expectType<StateObservable<1 | 2 | 3, never>>(onlyLift$)

  const sinkExplicitLift$ = source$.pipeState(
    sinkEffects(1 as const),
    liftEffects(1 as const),
  )
  expectType<StateObservable<1 | 2, 3>>(sinkExplicitLift$)

  const sinkImplicitLift$ = source$.pipeState(
    sinkEffects(1 as const),
    liftEffects(),
  )
  expectType<StateObservable<1 | 2 | 3, never>>(sinkImplicitLift$)

  const sinkMapLift$ = source$.pipeState(
    sinkEffects(1 as const),
    map((v) => `${v}`),
    liftEffects(1 as const),
  )
  expectType<StateObservable<1 | string, 3>>(sinkMapLift$)

  const filterSinkMapLift$ = source$.pipeState(
    filter((v) => v < 10),
    sinkEffects(1 as const),
    map((v) => `${v}`),
    liftEffects(1 as const),
    filter((v) => v < 10),
  )
  expectType<StateObservable<1 | string, 3>>(filterSinkMapLift$)

  const operatorThatAdds$ = source$.pipeState(startWith(null))
  expectType<StateObservable<1 | 2 | null, 3>>(operatorThatAdds$)

  const operatorThatReadds$ = operatorThatAdds$.pipeState(startWith(null)) // This used to use the `defaultOperator` overload
  expectType<StateObservable<1 | 2 | null, 3>>(operatorThatReadds$)
}

// merge
{
  const regularObservables$ = merge(of(1), of("string"))
  expectType<EffectObservable<number | string, never>>(regularObservables$)

  const effectObservables$ = merge(
    null as any as EffectObservable<1, 2>,
    null as any as EffectObservable<2, 3>,
  )
  expectType<EffectObservable<1 | 2, 2 | 3>>(effectObservables$)

  const mixedEffectRegular$ = merge(
    of(1 as const),
    null as any as EffectObservable<2, 3>,
  )
  expectType<EffectObservable<1 | 2, 3>>(mixedEffectRegular$)

  const stateObservables$ = merge(
    null as any as StateObservable<1, 2>,
    null as any as DefaultedStateObservable<2, 3>,
  )
  expectType<EffectObservable<1 | 2, 2 | 3>>(stateObservables$)

  const mixedAll$ = merge(
    of(1 as const),
    null as any as EffectObservable<2, 3>,
    null as any as StateObservable<1, 2>,
  )
  expectType<EffectObservable<1 | 2, 2 | 3>>(mixedAll$)
}

// combineLatest - tuple
{
  const regularObservables$ = combineLatest([of(1), of("string")])
  expectType<EffectObservable<[number, string], never>>(regularObservables$)

  const effectObservables$ = combineLatest([
    null as any as EffectObservable<1, 2>,
    null as any as EffectObservable<2, 3>,
  ])
  expectType<EffectObservable<[1, 2], 2 | 3>>(effectObservables$)

  const mixedEffectRegular$ = combineLatest([
    of(1 as const),
    null as any as EffectObservable<2, 3>,
  ])
  expectType<EffectObservable<[1, 2], 3>>(mixedEffectRegular$)

  const stateObservables$ = combineLatest([
    null as any as StateObservable<1, 2>,
    null as any as DefaultedStateObservable<2, 3>,
  ])
  expectType<EffectObservable<[1, 2], 2 | 3>>(stateObservables$)

  const mixedAll$ = combineLatest([
    of(1 as const),
    null as any as EffectObservable<2, 3>,
    null as any as StateObservable<1, 2>,
  ])
  expectType<EffectObservable<[1, 2, 1], 2 | 3>>(mixedAll$)

  const mixedWithSelector$ = combineLatest(
    [
      of(1 as const),
      null as any as EffectObservable<2, 3>,
      null as any as StateObservable<1, 2>,
    ],
    (one, two, secondOne) => ({ one, two, secondOne }),
  )
  expectType<
    EffectObservable<
      {
        one: 1
        two: 2
        secondOne: 1
      },
      2 | 3
    >
  >(mixedWithSelector$)
}

// combineLatest - object
{
  const regularObservables$ = combineLatest({
    number: of(1),
    string: of("string"),
  })
  expectType<EffectObservable<{ number: number; string: string }, never>>(
    regularObservables$,
  )

  const effectObservables$ = combineLatest({
    one: null as any as EffectObservable<1, 2>,
    two: null as any as EffectObservable<2, 3>,
  })
  expectType<EffectObservable<{ one: 1; two: 2 }, 2 | 3>>(effectObservables$)

  const mixedEffectRegular$ = combineLatest({
    one: of(1 as const),
    two: null as any as EffectObservable<2, 3>,
  })
  expectType<EffectObservable<{ one: 1; two: 2 }, 3>>(mixedEffectRegular$)

  const stateObservables$ = combineLatest({
    one: null as any as StateObservable<1, 2>,
    two: null as any as DefaultedStateObservable<2, 3>,
  })
  expectType<EffectObservable<{ one: 1; two: 2 }, 2 | 3>>(stateObservables$)

  const mixedAll$ = combineLatest({
    one: of(1 as const),
    two: null as any as EffectObservable<2, 3>,
    secondOne: null as any as StateObservable<1, 2>,
  })
  expectType<
    EffectObservable<
      {
        one: 1
        two: 2
        secondOne: 1
      },
      2 | 3
    >
  >(mixedAll$)
}
