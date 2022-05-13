
type MaterialExcelConfigData = {
  "interactionTitleTextMapHash": number// 1734642623,
  "materialType": "MATERIAL_NAMECARD",
  "stackLimit": number//1000,
  "maxUseCount": number//99,
  "useOnGain": boolean,
  "noFirstGetHint": boolean,
  "playGainEffect": boolean,
  "itemUse": Array<{
    "useOp"?: string,
    "useParam": string[]
  }>
  "rankLevel": number,
  "effectDescTextMapHash": number//1059911031,
  "specialDescTextMapHash": number//569101353,
  "typeDescTextMapHash": number//3736344046,
  "effectIcon": string,
  "effectName": string,
  "picPath": string[]
  // [
  //     "UI_NameCardPic_Noel_Alpha",
  //     "UI_NameCardPic_Noel_P"
  // ],
  "closeBagAfterUsed": boolean,
  "satiationParams": []
  "destroyReturnMaterial": [],
  "destroyReturnMaterialCount": [],
  "isForceGetHint": true,
  "id": number//210014,
  "nameTextMapHash": number//73191444,
  "descTextMapHash": number//1889394509,
  "icon": string//"UI_NameCardIcon_Noel",
  "itemType": "ITEM_MATERIAL"
}

const materialExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/MaterialExcelConfigData.json') as MaterialExcelConfigData[]
//character data
const materialExcelConfigData = Object.fromEntries(materialExcelConfigDataSrc.map(data =>
  [data.id, data])) as { [id: number]: MaterialExcelConfigData }

export default materialExcelConfigData
