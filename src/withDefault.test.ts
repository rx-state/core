import { NEVER } from "rxjs"
import { state, withDefault } from "./"

describe("withDefault", () => {
  it("makes a default state observable", () => {
    const result = state(NEVER).pipeState(withDefault("test"))

    expect(result.getDefaultValue()).toBe("test")
  })
})
