import type { WrFieldRow } from '../wr-field-row-extract'

function unitExpr(unit: string): string {
  if (unit.startsWith('st(') || unit.startsWith('stg(')) return `unit: ${unit}`
  return `unit: '${unit}'`
}

export function renderFieldRow(row: WrFieldRow): string {
  const indent = '        '
  if (row.kind === 'formula') {
    const parts = [`title: ${row.title}`]
    if (row.subtitle) parts.push(`subtitle: ${row.subtitle}`)
    if (row.multi) parts.push(`multi: ${row.multi}`)
    if (row.unit) parts.push(unitExpr(row.unit))
    parts.push(`fieldRef: formula.${row.formulaName}.tag`)
    return `${indent}{\n${indent}  ${parts.join(`,\n${indent}  `)},\n${indent}}`
  }
  const parts = [`title: ${row.title}`]
  if (row.subtitle) parts.push(`subtitle: ${row.subtitle}`)
  if (row.variant) parts.push(`variant: '${row.variant}'`)
  parts.push(`fieldValue: ''`)
  if (row.unit) parts.push(unitExpr(row.unit))
  return `${indent}{\n${indent}  ${parts.join(`,\n${indent}  `)},\n${indent}}`
}

export function renderFieldsBlock(rows: WrFieldRow[]): string {
  if (!rows.length) return ''
  return `    {
      type: 'fields',
      fields: [
${rows.map(renderFieldRow).join(',\n')}
      ],
    }`
}

export function sheetUsesStImport(source: string): boolean {
  return /\bst\(/.test(source)
}
