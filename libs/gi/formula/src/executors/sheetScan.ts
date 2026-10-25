import { existsSync, readdirSync, readFileSync } from 'node:fs'
import * as path from 'node:path'
import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'

export type SheetKind = 'char' | 'weapon' | 'artifact'
export type SheetStatus = 'ported' | 'stub' | 'placeholder' | 'missing'

export type SheetScan = {
  kind: SheetKind
  key: string
  status: SheetStatus
  pandoPath?: string
  wrPath?: string
  flags: string[]
  wrConds: string[]
  pandoConds: string[]
  wrListingHints: number
  pandoListings: string[]
}

const CHAR_STUB_TODO = 'TODO: Fill data-mine'
const COND_TODO = 'TODO: Conditionals'
const CHAR_ATK_PLACEHOLDER = 'ownBuff.premod.atk.add(1)'
const TEAM_ATK_PLACEHOLDER = 'teamBuff.premod.atk.add(1)'
const ENEMY_PLACEHOLDER = 'enemyDebuff.common.defRed_.add(1)'
const ART_2PC_FAKE = 'ownBuff.premod.atk_.add(cmpGE(count, 2, percent(1)))'

/** True if `needle` appears on a line that is not a `//` comment. */
export function uncommentedIncludes(src: string, needle: string): boolean {
  return src.split(/\r?\n/).some((line) => {
    const t = line.trimStart()
    return t.includes(needle) && !t.startsWith('//')
  })
}

const ESCALATE_PATTERNS: { flag: string; re: RegExp }[] = [
  { flag: 'splitScaleDmgNode', re: /\bsplitScaleDmgNode\b/ },
  { flag: 'infusion', re: /infusion\.(?:nonOverridableSelf|overridableSelf)/ },
  { flag: 'stringPrio', re: /\bstringPrio\b/ },
  { flag: 'lookup', re: /\blookup\s*\(/ },
  { flag: 'dataOverlay', re: /\bdata\s*\(\s*\{/ },
]

export function formulaDataDir(workspaceRoot: string, kind: SheetKind): string {
  return path.join(workspaceRoot, 'libs/gi/formula/src/data', kind)
}

export function wrCharDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, 'libs/gi/sheets/src/Characters')
}

export function wrWeaponDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, 'libs/gi/sheets/src/Weapons')
}

export function wrArtifactDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, 'libs/gi/sheets/src/Artifacts')
}

export function pandoSheetPath(
  workspaceRoot: string,
  kind: SheetKind,
  key: string
): string {
  return path.join(formulaDataDir(workspaceRoot, kind), `${key}.ts`)
}

export function findWrCharSheet(
  workspaceRoot: string,
  key: string
): string | undefined {
  const dir = wrCharDir(workspaceRoot)
  const direct = path.join(dir, key, 'index.tsx')
  if (existsSync(direct)) return direct
  if (key.startsWith('Traveler') && key !== 'Traveler') {
    const ele = key.slice('Traveler'.length)
    const eleFile = ele.charAt(0).toLowerCase() + ele.slice(1)
    const gendered = path.join(dir, `${key}F`, `${eleFile}.tsx`)
    if (existsSync(gendered)) return gendered
  }
  return undefined
}

export function findWrWeaponSheet(
  workspaceRoot: string,
  key: string
): string | undefined {
  const dir = wrWeaponDir(workspaceRoot)
  for (const type of allWeaponTypeKeys) {
    const folder = type.charAt(0).toUpperCase() + type.slice(1)
    const candidate = path.join(dir, folder, key, 'index.tsx')
    if (existsSync(candidate)) return candidate
  }
  return undefined
}

export function findWrArtifactSheet(
  workspaceRoot: string,
  key: string
): string | undefined {
  const candidate = path.join(wrArtifactDir(workspaceRoot), key, 'index.tsx')
  return existsSync(candidate) ? candidate : undefined
}

export function findWrSheet(
  workspaceRoot: string,
  kind: SheetKind,
  key: string
): string | undefined {
  switch (kind) {
    case 'char':
      return findWrCharSheet(workspaceRoot, key)
    case 'weapon':
      return findWrWeaponSheet(workspaceRoot, key)
    case 'artifact':
      return findWrArtifactSheet(workspaceRoot, key)
  }
}

