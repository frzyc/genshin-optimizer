import { verifyObjKeys } from '@genshin-optimizer/common/util'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allLightConeKeys } from '@genshin-optimizer/sr/consts'
import {
  equipmentConfig,
  equipmentSkillConfig,
  lightConeIdMap,
} from '@genshin-optimizer/sr/dm'

type LightConeData = {
  name: string
  passive: PassiveData
}
type PassiveData = {
  name: string
  description: string
}

const lightConeArray = Object.entries(equipmentConfig).map(
  ([lcId, lcConfig]) => {
    const { EquipmentName } = lcConfig
    const lcKey = lightConeIdMap[lcId]

    const { SkillName, SkillDesc } = equipmentSkillConfig[lcId][0]
    const passive = {
      name: SkillName.Hash.toString(),
      description: SkillDesc.Hash.toString(),
    }

    const tuple: [LightConeKey, LightConeData] = [
      lcKey,
      {
        name: EquipmentName.Hash.toString(),
        passive,
      },
    ]
    return tuple
  }
)

const data = Object.fromEntries(lightConeArray)
verifyObjKeys(data, allLightConeKeys)

export const allLightConeHashData = data
