import { Observable, Subscription, Subject, noop, Subscriber } from "rxjs"
import { StateObservable } from "../StateObservable"
import { EMPTY_VALUE } from "./empty-value"

const shareLatest = <T>(
  source$: Observable<T>,
  defaultValue: T,
  teardown = noop,
) => {
  let subject: Subject<T> | null
  let subscription: Subscriber<T> | null
  let refCount = 0
  let currentValue: T = EMPTY_VALUE
  let promise: Promise<T> | null

  const emitIfEmpty =
    defaultValue === EMPTY_VALUE
      ? noop
      : () => {
          currentValue === EMPTY_VALUE &&
            subject &&
            subject!.next((currentValue = defaultValue))
        }

  const result = new Observable<T>((subscriber) => {
    subscriber.complete = noop

    refCount++
    let innerSub: Subscription

    subscriber.add(() => {
      refCount--
      innerSub.unsubscribe()
      if (refCount === 0) {
        currentValue = EMPTY_VALUE
        if (subscription) {
          subscription.unsubscribe()
        }
        teardown()
        subject = null
        subscription = null
        promise = null
      }
    })

    if (!subject) {
      subject = new Subject<T>()
      innerSub = subject.subscribe(subscriber)
      subscription = null
      subscription = new Subscriber<T>({
        next(value: T) {
          subject!.next((currentValue = value))
        },
        error(err: any) {
          const _subject = subject
          subscription = null
          subject = null
          _subject!.error(err)
        },
        complete() {
          subscription = null
          emitIfEmpty()
          subject!.complete()
        },
      })
      source$.subscribe(subscription)
      emitIfEmpty()
    } else {
      innerSub = subject.subscribe(subscriber)
      if (currentValue !== EMPTY_VALUE) {
        subscriber.next(currentValue)
      }
    }
  }) as StateObservable<T>

  result.getRefCount = () => refCount

  const noSubscribersErr = new Error("No subscribers")
  result.getComplete$ = () =>
    new Observable<boolean>((observer) => {
      if (refCount === 0) {
        observer.error(noSubscribersErr)
        return
      }

      if (!subscription) {
        observer.next(true)
        observer.complete()
        return
      }

      observer.next(false)
      return subject!.subscribe({
        complete() {
          observer.next(true)
          observer.complete()
        },
      })
    })

  result.getValue = () => {
    if (refCount === 0) {
      throw noSubscribersErr
    }

    if (currentValue !== EMPTY_VALUE) return currentValue
    if (defaultValue !== EMPTY_VALUE) return defaultValue
    if (promise) return promise

    return (promise = new Promise<T>((res, rej) => {
      const error = (e: any) => {
        rej(e)
        promise = null
      }
      const pSubs = subject!.subscribe({
        next(v) {
          pSubs.unsubscribe()
          res(v)
          promise = null
        },
        error,
        complete() {
          error(new Error("Empty observable"))
        },
      })
      subscription!.add(pSubs)
    }))
  }

  if (defaultValue !== EMPTY_VALUE) {
    ;(result as any).getDefaultValue = () => defaultValue
  }

  return result
}
export default shareLatest
