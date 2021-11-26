import { PropTypeKey, WeaponId } from "../.."
import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile, layeredAssignment } from "../../Util"

type EquipAffixExcelConfigData = {
  "AffixId": number//1125034,
  "Id": WeaponId//112503,
  "Level"?: number//4,
  "NameTextMapHash": number//2433755451,
  "DescTextMapHash": number//3899169753,
  "OpenConfig": string//"Weapon_Claymore_Widsith",
  "AddProps": {
    "PropType"?: PropTypeKey//"FIGHT_PROP_ATTACK_PERCENT",
    "Value"?: number//0.3199999928474426
  }[]
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
const equipAffixExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/EquipAffixExcelConfigData.json') as EquipAffixExcelConfigData[]

const equipAffixExcelConfigData = {} as Record<number, EquipAffixExcelConfigData[]>
equipAffixExcelConfigDataSrc.forEach(data => {
  const { Id, Level = 0 } = data
  if (!equipAffixExcelConfigData[Id]) equipAffixExcelConfigData[Id] = []
  layeredAssignment(equipAffixExcelConfigData, [Id, Level], data)
})

dumpFile(`${__dirname}/EquipAffixExcelConfigData_idmap_gen.json`,
  Object.fromEntries(equipAffixExcelConfigDataSrc.map(data => [data.Id, nameToKey(TextMapEN[data.NameTextMapHash])])))

export default equipAffixExcelConfigData //
