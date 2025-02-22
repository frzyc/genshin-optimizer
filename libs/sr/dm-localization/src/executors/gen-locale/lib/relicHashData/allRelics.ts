import { verifyObjKeys } from '@genshin-optimizer/common/util'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import {
  allRelicSetKeys,
  type RelicSetCountKey,
} from '@genshin-optimizer/sr/consts'
import {
  relicSetConfig,
  relicSetIdMap,
  relicSetSkillConfig,
} from '@genshin-optimizer/sr/dm'
import { convertToHash } from '../util'

type RelicData = {
  setName: string
  setEffects: SetEffectData
}
type SetEffectData = Partial<Record<RelicSetCountKey, string>>

const relicArray = Object.entries(relicSetConfig).map(([setId, setConfig]) => {
  const { SetName } = setConfig
  const relicKey = relicSetIdMap[setId]

  const skills = Object.fromEntries(
    Object.entries(relicSetSkillConfig[setId]).map(
      ([setCount, skillConfig]) =>
        [+setCount, convertToHash(skillConfig.SkillDesc).toString()] as [
          RelicSetCountKey,
          string
        ]
    )
  ) as SetEffectData

  const tuple: [RelicSetKey, RelicData] = [
    relicKey,
    {
      setName: SetName.Hash.toString(),
      setEffects: skills,
    },
  ]
  return tuple
})

const data = Object.fromEntries(relicArray)
verifyObjKeys(data, allRelicSetKeys)
export const allRelicHashData = data
