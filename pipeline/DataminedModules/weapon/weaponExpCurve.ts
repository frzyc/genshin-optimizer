//exp curve

import { extrapolateFloat } from "../../extrapolateFloat"

type WeaponCurveExcelConfigData = {
  "Level": 1,
  "CurveInfos": [
    {
      "Type": "GROW_CURVE_ATTACK_101",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_102",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_103",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_104",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_105",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_CRITICAL_101",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_201",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_202",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_203",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_204",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_205",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_CRITICAL_201",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_301",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_302",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_303",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_304",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_ATTACK_305",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    },
    {
      "Type": "GROW_CURVE_CRITICAL_301",
      "Arith": "ARITH_MULTI",
      "Value": number//1.0
    }
  ]
}
export type WeaponGrowCurveKey = "GROW_CURVE_ATTACK_101" | "GROW_CURVE_ATTACK_102" | "GROW_CURVE_ATTACK_103" | "GROW_CURVE_ATTACK_104" |
  "GROW_CURVE_ATTACK_105" | "GROW_CURVE_CRITICAL_101" | "GROW_CURVE_ATTACK_201" | "GROW_CURVE_ATTACK_202" | "GROW_CURVE_ATTACK_203" |
  "GROW_CURVE_ATTACK_204" | "GROW_CURVE_ATTACK_205" | "GROW_CURVE_CRITICAL_201" | "GROW_CURVE_ATTACK_301" | "GROW_CURVE_ATTACK_302" |
  "GROW_CURVE_ATTACK_303" | "GROW_CURVE_ATTACK_304" | "GROW_CURVE_ATTACK_305" | "GROW_CURVE_CRITICAL_301"
const weaponExpCurveSrc = require('../../GenshinData/ExcelBinOutput/WeaponCurveExcelConfigData.json') as WeaponCurveExcelConfigData[]

export type WeaponExpCurveData = Record<WeaponGrowCurveKey, { [level: number]: number }>

const weaponExpCurve = {} as WeaponExpCurveData
weaponExpCurveSrc.forEach(({ Level, CurveInfos }) =>
  CurveInfos.forEach(({ Type, Value }) => {
    if (!weaponExpCurve[Type]) weaponExpCurve[Type] = {}
    weaponExpCurve[Type][Level] = extrapolateFloat(Value)
  }))

export default weaponExpCurve
