import type {
  RelicCavernSlotKey,
  RelicPlanarSlotKey,
} from '@genshin-optimizer/sr/consts'
import {
  relicSetConfig,
  relicSetSkillConfig_bySet,
} from '@genshin-optimizer/sr/dm'

type RelicData = {
  setName: string
  slots:
    | Record<RelicCavernSlotKey, SlotData>
    | Record<RelicPlanarSlotKey, SlotData>
}
type SlotData = {
  pieceName: string
}

const relicArray = Object.entries(relicSetConfig).map(([setId, setConfig]) => {
  const { SetName, SetSkillList } = setConfig

  const skills = relicSetSkillConfig_bySet[setId]
})

export const relicHashData = {}
