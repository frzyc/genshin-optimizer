import { PropTypeKey } from "../.."
import { layeredAssignment } from "../../Util"

type WeaponPromoteExcelConfigData = {
  "weaponPromoteId": number//12406,
  "promoteLevel": number//6,
  "costItems": {
    "id": number,
    "count": number
  }[]
  // [
  //   {
  //     "id": 114024,
  //     "count": 4
  //   },
  //   {
  //     "id": 112043,
  //     "count": 18
  //   },
  //   {
  //     "id": 112007,
  //     "count": 12
  //   }
  // ],
  "coinCost": number,
  "addProps": {
    "propType": PropTypeKey
    "value": number
  }[]
  // [
  //   {
  //     "propType": "FIGHT_PROP_BASE_ATTACK",
  //     "value": 155.60000610351562
  //   },
  //   {
  //     "propType": "FIGHT_PROP_CRITICAL"
  //   },
  //   {
  //     "propType": "FIGHT_PROP_CRITICAL_HURT"
  //   },
  //   {
  //     "propType": "FIGHT_PROP_CHARGE_EFFICIENCY"
  //   },
  //   {
  //     "propType": "FIGHT_PROP_ELEMENT_MASTERY"
  //   }
  // ],
  "unlockMaxLevel": number//90,
  "requiredPlayerLevel": number//50
}
const weaponPromoteExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/WeaponPromoteExcelConfigData.json') as WeaponPromoteExcelConfigData[]

const weaponPromoteExcelConfigData = {} as Record<number, WeaponPromoteExcelConfigData[]>

weaponPromoteExcelConfigDataSrc.forEach(data => {

  const { weaponPromoteId = 0, promoteLevel = 0 } = data
  if (!weaponPromoteId || !promoteLevel) return

  if (!weaponPromoteExcelConfigData[weaponPromoteId]) weaponPromoteExcelConfigData[weaponPromoteId] = [null]//fill in first item, to help with processing
  layeredAssignment(weaponPromoteExcelConfigData, [weaponPromoteId, promoteLevel], data)
})

export default weaponPromoteExcelConfigData
