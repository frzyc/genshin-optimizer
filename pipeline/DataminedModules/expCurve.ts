//exp curve

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
export type GrowCurveKey = "GROW_CURVE_HP_S4" | "GROW_CURVE_ATTACK_S4" | "GROW_CURVE_HP_S5" | "GROW_CURVE_ATTACK_S5"
const expCurveSrc = require('../GenshinData/ExcelBinOutput/AvatarCurveExcelConfigData.json') as AvatarCurveExcelConfigData[]

export type ExpCurveData = {
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

const expCurve = {} as ExpCurveData
expCurveSrc.forEach(({ Level, CurveInfos }) =>
  CurveInfos.forEach(({ Type, Value }) => {
    if (!expCurve[Type]) expCurve[Type] = {}
    expCurve[Type][Level] = Value
  }))

export default expCurve
