import { PropTypeKey, WeaponId } from "../.."
import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile, layeredAssignment } from "../../Util"

type EquipAffixExcelConfigData = {
  "affixId": number//1125034,
  "id": WeaponId//112503,
  "level"?: number//4,
  "nameTextMapHash": number//2433755451,
  "descTextMapHash": number//3899169753,
  "openConfig": string//"Weapon_Claymore_Widsith",
  "addProps": Array<{
    "propType": PropTypeKey//"FIGHT_PROP_ATTACK_PERCENT",
    "value": number//0.3199999928474426
  } | {}>
  // [
  //   {
  //     "propType": "FIGHT_PROP_ATTACK_PERCENT",
  //     "value": 0.3199999928474426
  //   },
  //   {},
  //   {}
  // ],
  "paramList": number[]
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
  const { id, level = 0 } = data
  if (!equipAffixExcelConfigData[id]) equipAffixExcelConfigData[id] = []
  layeredAssignment(equipAffixExcelConfigData, [id, level], data)
})

dumpFile(`${__dirname}/EquipAffixExcelConfigData_idmap_gen.json`,
  Object.fromEntries(equipAffixExcelConfigDataSrc.map(data => [data.id, nameToKey(TextMapEN[data.nameTextMapHash])])))

export default equipAffixExcelConfigData //
