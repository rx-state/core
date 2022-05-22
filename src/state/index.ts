import { state as IState } from "../index.d"
import { EMPTY_VALUE } from "../internal/empty-value"
import stateFactory from "./stateFactory"
import stateSingle from "./stateSingle"

export const state: typeof IState = (...args: any[]) =>
  (typeof args[0] === "function" ? (stateFactory as any) : stateSingle)(
    args[0],
    args.length > 1 ? args[1] : EMPTY_VALUE,
  )
