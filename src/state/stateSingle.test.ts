import { TestScheduler } from "rxjs/testing"
import { from, merge, defer, Observable, noop, Subject, EMPTY, of } from "rxjs"
import { state } from "./"
import { withLatestFrom, startWith, map, take } from "rxjs/operators"

const scheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

describe("stateSingle", () => {
  describe("observable", () => {
    it("shares the subscription with its observers", () => {
      scheduler().run(({ expectObservable, expectSubscriptions, cold }) => {
        const sourceSubs = []
        const source = cold("a-b-c-d-e")
        sourceSubs.push("    ^------!--")
        const sub = "        ^------!"
        const expected = "   a-b-c-d-"

        const shared = state(source)

        expectObservable(shared, sub).toBe(expected)
        expectObservable(shared, sub).toBe(expected)
        expectSubscriptions(source.subscriptions).toBe(sourceSubs)
      })
    })

    it("repeats the latest value to new observers", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("a-b-c-d-e")
        const sub1 = "       ^------!"
        const expected1 = "  a-b-c-d-"
        const sub2 = "       ---^---!"
        const expected2 = "  ---bc-d-"

        const shared = state(source)

        expectObservable(shared, sub1).toBe(expected1)
        expectObservable(shared, sub2).toBe(expected2)
      })
    })

    it("does not propagate complete", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("a-b-|")
        const sub1 = "       ^------!"
        const expected1 = "  a-b-----"
        const sub2 = "       -----^-!"
        const expected2 = "  -----b--"

        const shared = state(source)

        expectObservable(shared, sub1).toBe(expected1)
        expectObservable(shared, sub2).toBe(expected2)
      })
    })

    it("propagates errors", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("a-b-#")
        const sub1 = "       ^------!"
        const expected1 = "  a-b-#---"
        const sub2 = "       -----^--!"
        const expected2 = "  -----a-b-"

        const shared = state(source)

        expectObservable(shared, sub1).toBe(expected1)
        expectObservable(shared, sub2).toBe(expected2)
      })
    })

    it("restarts when all observers unsubscribe", () => {
      scheduler().run(({ expectObservable, expectSubscriptions, cold }) => {
        const sourceSubs = []
        const source = cold("a-b-c-d-e-f-g-h-i-j")
        sourceSubs.push("   ^------!----------------------")
        sourceSubs.push("   -----------^------------------")
        const sub1 = "      ^------!"
        const expected1 = " a-b-c-d-"
        const sub2 = "      -----------^------------------"
        const expected2 = " -----------a-b-c-d-e-f-g-h-i-j"

        const shared = state(source)

        expectObservable(shared, sub1).toBe(expected1)
        expectObservable(shared, sub2).toBe(expected2)
        expectSubscriptions(source.subscriptions).toBe(sourceSubs)
      })
    })

    it("stops listening on a synchronous observable when all observers unsubscribe", () => {
      let sideEffects = 0
      const synchronousObservable = new Observable<number>((subscriber) => {
        // This will check to see if the subscriber was closed on each loop
        // when the unsubscribe hits (from the `take`), it should be closed
        for (let i = 0; !subscriber.closed && i < 10; i++) {
          sideEffects++
          subscriber.next(i)
        }
      })
      state(synchronousObservable).pipe(take(3)).subscribe(noop)
      expect(sideEffects).toBe(3)
    })

    it("emits the default value synchronously if the source doesn't emit", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("----a-b-c")
        const sub = "        ^------!"
        const expected = "   d---a-b-"

        const shared = state(source, "d")

        expectObservable(shared, sub).toBe(expected)
      })
    })

    it("does not emit the default value synchronously if the source emits", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("------b-c").pipe(
          startWith("a"), // cold doesn't synchronously emit :(
        )
        const sub = "        ^------!"
        const expected = "   a-----b-"

        const shared = state(source, "d")

        expectObservable(shared, sub).toBe(expected)
      })
    })

    // Ported from shareLatest
    it("restarts when the source has completed and all observers unsubscribe", () => {
      scheduler().run(({ expectObservable, expectSubscriptions, cold }) => {
        const sourceSubs = []
        const source = cold("a-(b|)          ")
        sourceSubs.push("-^-!            ")
        sourceSubs.push("-----------^-!")
        const sub1 = "-^--!          "
        const expected1 = "-a-b         "
        const sub2 = "-----------^--!"
        const expected2 = "-----------a-b"

        const shared = state(source)

        expectObservable(shared, sub1).toBe(expected1)
        expectObservable(shared, sub2).toBe(expected2)
        expectSubscriptions(source.subscriptions).toBe(sourceSubs)
      })
    })

    it("handles recursively synchronous subscriptions", () => {
      scheduler().run(({ expectObservable, hot }) => {
        const values$ = hot("----b-c-d---")
        const latest$ = hot("----------x-")
        const expected = "   a---b-c-d-d-"
        const input$: any = merge(
          values$,
          latest$.pipe(
            withLatestFrom(defer(() => result$)),
            map(([, latest]) => latest),
          ),
        )

        const result$: any = state(input$.pipe(startWith("a")))

        expectObservable(result$, "^").toBe(expected)
      })
    })

    it("does not skip values on synchronous source", () => {
      scheduler().run(({ expectObservable }) => {
        const source = from(["a", "b", "c", "d"])
        const sub1 = "^"
        const expected1 = "  (abcd)"

        const shared = state(source)

        expectObservable(shared, sub1).toBe(expected1)
      })
    })

    // Ported from connectObservable
    it("supports streams that emit functions", () => {
      scheduler().run(({ expectObservable, cold }) => {
        function a() {}
        function b() {}
        function c() {}
        const values = { a, b, c }
        const source = cold("a-b-c-", values)
        const sub = "        ^------!"
        const expected = "   a-b-c---"

        const shared = state(source)

        expectObservable(shared, sub).toBe(expected, values)
      })
    })

    it("the default value can be undefined", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("----a-b-c")
        const sub = "        ^------!"
        const expected = "   u---a-b-"

        const shared = state(source, undefined)

        expectObservable(shared, sub).toBe(expected, {
          u: undefined,
          a: "a",
          b: "b",
        })
      })
    })
  })

  describe("getRefCount", () => {
    it("returns how many active subscriptions does the state have", () => {
      const source = new Subject()
      const sourceState = state(source)
      expect(sourceState.getRefCount()).toBe(0)

      const sub1 = sourceState.subscribe()
      expect(sourceState.getRefCount()).toBe(1)

      const sub2 = sourceState.subscribe()
      expect(sourceState.getRefCount()).toBe(2)

      sub1.unsubscribe()
      expect(sourceState.getRefCount()).toBe(1)

      source.complete()
      expect(sourceState.getRefCount()).toBe(1)

      const sub3 = sourceState.subscribe()
      expect(sourceState.getRefCount()).toBe(2)

      sub2.unsubscribe()
      sub3.unsubscribe()
      expect(sourceState.getRefCount()).toBe(0)
    })
  })

  describe("getComplete$ observable", () => {
    const values = {
      t: true,
      f: false,
    }

    it("throws an error if the stream does not have a subscription", () => {
      scheduler().run(({ expectObservable }) => {
        const source = EMPTY
        const complete = state(source).getComplete$()
        const sub = "     ^"
        const expected = "#"

        expectObservable(complete, sub).toBe(
          expected,
          {},
          new Error("No subscribers"),
        )
      })
    })

    it("emits whether the active observable has completed", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("---|")
        const sub1 = "       ^------"
        const expected1 = "  f--(t|)"
        const sub2 = "       -------^--"
        const expected2 = "  -------(t|)"

        const s = state(source)
        s.subscribe()
        const complete = s.getComplete$()

        expectObservable(complete, sub1).toBe(expected1, values)
        expectObservable(complete, sub2).toBe(expected2, values)
      })
    })

    it("immediately emits true if the active observable was already completed", () => {
      scheduler().run(({ expectObservable, cold }) => {
        const source = cold("---|")
        const s = state(source)
        s.subscribe()
        const complete = s.getComplete$()
        const expected = "   f--(t|)"

        expectObservable(complete).toBe(expected, values)
      })
    })
  })

  describe("getValue", () => {
    describe("without default value", () => {
      it("throws an error if the stream does not have a subscription", () => {
        const sourceState = state(of(1))
        expect(() => sourceState.getValue()).toThrowError(
          new Error("No subscribers"),
        )
      })

      it("returns the latest emitted value", () => {
        const sourceState = state(of(1))
        const sub = sourceState.subscribe()
        expect(sourceState.getValue()).toBe(1)

        sub.unsubscribe()
      })

      it("returns a promise if the observable hasn't emitted yet that will resolve with the first value", async () => {
        const source = new Subject<number>()
        const sourceState = state(source)
        const sub = sourceState.subscribe()

        const value = sourceState.getValue()
        expect(value).toBeInstanceOf(Promise)

        source.next(1)

        await expect(value).resolves.toBe(1)

        sub.unsubscribe()
      })

      it("rejects the promise if the stream completes without emitting any value", async () => {
        const source = new Subject<number>()
        const sourceState = state(source)
        const sub = sourceState.subscribe()

        const value = sourceState.getValue()

        source.complete()

        await expect(value).rejects.toEqual(new Error("Empty observable"))

        sub.unsubscribe()
      })

      it("rejects the promise if all observers unsubscribe before it emits any value", async () => {
        const source = new Subject<number>()
        const sourceState = state(source)
        const sub = sourceState.subscribe()

        const value = sourceState.getValue()

        sub.unsubscribe()

        await expect(value).rejects.toEqual(new Error("No subscribers"))
      })

      it("always returns the same promise while the value is not emitted", () => {
        const source = new Subject<number>()
        const sourceState = state(source)
        let sub = sourceState.subscribe()

        const initialPromise = sourceState.getValue()
        expect(initialPromise).toBe(sourceState.getValue())

        source.next(1)

        sub.unsubscribe()
        sub = sourceState.subscribe()

        expect(initialPromise).not.toBe(sourceState.getValue())
        source.next(1)

        sub.unsubscribe()
      })
    })

    describe("with default value", () => {
      it("throws an error if the stream does not have a subscription", () => {
        const sourceState = state(of(1), 1)
        expect(() => sourceState.getValue()).toThrowError(
          new Error("No subscribers"),
        )
      })

      it("returns the latest emitted value", () => {
        const sourceState = state(of(1), 3)
        const sub = sourceState.subscribe()
        expect(sourceState.getValue()).toBe(1)

        sub.unsubscribe()
      })

      it("returns the default value if the observable hasn't emitted yet", async () => {
        const source = new Subject<number>()
        const sourceState = state(source, 3)
        const sub = sourceState.subscribe()

        const value = sourceState.getValue()
        expect(value).toBe(3)

        sub.unsubscribe()
      })
    })
  })

  describe("getDefaultValue", () => {
    it("returns the default value of the state observable", () => {
      const sourceState = state(of(1), 3)
      expect(sourceState.getDefaultValue()).toBe(3)
    })
  })
})
