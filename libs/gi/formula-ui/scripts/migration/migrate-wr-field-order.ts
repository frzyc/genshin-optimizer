/**
 * Reorder Pando `{ type: 'fields' }` rows to match WR sheet field order.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { extractWrFieldLayout } from '../wr-field-extract'
import {
  findClosingBracket,
  TALENT_SECTIONS,
  type TalentSection,
} from '../wr-text-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

type PandoField = {
  formulaName: string
  text: string
}

function findSectionInner(src: string, section: TalentSection): string | null {
  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = src.indexOf(prefix)
  if (start === -1) return null
  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(src, openBracket)
  return src.slice(openBracket + 1, closeBracket)
}

function parsePandoFieldObjects(inner: string): PandoField[] {
  const fields: PandoField[] = []
  for (const el of splitTopLevelElements(inner)) {
    const mapMatch = el.match(
      /fieldRef:\s*tag,\s*\n\s*\}\)\),?\s*$|fieldRef:\s*tag\s*\n\s*\}\)\),?\s*$/
    )
    if (mapMatch || /\.map\(\(\{ tag \}/.test(el)) continue

    const refMatch = el.match(/fieldRef:\s*formula\.(\w+)\.tag/)
    if (!refMatch) continue
    fields.push({
      formulaName: refMatch[1],
      text: el.trim().replace(/,\s*$/, ''),
    })
  }
  return fields
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

function extractPandoFieldBlocks(sectionInner: string): string[] {
  const blocks: string[] = []
  for (const el of splitTopLevelElements(sectionInner)) {
    if (!el.includes("type: 'fields'")) continue
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

function reorderFieldInner(inner: string, wrOrder: string[]): string | null {
  if (/\.map\(\(\{ tag \}/.test(inner)) return null

  const fields = parsePandoFieldObjects(inner)
  if (!fields.length) return null

  const byName = new Map<string, PandoField>()
  for (const f of fields) {
    if (!byName.has(f.formulaName)) byName.set(f.formulaName, f)
  }

  const ordered: PandoField[] = []
  const used = new Set<string>()

  for (const name of wrOrder) {
    const f = byName.get(name)
    if (f && !used.has(name)) {
      ordered.push(f)
      used.add(name)
    }
  }
  for (const f of fields) {
    if (!used.has(f.formulaName)) ordered.push(f)
  }

  const before = fields.map((f) => f.formulaName).join(',')
  const after = ordered.map((f) => f.formulaName).join(',')
  if (before === after) return null

  const indent = inner.match(/\n(\s+)\{/)?.[1] ?? '        '
  return `\n${ordered.map((f) => `${indent}${f.text}`).join(',\n')}\n${indent.slice(0, -2)}`
}

function migrateSection(
  src: string,
  section: TalentSection,
  wrGroups: string[][]
): { src: string; changed: number } {
  if (!wrGroups.length) return { src, changed: 0 }

  const sectionInner = findSectionInner(src, section)
  if (!sectionInner) return { src, changed: 0 }

  const pandoBlocks = extractPandoFieldBlocks(sectionInner)
  if (!pandoBlocks.length) return { src, changed: 0 }

  let changed = 0
  let updatedSection = sectionInner

  const blockCount = Math.min(pandoBlocks.length, wrGroups.length)
  for (let i = 0; i < blockCount; i++) {
    const reordered = reorderFieldInner(pandoBlocks[i], wrGroups[i])
    if (!reordered) continue
    updatedSection = updatedSection.replace(pandoBlocks[i], reordered.trim())
    changed++
  }

  if (!changed) return { src, changed: 0 }

  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = src.indexOf(prefix)
  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(src, openBracket)

  return {
    src:
      src.slice(0, openBracket + 1) + updatedSection + src.slice(closeBracket),
    changed,
  }
}

function migrateKey(key: string): number {
  const wrLayout = extractWrFieldLayout(key)
  const pandoPath = join(sheetsDir, `${key}.tsx`)
  let src = readFileSync(pandoPath, 'utf8')
  let total = 0

  for (const section of TALENT_SECTIONS) {
    const wrGroups = wrLayout.get(section) ?? []
    if (!wrGroups.length) continue
    const { src: next, changed } = migrateSection(src, section, wrGroups)
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
    console.log(`${key}: reordered ${changed} field block(s)`)
    total += changed
  }
}

console.log(`Reordered ${total} field block(s) across ${keys.length} sheet(s)`)
