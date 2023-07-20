
export class Bundle<T> {
  entries: Array<T> = []

  constructor(entries?: Array<T>) {
    if (entries) {
      this.entries = entries
    }
  }
}