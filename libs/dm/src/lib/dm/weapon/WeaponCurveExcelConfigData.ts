//exp curve
import type { WeaponGrowCurveKey } from '@genshin-optimizer/pipeline'
import { extrapolateFloat } from '@genshin-optimizer/pipeline'
import { readDMJSON } from '../../util'

type WeaponCurveExcelConfigData = {
  level: 1
  curveInfos: [
    {
      type: 'GROW_CURVE_ATTACK_101'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_102'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_103'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_104'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_105'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_CRITICAL_101'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_201'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_202'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_203'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_204'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_205'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_CRITICAL_201'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_301'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_302'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_303'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_304'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_ATTACK_305'
      arith: 'ARITH_MULTI'
      value: number //1.0
    },
    {
      type: 'GROW_CURVE_CRITICAL_301'
      arith: 'ARITH_MULTI'
      value: number //1.0
    }
  ]
}

const weaponCurveExcelConfigDataSrc = JSON.parse(
  readDMJSON('ExcelBinOutput/WeaponCurveExcelConfigData.json')
) as WeaponCurveExcelConfigData[]

export type WeaponExpCurveData = Record<
  WeaponGrowCurveKey,
  { [level: number]: number }
>

const weaponCurveExcelConfigData = {} as WeaponExpCurveData
weaponCurveExcelConfigDataSrc.forEach(({ level, curveInfos }) =>
  curveInfos.forEach(({ type, value }) => {
    if (!weaponCurveExcelConfigData[type]) weaponCurveExcelConfigData[type] = {} // TODO: [0]
    weaponCurveExcelConfigData[type][level] = extrapolateFloat(value)
  })
)

export default weaponCurveExcelConfigData
