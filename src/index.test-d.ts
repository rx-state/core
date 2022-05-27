import { filter, from, map } from "rxjs"
import { expectType } from "tsd"
import { EffectObservable, liftEffects, sinkEffects } from "./index.d"

const source$ = from([1, 2, 3] as const)

/// Observable pipe
const onlySink$ = source$.pipe(sinkEffects(1 as const))
expectType<EffectObservable<2 | 3, 1>>(onlySink$)

const sinkFilter$ = source$.pipe(
  sinkEffects(1 as const),
  filter((v) => v > 1),
  map((v) => v + ""),
)

expectType<EffectObservable<2 | 3, 1>>(sinkFilter$)

const liftEverything$ = source$.pipe(liftEffects())
expectType<EffectObservable<1 | 2 | 3, never>>(liftEverything$)