export function parseWrCondNames(src: string): string[] {
  const names = new Set<string>()
  const re = /cond\s*\(\s*[^,]+,\s*['"]([^'"]+)['"]/g
  for (const m of src.matchAll(re)) names.add(m[1])
  return [...names].sort()
}

export function parsePandoCondNames(src: string): string[] {
  const names = new Set<string>()
  const re = /const\s*\{([^}]+)\}\s*=\s*all(?:Bool|Num|List)Conditionals/g
  for (const m of src.matchAll(re)) {
    for (const raw of m[1].split(',')) {
      const name = raw
        .trim()
        .replace(/^\{?\s*/, '')
        .split(':')[0]
        ?.trim()
      if (!name || name.startsWith('_')) continue
      names.add(name)
    }
  }
  return [...names].sort()
}

export function parsePandoListingNames(src: string): string[] {
  const names = new Set<string>()
  const re =
    /(?:customDmg|customHeal|customShield|fixedShield|customParam|dmg|shield)\(\s*['"]([^'"]+)['"]/g
  for (const m of src.matchAll(re)) names.add(m[1])
  return [...names].sort()
}

export function wrListingHintCount(src: string): number {
  return (src.match(/\bdmgNode\s*\(/g) ?? []).length
}

export function wrEscalateFlags(src: string): string[] {
  return ESCALATE_PATTERNS.filter(({ re }) => re.test(src)).map(
    ({ flag }) => flag
  )
}

export function classifyPandoSheet(
  kind: SheetKind,
  src: string
): {
  status: Exclude<SheetStatus, 'missing'>
  flags: string[]
} {
  const flags: string[] = []
  if (src.includes(CHAR_STUB_TODO)) flags.push('todo-dm')
  if (src.includes(COND_TODO)) flags.push('todo-conds')
  // Commented `// TODO: ownBuff.premod.atk.add(1),` is the stub notation, not poison.
  if (uncommentedIncludes(src, CHAR_ATK_PLACEHOLDER)) flags.push('atk.add(1)')
  if (uncommentedIncludes(src, TEAM_ATK_PLACEHOLDER))
    flags.push('teamBuff.atk.add(1)')
  if (uncommentedIncludes(src, ENEMY_PLACEHOLDER)) flags.push('defRed_.add(1)')
  if (kind === 'artifact' && src.includes(ART_2PC_FAKE))
    flags.push('art-fake-2pc')

  const poison = flags.includes('atk.add(1)') || flags.includes('art-fake-2pc')
  const stub = flags.includes('todo-dm') || flags.includes('todo-conds')

  if (poison) return { status: 'placeholder', flags }
  if (stub) return { status: 'stub', flags }
  return { status: 'ported', flags }
}

export function listPandoKeys(
  workspaceRoot: string,
  kind: SheetKind
): string[] {
  const dir = formulaDataDir(workspaceRoot, kind)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'util.ts')
    .map((f) => f.slice(0, -3))
}

export function expectedKeys(kind: SheetKind): readonly string[] {
  switch (kind) {
    case 'char':
      return allCharacterKeys
    case 'weapon':
      return allWeaponKeys
    case 'artifact':
      return allArtifactSetKeys
  }
}

export function scanEntity(
  workspaceRoot: string,
  kind: SheetKind,
  key: string
): SheetScan {
  const pandoPath = pandoSheetPath(workspaceRoot, kind, key)
  const wrPath = findWrSheet(workspaceRoot, kind, key)
  const wrSrc = wrPath && existsSync(wrPath) ? readFileSync(wrPath, 'utf8') : ''
  const wrConds = wrSrc ? parseWrCondNames(wrSrc) : []
  const wrFlags = wrSrc ? wrEscalateFlags(wrSrc) : []
  const wrListingHints = wrSrc ? wrListingHintCount(wrSrc) : 0

  if (!existsSync(pandoPath)) {
    return {
      kind,
      key,
      status: 'missing',
      wrPath,
      flags: [...wrFlags, 'pando-missing'],
      wrConds,
      pandoConds: [],
      wrListingHints,
      pandoListings: [],
    }
  }

  const pandoSrc = readFileSync(pandoPath, 'utf8')
  const { status, flags } = classifyPandoSheet(kind, pandoSrc)
  return {
    kind,
    key,
    status,
    pandoPath,
    wrPath,
    flags: [...flags, ...wrFlags],
    wrConds,
    pandoConds: parsePandoCondNames(pandoSrc),
    wrListingHints,
    pandoListings: parsePandoListingNames(pandoSrc),
  }
}

export function readText(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}
