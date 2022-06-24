import {
  noop,
  Observable,
  OperatorFunction,
  Subject,
  Subscriber,
  Subscription,
} from "rxjs"
import { EmptyObservableError, NoSubscribersError } from "../errors"
import { StatePromise } from "../StatePromise"
import { SUSPENSE } from "../SUSPENSE"
import { EMPTY_VALUE } from "./empty-value"

export default class StateObservable<T> extends Observable<T> {
  private subject: Subject<T> | null = null
  private subscription: Subscriber<T> | null = null
  private refCount = 0
  private currentValue: T = EMPTY_VALUE
  private promise: Promise<Exclude<T, SUSPENSE>> | null = null

  constructor(
    source$: Observable<T>,
    private defaultValue: T,
    teardown = noop,
  ) {
    super((subscriber) => {
      subscriber.complete = noop

      this.refCount++
      let innerSub: Subscription

      subscriber.add(() => {
        this.refCount--
        innerSub.unsubscribe()
        if (this.refCount === 0) {
          this.currentValue = EMPTY_VALUE
          if (this.subscription) {
            this.subscription.unsubscribe()
          }
          teardown()
          this.subject?.complete()
          this.subject = null
          this.subscription = null
          this.promise = null
        }
      })

      if (!this.subject) {
        this.subject = new Subject<T>()
        innerSub = this.subject.subscribe(subscriber)
        this.subscription = null
        this.subscription = new Subscriber<T>({
          next: (value: T) => {
            this.subject!.next((this.currentValue = value))
          },
          error: (err: any) => {
            this.subscription = null
            const subject = this.subject
            this.subject = null
            subject!.error(err)
          },
          complete: () => {
            this.subscription = null
            if (this.currentValue !== EMPTY_VALUE)
              return this.subject!.complete()
            if (defaultValue === EMPTY_VALUE) {
              const subject = this.subject
              this.subject = null
              return subject!.error(new EmptyObservableError())
            }

            this.subject!.next((this.currentValue = defaultValue))
            this.subject!.complete()
          },
        })
        source$.subscribe(this.subscription)
        if (defaultValue !== EMPTY_VALUE && this.currentValue === EMPTY_VALUE) {
          this.subject!.next((this.currentValue = defaultValue))
        }
      } else {
        innerSub = this.subject.subscribe(subscriber)
        if (this.currentValue !== EMPTY_VALUE) {
          subscriber.next(this.currentValue)
        }
      }
    })

    if (defaultValue === EMPTY_VALUE) {
      // Remove the getDefaultValue property from this object, as it's not part of the interface
      delete this.getDefaultValue
    }
  }

  pipeState(...ops: OperatorFunction<any, any>[]) {
    const result = (super.pipe as any)(...ops)
    return result instanceof StateObservable
      ? result
      : new StateObservable(result, EMPTY_VALUE)
  }

  getRefCount = () => {
    return this.refCount
  }
  getValue = (): Exclude<T, SUSPENSE> | StatePromise<Exclude<T, SUSPENSE>> => {
    if (this.promise) return this.promise
    if (
      this.currentValue !== EMPTY_VALUE &&
      (this.currentValue as any) !== SUSPENSE
    )
      return this.currentValue as any
    if (this.defaultValue !== EMPTY_VALUE) return this.defaultValue as any
    if (this.refCount === 0) throw new NoSubscribersError()

    return (this.promise = new StatePromise<Exclude<T, SUSPENSE>>(
      (res, rej) => {
        const error = (e: any) => {
          rej(e)
          this.promise = null
        }
        const pSubs = this.subject!.subscribe({
          next: (v) => {
            if ((v as any) !== SUSPENSE) {
              pSubs.unsubscribe()
              res(v as any)
              this.promise = null
            }
          },
          error,
          complete: () => {
            error(new EmptyObservableError())
          },
        })
        this.subscription!.add(pSubs)
        this.subscription!.add(() => {
          // When the subscription tears down (i.e. refCount = 0) and no value was emitted we must reject the promise.
          // we can directly emit error without any check, as if it had a value the promise already resolved.
          error(new NoSubscribersError())
        })
      },
    ))
  }
  getDefaultValue? = () => {
    return this.defaultValue
  }
}
