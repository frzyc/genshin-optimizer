import { objKeyMap } from '@genshin-optimizer/common/util'
import { allTravelerKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ExaiphanesBlade'
const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const critDMG_arr = [-1, 0, 0.06, 0.06, 0.06, 0.06]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)
const {
  traveleranemo,
  travelergeo,
  travelerelectro,
  travelerhydro,
  travelerpyro,
  travelerdendro,
  travelercryo,
} = allBoolConditionals('Traveler')
const isTraveler = lookup(
  own.char.charKey,
  objKeyMap(allTravelerKeys, () => 1),
  0
)
const numEleRes = sum(
  traveleranemo.ifOn(1),
  travelergeo.ifOn(1),
  travelerelectro.ifOn(1),
  travelerhydro.ifOn(1),
  travelerpyro.ifOn(1),
  travelerdendro.ifOn(1),
  travelercryo.ifOn(1)
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(isTraveler, passive.ifOn(percent(subscript(refinement, atk_arr))))
  ),
  ownBuff.premod.critDMG_.add(
    prod(
      isTraveler,
      passive.ifOn(percent(subscript(refinement, critDMG_arr))),
      numEleRes
    )
  )
)
