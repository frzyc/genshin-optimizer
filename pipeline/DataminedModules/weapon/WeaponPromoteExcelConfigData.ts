import { PropTypeKey } from "../.."
import { layeredAssignment } from "../../Util"

type WeaponPromoteExcelConfigData = {
  "WeaponPromoteId": number//12406,
  "PromoteLevel": number//6,
  "CostItems": {
    "Id": number,
    "Count": number
  }[]
  // [
  //   {
  //     "Id": 114024,
  //     "Count": 4
  //   },
  //   {
  //     "Id": 112043,
  //     "Count": 18
  //   },
  //   {
  //     "Id": 112007,
  //     "Count": 12
  //   }
  // ],
  "CoinCost": number,
  "AddProps": {
    "PropType": PropTypeKey
    "Value": number
  }[]
  // [
  //   {
  //     "PropType": "FIGHT_PROP_BASE_ATTACK",
  //     "Value": 155.60000610351562
  //   },
  //   {
  //     "PropType": "FIGHT_PROP_CRITICAL"
  //   },
  //   {
  //     "PropType": "FIGHT_PROP_CRITICAL_HURT"
  //   },
  //   {
  //     "PropType": "FIGHT_PROP_CHARGE_EFFICIENCY"
  //   },
  //   {
  //     "PropType": "FIGHT_PROP_ELEMENT_MASTERY"
  //   }
  // ],
  "UnlockMaxLevel": number//90,
  "RequiredPlayerLevel": number//50
}
const weaponPromoteExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/WeaponPromoteExcelConfigData.json') as WeaponPromoteExcelConfigData[]

const weaponPromoteExcelConfigData = {} as Record<number, WeaponPromoteExcelConfigData[]>

weaponPromoteExcelConfigDataSrc.forEach(data => {

  const { WeaponPromoteId = 0, PromoteLevel = 0 } = data
  if (!WeaponPromoteId || !PromoteLevel) return

  if (!weaponPromoteExcelConfigData[WeaponPromoteId]) weaponPromoteExcelConfigData[WeaponPromoteId] = [null]//fill in first item, to help with processing
  layeredAssignment(weaponPromoteExcelConfigData, [WeaponPromoteId, PromoteLevel], data)
})

export default weaponPromoteExcelConfigData //