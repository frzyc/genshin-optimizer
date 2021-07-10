import { PropTypeKey } from "../const"
import { extrapolateFloat } from "../extrapolateFloat"
import { layeredAssignment } from "../Util"

type ReliquaryAffixExcelConfigData = {
  "Id": number//996004, AFAIK, not used
  "DepotId": number//996,
  "GroupId": number//20,
  "PropType": PropTypeKey//"FIGHT_PROP_CRITICAL",
  "PropValue": number//0.062199998646974564,
  "Weight": number//1,
  "UpgradeWeight": number//1000
}
const artifactSubstatDataSrc = require('../GenshinData/ExcelBinOutput/ReliquaryAffixExcelConfigData.json') as ReliquaryAffixExcelConfigData[]
/**
 * TODO: how is this structured?
 */

type artifaceSubstatData = {
  [DepotId: number]: {
    [GroupId: number]: [PropTypeKey, number]
  }
}

const artifactSubstatData = {} as artifaceSubstatData
artifactSubstatDataSrc.forEach(({ DepotId, GroupId, PropType, PropValue }) => {
  layeredAssignment(artifactSubstatData, [DepotId, GroupId], [PropType, extrapolateFloat(PropValue)])
})

export default artifactSubstatData