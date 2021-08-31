export function valueStringWithUnit(value: number, unit: string): string {
  switch (unit) {
    case "%": return value.toFixed(1) + "%"
    case "eff": return value.toFixed(2) + "%"
    default: return value.toFixed(0)
  }
}

export function valueString(value: number, unit: string): string {
  switch (unit) {
    case "%": return value.toFixed(1)
    case "eff": return value.toFixed(2)
    default: return value.toFixed(0)
  }
}
