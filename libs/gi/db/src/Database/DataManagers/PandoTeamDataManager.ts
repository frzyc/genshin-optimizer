import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allAmplifyingReactionKeys,
  allCatalyzeReactionKeys,
  allCharacterKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'

export const pandoCritModeKeys = ['avg', 'crit', 'nonCrit'] as const
export type PandoCritModeKey = (typeof pandoCritModeKeys)[number]

/** Extra party slots (main is always member `0`). */
export const pandoTeammateMembers = ['1', '2', '3'] as const
export type PandoTeammateMember = (typeof pandoTeammateMembers)[number]
/** Calc `src` keys: main `0` plus teammate slots. */
export const pandoMembers = ['0', ...pandoTeammateMembers] as const
export type PandoMember = (typeof pandoMembers)[number]
export type PandoTeammates = [
  CharacterKey | '',
  CharacterKey | '',
  CharacterKey | '',
]
const emptyTeammates: PandoTeammates = ['', '', '']

const pandoConditionalSchema = z.object({
  sheet: z.string(),
  src: z.string(),
  dst: z.string().nullable(),
  condKey: z.string(),
  condValue: z.number(),
})
export type PandoTeamConditional = z.infer<typeof pandoConditionalSchema>

const formulaRefSchema = z
  .object({
    sheet: z.string(),
    name: z.string(),
    dim: z.string(),
  })
  .optional()

const pandoTeamSchema = z.object({
  conditionals: z.array(pandoConditionalSchema).catch([]),
  enemyLvl: z.number().catch(100),
  enemyPreRes: z.number().catch(0.1),
  enemyDefRed_: z.number().catch(0),
  enemyDefIgn: z.number().catch(0),
  amp: z.enum(['', ...allAmplifyingReactionKeys]).catch(''),
  cata: z.enum(['', ...allCatalyzeReactionKeys]).catch(''),
  critMode: z.enum(pandoCritModeKeys).catch('avg'),
  ref: formulaRefSchema,
  collapsedOptCategories: z.array(z.string()).catch([]),
  optConfigId: z.string().optional().catch(undefined),
  teammates: z
    .tuple([z.string().catch(''), z.string().catch(''), z.string().catch('')])
    .catch(emptyTeammates),
  activeMember: z.enum(pandoMembers).catch('0'),
})
type ParsedPandoTeam = z.infer<typeof pandoTeamSchema>
export type PandoFormulaRef = {
  sheet: string
  name: string
  dim: string
}
export type PandoTeam = Omit<
  ParsedPandoTeam,
  'ref' | 'teammates' | 'activeMember'
> & {
  ref: PandoFormulaRef | undefined
  teammates: PandoTeammates
  activeMember: PandoMember
}

export function initialPandoTeam(): PandoTeam {
  const parsed = pandoTeamSchema.parse({})
  const teammates = persistTeammates(parsed.teammates)
  return {
    ...parsed,
    ref: persistFormulaRef(parsed.ref),
    teammates,
    activeMember: persistActiveMember(parsed.activeMember, teammates),
  }
}

/** Member `src` keys present in the calc (`0` plus occupied teammate slots). */
export function pandoTeamSrcKeys(teammates: PandoTeammates): string[] {
  const keys = ['0']
  teammates.forEach((ck, i) => {
    if (ck) keys.push(pandoTeammateMembers[i]!)
  })
  return keys
}

function persistFormulaRef(
  raw: ParsedPandoTeam['ref']
): PandoFormulaRef | undefined {
  if (!raw?.sheet || !raw.name || !raw.dim) return undefined
  return { sheet: raw.sheet, name: raw.name, dim: raw.dim }
}

function persistTeammates(raw: readonly string[]): PandoTeammates {
  return [0, 1, 2].map((i) => {
    const key = raw[i] ?? ''
    return isPandoTeamCharacterKey(key) ? key : ''
  }) as PandoTeammates
}

function persistActiveMember(
  raw: string,
  teammates: PandoTeammates
): PandoMember {
  if (raw === '0') return '0'
  const slot = pandoTeammateMembers.findIndex((m) => m === raw)
  if (slot >= 0 && teammates[slot]) return raw as PandoMember
  return '0'
}

