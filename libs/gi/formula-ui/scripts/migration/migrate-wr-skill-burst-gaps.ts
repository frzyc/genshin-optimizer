/**
 * Append missing WR skill/burst formula rows to Pando UISheets.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulas } from '../../../formula/src/meta'
import { renderFieldRow } from '../lib/render-field'
import { extractWrFieldRows, type WrFormulaRow } from '../wr-field-row-extract'
import { findClosingBracket } from '../wr-text-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

function sheetFormulaRefs(src: string): Set<string> {
  const refs = new Set<string>()
  for (const m of src.matchAll(/formula\.(\w+)(?:\.tag)?/g)) refs.add(m[1])
  return refs
}

function wrSectionFormulas(
  key: string,
  section: 'skill' | 'burst'
): WrFormulaRow[] {
  const groups = extractWrFieldRows(key).get(section) ?? []
  const rows: WrFormulaRow[] = []
  for (const group of groups) {
    for (const row of group) {
      if (row.kind === 'formula') rows.push(row)
    }
  }
  return rows
}

function appendFieldsBlock(
  src: string,
  section: 'skill' | 'burst',
  rows: WrFormulaRow[]
): string {
  if (!rows.length) return src

  const empty = `${section}: ct.talentTem('${section}'),`
  if (src.includes(empty)) {
    const block = `  ${section}: ct.talentTem('${section}', [
    {
      type: 'fields',
      fields: [
${rows.map((row) => renderFieldRow(row)).join(',\n')}
      ],
    },
  ]),`
    return src.replace(empty, block)
  }

  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = src.indexOf(prefix)
  if (start === -1) return src

  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(src, openBracket)
  const inner = src.slice(openBracket + 1, closeBracket).trimEnd()
  const block = `    {
      type: 'fields',
      fields: [
${rows.map((row) => renderFieldRow(row)).join(',\n')}
      ],
    }`
  const sep = inner.length ? (inner.endsWith(',') ? '\n' : ',\n') : '\n'
  const nextInner = `${inner}${sep}${block}\n  `
  return src.slice(0, openBracket + 1) + nextInner + src.slice(closeBracket)
}

function migrateKey(key: string): number {
  const path = join(sheetsDir, `${key}.tsx`)
  let src = readFileSync(path, 'utf8')
  const charFormulas = (formulas as Record<string, Record<string, unknown>>)[
    key
  ]
  if (!charFormulas) return 0

  const refs = sheetFormulaRefs(src)
  let added = 0

  for (const section of ['skill', 'burst'] as const) {
    const missing = wrSectionFormulas(key, section).filter(
      (row) => charFormulas[row.formulaName] && !refs.has(row.formulaName)
    )
    if (!missing.length) continue
    const next = appendFieldsBlock(src, section, missing)
    if (next !== src) {
      src = next
      added += missing.length
      for (const row of missing) refs.add(row.formulaName)
    }
  }

  if (added) writeFileSync(path, src)
  return added
}

const argKeys = process.argv.slice(2)
const keys = (
  argKeys.length
    ? argKeys
    : readdirSync(sheetsDir)
        .filter((f) => f.endsWith('.tsx') && f !== 'index.ts')
        .map((f) => f.replace(/\.tsx$/, ''))
).sort()

let total = 0
for (const key of keys) {
  const added = migrateKey(key)
  if (added) {
    console.log(`${key}: added ${added} formula row(s)`)
    total += added
  }
}
console.log(`Added ${total} formula row(s) across ${keys.length} sheet(s)`)
