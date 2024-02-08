import {
  allCharacterKeys,
  type AdditiveReactionKey,
  type AmpReactionKey,
  type CharacterKey,
  type InfusionAuraElementKey,
  type MultiOptHitModeKey,
  allInfusionAuraElementKeys,
} from '@genshin-optimizer/gi/consts'
import type { InputPremodKey } from '../../Formula'
import type { IConditionalValues } from '../../Types/sheet'
import { DataManager } from '../DataManager'
import type { ArtCharDatabase } from '../Database'
import { validateCustomMultiTarget } from './CustomMultiTarget'
const buildTypeKeys = ['equipped', 'real', 'tc'] as const
type buildTypeKey = (typeof buildTypeKeys)[number]
export interface TeamCharacter {
  key: CharacterKey

  customMultiTargets: CustomMultiTarget[]
  conditional: IConditionalValues

  bonusStats: Partial<Record<InputPremodKey, number>>
  infusionAura?: InfusionAuraElementKey | ''
  // TODO builds
  buildType: buildTypeKey
  buildRealId: string
  buildRealIds: string[]
  buildTcId: string
  buildTcIds: string[]
}

export interface CustomTarget {
  weight: number
  path: string[]
  hitMode: MultiOptHitModeKey
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
  bonusStats: Partial<Record<InputPremodKey, number>>
}
export interface CustomMultiTarget {
  name: string
  description?: string
  targets: CustomTarget[]
}

export class TeamCharacterDataManager extends DataManager<
  string,
  'teamchars',
  TeamCharacter,
  TeamCharacter,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'teamchars')
    for (const key of this.database.storage.keys)
      if (key.startsWith('teamchar_') && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  override validate(obj: unknown): TeamCharacter | undefined {
    return validateTeamCharater(obj)
  }

  new(key: CharacterKey): string {
    const id = this.generateKey()
    this.set(id, { key })
    return id
  }
  override clear(): void {
    super.clear()
  }
}

function validateTeamCharater(obj: unknown = {}): TeamCharacter | undefined {
  const { key: characterKey } = obj as TeamCharacter
  let {
    customMultiTargets,
    conditional,
    bonusStats,
    infusionAura,

    buildType,
    buildRealId,
    buildRealIds,
    buildTcId,
    buildTcIds,
  } = obj as TeamCharacter
  if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

  if (!customMultiTargets) customMultiTargets = []
  customMultiTargets = customMultiTargets
    .map((cmt) => validateCustomMultiTarget(cmt))
    .filter((t) => t) as CustomMultiTarget[]

  if (!conditional) conditional = {}

  // TODO: validate bonusStats
  if (
    typeof bonusStats !== 'object' ||
    !Object.entries(bonusStats).map(([_, num]) => typeof num === 'number')
  )
    bonusStats = {}

  if (
    infusionAura &&
    !allInfusionAuraElementKeys.includes(infusionAura as InfusionAuraElementKey)
  )
    infusionAura = undefined

  if (!buildTypeKeys.includes(buildType)) buildType = 'equipped'

  //TODO
  buildRealId = ''
  buildRealIds = []
  buildTcId = ''
  buildTcIds = []

  if (!buildRealId && !buildTcId) buildType = 'equipped'

  return {
    key: characterKey,
    customMultiTargets,
    conditional,
    bonusStats,
    infusionAura,
    buildType,
    buildRealId,
    buildRealIds,
    buildTcId,
    buildTcIds,
  }
}
