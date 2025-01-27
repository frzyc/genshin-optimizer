export type Unit = '' | '%' | 's'
/**
 * Print out a number in percent with fixed decimal places
 */
export function valueString(
  value: number,
  unit: Unit = '',
  fixed = -1
): string {
  if (!isFinite(value)) {
    if (value > 0) return `\u221E`
    if (value < 0) return `-\u221E`
    return 'NaN'
  }
  if (unit === '%') value *= 100
  if (Number.isInteger(value)) fixed = 0
  else if (fixed === -1) {
    if (unit === '%') fixed = 1
    else
      fixed =
        Math.abs(value) < 10
          ? 3
          : Math.abs(value) < 1000
          ? 2
          : Math.abs(value) < 10000
          ? 1
          : 0
  }
  return `${value.toFixed(fixed)}${unit}`
}
export function isPercentStat<Key extends string>(key: Key): boolean {
  return key.endsWith('_')
}
export function getUnitStr<Key extends string>(key: Key): Unit {
  if (isPercentStat(key)) return '%'
  return ''
}

export function statKeyToFixed(statKey: string) {
  return statKey.endsWith('_') ? 1 : 0
}

export function roundStat(value: number, statKey: string) {
  return isPercentStat(statKey)
    ? Math.round(value * 10000) / 10000
    : Math.round(value * 100) / 100
}
