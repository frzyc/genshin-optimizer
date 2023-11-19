export const clamp = (val: number, low: number, high: number) => {
  if (val < low) return low
  if (val > high) return high
  return val
}
export const clamp01 = (val: number) => clamp(val, 0, 1)
export const clampPercent = (val: number) => clamp(val, 0, 100)

export function toPercent(number: number, statKey: string) {
  if (statKey.endsWith('_')) return number * 100
  return number
}
export function within(val: number, a: number, b: number, inclusive = true) {
  if (inclusive) return val >= a && val <= b
  return val > a && val < b
}
