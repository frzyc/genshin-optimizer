import type { IConditionalData } from './IConditionalData'

export function correctConditionalValue(
  conditional: IConditionalData,
  value: number
) {
  if (conditional.type === 'bool') {
    return +!!value
  }
  if (conditional.type === 'num') {
    if (conditional.int_only && !Number.isInteger(value)) {
      value = Math.round(value)
    }
    if (conditional.min !== undefined && value < conditional.min)
      value = conditional.min
    if (conditional.max !== undefined && value > conditional.max)
      value = conditional.max
  } else if (conditional.type === 'list') {
    if (!Number.isInteger(value)) {
      value = Math.round(value)
    }
    if (value < 0) value = 0
    if (value > conditional.list.length - 1) value = conditional.list.length - 1
  }
  return value
}
