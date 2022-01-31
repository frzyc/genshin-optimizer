export class BorrowManager<T> {
  data: Dict<string, { value: T, refCount: number }> = {}
  init: (key: string) => T
  deinit: (key: string, value: T) => void

  constructor(init: (key: string) => T, deinit: (key: string, value: T) => void) {
    this.init = init
    this.deinit = deinit
  }

  /**
   * Borrow the object corresponding to `key`, creating the object as necessary.
   * The borrowing ends when `callback`'s promise is fulfilled.
   * When the last borrowing ends, `deinit` the object.
   *
   * Do not use `arg` after the `callback`'s promise is fulfilled.
   */
  async borrow<R>(key: string, callback: (arg: T) => Promise<R>): Promise<R> {
    if (!this.data[key]) {
      this.data[key] = { value: this.init(key), refCount: 0 }
    }

    const box = this.data[key]!
    box.refCount += 1
    const result = await callback(box.value)
    box.refCount -= 1
    if (!box.refCount) {
      // Last user. Cleaning up
      delete this.data[key]
      this.deinit(key, box.value)
    }
    return result
  }
}
