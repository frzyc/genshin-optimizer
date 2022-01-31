/**
 * @deprecated
 */
export function valueStringWithUnit(value: number, unit: string): string {
  switch (unit) {
    case "%": return valueString(value, unit) + "%"
    case "eff": return valueString(value, unit) + "%"
    default: return valueString(value, unit)
  }
}
/**
 * @deprecated
 */
export function valueString(value: number, unit: string): string {
  switch (unit) {
    case "%": return (Math.round(value * 10) / 10).toFixed(1) // TODO: % conversion
    case "eff": return value.toFixed(2)
    default: return Math.round(value).toFixed(0)
  }
}
