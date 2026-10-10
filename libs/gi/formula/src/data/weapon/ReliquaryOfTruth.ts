import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ReliquaryOfTruth'
const eleMasArr = [-1, 80, 100, 120, 140, 160]
const critDMG_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const boost = 1.5

const {
  weapon: { refinement },
} = own
const { afterSkill, afterLunarBloom } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(
    afterSkill.ifOn(
      prod(
        afterLunarBloom.ifOn(percent(boost), 1),
        subscript(refinement, eleMasArr)
      )
    )
  ),
  ownBuff.premod.critDMG_.add(
    afterLunarBloom.ifOn(
      prod(
        afterSkill.ifOn(percent(boost), 1),
        percent(subscript(refinement, critDMG_arr))
      )
    )
  )
)
