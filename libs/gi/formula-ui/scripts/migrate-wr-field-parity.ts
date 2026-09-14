/**
 * Sync Pando `{ type: 'fields' }` blocks to WR row order, titles, and static labels.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  extractWrFieldRows,
  type WrFieldRow,
} from './wr-field-row-extract'
import {
  findClosingBracket,
  TALENT_SECTIONS,
  type TalentSection,
} from './wr-text-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

function findSectionInner(src: string, section: TalentSection): string | null {
  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = src.indexOf(prefix)
  if (start === -1) return null
  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(src, openBracket)
  return src.slice(openBracket + 1, closeBracket)
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

function extractPandoFieldBlockInners(sectionInner: string): string[] {
  const blocks: string[] = []
  for (const el of splitTopLevelElements(sectionInner)) {
    if (!el.includes("type: 'fields'")) continue
    if (/\.map\(\(\{ tag \}/.test(el)) continue
    const fieldsIdx = el.indexOf('fields:')
    if (fieldsIdx === -1) continue
    const bracketStart = el.indexOf('[', fieldsIdx)
    if (bracketStart === -1) continue
    let depth = 0
    for (let i = bracketStart; i < el.length; i++) {
      const ch = el[i]
      if (ch === '[') depth++
      else if (ch === ']') {
        depth--
        if (depth === 0) {
          blocks.push(el.slice(bracketStart + 1, i))
          break
        }
      }
    }
  }
  return blocks
}

function renderField(row: WrFieldRow): string {
  const indent = '        '
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

function renderFieldsInner(rows: WrFieldRow[]): string {
  return `\n${rows.map(renderField).join(',\n')}\n      `
}

function migrateSection(
  src: string,
  section: TalentSection,
  wrGroups: WrFieldRow[][]
): { src: string; changed: number } {
  if (!wrGroups.length) return { src, changed: 0 }

  const sectionInner = findSectionInner(src, section)
  if (!sectionInner) return { src, changed: 0 }

  const pandoBlocks = extractPandoFieldBlockInners(sectionInner)
  if (!pandoBlocks.length) return { src, changed: 0 }

  let changed = 0
  let updatedSection = sectionInner
  const blockCount = Math.min(pandoBlocks.length, wrGroups.length)

  for (let i = 0; i < blockCount; i++) {
    const rendered = renderFieldsInner(wrGroups[i]).trim()
    if (pandoBlocks[i].trim() === rendered.trim()) continue
    updatedSection = updatedSection.replace(pandoBlocks[i], rendered)
    changed++
  }

  if (!changed) return { src, changed: 0 }

  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = src.indexOf(prefix)
  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(src, openBracket)

  return {
    src: src.slice(0, openBracket + 1) + updatedSection + src.slice(closeBracket),
    changed,
  }
}

function migrateKey(key: string): number {
  const wrRows = extractWrFieldRows(key)
  const pandoPath = join(sheetsDir, `${key}.tsx`)
  let src = readFileSync(pandoPath, 'utf8')
  let total = 0

  for (const section of TALENT_SECTIONS) {
    const groups = wrRows.get(section) ?? []
    if (!groups.length) continue
    const { src: next, changed } = migrateSection(src, section, groups)
    src = next
    total += changed
  }

  if (total) writeFileSync(pandoPath, src)
  return total
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
  const changed = migrateKey(key)
  if (changed) {
    console.log(`${key}: synced ${changed} field block(s)`)
    total += changed
  }
}

console.log(`Synced ${total} field block(s) across ${keys.length} sheet(s)`)
