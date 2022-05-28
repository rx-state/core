import { filter, from, map, Observable } from "rxjs"
import { expectType } from "tsd"
import { EffectObservable, liftEffects, sinkEffects } from "./index.d"

const source$ = from([1, 2, 3] as const)

/// Observable pipe
const onlySink$ = source$.pipe(sinkEffects(1 as const))
expectType<EffectObservable<2 | 3, 1>>(onlySink$)

const noEffects$ = source$.pipe(
  map((v) => v + 1),
  filter((v) => v > 0),
)
expectType<Observable<number>>(noEffects$)

const sinkFilter$ = source$.pipe(
  sinkEffects(1 as const),
  filter((v) => v > 1),
  map((v) => v + ""),
)
expectType<EffectObservable<string, 1>>(sinkFilter$)

const sinkFilterFlippedOrder$ = source$.pipe(
  map((v) => v + ""),
  sinkEffects(1 as const),
)
expectType<EffectObservable<string, 1>>(sinkFilterFlippedOrder$)

const liftObservable$ = source$.pipe(liftEffects())
expectType<EffectObservable<1 | 2 | 3, never>>(liftObservable$)

const liftAfterSink$ = source$.pipe(sinkEffects(1 as const), liftEffects())
expectType<EffectObservable<1 | 2 | 3, never>>(liftAfterSink$)

const liftEverything$ = source$.pipe(
  sinkEffects(1 as const),
  filter((v) => v > 3),
  liftEffects(),
)
expectType<EffectObservable<1 | 2 | 3, never>>(liftEverything$)
