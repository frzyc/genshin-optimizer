import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')
const outPath = join(sheetsDir, 'index.ts')
const auditPath = join(
  process.cwd(),
  'libs/gi/formula-ui/src/char/charUiAudit.ts'
)

const sheetKeys = readdirSync(sheetsDir)
  .filter((f) => f.endsWith('.tsx') && f !== 'index.ts')
  .map((f) => f.replace(/\.tsx$/, ''))
  .sort((a, b) => a.localeCompare(b))

const index = `// WARNING: Generated file, do not modify
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { TalentSheetElementKey } from '../consts'
${sheetKeys.map((key) => `import ${key} from './${key}'`).join('\n')}

export const uiSheets: Partial<
  Record<CharacterKey, UISheet<TalentSheetElementKey>>
> = {
  ${sheetKeys.join(',\n  ')},
} as const
`

writeFileSync(outPath, index)

const auditKeys = sheetKeys
const auditSrc = readFileSync(auditPath, 'utf8')
const auditKeysBlock = `export const CHAR_UI_AUDIT_KEYS = [\n${auditKeys
  .map((key) => `  '${key}',`)
  .join('\n')}\n] as const satisfies readonly CharacterKey[]`
const updatedAudit = auditSrc.replace(
  /export const CHAR_UI_AUDIT_KEYS = \[[\s\S]*?\] as const satisfies readonly CharacterKey\[\]/,
  auditKeysBlock
)
if (updatedAudit === auditSrc) {
  throw new Error(`Failed to update CHAR_UI_AUDIT_KEYS in ${auditPath}`)
}
writeFileSync(auditPath, updatedAudit)

console.log(`Wrote ${sheetKeys.length} char UI sheets to ${outPath}`)
console.log(`Synced ${auditKeys.length} audit keys`)
