import { Observable } from "rxjs"
import StateObservable from "../internal/state-observable"

function cloneProps<T>(
  internal: StateObservable<T>,
  external: StateObservable<T>,
) {
  external.getValue = internal.getValue
  external.getRefCount = internal.getRefCount
  external.pipeState = internal.pipeState
  if ((internal as any).getDefaultValue) {
    ;(external as any).getDefaultValue = (internal as any).getDefaultValue
  }
}

/**
 *
 * @param getObservable function that takes arbitrary arguments and returns an
 * observable
 * @param defaultValue value or a function that returns a value
 * @returns a function that returns a StateObservable. The StateObservable will
 * be shared between all calls to the function with the same arguments. The
 * StateObservables is cached in a NestedMap which uses the arguments as keys.
 * Arguments are compared by reference for lookup in the cache, so they should
 * be primitives to benefit from the cache. If the arguments are objects that
 * are not referentially equal, a new observable will be created each time the
 * function is called.
 */
export default function connectFactoryObservable<A extends [], O>(
  getObservable: (...args: A) => Observable<O>,
  defaultValue: O | ((...args: A) => O),
) {
  const cache = new NestedMap<A, StateObservable<O>>()
  const getDefaultValue = (
    typeof defaultValue === "function" ? defaultValue : () => defaultValue
  ) as (...args: A) => O

  const getSharedObservable$ = (input: A): StateObservable<O> => {
    for (let i = input.length - 1; input[i] === undefined && i > -1; i--) {
      input.splice(-1)
    }
    const key = [input.length, ...input] as any as A
    const cachedVal = cache.get(key)

    if (cachedVal !== undefined) {
      return cachedVal
    }

    const sharedObservable$ = new StateObservable(
      getObservable(...input),
      getDefaultValue(...input),
      () => {
        cache.delete(key)
      },
    )

    const publicShared$ = new Observable<O>((subscriber) => {
      const inCache = cache.get(key)
      let source$: StateObservable<O> = sharedObservable$

      // Handle the case where
      // 1. the observable was subscribed to, then
      // 2. all subscribers unsubscribed (causing it to be removed from the
      //    cache), then
      // 3. a new subscriber subscribed to that same observable.
      // We have closed over the observable, so we add it back to the cache
      // here.
      if (!inCache) {
        cache.set(key, publicShared$)
      }
      // Handle the case where
      // 1. the observable returned by the initial call to getSharedObservable$
      //    was subscribed to, then
      // 2. all its subscribers unsubscribed (causing it to be removed from the
      //    cache), then
      // 3. getSharedObservable$ was called again with the same arguments, but
      //    we created a new observable (and cached it) because there was no
      //    cached one, then
      // 4. the observable returned by the initial call to getSharedObservable$
      //    was subscribed to again; (publicShared$, which we have closed over,
      //    at this point refers the original observable).
      // We want to share the cached observable, not the original one, but we
      // need to ensure that the original one shares the methods of the
      // cached one.
      else if (inCache !== publicShared$) {
        source$ = inCache
        cloneProps(source$, publicShared$)
      }

      return source$.subscribe(subscriber)
    }) as StateObservable<O>
    cloneProps(sharedObservable$, publicShared$)

    cache.set(key, publicShared$)
    return publicShared$
  }

  return (...input: A) => getSharedObservable$(input)
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
