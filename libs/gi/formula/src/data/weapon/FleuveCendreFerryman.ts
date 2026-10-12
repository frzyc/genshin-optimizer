import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FleuveCendreFerryman'
const skill_critRate_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const enerRech_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const {
  weapon: { refinement },
} = own
const { afterSkill } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critRate_.skill.add(
    percent(subscript(refinement, skill_critRate_arr))
  ),
  ownBuff.premod.enerRech_.add(
    afterSkill.ifOn(percent(subscript(refinement, enerRech_arr)))
  )
)
