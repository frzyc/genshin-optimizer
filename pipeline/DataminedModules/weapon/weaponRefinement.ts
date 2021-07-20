import { PropTypeKey, WeaponId } from "../.."
import { layeredAssignment } from "../../Util"

type EquipAffixExcelConfigData = {
  "AffixId": number//1125034,
  "Id": WeaponId//112503,
  "Level"?: number//4,
  "NameTextMapHash": number//2433755451,
  "DescTextMapHash": number//3899169753,
  "OpenConfig": string//"Weapon_Claymore_Widsith",
  "AddProps": Array<{
    "PropType"?: PropTypeKey//"FIGHT_PROP_ATTACK_PERCENT",
    "Value"?: number//0.3199999928474426
  }>
  // [
  //   {
  //     "PropType": "FIGHT_PROP_ATTACK_PERCENT",
  //     "Value": 0.3199999928474426
  //   },
  //   {},
  //   {}
  // ],
  "ParamList": number[]
  // [
  //   0.3199999928474426,
  //   0.30000001192092896,
  //   12.0,
  //   0.23999999463558197,
  //   0.4000000059604645,
  //   20.0,
  //   0.0,
  //   0.0
  // ]
}
const WeaponRefinementDataSrc = require('../../GenshinData/ExcelBinOutput/EquipAffixExcelConfigData.json') as EquipAffixExcelConfigData[]

const WeaponRefinementData = {} as Record<number, Array<EquipAffixExcelConfigData>>
WeaponRefinementDataSrc.forEach(data => {
  const { Id, Level = 0 } = data
  if (!WeaponRefinementData[Id]) WeaponRefinementData[Id] = []
  layeredAssignment(WeaponRefinementData, [Id, Level], data)
})

export default WeaponRefinementData //
