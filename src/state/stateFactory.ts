import { Observable } from "rxjs"
import StateObservable from "../internal/state-observable"

function cloneProps<T>(
  internal: StateObservable<T>,
  external: StateObservable<T>,
) {
  external.getValue = internal.getValue
  external.getRefCount = internal.getRefCount
  if ((internal as any).getDefaultValue) {
    ;(external as any).getDefaultValue = (internal as any).getDefaultValue
  }
}

export default function connectFactoryObservable<A extends [], O>(
  getObservable: (...args: A) => Observable<O>,
  defaultValue: O | ((...args: A) => O),
) {
  const cache = new NestedMap<A, StateObservable<O>>()
  const getDefaultValue = (
    typeof defaultValue === "function" ? defaultValue : () => defaultValue
  ) as (...args: A) => O

  const getSharedObservables$ = (input: A): StateObservable<O> => {
    for (let i = input.length - 1; input[i] === undefined && i > -1; i--) {
      input.splice(-1)
    }
    const keys = [input.length, ...input] as any as A
    const cachedVal = cache.get(keys)

    if (cachedVal !== undefined) {
      return cachedVal
    }

    const sharedObservable$ = new StateObservable(
      new Observable<O>((observer) =>
        getObservable(...input).subscribe(observer),
      ),
      getDefaultValue(...input),
      () => {
        cache.delete(keys)
      },
    )

    const publicShared$ = new Observable<O>((subscriber) => {
      const inCache = cache.get(keys)
      let source$: StateObservable<O> = sharedObservable$

      if (!inCache) {
        cache.set(keys, result)
      } else if (inCache !== publicShared$) {
        source$ = inCache
        cloneProps(source$, publicShared$)
      }

      return source$.subscribe(subscriber)
    }) as StateObservable<O>
    cloneProps(sharedObservable$, publicShared$)

    const result: StateObservable<O> = publicShared$

    cache.set(keys, result)
    return result
  }

  return (...input: A) => getSharedObservables$(input)
}

class NestedMap<K extends [], V extends Object> {
  private root: Map<K, any>
  constructor() {
    this.root = new Map()
  }

  get(keys: K[]): V | undefined {
    let current: any = this.root
    for (let i = 0; i < keys.length; i++) {
      current = current.get(keys[i])
      if (!current) return undefined
    }
    return current
  }

  set(keys: K[], value: V): void {
    let current: Map<K, any> = this.root
    let i
    for (i = 0; i < keys.length - 1; i++) {
      let nextCurrent = current.get(keys[i])
      if (!nextCurrent) {
        nextCurrent = new Map<K, any>()
        current.set(keys[i], nextCurrent)
      }
      current = nextCurrent
    }
    current.set(keys[i], value)
  }

  delete(keys: K[]): void {
    const maps: Map<K, any>[] = [this.root]
    let current: Map<K, any> = this.root

    for (let i = 0; i < keys.length - 1; i++) {
      maps.push((current = current.get(keys[i])))
    }

    let mapIdx = maps.length - 1
    maps[mapIdx].delete(keys[mapIdx])

    while (--mapIdx > -1 && maps[mapIdx].get(keys[mapIdx]).size === 0) {
      maps[mapIdx].delete(keys[mapIdx])
    }
  }
}
