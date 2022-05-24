import { Observable, Subscriber } from "rxjs"
import type { EffectObservable, liftEffects as ILiftEffects } from "../index.d"
import { Effect } from "./Effect"

export const liftEffects: typeof ILiftEffects = <Args extends Array<any>>(
  ...args: Args
) => {
  const toInclude = new Set(args)

  return <T, E>(
    source$: EffectObservable<T, E>,
  ): EffectObservable<
    T | Args[keyof Args & number],
    Exclude<E, Args[keyof Args & number]>
  > => {
    return new Observable((observer) => {
      let subscriber: Subscriber<any>

      const setSubscriber = () => {
        subscriber = new Subscriber<T>({
          next(v: T) {
            observer.next(v as any)
          },
          error(e: unknown) {
            if (
              e instanceof Effect &&
              (toInclude.has(e.value) || !toInclude.size)
            ) {
              observer.next(e.value)
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
