import { Observable, Subscriber } from "rxjs"
import { SUSPENSE } from "../SUSPENSE"
import { sinkSuspense as ISinkSuspense } from "../index.d"

type SubscriberWithInner<T> = Subscriber<T> & { inner: Subscriber<any> }
export const sinkSuspense: typeof ISinkSuspense = () => {
  return <T>(source$: Observable<T>) => {
    let waiting: SubscriberWithInner<any> | null = null

    return new Observable((observer) => {
      if (waiting) {
        waiting.inner = observer
        const outter = waiting!
        return () => {
          if (outter.inner === observer) outter.unsubscribe()
        }
      }

      let outter = new Subscriber<T | SUSPENSE>({
        next(value: T | SUSPENSE) {
          if (value === SUSPENSE) {
            waiting = outter
            outter.inner.error(value)
            waiting = null
            if (outter.inner === observer) {
              outter.unsubscribe()
            }
          } else {
            outter.inner.next(value)
          }
        },
        error(e: unknown) {
          outter.inner.error(e)
        },
        complete() {
          outter.inner.complete()
        },
      }) as SubscriberWithInner<T>

      outter.inner = observer
      source$.subscribe(outter)

      return () => {
        if (outter.inner === observer) outter.unsubscribe()
      }
    })
  }
}
