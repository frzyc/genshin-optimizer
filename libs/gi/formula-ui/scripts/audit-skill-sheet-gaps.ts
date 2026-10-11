/**
 * Find Pando UISheet skill sections missing WR skill damage formula rows.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulas } from '../../formula/src/meta'
import { extractWrFieldRows } from './wr-field-row-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')
const keys = readdirSync(sheetsDir)
  .filter((f) => f.endsWith('.tsx') && f !== 'index.ts')
  .map((f) => f.replace(/\.tsx$/, ''))
  .sort()

function sheetFormulaRefs(src: string): Set<string> {
  const refs = new Set<string>()
  for (const m of src.matchAll(/formula\.(\w+)(?:\.tag)?/g)) refs.add(m[1])
  return refs
}

function wrSkillFormulas(key: string): string[] {
  const groups = extractWrFieldRows(key).get('skill') ?? []
  const names: string[] = []
  for (const group of groups) {
    for (const row of group) {
      if (row.kind === 'formula') names.push(row.formulaName)
    }
  }
  return names
}

function wrBurstFormulas(key: string): string[] {
  const groups = extractWrFieldRows(key).get('burst') ?? []
  const names: string[] = []
  for (const group of groups) {
    for (const row of group) {
      if (row.kind === 'formula') names.push(row.formulaName)
    }
  }
  return names
}

type Gap = { key: string; section: 'skill' | 'burst'; missing: string[] }

const gaps: Gap[] = []

for (const key of keys) {
  if (!(formulas as Record<string, Record<string, unknown>>)[key]) continue
  const charFormulas = (formulas as Record<string, Record<string, unknown>>)[
    key
  ]
  const src = readFileSync(join(sheetsDir, `${key}.tsx`), 'utf8')
  const refs = sheetFormulaRefs(src)

  for (const [section, wrNames] of [
    ['skill', wrSkillFormulas(key)] as const,
    ['burst', wrBurstFormulas(key)] as const,
  ]) {
    const missing = wrNames.filter((n) => charFormulas[n] && !refs.has(n))
    if (missing.length) gaps.push({ key, section, missing })
  }
}

const lines = gaps.map((g) => `${g.key} ${g.section}: ${g.missing.join(', ')}`)
writeFileSync(
  join(
    process.cwd(),
    'libs/gi/formula-ui/scripts/audit-skill-sheet-gaps.out.txt'
  ),
  `${lines.join('\n')}\n\ntotal: ${gaps.length}\n`
)
console.log(lines.join('\n'))
console.log(`\ntotal: ${gaps.length}`)
