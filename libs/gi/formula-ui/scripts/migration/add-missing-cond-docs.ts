/**
 * Insert charConditionalDocument rows for formula conditionals missing from Pando sheets.
 * Section + teamBuff come from WR condTem layout.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { conditionals } from '../../../formula/src/meta'
import { extractWrCondLayout } from '../wr-conditional-extract'
import { findClosingBracket, type TalentSection } from '../wr-text-extract'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

function extractExistingCondNames(src: string): Set<string> {
  const names = new Set<string>()
  const re = /charConditionalDocument\([^,]+,\s*cond\.(\w+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) names.add(m[1])
  return names
}

function condStmt(condName: string, teamBuff: boolean): string {
  return teamBuff
    ? `    charConditionalDocument(key, cond.${condName}, { teamBuff: true }),`
    : `    charConditionalDocument(key, cond.${condName}),`
}

function insertCondInSection(
  src: string,
  section: TalentSection,
  stmt: string
): string {
  const emptyPrefix = `${section}: ct.talentTem('${section}'),`
  if (src.includes(emptyPrefix)) {
    return src.replace(
      emptyPrefix,
      `${section}: ct.talentTem('${section}', [\n${stmt}\n  ]),`
    )
  }

  const prefix = `${section}: ct.talentTem('${section}', [`
  const start = src.indexOf(prefix)
  if (start === -1) return src

  const openBracket = start + prefix.length - 1
  const closeBracket = findClosingBracket(src, openBracket)
  const inner = src.slice(openBracket + 1, closeBracket)
  const trimmed = inner.trimEnd().replace(/,\s*$/, '')
  const updatedInner = trimmed ? `${trimmed},\n${stmt}\n` : `${stmt}\n`

  return src.slice(0, openBracket + 1) + updatedInner + src.slice(closeBracket)
}

function migrateKey(key: string): number {
  const pandoPath = join(sheetsDir, `${key}.tsx`)
  if (!readFileSync(pandoPath, 'utf8')) return 0

  const sheetConds =
    (conditionals as Record<string, Record<string, unknown>>)[key] ?? {}
  const condNames = Object.keys(sheetConds)
  if (!condNames.length) return 0

  let src = readFileSync(pandoPath, 'utf8')
  const existing = extractExistingCondNames(src)
  const layout = extractWrCondLayout(key)
  const sectionByCond = new Map(
    layout.map(({ condName, section, teamBuff }) => [
      condName,
      { section, teamBuff },
    ])
  )

  let added = 0
  for (const condName of condNames) {
    if (existing.has(condName)) continue
    const placement = sectionByCond.get(condName)
    const section = placement?.section ?? 'skill'
    const teamBuff = placement?.teamBuff ?? false
    src = insertCondInSection(src, section, condStmt(condName, teamBuff))
    added++
  }

  if (added) writeFileSync(pandoPath, src)
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
    console.log(`${key}: added ${added} conditional document(s)`)
    total += added
  }
}

console.log(
  `Added ${total} conditional document(s) across ${keys.length} sheets`
)
