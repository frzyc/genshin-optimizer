import { extrapolateFloat } from "@genshin-optimizer/pipeline"
import { readDMJSON } from "../../util"

//exp curve
type AvatarCurveExcelConfigData = {
  "level": number//2,
  "curveInfos": [
    {
      "type": "GROW_CURVE_HP_S4",
      "arith": "ARITH_MULTI",
      "value": number//1.0829999446868896
    },
    {
      "type": "GROW_CURVE_ATTACK_S4",
      "arith": "ARITH_MULTI",
      "value": number//1.0829999446868896
    },
    {
      "type": "GROW_CURVE_HP_S5",
      "arith": "ARITH_MULTI",
      "value": number//1.0829999446868896
    },
    {
      "type": "GROW_CURVE_ATTACK_S5",
      "arith": "ARITH_MULTI",
      "value": number//1.0829999446868896
    }
  ]
}

const characterExpCurveSrc = JSON.parse(readDMJSON("ExcelBinOutput/AvatarCurveExcelConfigData.json")) as AvatarCurveExcelConfigData[]

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
characterExpCurveSrc.forEach(({ level, curveInfos }) =>
  curveInfos.forEach(({ type, value }) => {
    if (!characterExpCurve[type]) characterExpCurve[type] = {} // TODO: [0]
    characterExpCurve[type][level] = extrapolateFloat(value)
  }))

export default characterExpCurve
