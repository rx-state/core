import {
  EMPTY,
  filter,
  from,
  map,
  Observable,
  OperatorFunction,
  startWith,
  switchMap,
} from "rxjs"
import { SUSPENSE } from "SUSPENSE"
import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectType,
} from "tsd"
import {
  DefaultedStateObservable,
  liftSuspense,
  sinkSuspense,
  state,
  StateObservable,
  withDefault,
  WithDefaultOperator,
} from "./index.d"

// Regular Observable
{
  const source$ = from([1, 2, 3, SUSPENSE] as const)

  const onlySink$ = source$.pipe(sinkSuspense())
  expectType<Observable<1 | 2 | 3>>(onlySink$)

  const onlyLift$ = source$.pipe(liftSuspense())
  expectType<Observable<1 | 2 | 3 | SUSPENSE>>(onlyLift$)
}

// StateObservable
{
  const source$: StateObservable<1 | 2> = null as any

  expectAssignable<Observable<1 | 2>>(source$)
  expectNotAssignable<Observable<1>>(source$)

  expectAssignable<StateObservable<1 | 2 | 3>>(source$)
  expectNotAssignable<StateObservable<2>>(source$)

  expectAssignable<StateObservable<1 | 2>>(
    null as any as DefaultedStateObservable<1 | 2>,
  )
  expectNotAssignable<DefaultedStateObservable<2>>(source$)

  const noOperator$ = source$.pipeState()
  expectType<StateObservable<1 | 2>>(noOperator$)

  // withDefault operator
  const operator = withDefault<number, "default">("default")
  expectAssignable<WithDefaultOperator<number, number | "default">>(operator)
  expectAssignable<OperatorFunction<number, number | "default">>(operator)
  expectNotAssignable<WithDefaultOperator<any, any>>(startWith<1 | 2>(null))

  const withDefaultAtEnd$ = source$.pipeState(
    map((v) => v),
    withDefault("default"),
  )
  expectType<DefaultedStateObservable<1 | 2 | string>>(withDefaultAtEnd$)

  const withDefaultAtMiddle$ = source$.pipeState(
    map((v) => v),
    withDefault("default"),
    map((v) => v),
  )
  expectType<StateObservable<1 | 2 | string>>(withDefaultAtMiddle$)

  // Pipe with effects
  const filterSinkMapLift$ = source$.pipeState(
    filter((v) => v < 10),
    sinkSuspense(),
    map((v) => `${v}`),
    liftSuspense(),
  )
  expectType<StateObservable<string | SUSPENSE>>(filterSinkMapLift$)

  const operatorThatAdds$ = source$.pipeState(startWith(null))
  expectType<StateObservable<1 | 2 | null>>(operatorThatAdds$)

  const operatorThatReadds$ = operatorThatAdds$.pipeState(startWith(null)) // This used to use the `defaultOperator` overload
  expectType<StateObservable<1 | 2 | null>>(operatorThatReadds$)
}

// state
{
  const observable$: Observable<1 | 2> = null as any
  const stateFromObservable$ = state(observable$)
  expectType<StateObservable<1 | 2>>(stateFromObservable$)
  const stateFactoryFromObservable$ = state(() => observable$)
  expectType<StateObservable<1 | 2>>(stateFactoryFromObservable$())

  const stateObservable$: StateObservable<1 | 2> = null as any
  const stateFromStateObservable$ = state(stateObservable$)
  expectType<StateObservable<1 | 2>>(stateFromStateObservable$)
  const stateFactoryFromStateObservable$ = state(() => stateObservable$)
  expectType<StateObservable<1 | 2>>(stateFactoryFromStateObservable$())
  const statePipe$ = state(stateObservable$.pipe(map((v) => v)))
  expectType<StateObservable<1 | 2>>(statePipe$)

  const string$ = from("abc")
  const factory$ = state((_a: string) => EMPTY)
  expectError(string$.pipe(switchMap(factory$)))
  expectType<Observable<never>>(string$.pipe(switchMap((v) => factory$(v))))

  const takesIndex$ = state((_a: string, _b: number) => EMPTY)
  expectType<Observable<never>>(string$.pipe(switchMap(takesIndex$)))

  const optionalFactory$ = state((_a: string, _b?: number) => EMPTY)
  expectType<Observable<never>>(
    string$.pipe(switchMap((v) => optionalFactory$(v))),
  )
  expectType<Observable<never>>(
    string$.pipe(switchMap((v) => optionalFactory$(v, Number(v)))),
  )

  const variadicFactory$ = state((_b: number, ..._args: string[]) => EMPTY)
  expectError(variadicFactory$(3, "a", undefined, "4"))
  expectType<StateObservable<never>>(variadicFactory$(3, "a", "b", "c"))
}
