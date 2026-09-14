import type {
  ArtifactSetKey,
  CharacterKey,
  MainStatKey,
  SubstatKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedCharacter, ICachedWeapon } from '@genshin-optimizer/gi/db'
import {
  artifactsData,
  type Calculator,
  charData,
  conditionalEntries,
  enemyDebuff,
  genshinCalculatorWithEntries,
  type Member,
  own,
  ownBuff,
  pandoContextEntries,
  type TagMapNodeEntries,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import {
  allArtifactData,
  displayDataMap,
  getCharSheet,
  getWeaponSheet,
  reactionData,
  resonanceData,
} from '@genshin-optimizer/gi/sheets'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import type { Data, NumNode } from '@genshin-optimizer/gi/wr'
import {
  common,
  constant,
  dataObjForCharacter,
  dataObjForWeapon,
  input,
  mergeData,
  percent,
} from '@genshin-optimizer/gi/wr'
import { expect } from 'vitest'
import { relDiff } from './relDiff'

export type FinalStat =
  | 'atk'
  | 'hp'
  | 'def'
  | 'eleMas'
  | 'critRate_'
  | 'critDMG_'
  | 'enerRech_'

export const DEFAULT_FINALS: readonly FinalStat[] = [
  'atk',
  'hp',
  'def',
  'eleMas',
  'critRate_',
  'critDMG_',
  'enerRech_',
]

export const DEFAULT_REL_TOL = 1e-4

export type HitMode = 'avgHit' | 'hit' | 'critHit'
export type CritMode = 'avg' | 'nonCrit' | 'crit'

export type ParityChar = {
  key: CharacterKey
  level: number
  talent: { auto: number; skill: number; burst: number }
  ascension: number
  constellation: number
}

export type ParityWeapon = {
  key: WeaponKey
  level: number
  ascension: number
  refinement: number
  location?: string
  lock?: boolean
}

export type ParityArt = {
  set: ArtifactSetKey
  stats: readonly { key: MainStatKey | SubstatKey; value: number }[]
}

export type ParityMember = {
  char: ParityChar
  weapon: ParityWeapon
  arts?: readonly ParityArt[]
}

/** `count` dummy pieces of `set` (empty stats = set-bonus-only probe). */
export function artSetPieces(
  set: ArtifactSetKey,
  count: number,
  stats: ParityArt['stats'] = []
): ParityArt[] {
  return Array.from({ length: count }, () => ({ set, stats }))
}

/** WR `artSet` counts + `art` piece stats from the same `member.arts` Pando uses. */
export function wrArtsData(arts: readonly ParityArt[] | undefined): Data {
  if (!arts?.length) return {}
  const sets: Partial<Record<ArtifactSetKey, number>> = {}
  const statSums: Partial<Record<MainStatKey | SubstatKey, number>> = {}
  for (const { set, stats } of arts) {
    sets[set] = (sets[set] ?? 0) + 1
    for (const { key, value } of stats) {
      statSums[key] = (statSums[key] ?? 0) + value
    }
  }
  const artSet = Object.fromEntries(
    Object.entries(sets).map(([k, v]) => [k, constant(v as number)])
  )
  const art = Object.fromEntries(
    Object.entries(statSums).map(([k, v]) => [
      k,
      k.endsWith('_') ? percent(v as number) : constant(v as number),
    ])
  )
  return {
    ...(Object.keys(artSet).length ? { artSet } : {}),
    ...(Object.keys(art).length ? { art } : {}),
  } as Data
}

/** WR `conditional[sheet][name] = 'on' | number`. */
export type WrConditionalBag = Record<string, Record<string, string | number>>

/** Pando `conditionalEntries(sheet, src, dst)(name, value)`. Own kit conds use `dst: null`. */
export type PandoConditionalSpec = {
  sheet: string
  src: Member
  dst: Member | null
  name: string
  value: number
}

export type ParityFixture = {
  members: readonly ParityMember[]
  enemy: { lvl: number; preRes: number }
  hitMode?: HitMode
  critMode?: CritMode
  cata?: string
  amp?: string
  wrConditionals?: WrConditionalBag
  pandoConditionals?: readonly PandoConditionalSpec[]
  extraPando?: TagMapNodeEntries
  /** WR `tally[ele]` overlay (solo UIData does not populate party tallies). */
  wrTally?: Partial<Record<string, number>>
  /** On-field member. Solo fixtures always resolve to that member. */
  activeMember?: Member
}

const WR_FINAL: Record<FinalStat, NumNode> = {
  atk: input.total.atk,
  hp: input.total.hp,
  def: input.total.def,
  eleMas: input.total.eleMas,
  critRate_: input.total.critRate_,
  critDMG_: input.total.critDMG_,
  enerRech_: input.total.enerRech_,
}

const PANDO_FINAL = {
  atk: own.final.atk,
  hp: own.final.hp,
  def: own.final.def,
  eleMas: own.final.eleMas,
  critRate_: own.final.critRate_,
  critDMG_: own.final.critDMG_,
  enerRech_: own.final.enerRech_,
} as const

const ELE_RES_KEYS = [
  'physical_res_',
  'dendro_res_',
  'anemo_res_',
  'geo_res_',
  'electro_res_',
  'hydro_res_',
  'pyro_res_',
  'cryo_res_',
] as const

export function hitModeToCritMode(hitMode: HitMode): CritMode {
  switch (hitMode) {
    case 'hit':
      return 'nonCrit'
    case 'critHit':
      return 'crit'
    default:
      return 'avg'
  }
}

/** WR stores ER as 1 = 100% base; Pando is additive-only (0). */
export function mapWrEnerRech(wrVal: number): number {
  return wrVal - 1
}

export function mapWrFinal(stat: FinalStat, wrVal: number): number {
  return stat === 'enerRech_' ? mapWrEnerRech(wrVal) : wrVal
}

export function readWrFinal(
  ui: ReturnType<typeof computeUIData>,
  stat: FinalStat
): number {
  return ui.get(WR_FINAL[stat]).value as number
}

export function readPandoFinal(calc: Calculator, stat: FinalStat): number {
  return calc.compute(PANDO_FINAL[stat]).val as number
}

export function readWrArtSet(
  ui: ReturnType<typeof computeUIData>,
  set: ArtifactSetKey
): number {
  return ui.get(input.artSet[set]).value as number
}

export function readPandoArtSet(calc: Calculator, set: ArtifactSetKey): number {
  return calc.compute(own.common.count.sheet(set)).val as number
}

export function pandoListingNames(calc: Calculator): string[] {
  return calc
    .listFormulas(own.listing.formulas)
    .map((x) => x.tag.name)
    .filter((name): name is string => !!name)
    .sort()
}

export function assertPandoListingsFinite(calc: Calculator): void {
  const reads = calc.listFormulas(own.listing.formulas)
  for (const read of reads) {
    const val = calc.compute(read).val
    const name = read.tag.name ?? read.tag.q ?? 'listing'
    expect(Number.isFinite(val as number), `listing ${name}`).toBe(true)
  }
}

export function assertFinals(
  wr: ReturnType<typeof computeUIData>,
  pando: Calculator,
  stats: readonly FinalStat[] = DEFAULT_FINALS,
  relTol = DEFAULT_REL_TOL
): void {
  for (const stat of stats) {
    const wrRaw = readWrFinal(wr, stat)
    const wrVal = mapWrFinal(stat, wrRaw)
    const pandoVal = readPandoFinal(pando, stat)
    expect(Number.isFinite(wrRaw), `WR ${stat}`).toBe(true)
    expect(Number.isFinite(pandoVal), `Pando ${stat}`).toBe(true)
    expect(
      relDiff(wrVal, pandoVal),
      `${stat} wr=${wrRaw} mapped=${wrVal} pando=${pandoVal}`
    ).toBeLessThan(relTol)
  }
}

export function assertCondNameSets(
  wrNames: readonly string[],
  pandoNames: readonly string[]
): void {
  expect([...pandoNames].sort()).toEqual([...wrNames].sort())
}

/**
 * Solo WR UIData (computeUIData). Uses members[0] only.
 * Team buffs / resonance across members still need uiDataForTeam — see parity.md.
 */
export function buildWrSolo(fixture: ParityFixture) {
  const member = fixture.members[0]
  if (!member) throw new Error('ParityFixture.members must be non-empty')

  const hitMode = fixture.hitMode ?? 'avgHit'
  const character = {
    key: member.char.key,
    level: member.char.level,
    ascension: member.char.ascension,
    constellation: member.char.constellation,
    talent: { ...member.char.talent },
    equippedArtifacts: {
      flower: '',
      plume: '',
      sands: '',
      goblet: '',
      circlet: '',
    },
    equippedWeapon: 'w-parity',
  } as ICachedCharacter

  const weapon = {
    id: 'w-parity',
    key: member.weapon.key,
    level: member.weapon.level,
    ascension: member.weapon.ascension,
    refinement: member.weapon.refinement,
    location: member.weapon.location ?? member.char.key,
    lock: member.weapon.lock ?? false,
  } as ICachedWeapon

  const characterSheet = getCharSheet(member.char.key, 'F')
  if (!characterSheet)
    throw new Error(`Missing WR character sheet ${member.char.key}`)
  const weaponSheet = getWeaponSheet(weapon.key)
  if (!weaponSheet) throw new Error(`Missing WR weapon sheet ${weapon.key}`)

  const weaponSheetsDataOfType =
    displayDataMap[getCharStat(member.char.key).weaponType]
  const { display: _weaponDisplay, ...restWeaponSheetData } = weaponSheet.data
  const weaponSheetsData = mergeData([
    restWeaponSheetData,
    weaponSheetsDataOfType,
  ])

  const charObj = dataObjForCharacter(character)
  charObj.enemy = {
    ...(charObj.enemy as object),
    level: constant(fixture.enemy.lvl),
  } as Data['enemy']
  if (fixture.enemy.preRes !== 0.1) {
    charObj.enemy = {
      ...(charObj.enemy as object),
      ...Object.fromEntries(
        ELE_RES_KEYS.map((k) => [k, percent(fixture.enemy.preRes)])
      ),
    } as Data['enemy']
  }
  charObj.hit = {
    ...(charObj.hit as object),
    hitMode: constant(hitMode),
  } as Data['hit']

  const conditionalLayer: Data = fixture.wrConditionals
    ? ({
        conditional: Object.fromEntries(
          Object.entries(fixture.wrConditionals).map(([sheet, names]) => [
            sheet,
            Object.fromEntries(
              Object.entries(names).map(([name, val]) => [name, constant(val)])
            ),
          ])
        ),
      } as Data)
    : {}

  const tallyLayer: Data | undefined = fixture.wrTally
    ? ({
        tally: Object.fromEntries(
          Object.entries(fixture.wrTally).map(([k, v]) => [
            k,
            constant(v as number),
          ])
        ),
      } as Data)
    : undefined

  const data: Data[] = [
    dataObjForWeapon(weapon),
    charObj,
    wrArtsData(member.arts),
    conditionalLayer,
    ...(tallyLayer ? [tallyLayer] : []),
    mergeData([characterSheet.data, weaponSheetsData, allArtifactData]),
    common,
    resonanceData,
    reactionData,
  ]
  return computeUIData(data)
}

/** Pando calculator tagged to `src` (default member 0). */
export function buildPando(
  fixture: ParityFixture,
  src: Member = '0'
): Calculator {
  const hitMode = fixture.hitMode ?? 'avgHit'
  const critMode = fixture.critMode ?? hitModeToCritMode(hitMode)
  const memberKeys = fixture.members.map((_, i) => String(i) as Member)

  const data: TagMapNodeEntries = [
    ...teamData(memberKeys),
    ...fixture.members.flatMap((member, i) =>
      withMember(
        String(i) as Member,
        ...charData(member.char as never),
        ...weaponData(member.weapon as never),
        ...artifactsData([...(member.arts ?? [])])
      )
    ),
    ...(fixture.pandoConditionals ?? []).map(
      ({ sheet, src, dst, name, value }) =>
        conditionalEntries(sheet as never, src, dst)(name, value)
    ),
    ...(fixture.extraPando ?? []),
    ...pandoContextEntries({
      memberKeys,
      activeMember: fixture.activeMember,
    }),
    enemyDebuff.reaction.cata.add(fixture.cata ?? ''),
    enemyDebuff.reaction.amp.add(fixture.amp ?? ''),
    enemyDebuff.common.lvl.add(fixture.enemy.lvl),
    enemyDebuff.common.preRes.add(fixture.enemy.preRes),
    ownBuff.common.critMode.add(critMode),
  ]
  return genshinCalculatorWithEntries(data).withTag({ src })
}

export type NormTree = {
  op?: string
  val: number | string | undefined
  kids?: NormTree[]
  note?: string
}

export function normalizePandoTree(
  node: {
    val?: number | string
    meta?: { op?: string; ops?: unknown[]; tag?: Record<string, unknown> }
  },
  depth = 0,
  maxDepth = 4
): NormTree {
  if (!node || depth > maxDepth) {
    return { val: node?.val, note: depth > maxDepth ? 'truncated' : 'empty' }
  }
  const meta = node.meta ?? {}
  const kids = (meta.ops ?? [])
    .filter(Boolean)
    .slice(0, 12)
    .map((c) =>
      normalizePandoTree(
        c as Parameters<typeof normalizePandoTree>[0],
        depth + 1,
        maxDepth
      )
    )
  const tag = meta.tag
  return {
    op: meta.op,
    val: node.val,
    ...(kids.length ? { kids } : {}),
    note: tag
      ? `tag:${JSON.stringify({
          q: tag['q'],
          qt: tag['qt'],
          sheet: tag['sheet'],
          name: tag['name'],
        })}`
      : undefined,
  }
}

export function normalizeWrTree(
  node: {
    value?: number | string
    info?: { path?: unknown; name?: string }
    meta?: { op?: string; ops?: unknown[] }
  },
  depth = 0,
  maxDepth = 4
): NormTree {
  if (!node || depth > maxDepth) {
    return { val: node?.value, note: depth > maxDepth ? 'truncated' : 'empty' }
  }
  const meta = node.meta ?? {}
  const kids = (meta.ops ?? [])
    .filter(Boolean)
    .slice(0, 12)
    .map((c) =>
      normalizeWrTree(
        c as Parameters<typeof normalizeWrTree>[0],
        depth + 1,
        maxDepth
      )
    )
  const info = node.info ?? {}
  return {
    op: meta.op,
    val: node.value,
    ...(kids.length ? { kids } : {}),
    note: info.path
      ? `path:${JSON.stringify(info.path)}`
      : info.name
        ? `name:${info.name}`
        : undefined,
  }
}
