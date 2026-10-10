import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FinaleOfTheDeep'
const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const bond_atkArr = [-1, 0.024, 0.03, 0.036, 0.042, 0.048]
const bond_maxAtkArr = [-1, 150, 187.5, 225, 262.5, 300]

const {
  weapon: { refinement },
} = own
const { afterSkill, bond } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    afterSkill.ifOn(percent(subscript(refinement, atk_arr)))
  ),
  ownBuff.premod.atk.add(
    bond.ifOn(
      min(
        prod(
          prod(percent(0.25), own.final.hp),
          percent(subscript(refinement, bond_atkArr))
        ),
        subscript(refinement, bond_maxAtkArr)
      )
    )
  )
)
