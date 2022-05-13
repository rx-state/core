import { concat, from, map, timer } from "rxjs"
import { mapEffect, effect, Effect, liftEffects } from "./effect"

describe("effect", () => {
  it("works", () => {
    const test$ = from([1, null, 3, null, 5]).pipe(
      map((val, idx) => [val, idx] as const),
      mapEffect(([value]) => {
        return value === null ? effect(null) : value
      }),
    )

    /*
    const values1: Array<number | null> = []
    test$
      .pipe(
        map((x) => x * 2),
        liftEffects<null>(),
      )
      .subscribe((x) => {
        values1.push(x)
      })

    expect(values1).toEqual([null, 2, null, 6, null, 10])
    */

    const values2: Array<number | null> = []
    const errors = new Array<any>()
    test$
      .pipe(
        map((x) => x * 3),
        liftEffects<null>(),
      )
      .subscribe(
        (x) => {
          values2.push(x)
        },
        (e) => {
          errors.push(e instanceof Effect ? e.value : e)
        },
      )

    expect(values2).toEqual([3, null, 9, null, 15])
    expect(errors).toEqual([])
  })
  it("also works", async () => {
    const test$ = concat([null], timer(20)).pipe(
      map((val, idx) => [val, idx] as const),
      mapEffect(([value]) => {
        return value === null ? effect(null) : value
      }),
    )

    /*
    const values1: Array<number | null> = []
    test$
      .pipe(
        map((x) => x * 2),
        liftEffects<null>(),
      )
      .subscribe((x) => {
        values1.push(x)
      })

    expect(values1).toEqual([null, 2, null, 6, null, 10])
    */

    const values2: Array<number | null> = []
    const errors = new Array<any>()
    test$
      .pipe(
        map((x) => x * 3),
        liftEffects<null>(),
      )
      .subscribe(
        (x) => {
          values2.push(x)
        },
        (e) => {
          errors.push(e instanceof Effect ? e.value : e)
        },
      )

    await new Promise((res) => setTimeout(res, 50))

    expect(values2).toEqual([null, 0])
    expect(errors).toEqual([])
  })
})
