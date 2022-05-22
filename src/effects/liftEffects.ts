import { Effect } from "./Effect"
import { Observable, Subscriber } from "rxjs"
import type { EffectObservable } from "../index.d"

type IsEmpty<T> = unknown extends T ? true : T extends never ? true : false

export function liftEffects(): <T, E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<IsEmpty<E> extends true ? T : T | E, never>
export function liftEffects<Args extends Array<unknown>>(
  ...args: Args
): <T, E>(
  source$: EffectObservable<T, E>,
) => EffectObservable<
  | T
  | (IsEmpty<E> extends true
      ? Args[keyof Args & number]
      : E & Args[keyof Args & number]),
  IsEmpty<E> extends true ? never : Exclude<E, Args[keyof Args & number]>
>

export function liftEffects<Args extends Array<any>>(...args: Args) {
  const toInclude = new Set(args)
  return <T, E>(
    source$: EffectObservable<T, E>,
  ): EffectObservable<
    unknown extends E
      ? T | Args[keyof Args & number]
      : T | (Args[keyof Args & number] & E),
    unknown extends E ? never : Exclude<E, Args[keyof Args & number]>
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
