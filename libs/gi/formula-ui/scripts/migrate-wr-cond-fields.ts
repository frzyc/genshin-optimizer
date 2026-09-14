/**
 * Sync charConditionalDocument `fields` from WR condTem state field rows.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseWrFieldElement } from './wr-field-row-extract'
import {
  extractBraceContent,
  findClosingBracket,
  readWrSheetSource,
  TALENT_SECTIONS,
  type TalentSection,
} from './wr-text-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

function buildPathToCondName(wrSrc: string): Map<string, string> {
  const pathToName = new Map<string, string>()
  const condDeclRe =
    /const \[(\w+),\s*(\w+)\]\s*=\s*cond\(\s*[\s\S]*?'([^']+)'\s*\)/g
  let m: RegExpExecArray | null
  while ((m = condDeclRe.exec(wrSrc))) {
    pathToName.set(m[1], m[3])
    pathToName.set(m[2], m[3])
  }
  return pathToName
}

function splitTopLevelElements(content: string): string[] {
  const elements: string[] = []
  let depth = 0
  let start = -1
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (ch === '(' || ch === '{' || ch === '[') {
      if (depth === 0) start = i
      depth++
    } else if (ch === ')' || ch === '}' || ch === ']') {
      depth--
      if (depth === 0 && start >= 0) {
        elements.push(content.slice(start, i + 1).trim())
        start = -1
      }
    }
  }
  return elements.filter(Boolean)
}

function renderField(row: ReturnType<typeof parseWrFieldElement>): string | null {
  if (!row) return null
  const indent = '          '
  if (row.kind === 'formula') {
    const parts = [`title: ${row.title}`]
    if (row.subtitle) parts.push(`subtitle: ${row.subtitle}`)
    if (row.multi) parts.push(`multi: ${row.multi}`)
    if (row.unit) parts.push(`unit: '${row.unit}'`)
    parts.push(`fieldRef: formula.${row.formulaName}.tag`)
    return `${indent}{\n${indent}  ${parts.join(`,\n${indent}  `)},\n${indent}}`
  }
  const parts = [`title: ${row.title}`]
  if (row.subtitle) parts.push(`subtitle: ${row.subtitle}`)
  if (row.variant) parts.push(`variant: '${row.variant}'`)
  parts.push(`fieldValue: ''`)
  if (row.unit) {
    if (row.unit.startsWith('st(')) parts.push(`unit: ${row.unit}`)
    else parts.push(`unit: '${row.unit}'`)
  }
  return `${indent}{\n${indent}  ${parts.join(`,\n${indent}  `)},\n${indent}}`
}

function extractWrCondFields(
  key: string
): Map<string, string[]> {
  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return new Map()

  const pathToName = buildPathToCondName(wrSrc)
  const result = new Map<string, string[]>()
  const condTemRe = /ct\.condTem\('([^']+)',\s*\{/g
  let m: RegExpExecArray | null

  while ((m = condTemRe.exec(wrSrc))) {
    const openBrace = m.index + m[0].length - 1
    const obj = extractBraceContent(wrSrc, openBrace)
    const pathMatch = obj.match(/path:\s*(\w+)/)
    const valueMatch = obj.match(/value:\s*(\w+)/)
    const condName =
      (pathMatch && pathToName.get(pathMatch[1])) ??
      (valueMatch && pathToName.get(valueMatch[1]))
    if (!condName) continue

    const statesMatch = obj.match(/states:\s*\{([\s\S]*)\}\s*,?\s*$/)
    if (!statesMatch) continue
    const firstStateFields = statesMatch[1].match(/fields:\s*\[([\s\S]*?)\]\s*,?\s*\}/)
    if (!firstStateFields) continue

    const rows: string[] = []
    for (const el of splitTopLevelElements(firstStateFields[1])) {
      const rendered = renderField(parseWrFieldElement(el, key, m[1] as TalentSection))
      if (rendered) rows.push(rendered)
    }
    if (rows.length) result.set(condName, rows)
  }

  return result
}

function upsertCondFields(
  src: string,
  condName: string,
  fieldLines: string[]
): string {
  const needle = `charConditionalDocument(key, cond.${condName}`
  const idx = src.indexOf(needle)
  if (idx === -1) return src

  const fieldsBlock = `fields: [\n${fieldLines.join(',\n')},\n      ]`
  const slice = src.slice(idx)
  if (/fields:\s*\[/.test(slice.slice(0, 400))) {
    return src.replace(
      new RegExp(
        String.raw`(charConditionalDocument\(key, cond\.${condName}[^)]*\)[^}]*fields:\s*\[)[\s\S]*?(\]\s*,?\s*\})`
      ),
      `$1\n${fieldLines.join(',\n')},\n      $2`
    )
  }

  return src.replace(
    new RegExp(String.raw`(charConditionalDocument\(key, cond\.${condName}\)),`),
    `$1, { ${fieldsBlock} }),`
  )
}

function migrateKey(key: string): number {
  const wrFields = extractWrCondFields(key)
  if (!wrFields.size) return 0

  const pandoPath = join(sheetsDir, `${key}.tsx`)
  let src = readFileSync(pandoPath, 'utf8')
  let changed = 0

  for (const [condName, lines] of wrFields) {
    const next = upsertCondFields(src, condName, lines)
    if (next !== src) {
      src = next
      changed++
    }
  }

  if (changed) writeFileSync(pandoPath, src)
  return changed
}

const keys = readdirSync(sheetsDir)
  .filter((f) => f.endsWith('.tsx') && f !== 'index.ts')
  .map((f) => f.replace(/\.tsx$/, ''))
  .sort()

let total = 0
for (const key of keys) {
  const changed = migrateKey(key)
  if (changed) {
    console.log(`${key}: synced ${changed} conditional field block(s)`)
    total += changed
  }
}

console.log(`Synced ${total} conditional field block(s) across ${keys.length} sheets`)
