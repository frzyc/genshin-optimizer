import { verifyObjKeys } from '@genshin-optimizer/common/util'
import type { ServantKey } from '@genshin-optimizer/sr/consts'
import { allServantKeys } from '@genshin-optimizer/sr/consts'
import {
  avatarServantConfig,
  avatarServantSkillConfig,
  servantIdMap,
} from '@genshin-optimizer/sr/dm'

type ServantData = {
  name: string
  abilities: AbilitiesData
}
type AbilitiesData = {
  skill: AbilityData[]
  talent: AbilityData[]
}
type AbilityData = {
  name: string
  fullDesc: string
  shortDesc: string
  tag: string
}

const servantsArray = Object.entries(avatarServantConfig).map(
  ([servantId, servantConfig]) => {
    const { ServantName, SkillIDList } = servantConfig
    const servantKey = servantIdMap[servantId]

    const abilities: AbilitiesData = {
      skill: [],
      talent: [],
    }
    SkillIDList.forEach((skillId) => {
      const { SkillName, SkillTag, SkillDesc, SimpleSkillDesc, AttackType } =
        avatarServantSkillConfig[skillId][0]
      const ability = AttackType ? 'skill' : 'talent'
      abilities[ability].push({
        name: SkillName.Hash.toString(),
        fullDesc: SkillDesc?.Hash.toString() ?? '',
        shortDesc: SimpleSkillDesc?.Hash.toString() ?? '',
        tag: SkillTag.Hash.toString(),
      })
    })

    const tuple: [ServantKey, ServantData] = [
      servantKey,
      {
        name: ServantName.Hash.toString(),
        abilities,
      },
    ]
    return tuple
  }
)

const data = Object.fromEntries(servantsArray)
verifyObjKeys(data, allServantKeys)
export const allServantHashData = data
