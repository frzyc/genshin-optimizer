import { PropTypeKey } from "../.."
import { layeredAssignment } from "../../Util"

type EquipAffixExcelConfigData = {
  "WeaponPromoteId": number//12406,
  "PromoteLevel": number//6,
  "CostItems": Array<{
    "Id": number,
    "Count": number
  }>
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
  "AddProps": Array<{
    "PropType": PropTypeKey
    "Value": number
  }>
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
const weaponAscensionDataSrc = require('../../GenshinData/ExcelBinOutput/WeaponPromoteExcelConfigData.json') as EquipAffixExcelConfigData[]

const weaponAscensionData = {} as Record<number, Array<EquipAffixExcelConfigData>>

weaponAscensionDataSrc.forEach(data => {

  const { WeaponPromoteId = 0, PromoteLevel = 0 } = data
  if (!WeaponPromoteId || !PromoteLevel) return

  if (!weaponAscensionData[WeaponPromoteId]) weaponAscensionData[WeaponPromoteId] = [null]//fill in first item, to help with processing
  layeredAssignment(weaponAscensionData, [WeaponPromoteId, PromoteLevel], data)
})

export default weaponAscensionData //