import { Observable, Subscriber } from "rxjs"

export class Effect<T> {
  constructor(readonly value: T) {}
}

export const effect = <T>(value: T) => new Effect(value)

type SubscriberWithInner<T> = Subscriber<T> & { inner: Subscriber<any> }
export const mapEffect =
  <Input, Output>(mapper: (input: Input) => Output) =>
  (source$: Observable<Input>): Observable<Exclude<Output, Effect<any>>> => {
    let waiting: SubscriberWithInner<Input> | null = null

    return new Observable((observer) => {
      if (waiting) {
        waiting.inner = observer
        const outter = waiting!
        return () => {
          if (outter.inner === observer) outter.unsubscribe()
        }
      }

      let outter = new Subscriber<Input>({
        next(input: Input) {
          const output = mapper(input)
          if (output instanceof Effect) {
            waiting = outter
            outter.inner.error(output)
            waiting = null
            if (outter.inner === observer) {
              outter.unsubscribe()
            }
          } else {
            outter.inner.next(output)
          }
        },
        error(e: unknown) {
          outter.inner.error(e)
        },
        complete() {
          outter.inner.complete()
        },
      }) as SubscriberWithInner<Input>

      outter.inner = observer
      source$.subscribe(outter)

      return () => {
        if (outter.inner === observer) outter.unsubscribe()
      }
    })
  }

export const liftEffects =
  <E>() =>
  <T>(source$: Observable<T>): Observable<T | E> => {
    return new Observable((observer) => {
      let subscriber: Subscriber<any>

      const setSubscriber = () => {
        subscriber = new Subscriber<T>({
          next(v: T) {
            observer.next(v)
          },
          error(e: unknown) {
            if (e instanceof Effect) {
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
