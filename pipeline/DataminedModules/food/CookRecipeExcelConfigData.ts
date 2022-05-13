import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"

type CookRecipeExcelConfigData = {//Adeptus' Temptation
  "id": number// 5101,
  "nameTextMapHash": number//2535717720,
  "rankLevel": number//5,
  "icon": string// "UI_ItemIcon_108123",
  "descTextMapHash": number//3785660866,
  "effectDesc": number[]
  // [
  //   1022833117,
  //   3090219849,
  //   3779451422,
  //   4255144839
  // ],
  "foodType": "COOK_FOOD_ATTACK",
  "cookMethod": "COOK_METHOD_BOIL",
  "maxProficiency": number//25,
  "qualityOutputVec": {
    "id": number//108122,
    "count": number//1
  }[]
  // [
  //   {
  //     "id": 108122,
  //     "count": 1
  //   },
  //   {
  //     "id": 108123,
  //     "count": 1
  //   },
  //   {
  //     "id": 108124,
  //     "count": 1
  //   }
  // ],
  "inputVec": {
    "id": number//108122,
    "count": number//1
  }[]
  // [
  //   {
  //     "id": 110005,
  //     "count": 4
  //   },
  //   {
  //     "id": 100073,
  //     "count": 3
  //   },
  //   {
  //     "id": 100093,
  //     "count": 3
  //   },
  //   {
  //     "id": 100063,
  //     "count": 3
  //   },
  //   {}
  // ],
  "qteParam": string// "0.63,0.17",
  "qteQualityWeightVec": number[]
  // [
  //   0,
  //   0,
  //   100
  // ]
}

const cookRecipeExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/CookRecipeExcelConfigData.json') as CookRecipeExcelConfigData[]
//character data
const cookRecipeExcelConfigData = Object.fromEntries(cookRecipeExcelConfigDataSrc.map(data =>
  [data.id, data])) as { [AvatarId: number]: CookRecipeExcelConfigData }

dumpFile(`${__dirname}/CookRecipeExcelConfigData_idmap_gen.json`,
  Object.fromEntries(cookRecipeExcelConfigDataSrc.map(data => [data.id, nameToKey(TextMapEN[data.nameTextMapHash])])))

export default cookRecipeExcelConfigData
