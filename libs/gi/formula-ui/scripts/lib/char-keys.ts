import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { CHAR_SHEETS_DIR, FORMULA_CHAR_DIR } from './paths'

export function listFormulaCharKeys(): string[] {
  return readdirSync(FORMULA_CHAR_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'util.ts' && f !== 'index.ts')
    .map((f) => f.replace(/\.ts$/, ''))
    .sort((a, b) => a.localeCompare(b))
}

export function listExistingCharSheetKeys(): Set<string> {
  return new Set(
    readdirSync(CHAR_SHEETS_DIR)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => f.replace(/\.tsx$/, ''))
  )
}

export function listMissingCharSheetKeys(): string[] {
  const existing = listExistingCharSheetKeys()
  return listFormulaCharKeys().filter((k) => !existing.has(k))
}

export function charSheetPath(key: string): string {
  return join(CHAR_SHEETS_DIR, `${key}.tsx`)
}

export function charSheetExists(key: string): boolean {
  return existsSync(charSheetPath(key))
}
