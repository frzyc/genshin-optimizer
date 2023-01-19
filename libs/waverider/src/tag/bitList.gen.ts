/** `data[i]` is a list of numbers less than 2^i with exactly ceil(i/2) bits set */
const data: number[][] = [...Array(12)].map(_ => [])

for (let i = 1; i < 1 << data.length; i++) {
  let count = 0
  for (let cur = i; cur; cur = cur >> 1)
    count += cur & 1

  if (i < 1 << 2 * count) data[2 * count]?.push(i)

  // Technically, we can omit each odd entry `i`, and use the first half of `i + 1`.
  // However, the overhead here is minimal, and it's easier to handle than separating
  // odd/even code paths in the library.
  if (i < 1 << 2 * count - 1) data[2 * count - 1]?.push(i)
}

export default data
