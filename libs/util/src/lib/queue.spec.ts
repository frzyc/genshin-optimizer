import { FIFO, MaxPrio } from './queue'

describe('Priority queue', () => {
  const asc = Array(100)
    .fill(0)
    .map((_, i) => [i, `${i}`] as const)
  const desc = [...asc].reverse()

  test('ascending insertion', () => {
    const prio = new MaxPrio<string>()
    for (const [key, value] of asc) prio.insert(key, value)
    for (const [_, value] of desc) expect(prio.pop()).toEqual(value)
    expect(prio.pop()).toBeUndefined()
  })
  test('descending insertion', () => {
    const prio = new MaxPrio()
    for (const [key, value] of desc) prio.insert(key, value)
    for (const [_, value] of desc) expect(prio.pop()).toEqual(value)
    expect(prio.pop()).toBeUndefined()
  })
})

describe('FIFO queue', () => {
  test('Insertion', () => {
    const fifo = new FIFO<number>()
    const data = Array(100)
      .fill(0)
      .map((_, i) => i)
    for (const i of data) fifo.push(i)
    for (const i of data) expect(fifo.pop()).toEqual(i)
  })
})
