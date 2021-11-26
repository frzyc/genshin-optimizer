import { PropTypeKey, SubstatKey, SubStatPropTypeMap } from "../.."
import { extrapolateFloat } from "../../extrapolateFloat"
import { layeredAssignment } from "../../Util"

type ReliquaryAffixExcelConfigData = {
  "Id": number//996004, AFAIK, not used
  "DepotId": number//996,
  "GroupId": number//20,
  "PropType": PropTypeKey//"FIGHT_PROP_CRITICAL",
  "PropValue": number//0.062199998646974564,
  "Weight": number//1,
  "UpgradeWeight": number//1000
}
const artifactSubstatDataSrc = require('../../GenshinData/ExcelBinOutput/ReliquaryAffixExcelConfigData.json') as ReliquaryAffixExcelConfigData[]

type artifaceSubstatData = {
  [Rarity: number]: Record<SubstatKey, number[]>
}

const artifactSubstatData = {} as artifaceSubstatData

//create the general shape of artifactSubstatData
Array.from({ length: 5 }, (_, i) => i + 1).forEach(rank => {
  Object.values(SubStatPropTypeMap).forEach(element => {
    layeredAssignment(artifactSubstatData, [rank, element], [])
  });
})

artifactSubstatDataSrc.forEach(({ DepotId, GroupId, PropType, PropValue }) => {
  const rank = Math.round(DepotId / 100)
  if (rank > 5) return
  artifactSubstatData[rank][SubStatPropTypeMap[PropType]].push(extrapolateFloat(PropValue))
})

export default artifactSubstatData
