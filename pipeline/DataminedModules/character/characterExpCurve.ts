//exp curve

import { extrapolateFloat } from "../../extrapolateFloat"

type AvatarCurveExcelConfigData = {
  "Level": number//2,
  "CurveInfos": [
    {
      "Type": "GROW_CURVE_HP_S4",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0829999446868896
    },
    {
      "Type": "GROW_CURVE_ATTACK_S4",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0829999446868896
    },
    {
      "Type": "GROW_CURVE_HP_S5",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0829999446868896
    },
    {
      "Type": "GROW_CURVE_ATTACK_S5",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0829999446868896
    }
  ]
}
export type CharacterGrowCurveKey = "GROW_CURVE_HP_S4" | "GROW_CURVE_ATTACK_S4" | "GROW_CURVE_HP_S5" | "GROW_CURVE_ATTACK_S5"
const characterExpCurveSrc = require('../../GenshinData/ExcelBinOutput/AvatarCurveExcelConfigData.json') as AvatarCurveExcelConfigData[]

export type CharacterExpCurveData = {
  GROW_CURVE_HP_S4: {
    [level: number]: number
  },
  GROW_CURVE_ATTACK_S4: {
    [level: number]: number
  }
  GROW_CURVE_HP_S5: {
    [level: number]: number
  }
}

const characterExpCurve = {} as CharacterExpCurveData
characterExpCurveSrc.forEach(({ Level, CurveInfos }) =>
  CurveInfos.forEach(({ Type, Value }) => {
    if (!characterExpCurve[Type]) characterExpCurve[Type] = {} // TODO: [0]
    characterExpCurve[Type][Level] = extrapolateFloat(Value)
  }))

export default characterExpCurve
