import { Observable } from "rxjs"
import { PipeState } from "./PipeState"

export class StatePromise<T> extends Promise<T> {
  constructor(cb: (res: (value: T) => void, rej: any) => void) {
    super(cb)
  }
}

export interface StateObservable<T> extends Observable<T> {
  getRefCount: () => number
  getValue: (filter?: (value: T) => boolean) => T | StatePromise<T>
  pipe: PipeState<T>
}

export interface DefaultedStateObservable<T> extends StateObservable<T> {
  getValue: (filter?: (value: T) => boolean) => T
  getDefaultValue: () => T
  pipe: PipeState<T>
}