const storageHash = 'pandoTeam_'

export class PandoTeamDataManager extends DataManager<
  CharacterKey,
  'pandoTeams',
  PandoTeam,
  PandoTeam,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'pandoTeams')
    for (const key of this.database.storage.keys) {
      if (
        key.startsWith(storageHash) &&
        !this.set(key.split(storageHash)[1] as CharacterKey, {})
      )
        this.database.storage.remove(key)
    }
  }
  override validate(obj: unknown): PandoTeam | undefined {
    const result = pandoTeamSchema.safeParse(obj)
    if (!result.success) return undefined
    const {
      ref: rawRef,
      optConfigId: rawOptConfigId,
      teammates: rawTeammates,
      activeMember: rawActiveMember,
      ...rest
    } = result.data
    const optConfigId =
      rawOptConfigId && this.database.pandoOptConfigs.get(rawOptConfigId)
        ? rawOptConfigId
        : undefined
    const teammates = persistTeammates(rawTeammates)
    return {
      ...rest,
      optConfigId,
      ref: persistFormulaRef(rawRef),
      teammates,
      activeMember: persistActiveMember(rawActiveMember, teammates),
    }
  }
  override toStorageKey(key: CharacterKey): string {
    return `${storageHash}${key}`
  }
  override toCacheKey(key: string): CharacterKey {
    return key.split(storageHash)[1] as CharacterKey
  }
  override get(key: CharacterKey): PandoTeam | undefined {
    return this.data[key]
  }
  getOrCreate(key: CharacterKey): PandoTeam {
    if (!this.keys.includes(key)) {
      this.set(key, initialPandoTeam())
    }
    this.ensureOptConfigId(key)
    return this.get(key) as PandoTeam
  }
  /** Every team has a solver config so Optimize and Builds share one document. */
  private ensureOptConfigId(key: CharacterKey) {
    const team = this.get(key)
    if (!team || team.optConfigId) return
    this.set(key, { optConfigId: this.database.pandoOptConfigs.new() })
  }
  setConditional(
    key: CharacterKey,
    sheet: string,
    condKey: string,
    src: string,
    dst: string | null,
    condValue: number
  ) {
    this.getOrCreate(key)
    this.set(key, (team) => {
      const next = team.conditionals.filter(
        (c) =>
          !(
            c.sheet === sheet &&
            c.condKey === condKey &&
            c.src === src &&
            c.dst === dst
          )
      )
      if (condValue) next.push({ sheet, src, dst, condKey, condValue })
      return { conditionals: next }
    })
  }
  setTeammate(
    key: CharacterKey,
    slot: 0 | 1 | 2,
    teammateKey: CharacterKey | ''
  ) {
    this.getOrCreate(key)
    this.set(key, (team) => {
      const teammates = [...team.teammates] as PandoTeammates
      const next = teammateKey && teammateKey !== key ? teammateKey : ''
      const droppedMembers = new Set<string>()
      if (next) {
        for (let i = 0; i < teammates.length; i++) {
          if (i !== slot && teammates[i] === next) {
            teammates[i] = ''
            droppedMembers.add(pandoTeammateMembers[i]!)
          }
        }
      }
      if (teammates[slot] && teammates[slot] !== next)
        droppedMembers.add(pandoTeammateMembers[slot]!)
      teammates[slot] = next
      const nextTeam = {
        teammates,
        conditionals: droppedMembers.size
          ? team.conditionals.filter((c) => !droppedMembers.has(c.src))
          : team.conditionals,
      }
      return {
        ...nextTeam,
        activeMember: persistActiveMember(team.activeMember, teammates),
      }
    })
  }
  setActiveMember(key: CharacterKey, member: PandoMember) {
    this.getOrCreate(key)
    this.set(key, (team) => ({
      activeMember: persistActiveMember(member, team.teammates),
    }))
  }
}

export function isPandoTeamCharacterKey(
  key: string | undefined
): key is CharacterKey {
  return !!key && (allCharacterKeys as readonly string[]).includes(key)
}
