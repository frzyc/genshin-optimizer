import { readDMJSON } from '../../util'

type AvatarTalentExcelConfigData = {
  talentId: number //293,
  nameTextMapHash: number //1369435161,
  descTextMapHash: number //2182377015,
  icon: string //"UI_Talent_U_Klee_01",
  prevTalent: number //292,
  mainCostItemId: number //1129,
  mainCostItemCount: number //1,
  openConfig: string //"Klee_Constellation_3",
  addProps: object[]
  // [
  //     {},
  //     {}
  // ],
  paramList: number[]
  // [
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0,
  //     0.0
  // ]
}
const avatarTalentExcelConfigDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/AvatarTalentExcelConfigData.json')
) as AvatarTalentExcelConfigData[]
const avatarTalentExcelConfigData = Object.fromEntries(
  avatarTalentExcelConfigDataSrc.map((data) => [data.talentId, data])
) as { [id: number]: AvatarTalentExcelConfigData }

export { avatarTalentExcelConfigData }
