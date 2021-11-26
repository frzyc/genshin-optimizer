import { MainPropMap, MainStatKey, PropTypeKey, propTypeMap, StatKey } from "../.."
import { extrapolateFloat } from "../../extrapolateFloat"
import { layeredAssignment } from "../../Util"

type ReliquaryLevelExcelConfigData = {
  "Rank": number,
  "Level": number,
  "Exp": number//600,
  "AddProps": {
    "PropType": PropTypeKey// "FIGHT_PROP_HP",
    "Value": number//129.0
  }[]
}
const artifactMainstatDataSrc = require('../../GenshinData/ExcelBinOutput/ReliquaryLevelExcelConfigData.json') as ReliquaryLevelExcelConfigData[]

export type artifaceMainstatData = {
  [rank: number]: Record<MainStatKey, number[]>
}

const artifactMainstatData = {} as artifaceMainstatData

//create the general shape of artifactMainstatData
Array.from({ length: 5 }, (_, i) => i + 1).forEach(rank => {
  Object.values(MainPropMap).forEach(element => {
    layeredAssignment(artifactMainstatData, [rank, element], [])
  });
})

//populate the arrays from the data.
artifactMainstatDataSrc.forEach(({ Rank = 0, Level, AddProps }) => {
  if (!Rank) return //1st element is invalid
  if ((Level - 1) > Rank * 4) return //prune extra values
  AddProps.forEach(({ PropType, Value }) => {
    // Main stat has these values, which we are not really using.
    //TODO: wtf is FIGHT_PROP_FIRE_SUB_HURT? burning reduction?
    if (["FIGHT_PROP_FIRE_SUB_HURT", "FIGHT_PROP_GRASS_ADD_HURT", "FIGHT_PROP_DEFENSE"].includes(PropType)) return
    if (Object.keys(MainPropMap).includes(PropType))
      layeredAssignment(artifactMainstatData, [Rank, propTypeMap[PropType], Level - 1], extrapolateFloat(Value))
    else console.warn(`MainPropMap.${PropType} is not a valid key.`);

  })
})

export default artifactMainstatData