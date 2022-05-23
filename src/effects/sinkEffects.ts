import { Observable, Subscriber } from "rxjs"
import type { EffectObservable, sinkEffects as ISinkEffects } from "../index.d"
import { effect } from "./Effect"

type SubscriberWithInner<T> = Subscriber<T> & { inner: Subscriber<any> }
export const sinkEffects: typeof ISinkEffects = (...args) => {
  const toExclude = new Set(args)

  return <T, E>(source$: EffectObservable<T, E>) => {
    let waiting: SubscriberWithInner<any> | null = null

    return new Observable((observer) => {
      if (waiting) {
        waiting.inner = observer
        const outter = waiting!
        return () => {
          if (outter.inner === observer) outter.unsubscribe()
        }
      }

      let outter = new Subscriber<T>({
        next(value: T) {
          if (toExclude.has(value)) {
            waiting = outter
            outter.inner.error(effect(value))
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
