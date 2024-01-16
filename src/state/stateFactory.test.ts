import "expose-gc"
import { concat, defer, NEVER, Observable, of, Subject } from "rxjs"
import { map, take } from "rxjs/operators"
import { TestScheduler } from "rxjs/testing"
import { liftSuspense, sinkSuspense } from "../effects"
import { StateObservable } from "../index.d"
import { SUSPENSE } from "../SUSPENSE"
import { state } from "./"

const scheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

describe("stateFactory", () => {
  describe("observable", () => {
    it("shares the subscription with all the observers with the same parameters", () => {
      scheduler().run(({ expectObservable, expectSubscriptions, cold }) => {
        const sourceSubsA = []
        const sourceA = cold("a-b-c-d-e")
        const subA = "        ^------!"
        const expectedA = "   a-b-c-d-"
        sourceSubsA.push("    ^------!")

        const sourceSubsB = []
        const sourceB = cold("  f-g-h-i-j")
        const subB = "        --^------!"
        const expectedB = "   --f-g-h-i-"
        sourceSubsB.push("    --^------!")

        const shared = state((v: "a" | "b") => (v === "a" ? sourceA : sourceB))

        expectObservable(shared("a"), subA).toBe(expectedA)
        expectObservable(shared("a"), subA).toBe(expectedA)
        expectSubscriptions(sourceA.subscriptions).toBe(sourceSubsA)
        expectObservable(shared("b"), subB).toBe(expectedB)
        expectObservable(shared("b"), subB).toBe(expectedB)
        expectSubscriptions(sourceB.subscriptions).toBe(sourceSubsB)
      })
    })

    it("individually resets the instance whose refcount reaches zero", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const sourceA = cold("a-b-c-d-e")
        const subA = "        ^--!----"
        const expectedA = "   a-b-----"
        const subA2 = "       ----^--!"
        const expectedA2 = "  ----a-b-"

        const sourceB = cold("  f-g-h-i-j")
        const subB = "        --^------!"
        const expectedB = "   --f-g-h-i-"

        const shared = state((v: "a" | "b") => (v === "a" ? sourceA : sourceB))

        expectObservable(shared("a"), subA).toBe(expectedA)
        expectObservable(shared("a"), subA2).toBe(expectedA2)
        expectObservable(shared("b"), subB).toBe(expectedB)
      })
    })

    it("handles missing optional args as if they were undefined", () => {
      const getNumber$ = state((x: number, y?: number) => of(x + (y ?? 0)))

      expect(getNumber$(5)).toBe(getNumber$(5, undefined))
      expect(getNumber$(6, undefined)).toBe(getNumber$(6))
    })

    it("doesn't hold references to observables whose refcount reached zero", async () => {
      let deferredRes: (val: string) => void = () => {}
      const deferredP = new Promise<string>((res) => {
        deferredRes = res
      })
      const registry = new FinalizationRegistry(deferredRes)

      const stateFactory = state(() => NEVER)
      let observable: any = stateFactory()
      registry.register(observable, "observable")
      const subscription = observable.subscribe()
      observable = undefined

      await Promise.resolve()
      subscription.unsubscribe()

      global.gc!()

      const value = await deferredP
      expect(value).toBe("observable")
    })

    it("doesn't hold references to observables whose refcount reached zero, even when self-referenced through defer", async () => {
      let deferredRes: (val: string) => void = () => {}
      const deferredP = new Promise<string>((res) => {
        deferredRes = res
      })
      const registry = new FinalizationRegistry(deferredRes)

      const stateFactory: (x: number) => StateObservable<number> = state(
        (x: number) =>
          concat(
            of(x),
            defer(() => stateFactory(x)),
          ),
      )
      let observable: any = stateFactory(1)
      registry.register(observable, "observable")
      const subscription = observable.subscribe()
      observable = undefined

      await Promise.resolve()
      subscription.unsubscribe()

      global.gc!()

      const value = await deferredP
      expect(value).toBe("observable")
    })

    describe("re-subscriptions on disposed observables", () => {
      it("registers itself when no other observable has been registered for that key", () => {
        const key = 0
        let sideEffects = 0

        const getShared = state((_: number) =>
          defer(() => {
            return of(++sideEffects)
          }),
        )

        const stream = getShared(key)

        let val
        stream.pipe(take(1)).subscribe((x) => {
          val = x
        })
        expect(val).toBe(1)

        stream.pipe(take(1)).subscribe((x) => {
          val = x
        })
        expect(val).toBe(2)

        const subscription = stream.subscribe((x) => {
          val = x
        })
        expect(val).toBe(3)

        getShared(key)
          .pipe(take(1))
          .subscribe((x) => {
            val = x
          })
        expect(val).toBe(3)
        subscription.unsubscribe()
      })

      it("subscribes to the currently registered observable if a new observable has been registered for that key", () => {
        const key = 0
        let sideEffects = 0

        const getShared = state((_: number) =>
          defer(() => {
            return of(++sideEffects)
          }),
        )

        const stream1 = getShared(key)

        let val
        stream1.pipe(take(1)).subscribe((x) => {
          val = x
        })
        expect(val).toBe(1)
        expect(stream1.getRefCount()).toBe(0)

        const stream2 = getShared(key)
        const subscription1 = stream2.subscribe((x) => {
          val = x
        })
        expect(val).toBe(2)
        expect(stream1.getRefCount()).toBe(0)
        expect(stream2.getRefCount()).toBe(1)

        stream1.pipe(take(1)).subscribe((x) => {
          val = x
        })
        expect(val).toBe(2)
        expect(stream1.getRefCount()).toBe(1)
        expect(stream2.getRefCount()).toBe(1)

        stream1.pipe(take(1)).subscribe((x) => {
          val = x
        })
        expect(val).toBe(2)
        expect(stream1.getRefCount()).toBe(1)
        expect(stream2.getRefCount()).toBe(1)

        const subscription2 = stream2.subscribe((x) => {
          val = x
        })
        expect(stream1.getRefCount()).toBe(2)
        expect(stream2.getRefCount()).toBe(2)

        subscription1.unsubscribe()
        subscription2.unsubscribe()
      })

      it("does not crash when the observable lazily references its enhanced self", () => {
        const obs$ = state(
          (key: number) => defer(() => obs$(key)).pipe(take(1)),
          (key: number) => key,
        ) as (key: number) => Observable<number>

        let error = null
        obs$(1)
          .subscribe({
            error: (e: any) => {
              error = e
            },
          })
          .unsubscribe()

        expect(error).toBeNull()
      })

      it("does not crash when the factory function self-references its enhanced self", () => {
        let nSubscriptions = 0
        const me$ = state(
          (key: number): Observable<number> => {
            nSubscriptions++
            return defer(() =>
              me$(key).pipe(
                take(1),
                map((x) => x * 2),
              ),
            )
          },
          (key: number) => key,
        )

        let value = 0
        const sub1 = me$(5).subscribe((val) => {
          value = val
        })

        expect(value).toBe(10)
        expect(sub1.closed).toBe(false)

        value = 0
        const sub2 = me$(5).subscribe((val) => {
          value = val
        })

        expect(value).toBe(10)
        expect(nSubscriptions).toBe(1)

        sub1.unsubscribe()
        sub2.unsubscribe()

        const sub3 = me$(5).subscribe((val) => {
          value = val
        })

        expect(value).toBe(10)
        expect(nSubscriptions).toBe(2)
        sub3.unsubscribe()
      })
    })

    it("resubscribes to the same instance on synchronous retries", () => {
      let instances = 0
      const source$ = new Subject<number | SUSPENSE>()
      const state$ = state(() => {
        instances++
        return source$.pipe(sinkSuspense())
      })

      const sub = state$().pipe(liftSuspense()).subscribe()

      expect(instances).toBe(1)
      source$.next(SUSPENSE)
      expect(instances).toBe(1)
      source$.next(1)
      expect(instances).toBe(1)

      sub.unsubscribe()
    })
  })

  describe("getRefCount", () => {
    it("returns how many active subscriptions does each state have", () => {
      const stateFactory = state((_: string) => NEVER)
      const stateA = stateFactory("a")
      const stateB = stateFactory("b")
      const stateA_cached = stateFactory("a")

      expect(stateA.getRefCount()).toBe(0)
      expect(stateA_cached.getRefCount()).toBe(0)
      expect(stateB.getRefCount()).toBe(0)

      const sub1 = stateA.subscribe()
      expect(stateA.getRefCount()).toBe(1)
      expect(stateA_cached.getRefCount()).toBe(1)
      expect(stateB.getRefCount()).toBe(0)

      const sub2 = stateB.subscribe()
      expect(stateA.getRefCount()).toBe(1)
      expect(stateB.getRefCount()).toBe(1)

      sub1.unsubscribe()
      expect(stateA.getRefCount()).toBe(0)
      expect(stateA_cached.getRefCount()).toBe(0)
      expect(stateB.getRefCount()).toBe(1)

      sub2.unsubscribe()
      expect(stateA.getRefCount()).toBe(0)
      expect(stateB.getRefCount()).toBe(0)
    })
  })

  describe("getValue", () => {
    it("returns the latest emitted value of each", () => {
      const stateFactory = state((v: number) => of(v), 3)
      const state1 = stateFactory(1)
      const state2 = stateFactory(2)

      const sub1 = state1.subscribe()
      const sub2 = state2.subscribe()

      expect(state1.getValue()).toBe(1)
      expect(state2.getValue()).toBe(2)

      sub1.unsubscribe()
      sub2.unsubscribe()
    })
  })

  describe("getDefaultValue", () => {
    it("returns the default value for each state observable", () => {
      const stateFactory = state(
        (v: number) => of(v * 5),
        (v: number) => v,
      )
      const state1 = stateFactory(1)
      const state2 = stateFactory(2)

      expect(state1.getDefaultValue()).toBe(1)
      expect(state2.getDefaultValue()).toBe(2)
    })
  })

  describe.skip("subject", () => {
    it("should work", () => {
      const subj1 = new Subject<number>()
      const subj2 = new Subject<number>()
      subj1.subscribe({ next: (val) => expect(val).toBe(1) })
      subj1.next(1)
      subj2.subscribe(subj1)
      subj2.next(2)
      subj1.complete()

      subj1.complete()
      subj1.next(2)
      subj1.subscribe({ next: (val) => expect(val).toBe(1) })
      subj1.next(2)
    })
  })
})
