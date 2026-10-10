import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { conditionals } from '../../../formula/src/meta'
import {
  charSheetExists,
  listExistingCharSheetKeys,
  listFormulaCharKeys,
  listMissingCharSheetKeys,
} from './char-keys'
import { REPO_ROOT } from './paths'
import { describeCharSheetSources } from './render-char-sheet'

const FORMULA_ARTIFACT_DIR = join(
  REPO_ROOT,
  'libs/gi/formula/src/data/artifact'
)
const FORMULA_WEAPON_DIR = join(REPO_ROOT, 'libs/gi/formula/src/data/weapon')
const CONST_ARTIFACT_FILE = join(REPO_ROOT, 'libs/gi/consts/src/artifact.ts')
const CONST_WEAPON_FILE = join(REPO_ROOT, 'libs/gi/consts/src/weapon.ts')

function listDirKeys(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'util.ts')
    .map((f) => f.replace(/\.ts$/, ''))
    .sort((a, b) => a.localeCompare(b))
}

function readExportedStringKeys(
  filePath: string,
  exportPattern: RegExp
): string[] {
  const src = readFileSync(filePath, 'utf8')
  const keys = new Set<string>()
  for (const m of src.matchAll(exportPattern)) {
    for (const s of m[1].matchAll(/'([^']+)'/g)) keys.add(s[1])
  }
  return [...keys].sort((a, b) => a.localeCompare(b))
}

function readArtifactSetKeys(): string[] {
  return readExportedStringKeys(
    CONST_ARTIFACT_FILE,
    /export const allArtifactSetKeys = \[([\s\S]*?)\] as const/g
  )
}

function readWeaponKeys(): string[] {
  return readExportedStringKeys(
    CONST_WEAPON_FILE,
    /export const allWeapon(?:Sword|Claymore|Polearm|Bow|Catalyst)Keys = \[([\s\S]*?)\] as const/g
  )
}

function condCount(key: string): number {
  return Object.keys(
    (conditionals as Record<string, Record<string, unknown>>)[key] ?? {}
  ).length
}

export type CharCoverageRow = {
  key: string
  hasSheet: boolean
  hasWr: boolean
  wrSections: number
  condCount: number
}

export type CoverageReport = {
  char: {
    formulaCount: number
    sheetCount: number
    missing: string[]
    orphanSheets: string[]
    rows: CharCoverageRow[]
  }
  art: {
    formulaCount: number
    constCount: number
    withConditionals: number
    missingFromConsts: string[]
    extraInConsts: string[]
  }
  weapon: {
    formulaCount: number
    constCount: number
    withConditionals: number
    missingFromConsts: string[]
    extraInConsts: string[]
  }
}

export function buildCoverageReport(): CoverageReport {
  const formulaChars = listFormulaCharKeys()
  const existingSheets = listExistingCharSheetKeys()
  const missing = listMissingCharSheetKeys()
  const orphanSheets = [...existingSheets]
    .filter((k) => !formulaChars.includes(k))
    .sort()

  const charRows: CharCoverageRow[] = formulaChars.map((key) => {
    const meta = describeCharSheetSources(key)
    return {
      key,
      hasSheet: charSheetExists(key),
      hasWr: meta.hasWr,
      wrSections: meta.wrSections,
      condCount: meta.condCount,
    }
  })

  const formulaArts = listDirKeys(FORMULA_ARTIFACT_DIR)
  const formulaWeapons = listDirKeys(FORMULA_WEAPON_DIR)
  const allArtifactSetKeys = readArtifactSetKeys()
  const allWeaponKeys = readWeaponKeys()
  const artSet = new Set(allArtifactSetKeys)
  const weaponSet = new Set(allWeaponKeys)

  return {
    char: {
      formulaCount: formulaChars.length,
      sheetCount: existingSheets.size,
      missing,
      orphanSheets,
      rows: charRows,
    },
    art: {
      formulaCount: formulaArts.length,
      constCount: allArtifactSetKeys.length,
      withConditionals: formulaArts.filter((k) => condCount(k) > 0).length,
      missingFromConsts: formulaArts.filter((k) => !artSet.has(k)),
      extraInConsts: allArtifactSetKeys.filter((k) => !formulaArts.includes(k)),
    },
    weapon: {
      formulaCount: formulaWeapons.length,
      constCount: allWeaponKeys.length,
      withConditionals: formulaWeapons.filter((k) => condCount(k) > 0).length,
      missingFromConsts: formulaWeapons.filter((k) => !weaponSet.has(k)),
      extraInConsts: allWeaponKeys.filter((k) => !formulaWeapons.includes(k)),
    },
  }
}

export function printCoverageReport(report: CoverageReport): void {
  const { char, art, weapon } = report

  console.log('=== Character UI sheets ===')
  console.log(
    `Formula chars: ${char.formulaCount} | Sheets: ${char.sheetCount} | Missing: ${char.missing.length}`
  )
  if (char.missing.length) {
    console.log(`  Missing sheets: ${char.missing.join(', ')}`)
  }
  if (char.orphanSheets.length) {
    console.log(`  Orphan sheets (no formula): ${char.orphanSheets.join(', ')}`)
  }
  const noWr = char.rows.filter((r) => r.hasSheet && !r.hasWr)
  if (noWr.length) {
    console.log(
      `  Sheets without WR reference (${noWr.length}): ${noWr.map((r) => r.key).join(', ')}`
    )
  }

  console.log('\n=== Artifact UI (runtime-generated) ===')
  console.log(
    `Formula sets: ${art.formulaCount} | const keys: ${art.constCount} | With conditionals: ${art.withConditionals}`
  )
  if (art.missingFromConsts.length) {
    console.log(
      `  Formula keys not in allArtifactSetKeys: ${art.missingFromConsts.join(', ')}`
    )
  }

  console.log('\n=== Weapon UI (runtime-generated) ===')
  console.log(
    `Formula weapons: ${weapon.formulaCount} | const keys: ${weapon.constCount} | With conditionals: ${weapon.withConditionals}`
  )
  if (weapon.missingFromConsts.length) {
    console.log(
      `  Formula keys not in allWeaponKeys: ${weapon.missingFromConsts.join(', ')}`
    )
  }
}
