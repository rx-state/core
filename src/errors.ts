export class NoSubscribersError extends Error {
  constructor() {
    super()
    this.name = "NoSubscribersError"
  }
}

export class EmptyObservableError extends Error {
  constructor() {
    super()
    this.name = "EmptyObservableError"
  }
}
