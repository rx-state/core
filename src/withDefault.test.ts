import { NEVER } from "rxjs"
import { state } from "./state"
import { withDefault } from "./withDefault"

describe("withDefault", () => {
  it("makes a default state observable", () => {
    const result = state(NEVER).pipe(withDefault("test"))

    expect(result.getDefaultValue()).toBe("test")
  })
})
