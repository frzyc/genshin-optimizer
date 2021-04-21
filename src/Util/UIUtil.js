export function valueString(value, unit) {
    switch (unit) {
        case "%": return value.toFixed(1)
        case "eff": return value.toFixed(2)
        default: return value.toFixed()
    }
}