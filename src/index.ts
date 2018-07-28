import { EventEmitter } from 'events'

export const ItemQueuedEventName = 'item_queued'
export const ItemDequeuedEventName = 'item_dequeued'

export class NotifierQueue<T> extends EventEmitter {
  public isEmpty: boolean
  public length: number

  /**
   * Create a new instance with some optional initial values.
   * The 'item_queued' event will not be triggered for the initial values.
   *
   * @static
   * @template T the type of the items this queue will hold
   * @param {T[]} [initialValues=[]] optional initial values
   * @memberof NotifierQueue
   */
  public static make<T>(initialValues: T[] = []) {
    return new NotifierQueue(initialValues)
  }

  private constructor(private _items: T[]) {
    super()
    this.isEmpty = !_items.length
    this.length = _items.length
  }

  public enqueue(item: T) {
    this._items.push(item)
    this.setLengthAndIsEmpty()

    this.emit(ItemQueuedEventName, item)
  }

  public dequeue() {
    const latest = this._items.shift()
    if (latest === undefined) return

    this.setLengthAndIsEmpty()
    this.emit(ItemDequeuedEventName, latest)

    return latest
  }

  public contains(predicate: (item: T) => boolean): boolean {
    return this._items.find(predicate) !== undefined
  }

  public seek<R>(process: (item: T) => R | undefined): R | undefined {
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i]
      const res = process(item)

      if (res) {
        this._items.splice(i, 1)
        this.setLengthAndIsEmpty()
        this.emit(ItemDequeuedEventName, item)

        return res
      }
    }

    return
  }

  public peek(): T | undefined {
    if (!this._items.length) return

    return this._items[this._items.length - 1]
  }

  private setLengthAndIsEmpty() {
    this.isEmpty = !this._items.length
    this.length = this._items.length
  }
}
