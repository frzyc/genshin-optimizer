import { nameToKey, TextMapEN } from "../../TextMapUtil"
import { dumpFile } from "../../Util"

type CookRecipeExcelConfigData = {//Adeptus' Temptation
  "Id": number// 5101,
  "NameTextMapHash": number//2535717720,
  "RankLevel": number//5,
  "Icon": string// "UI_ItemIcon_108123",
  "DescTextMapHash": number//3785660866,
  "EffectDesc": number[]
  // [
  //   1022833117,
  //   3090219849,
  //   3779451422,
  //   4255144839
  // ],
  "FoodType": "COOK_FOOD_ATTACK",
  "CookMethod": "COOK_METHOD_BOIL",
  "MaxProficiency": number//25,
  "QualityOutputVec": {
    "Id": number//108122,
    "Count": number//1
  }[]
  // [
  //   {
  //     "Id": 108122,
  //     "Count": 1
  //   },
  //   {
  //     "Id": 108123,
  //     "Count": 1
  //   },
  //   {
  //     "Id": 108124,
  //     "Count": 1
  //   }
  // ],
  "InputVec": {
    "Id": number//108122,
    "Count": number//1
  }[]
  // [
  //   {
  //     "Id": 110005,
  //     "Count": 4
  //   },
  //   {
  //     "Id": 100073,
  //     "Count": 3
  //   },
  //   {
  //     "Id": 100093,
  //     "Count": 3
  //   },
  //   {
  //     "Id": 100063,
  //     "Count": 3
  //   },
  //   {}
  // ],
  "QteParam": string// "0.63,0.17",
  "QteQualityWeightVec": number[]
  // [
  //   0,
  //   0,
  //   100
  // ]
}

const cookRecipeExcelConfigDataSrc = require('../../GenshinData/ExcelBinOutput/CookRecipeExcelConfigData.json') as CookRecipeExcelConfigData[]
//character data
const cookRecipeExcelConfigData = Object.fromEntries(cookRecipeExcelConfigDataSrc.map(data =>
  [data.Id, data])) as { [AvatarId: number]: CookRecipeExcelConfigData }

dumpFile(`${__dirname}/CookRecipeExcelConfigData_idmap_gen.json`,
  Object.fromEntries(cookRecipeExcelConfigDataSrc.map(data => [data.Id, nameToKey(TextMapEN[data.NameTextMapHash])])))

export default cookRecipeExcelConfigData