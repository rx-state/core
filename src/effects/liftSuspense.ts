import { Observable, Subscriber } from "rxjs"
import { SUSPENSE } from "../SUSPENSE"
import type { liftSuspense as ILiftSuspense } from "../index.d"

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
