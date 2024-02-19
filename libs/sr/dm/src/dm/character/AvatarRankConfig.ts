import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH } from '../../consts'
import { readDMJSON } from '../../util'
import type { HashId, MaterialValue, Value } from '../common'
import { avatarConfig } from './AvatarConfig'

// Eidolon information
export type AvatarRankConfig = {
  RankID: number // Internal Eidolon ID
  Rank: Rank // Eidolon #1-6
  Trigger: HashId
  Name: string
  Desc: string
  IconPath: string
  SkillAddLevelList: SkillAddLevelList // Info for Eidolon 3/5
  RankAbility: string[] // I dunno
  UnlockCost: MaterialValue
  Param: Value[] // Scalings, if any
}
export const allRanks = [1, 2, 3, 4, 5, 6] as const
export type Rank = (typeof allRanks)[number]
// { <skillId>: <# of levels increased> }
type SkillAddLevelList = Partial<Record<string, number>>

const avatarRankConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/AvatarRankConfig.json')
) as Record<string, AvatarRankConfig>

// Convert to { charId: { eidolon#: config } } mapping
const avatarRankConfig = Object.fromEntries(
  Object.entries(avatarConfig).map(([avatarId, avatarConfig]) => [
    avatarId, // Map charId
    // to { eidolon#: config }
    Object.fromEntries(
      avatarConfig.RankIDList.map((rankId) => [
        avatarRankConfigSrc[rankId].Rank, // Map Eidolon #1-6
        avatarRankConfigSrc[rankId], // to Config
      ])
    ),
  ])
)

dumpFile(
  `${PROJROOT_PATH}/src/dm/character/AvatarRankConfig_charMapped_gen.json`,
  avatarRankConfig
)
export { avatarRankConfig }
