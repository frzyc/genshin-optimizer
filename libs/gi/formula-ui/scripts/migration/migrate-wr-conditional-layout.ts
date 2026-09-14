/**
 * Move Pando charConditionalDocument rows to WR condTem sections; sync teamBuff.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { extractWrCondLayout } from '../wr-conditional-extract'
import { findClosingBracket, type TalentSection } from '../wr-text-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

function findCallEnd(src: string, openParenIdx: number): number {
  let depth = 0
  for (let i = openParenIdx; i < src.length; i++) {
    if (src[i] === '(') depth++
    else if (src[i] === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  throw new Error('Unbalanced parens in charConditionalDocument')
}

function extractPandoCondStatements(src: string): Map<string, string> {
  const map = new Map<string, string>()
  const needle = 'charConditionalDocument('
  let idx = 0

  while ((idx = src.indexOf(needle, idx)) !== -1) {
    const start = idx
    const nameMatch = src.slice(start).match(/cond\.(\w+)/)
    if (!nameMatch) {
      idx += needle.length
      continue
    }
    const openParen = start + needle.length - 1
    const closeParen = findCallEnd(src, openParen)
    let end = closeParen + 1
    if (src[end] === ',') end++
    const stmt = src.slice(start, end).trim()
    map.set(nameMatch[1], `    ${stmt}${stmt.endsWith(',') ? '' : ','}`)
    idx = end
  }

  return map
}

function removeAllCondStatements(src: string): string {
  const needle = 'charConditionalDocument('
  let out = ''
  let cursor = 0
  let idx = 0

  while ((idx = src.indexOf(needle, idx)) !== -1) {
    out += src.slice(cursor, idx)
    const openParen = idx + needle.length - 1
    const closeParen = findCallEnd(src, openParen)
    let end = closeParen + 1
    if (src[end] === ',') end++
    while (src[end] === ' ' || src[end] === '\t') end++
    if (src[end] === '\r') end++
    if (src[end] === '\n') end++
    cursor = end
    idx = end
  }

  out += src.slice(cursor)
  return out
}

function ensureTeamBuff(stmt: string, teamBuff: boolean): string {
  if (!teamBuff || stmt.includes('teamBuff')) return stmt
  if (stmt.includes('{')) {
    return stmt.replace(/\{\s*/, '{ teamBuff: true, ')
  }
  return stmt.replace(/cond\.(\w+)\),/, 'cond.$1, { teamBuff: true }),')
}

function insertCondInSection(
  src: string,
  section: TalentSection,
  stmt: string
): string {
  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = src.indexOf(prefix)
  if (start === -1) {
    const emptyPrefix = `${section}: ct.talentTem('${section}'),`
    if (src.includes(emptyPrefix)) {
      return src.replace(
        emptyPrefix,
        `${section}: ct.talentTem('${section}', [\n${stmt}\n  ]),`
      )
    }
    return src
  }

  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(src, openBracket)
  const inner = src.slice(openBracket + 1, closeBracket)
  const trimmed = inner.trimEnd().replace(/,\s*$/, '')
  const updatedInner = trimmed ? `${trimmed},\n${stmt}\n` : `${stmt}\n`

  return src.slice(0, openBracket + 1) + updatedInner + src.slice(closeBracket)
}

function migrateKey(key: string): number {
  const layout = extractWrCondLayout(key)
  if (!layout.length) return 0

  const pandoPath = join(sheetsDir, `${key}.tsx`)
  let src = readFileSync(pandoPath, 'utf8')
  const existing = extractPandoCondStatements(src)
  src = removeAllCondStatements(src)

  let moved = 0
  const placed = new Set<string>()

  for (const { condName, section, teamBuff } of layout) {
    if (placed.has(condName) || !existing.has(condName)) continue
    const stmt = ensureTeamBuff(existing.get(condName)!, teamBuff)
    src = insertCondInSection(src, section, stmt)
    placed.add(condName)
    moved++
  }

  for (const [condName, stmt] of existing) {
    if (placed.has(condName)) continue
    src = insertCondInSection(src, 'skill', stmt)
    placed.add(condName)
    moved++
  }

  if (moved) writeFileSync(pandoPath, src)
  return moved
}

const keys = readdirSync(sheetsDir)
  .filter((f) => f.endsWith('.tsx') && f !== 'index.ts')
  .map((f) => f.replace(/\.tsx$/, ''))
  .sort()

let total = 0
for (const key of keys) {
  const moved = migrateKey(key)
  if (moved) {
    console.log(`${key}: relocated ${moved} conditional(s)`)
    total += moved
  }
}

console.log(
  `Relocated ${total} conditional document(s) across ${keys.length} sheets`
)
