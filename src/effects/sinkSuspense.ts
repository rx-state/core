import { Observable, Subscriber } from "rxjs"
import { SUSPENSE } from "../SUSPENSE"
import { sinkSuspense as ISinkSuspense } from "../index.d"

type SubscriberWithInner<T> = Subscriber<T> & { inner: Subscriber<any> }

/**
 * `sinkSuspense()` and `liftSuspense() are operators that help deal with
 * SUSPENSE values on the streams, which is useful when the meaning of SUSPENSE
 * is that everything needs to be reset.
 *
 * `sinkSuspense()` is an operator that when it receives a SUSPENSE, it will
 * throw it as an error down the stream, which resets all of the observables
 * down below. It will then hold the subscription to the upstream, waiting for a
 * resubscription to happen immediately. If it doesn't happen, then it will
 * unsubscribe from upstream.
 */
export const sinkSuspense: typeof ISinkSuspense = () => {
  return <T>(source$: Observable<T>) => {
    let waiting: SubscriberWithInner<any> | null = null

    return new Observable((observer) => {
      if (waiting) {
        waiting.inner = observer
        const outer = waiting!
        return () => {
          if (outer.inner === observer) outer.unsubscribe()
        }
      }

      let outer = new Subscriber<T | SUSPENSE>({
        next(value: T | SUSPENSE) {
          if (value === SUSPENSE) {
            waiting = outer
            outer.inner.error(value)
            waiting = null
            if (outer.inner === observer) {
              outer.unsubscribe()
            }
          } else {
            outer.inner.next(value)
          }
        },
        error(e: unknown) {
          outer.inner.error(e)
        },
        complete() {
          outer.inner.complete()
        },
      }) as SubscriberWithInner<T>

      outer.inner = observer
      source$.subscribe(outer)

      return () => {
        if (outer.inner === observer) outer.unsubscribe()
      }
    })
  }
}
