import { Observable, Subscriber } from "rxjs"
import { SUSPENSE } from "../SUSPENSE"
import type { liftSuspense as ILiftSuspense } from "../index.d"

/**
 * `sinkSuspense()` and `liftSuspense() are operators that help deal with
 * SUSPENSE values on the streams, which is useful when the meaning of SUSPENSE
 * is that everything needs to be reset.
 *
 * `liftSuspense()` is an operator that when it receives SUSPENSE as an error,
 * it will immediately resubscribe to its upstream, and emit SUSPENSE as a
 * value.
 *
 * This allows to avoid dealing with SUSPENSE on the streams that are in-between
 * the one that generates SUSPENSE and the one that needs to receive it.
 */
export const liftSuspense: typeof ILiftSuspense = () => {
  return <T>(source$: Observable<T>): Observable<T | SUSPENSE> => {
    return new Observable((observer) => {
      let subscriber: Subscriber<any>

      const setSubscriber = () => {
        subscriber = new Subscriber<T>({
          next(v: T) {
            observer.next(v as any)
          },
          error(e: unknown) {
            if (e === SUSPENSE) {
              observer.next(e)
              setSubscriber()
            } else observer.error(e)
          },
          complete() {
            observer.complete()
          },
        })
        source$.subscribe(subscriber)
      }

      setSubscriber()

      return () => {
        subscriber.unsubscribe()
      }
    })
  }
}
