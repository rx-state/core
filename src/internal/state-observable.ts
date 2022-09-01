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
  private promise: {
    res: (value: Exclude<T, SUSPENSE>) => void
    rej: (v: any) => void
    p: StatePromise<Exclude<T, SUSPENSE>>
  } | null = null

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
          if (this.promise) {
            this.promise.rej(new NoSubscribersError())
            this.promise = null
          }
        }
      })

      if (!this.subject) {
        this.subject = new Subject<T>()
        innerSub = this.subject.subscribe(subscriber)
        this.subscription = null
        this.subscription = new Subscriber<T>({
          next: (value: T) => {
            if (this.promise && (value as any) !== SUSPENSE) {
              this.promise.res(value as any)
              this.promise = null
            }
            this.subject!.next((this.currentValue = value))
          },
          error: (err: any) => {
            this.subscription = null
            const subject = this.subject
            this.subject = null
            this.currentValue = EMPTY_VALUE

            const rej = this.promise?.rej
            if (rej && err === SUSPENSE) {
              this.promise!.rej = () => {
                rej!(err)
              }
            }
            subject!.error(err)
            if (rej && this.promise) {
              this.promise.rej = rej
            }
          },
          complete: () => {
            this.subscription = null
            if (this.promise) {
              this.promise.rej(new EmptyObservableError())
              this.promise = null
            }

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
    if (this.promise) return this.promise.p
    if (
      this.currentValue !== EMPTY_VALUE &&
      (this.currentValue as any) !== SUSPENSE
    )
      return this.currentValue as any
    if (this.defaultValue !== EMPTY_VALUE) return this.defaultValue as any
    if (this.refCount === 0) throw new NoSubscribersError()

    const promise = new StatePromise<Exclude<T, SUSPENSE>>((res, rej) => {
      this.promise = { res, rej, p: null as any }
    })
    this.promise!.p = promise
    return promise
  }
  getDefaultValue? = () => {
    return this.defaultValue
  }
}
