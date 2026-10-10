import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, percent, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BreezeborneRefrain'
const stellar_dmg_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own
const { viper } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ...allStellarReactionKeys.map((k) =>
    teamBuff.premod.dmg_[k].add(
      viper.ifOn(percent(subscript(refinement, stellar_dmg_arr)))
    )
  )
)
