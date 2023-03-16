export class MaxPrio<V> {
  // Fibonacci Heap
  list: (PrioNode<V> | undefined)[] = []
  pivot = -1

  insert(key: number, value: V) {
    const oldMaxKey = this.list[this.pivot]?.key
    const degree = this.addNode({ key, value, children: [] }, 0)
    if (this.pivot < degree || oldMaxKey! < key) this.pivot = degree
  }
  pop(): V | undefined {
    const max = this.popNode(this.pivot)
    if (!max) return
    const { value, children } = max

    children.forEach((child, i) => this.addNode(child, i))
    if (!this.list.at(-1)) this.list.pop()

    let maxKey = -Infinity
    this.pivot = -1
    this.list.forEach((node, i) => {
      if (node && node.key >= maxKey) {
        maxKey = node.key
        this.pivot = i
      }
    })

    return value
  }

  /** Returns the degree of the tree that `node` resides in */
  private addNode(node: PrioNode<V>, degree: number): number {
    let other: PrioNode<V> | undefined
    while ((other = this.popNode(degree))) {
      if (other.key > node.key) {
        other.children.push(node)
        node = other
      } else node.children.push(other)
      degree += 1
    }
    this.list[degree] = node
    return degree
  }
  private popNode(degree: number): PrioNode<V> | undefined {
    const result = this.list[degree]
    this.list[degree] = undefined
    return result
  }
}

interface PrioNode<V> {
  key: number
  value: V
  children: PrioNode<V>[]
}

export class FIFO<T> {
  // Simple two-stack implementation
  head: T[] = []
  tail: T[] = []

  get length(): number {
    return this.head.length + this.tail.length
  }
  push(t: T): void {
    this.tail.push(t)
  }
  pop(): T | undefined {
    if (!this.head.length && this.tail.length)
      [this.head, this.tail] = [this.tail.reverse(), this.head]
    return this.head.pop()
  }
}
