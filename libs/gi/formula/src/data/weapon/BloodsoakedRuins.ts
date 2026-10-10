import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BloodsoakedRuins'
const lunarcharged_dmg_arr = [-1, 0.36, 0.48, 0.6, 0.72, 0.84]
const critDMG_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const {
  weapon: { refinement },
} = own
const { afterBurst, afterLc } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.lunarcharged.add(
    afterBurst.ifOn(percent(subscript(refinement, lunarcharged_dmg_arr)))
  ),
  ownBuff.premod.critDMG_.add(
    afterLc.ifOn(percent(subscript(refinement, critDMG_arr)))
  )
)
