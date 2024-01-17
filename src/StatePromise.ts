import type { StatePromise as IStatePromise } from "./index.d"

// Q: in what way is this different from Promise<T>? Not clear to me why this is
// useful.
export class StatePromise<T> extends Promise<T> implements IStatePromise<T> {
  constructor(cb: (res: (value: T) => void, rej: any) => void) {
    super(cb)
  }
}
