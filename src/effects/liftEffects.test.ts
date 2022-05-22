import {
  concat,
  from,
  map,
  Observable,
  scan,
  take,
  throwError,
  timer,
} from "rxjs"
import { Effect, liftEffects, sinkEffects } from "./"

describe("liftEffects", () => {
  it("lift the effects", () => {
    let nSubscriptions = 0
    const source$ = new Observable<number>((observer) => {
      nSubscriptions++
      for (let i = 0; i < 10 && !observer.closed; i++) {
        observer.next(i)
      }
    })

    const values: Array<number | null> = []
    const errors = new Array<any>()
    const values$ = source$.pipe(
      sinkEffects(3, 6),
      map((x) => x * 2),
      liftEffects(3, 6),
      take(9),
    )
    values$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        errors.push(e)
      },
    )

    expect(nSubscriptions).toBe(1)
    expect(values).toEqual([0, 2, 4, 3, 8, 10, 6, 14, 16])
    expect(errors).toEqual([])
  })

  it("works with complex async values", async () => {
    const test$ = concat([null], timer(20)).pipe(
      sinkEffects(null),
      map((x) => x + 10),
      liftEffects(null),
    )

    const values: Array<number | null> = []
    const errors = new Array<any>()
    test$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        errors.push(e instanceof Effect ? e.value : e)
      },
    )

    await new Promise((res) => setTimeout(res, 30))

    expect(values).toEqual([null, 10])
    expect(errors).toEqual([])
  })

  it("propagates normal errors", async () => {
    const test$ = concat([null], timer(20), throwError("foo")).pipe(
      sinkEffects(null),
      map((x) => x + 10),
      liftEffects(null),
    )

    const values: Array<number | null> = []
    const errors = new Array<any>()
    test$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        errors.push(e instanceof Effect ? e.value : e)
      },
    )

    await new Promise((res) => setTimeout(res, 30))

    expect(values).toEqual([null, 10])
    expect(errors).toEqual(["foo"])
  })

  it("resets stateful Observables upon effect emission", async () => {
    const test$ = from([1, 2, 3, 4, 5, 6, 7, 8]).pipe(
      sinkEffects(3, 6),
      scan((a, b) => a + b, 0),
      liftEffects(3, 6, 10),
    )

    const values: Array<number | null> = []
    const errors = new Array<any>()
    test$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        errors.push(e instanceof Effect ? e.value : e)
      },
    )

    await new Promise((res) => setTimeout(res, 30))

    expect(values).toEqual([1, 3, 3, 4, 9, 6, 7, 15])
    expect(errors).toEqual([])
  })

  it("lifts all effects when non are passed", async () => {
    const test$ = from([1, 2, 3, 4, 5, 6, 7, 8]).pipe(
      sinkEffects(3, 6),
      scan((a, b) => a + b, 0),
      liftEffects(),
    )

    const values: Array<number> = []
    const errors = new Array<any>()
    test$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        errors.push(e instanceof Effect ? e.value : e)
      },
    )

    await new Promise((res) => setTimeout(res, 30))

    expect(values).toEqual([1, 3, 3, 4, 9, 6, 7, 15])
    expect(errors).toEqual([])
  })
})
