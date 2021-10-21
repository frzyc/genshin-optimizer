
type MaterialExcelConfigData = {
  "InteractionTitleTextMapHash": number// 1734642623,
  "MaterialType": "MATERIAL_NAMECARD",
  "StackLimit": number//1000,
  "MaxUseCount": number//99,
  "CloseBagAfterUsed": true,
  "PlayGainEffect": true,
  "UseParam": string[]
  // [
  //     "UI_NameCardPic_Noel_Alpha",
  //     "UI_NameCardPic_Noel_P"
  // ],
  "RankLevel": 4,
  "EffectDescTextMapHash": number//1059911031,
  "SpecialDescTextMapHash": number//569101353,
  "TypeDescTextMapHash": number//3736344046,
  "EffectIcon": "",
  "EffectName": "",
  "SatiationParams": [],
  "DestroyReturnMaterial": [],
  "DestroyReturnMaterialCount": [],
  "IsForceGetHint": true,
  "Id": number//210014,
  "NameTextMapHash": number//73191444,
  "DescTextMapHash": number//1889394509,
  "Icon": string//"UI_NameCardIcon_Noel",
  "ItemType": "ITEM_MATERIAL"
}

const materialExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/MaterialExcelConfigData.json') as MaterialExcelConfigData[]
//character data
const materialExcelConfigData = Object.fromEntries(materialExcelConfigDataSrc.map(data =>
  [data.Id, data])) as { [Id: number]: MaterialExcelConfigData }

export default materialExcelConfigData
