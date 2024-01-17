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

/**
 * StateObservable Represents an Observable state. It has the following
 * properties:
 * - It's multicast: The subscription is shared with all the subscribers.
 * - It replays the last emitted value to every new subscriber.
 * - It doesn't propagate complete. This allows it to replay the last emitted
 *   value to subscribers that subscribe after the source completes.
 * - When all its subscribers unsubscribe, it cleans up everything,
 *   unsubscribing from the source and resetting the latest value.
 */
export default class StateObservable<T> extends Observable<T> {
  // subject is used to multicast the source observable to all subscribers.
  private subject: Subject<T> | null = null
  // will contain a subscription to the source observable passed to
  // the constructor
  private subscription: Subscriber<T> | null = null
  private refCount = 0
  // We keep track of the current value with every emission from the source so
  // it can be emitted to new subscribers, and returned by getValue()
  private currentValue: T = EMPTY_VALUE
  // This promise is returned when getValue() is called while there are
  // subscribers but we have not emitted a value yet
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
      const subscriberWithoutComplete = new Subscriber({
        next: subscriber.next.bind(subscriber),
        error: subscriber.error.bind(subscriber),
        complete: noop,
      })

      this.refCount++
      // When a subscriber subscribes to the state observable instance, we want
      // it to receive next and error events, but we don't want that
      // subscription to complete, even if this.subject completes. We achieve
      // this by subscribing to this.subject with a subscriber that omits the
      // complete handler. innerSub will be a subscription to this.subject,
      // scoped to each subscription to the state observable instance. When the
      // subscription to the state observable instance is unsubscribed, innerSub
      // will be as well. We capture the subscription in innerSub so we can
      // unsubscribe from it when the subscription to the state observable
      // instance is unsubscribed.
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
            // If we had subscribers, but had not yet emitted a value, and
            // getValue() was called, this.promise will exist. If getValue()
            // was called while there were subscribers but we had not emitted
            // yet, this promise will have been returned from getValue(). Since
            // we no longer have subscribers, we reject that promise.
            this.promise.rej(new NoSubscribersError())
            this.promise = null
          }
        }
      })

      if (!this.subject) {
        this.subject = new Subject<T>()
        // The subscriber to the state observable instance should be notified
        // when the subject emits. Ensure that complete never gets called on the
        // subscriber to the state observable instance, even if the subject
        // completes.
        innerSub = this.subject.subscribe(subscriberWithoutComplete)
        // this subscriber will be used to subscribe to the source observable
        // and proxy emissions to the subject
        this.subscription = new Subscriber<T>({
          next: (value: T) => {
            // we don't need the promise anymore once we've emitted a
            // non-SUSPENSE value
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
              // If the source observable errors with SUSPENSE, that is a signal that
              // consumers of the state observable should be reset. The promise returned by
              // getValue() should be rejected with SUSPENSE, and other errors should
              // be ignored until the subscription is reset. To achieve this, we
              // reset the rejection function to wrap a call to the original
              // rejection function, passing SUSPENSE, so that if it is called
              // with another error/value, the passed error/value will be
              // ignored and the promise will be rejected with SUSPENSE.
              this.promise!.rej = () => {
                rej!(err)
              }
            }
            // Propagate the error to the subscriber to the state observable.
            // This will end the subscription, calling the cleanup function that
            // can cause the promise to be reset to null.
            subject!.error(err)
            // if the promise was not reset to null, reset the rejection
            // function to the original
            if (rej && this.promise) {
              this.promise.rej = rej
            }
          },
          complete: () => {
            // if the source observable completes, discard the subscription to it and
            // complete the subject to clean up and release memory
            this.subscription = null
            if (this.promise) {
              this.promise.rej(new EmptyObservableError())
              this.promise = null
            }

            if (this.currentValue !== EMPTY_VALUE)
              return this.subject!.complete()

            // If we have no current value, no promise to fulfill, and there is
            // no default value, there is nothing to emit, so we error. We no
            // longer need the subject.
            if (defaultValue === EMPTY_VALUE) {
              const subject = this.subject
              this.subject = null
              return subject!.error(new EmptyObservableError())
            }

            // if a synchronous observable completes without emitting a value
            // and there is a default value, ensure we emit the default value
            // before completing
            this.subject!.next((this.currentValue = defaultValue))
            this.subject!.complete()
          },
        })
        source$.subscribe(this.subscription)
        if (defaultValue !== EMPTY_VALUE && this.currentValue === EMPTY_VALUE) {
          this.subject!.next((this.currentValue = defaultValue))
        }
      } else {
        innerSub = this.subject.subscribe(subscriberWithoutComplete)
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

  pipeState = (...ops: OperatorFunction<any, any>[]) => {
    const result = (super.pipe as any)(...ops)
    return result instanceof StateObservable
      ? result
      : new StateObservable(result, EMPTY_VALUE)
  }

  getRefCount = () => {
    return this.refCount
  }
  // if we've already emitted a value that is not SUSPENSE, or have a default
  // value, return that, otherwise return a promise that will resolve when we
  // emit a non-SUSPENSE value
  getValue = (): Exclude<T, SUSPENSE> | StatePromise<Exclude<T, SUSPENSE>> => {
    if (this.promise) return this.promise.p
    if (
      this.currentValue !== EMPTY_VALUE &&
      (this.currentValue as any) !== SUSPENSE
    )
      return this.currentValue as any
    if (this.defaultValue !== EMPTY_VALUE) return this.defaultValue as any
    if (this.refCount === 0) throw new NoSubscribersError()

    // if we have subscribers, but we have not emitted a value yet, and
    // getValue() is called, we create a promise and return it.
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
