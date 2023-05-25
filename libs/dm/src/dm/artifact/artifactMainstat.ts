import { extrapolateFloat } from '@genshin-optimizer/pipeline'
import { layeredAssignment } from '@genshin-optimizer/util'
import type { MainStatKey, PropTypeKey } from '../../mapping'
import { MainPropMap, propTypeMap } from '../../mapping'
import { readDMJSON } from '../../util'

type ReliquaryLevelExcelConfigData = {
  rank: number
  level: number
  exp: number //600,
  addProps: {
    propType: PropTypeKey // "FIGHT_PROP_HP",
    value: number //129.0
  }[]
}
const artifactMainstatDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/ReliquaryLevelExcelConfigData.json')
) as ReliquaryLevelExcelConfigData[]

export type artifaceMainstatData = {
  [rank: number]: Record<MainStatKey, number[]>
}

const artifactMainstatData = {} as artifaceMainstatData

//create the general shape of artifactMainstatData
Array.from({ length: 5 }, (_, i) => i + 1).forEach((rank) => {
  Object.values(MainPropMap).forEach((element) => {
    layeredAssignment(artifactMainstatData, [rank, element], [])
  })
})

//populate the arrays from the data.
artifactMainstatDataSrc.forEach(({ rank = 0, level, addProps }) => {
  if (!rank) return //1st element is invalid
  if (level - 1 > rank * 4) return //prune extra values
  addProps.forEach(({ propType, value }) => {
    // Main stat has these values, which we are not really using.
    //TODO: wtf is FIGHT_PROP_FIRE_SUB_HURT? burning reduction?
    if (['FIGHT_PROP_FIRE_SUB_HURT', 'FIGHT_PROP_DEFENSE'].includes(propType))
      return
    if (Object.keys(MainPropMap).includes(propType as keyof typeof MainPropMap))
      layeredAssignment(
        artifactMainstatData,
        [rank, propTypeMap[propType], level - 1],
        extrapolateFloat(value)
      )
    else console.warn(`MainPropMap.${propType} is not a valid key.`)
  })
})

export { artifactMainstatData }
