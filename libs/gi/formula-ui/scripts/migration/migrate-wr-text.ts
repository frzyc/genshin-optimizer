/**
 * Insert WR text documents missing from Pando char UISheets.
 * Only adds `{ type: 'text', text: … }`; does not rewrite fields/conditionals.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  extractWrTextDocs,
  findClosingBracket,
  TALENT_SECTIONS,
  type TalentSection,
  textDocLine,
} from '../wr-text-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

function existingTextExprs(pandoSrc: string): Set<string> {
  const out = new Set<string>()
  const re = /text:\s*(ct\.(?:chg|ch)\([^)]+\)|stg?\([^)]*\))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(pandoSrc))) out.add(m[1])
  return out
}

function insertTextDocs(
  pandoSrc: string,
  section: TalentSection,
  exprs: string[]
): string {
  if (!exprs.length) return pandoSrc

  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = pandoSrc.indexOf(prefix)
  if (start === -1) {
    const emptyPrefix = `${section}: ct.talentTem('${section}'),`
    if (pandoSrc.includes(emptyPrefix)) {
      const block = exprs.map((e) => textDocLine(e)).join(',\n')
      return pandoSrc.replace(
        emptyPrefix,
        `${section}: ct.talentTem('${section}', [\n${block},\n  ]),`
      )
    }
    return pandoSrc
  }

  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(pandoSrc, openBracket)
  const inner = pandoSrc.slice(openBracket + 1, closeBracket)
  const block = `${exprs.map((e) => textDocLine(e)).join(',\n')},\n`
  const trimmed = inner.trimEnd().replace(/,\s*$/, '')
  const updatedInner = trimmed ? `${trimmed},\n${block}` : block

  return (
    pandoSrc.slice(0, openBracket + 1) +
    updatedInner +
    pandoSrc.slice(closeBracket)
  )
}

function migrateKey(key: string): number {
  const pandoPath = join(sheetsDir, `${key}.tsx`)
  const wrDocs = extractWrTextDocs(key)
  let pandoSrc = readFileSync(pandoPath, 'utf8')
  const existing = existingTextExprs(pandoSrc)
  let added = 0

  for (const section of TALENT_SECTIONS) {
    const missing = (wrDocs.get(section) ?? [])
      .map((d) => d.expr)
      .filter((expr) => !existing.has(expr))
    if (!missing.length) continue

    pandoSrc = insertTextDocs(pandoSrc, section, missing)
    for (const expr of missing) {
      existing.add(expr)
      added++
    }
  }

  if (added) writeFileSync(pandoPath, pandoSrc)
  return added
}

const keys = readdirSync(sheetsDir)
  .filter((f) => f.endsWith('.tsx') && f !== 'index.ts')
  .map((f) => f.replace(/\.tsx$/, ''))
  .sort()

let total = 0
for (const key of keys) {
  const added = migrateKey(key)
  if (added) {
    console.log(`${key}: +${added} text doc(s)`)
    total += added
  }
}

console.log(`Added ${total} WR text document(s) across ${keys.length} sheets`)
