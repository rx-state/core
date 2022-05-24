export class Effect<T> {
  constructor(readonly value: T) {}
}
export const effect = <T>(value: T) => new Effect(value)
