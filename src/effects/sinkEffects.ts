import { effect } from "./Effect"
import { Observable, Subscriber } from "rxjs"
import type { EffectObservable } from "../index.d"

type IsEmpty<T> = unknown extends T ? true : T extends never ? true : false

type SubscriberWithInner<T> = Subscriber<T> & { inner: Subscriber<any> }
export const sinkEffects = <Args extends Array<any>>(...args: Args) => {
  type UnionArgTypes = Args[keyof Args & number]
  const toExclude = new Set(args)
  return <T, E>(
    source$: EffectObservable<T, E>,
  ): EffectObservable<
    IsEmpty<UnionArgTypes> extends true ? T : Exclude<T, UnionArgTypes>,
    IsEmpty<E> extends true ? UnionArgTypes : UnionArgTypes | E
  > => {
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
