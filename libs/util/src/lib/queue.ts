export class MaxPrio<V> {
  // Fibonacci Heap
  list: (PrioNode<V> | undefined)[] = []
  maxNode: PrioNode<V> | undefined

  insert(key: number, value: V): void {
    let node: PrioNode<V> | undefined = { key, value, children: [] }
    if (!this.maxNode || this.maxNode.key < key)
      [this.maxNode, node] = [node, this.maxNode]
    if (node) this.addNode(node, node.children.length)
  }
  pop(): V | undefined {
    if (!this.maxNode) return
    const { value, children } = this.maxNode
    children.forEach((child, i) => this.addNode(child, i))

    const [_, maxDegree] = this.list.reduce(
      (max, cur, iCur) =>
        !cur || (max[0] && max[0].key > cur.key) ? max : [cur, iCur],
      [undefined as PrioNode<V> | undefined, -1]
    )
    if (maxDegree === this.list.length - 1) this.maxNode = this.list.pop()
    else this.maxNode = this.popNode(maxDegree)
    return value
  }

  private addNode(node: PrioNode<V>, degree: number): void {
    let other: PrioNode<V> | undefined
    while ((other = this.popNode(degree))) {
      if (other.key > node.key) {
        other.children.push(node)
        node = other
      } else node.children.push(other)
      degree += 1
    }
    this.list[degree] = node
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
