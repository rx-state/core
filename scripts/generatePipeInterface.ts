const genericsSequence = new Array(26)
  .fill(0)
  .map((_, i) => String.fromCharCode("A".charCodeAt(0) + i))
  .filter((v) => v !== "T")

function generatePipeInterface(limit = 9) {
  // Function: <Generics>( ... ): Type<Generics>
  const opening = (generics: string[]) => `<${generics.join(", ")}>(`
  const closing = (type: string, generics: string[]) =>
    `): ${type}<${generics.join(", ")}>`

  // Parameters
  const operator = (generics: string[], index: number) =>
    `op${index + 1}: EffectOperatorFunction<${generics.join(", ")}>,`
  const defaultOp = (generics: string[]) =>
    `defaultOp: WithDefaultOperator<${generics.join(", ")}>,`

  const createFunctionEffectGenerics = (generics: string[]) => [
    ...generics,
    ...generics.map((g, i) =>
      i === 0 ? `E${g} = ET` : `E${g} = E${generics[i - 1]}`,
    ),
  ]

  const createOperatorEffectGenerics = (generics: string[]) => [
    ...generics,
    ...generics.map((g) => `E${g}`),
  ]

  const withDefaultOverload = (generics: string[]) => {
    const intrinsicGenerics = ["T", ...generics]

    const parameters = new Array(generics.length)
      .fill(0)
      .map((_, i) => {
        if (i < generics.length - 1) {
          const paramGenerics = createOperatorEffectGenerics(
            intrinsicGenerics.slice(i, i + 2),
          )

          return operator(paramGenerics, i)
        }
        const inParam = intrinsicGenerics[i]
        const defaultParam = intrinsicGenerics[i + 1]
        return defaultOp([inParam, defaultParam])
      })
      .join("\n    ")

    const openingGenerics = createFunctionEffectGenerics(generics)
    // On the case of default, the last effect is unused, we should remove it.
    openingGenerics.pop()
    return `  ${opening(openingGenerics)}
    ${parameters}
  ${closing("DefaultedStateObservable", [
    intrinsicGenerics.slice(-2).join(" | "),
    "E" + intrinsicGenerics[intrinsicGenerics.length - 2],
  ])}`
  }
  const regularOverload = (generics: string[], rest = false) => {
    if (generics.length === 0) {
      return `  (): StateObservable<T, ET>`
    }

    const intrinsicGenerics = ["T", ...generics]

    const parameters = new Array(generics.length).fill(0).map((_, i) => {
      const paramGenerics = createOperatorEffectGenerics(
        intrinsicGenerics.slice(i, i + 2),
      )

      return operator(paramGenerics, i)
    })

    if (rest) {
      parameters.push(
        `...operations: EffectOperatorFunction<any, any, any, any>[]`,
      )
    }

    const lastGeneric = intrinsicGenerics[intrinsicGenerics.length - 1]
    const resultTypes = rest
      ? ["unknown", "unknown"]
      : [lastGeneric, `E${lastGeneric}`]

    return `  ${opening(createFunctionEffectGenerics(generics))}
    ${parameters.join("\n    ")}
  ${closing("StateObservable", resultTypes)}`
  }

  const defaultOverloads = new Array(limit)
    .fill(0)
    .map((_, i) => withDefaultOverload(genericsSequence.slice(0, i + 1)))
    .join("\n")
  const regularOverloads = new Array(limit + 1)
    .fill(0)
    .map((_, i) => regularOverload(genericsSequence.slice(0, i)))
    .join("\n")

  // pipe redefinition must match the original one to correctly infer between StateObservable into Observable.
  // otherwise `combineLatest([stateObservable, of(1)]) => Observable<[unknown, number]>
  const restOverload = regularOverload(genericsSequence.slice(0, limit), true)

  return `export interface PipeState<T, ET> {
${defaultOverloads}
 
${regularOverloads}
${restOverload}
}`
}

console.log(generatePipeInterface(9))
