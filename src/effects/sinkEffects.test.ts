import { from, Observable } from "rxjs"
import { Effect, sinkEffects } from "../"
import { effect } from "./Effect"

describe("sinkEffects", () => {
  it("propagates sinked effects as errors", () => {
    const test$ = from([1, null, 3, null, 5]).pipe(sinkEffects(null))

    const values: Array<number | null> = []
    const errors = new Array<any>()
    test$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        errors.push(e)
      },
    )

    expect(values).toEqual([1])
    expect(errors).toEqual([effect(null)])
  })

  it("keeps the source subscription alive after synchronously re-subscribing upon receiving an effect", () => {
    let nSubscriptions = 0
    const source$ = new Observable<number>((observer) => {
      nSubscriptions++
      for (let i = 0; i < 10 && !observer.closed; i++) {
        observer.next(i)
      }
    })

    const values: Array<number | null> = []
    const errors = new Array<any>()
    const sinked$ = source$.pipe(sinkEffects(3))
    sinked$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        if (e instanceof Effect) {
          errors.push(e.value)
          sinked$.subscribe((x) => {
            values.push(x)
          })
        } else {
          errors.push(e)
        }
      },
    )

    expect(nSubscriptions).toBe(1)
    expect(values).toEqual([0, 1, 2, 4, 5, 6, 7, 8, 9])
    expect(errors).toEqual([3])
  })

  it("propagates errors", () => {
    let nSubscriptions = 0
    const source$ = new Observable<number>((observer) => {
      nSubscriptions++
      for (let i = 0; i < 10 && !observer.closed; i++) {
        if (i === 2) observer.error(2)
        observer.next(i)
      }
    })

    const values: Array<number | null> = []
    const errors = new Array<any>()
    const sinked$ = source$.pipe(sinkEffects(3))
    sinked$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        if (e instanceof Effect) {
          errors.push(e.value)
          sinked$.subscribe((x) => {
            values.push(x)
          })
        } else {
          errors.push(e)
        }
      },
    )

    expect(nSubscriptions).toBe(1)
    expect(values).toEqual([0, 1])
    expect(errors).toEqual([2])
  })

  it("propagates completes", () => {
    let nSubscriptions = 0
    const source$ = new Observable<number>((observer) => {
      nSubscriptions++
      for (let i = 0; i < 10 && !observer.closed; i++) {
        if (i === 2) observer.complete()
        observer.next(i)
      }
    })

    const values: Array<number | null> = []
    const errors = new Array<any>()
    const sinked$ = source$.pipe(sinkEffects(3))
    sinked$.subscribe(
      (x) => {
        values.push(x)
      },
      (e) => {
        if (e instanceof Effect) {
          errors.push(e.value)
          sinked$.subscribe((x) => {
            values.push(x)
          })
        } else {
          errors.push(e)
        }
      },
    )

    expect(nSubscriptions).toBe(1)
    expect(values).toEqual([0, 1])
    expect(errors).toEqual([])
  })
})
