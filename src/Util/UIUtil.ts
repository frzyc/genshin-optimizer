export function valueString(value: number, unit: string): string {
  switch (unit) {
    case "%": return (Math.round(value * 10) / 10).toFixed(1) + "%"
    case "eff": return value.toFixed(2) + "%"
    default: return Math.round(value).toFixed(0)
  }
}