import { Observable } from "rxjs"

export class StatePromise<T> extends Promise<T> {
  constructor(cb: (res: (value: T) => void, rej: any) => void) {
    super(cb)
  }
}

export interface StateObservable<T> extends Observable<T> {
  getRefCount: () => number
  getComplete$: () => Observable<boolean>
  getValue: () => T | StatePromise<T>
}

export interface DefaultedStateObservable<T> extends StateObservable<T> {
  getValue: () => T
  getDefaultValue: () => T
}
