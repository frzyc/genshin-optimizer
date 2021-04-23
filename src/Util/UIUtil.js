export function valueString(value, unit) {
    switch (unit) {
        case "%": return Math.round(value * 10) / 10
        case "eff": return value.toFixed(2)
        default: return Math.round(value)
    }
}