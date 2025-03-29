import { layeredAssignment } from '@genshin-optimizer/common/util'
import type { DSubstatKey, SubstatKey } from '../../mapping'
import { SubStatPropTypeMap } from '../../mapping'
import { readExcelJSON } from '../../util'

type ReliquaryAffixExcelConfigData = {
  id: number //996004, AFAIK, not used
  depotId: number //996,
  groupId: number //20,
  propType: DSubstatKey //"FIGHT_PROP_CRITICAL",
  propValue: number //0.062199998646974564,
}
const artifactSubstatDataSrc: ReliquaryAffixExcelConfigData[] = readExcelJSON(
  'ExcelBinOutput/ReliquaryAffixExcelConfigData.json'
)

type artifaceSubstatData = {
  [Rarity: number]: Record<SubstatKey, number[]>
}

const artifactSubstatData = {} as artifaceSubstatData

//create the general shape of artifactSubstatData
Array.from({ length: 5 }, (_, i) => i + 1).forEach((rank) => {
  Object.values(SubStatPropTypeMap).forEach((element) => {
    layeredAssignment(artifactSubstatData, [rank, element], [])
  })
})

artifactSubstatDataSrc.forEach(({ depotId, propType, propValue }) => {
  const rank = Math.round(depotId / 100)
  if (rank > 5) return
  const substatKey = SubStatPropTypeMap[propType]
  artifactSubstatData[rank][substatKey].push(propValue)
})

export { artifactSubstatData }
