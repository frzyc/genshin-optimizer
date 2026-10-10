import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Verdict'
const skill_dmg_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]

const {
  weapon: { refinement },
} = own
const { seals } = allNumConditionals(key, true, 0, 2)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(
    prod(seals, percent(subscript(refinement, skill_dmg_arr)))
  )
)
