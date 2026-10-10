import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  lookup,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheFirstGreatMagic'
const charged_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const stackAtk_arrs = [
  [-1, 0.16, 0.2, 0.24, 0.28, 0.32],
  [-1, 0.32, 0.4, 0.48, 0.56, 0.64],
  [-1, 0.48, 0.6, 0.72, 0.84, 0.96],
]
const moveSPD_arrs = [
  [-1, 0.04, 0.06, 0.08, 0.1, 0.12],
  [-1, 0.07, 0.09, 0.11, 0.13, 0.15],
  [-1, 0.1, 0.12, 0.14, 0.16, 0.18],
]

const {
  weapon: { refinement },
} = own
const sameElementTeammates = lookup(
  own.char.ele,
  {
    anemo: team.common.count.anemo,
    geo: team.common.count.geo,
    electro: team.common.count.electro,
    hydro: team.common.count.hydro,
    pyro: team.common.count.pyro,
    cryo: team.common.count.cryo,
    dendro: team.common.count.dendro,
  },
  0
)
const otherElementTeammates = sum(
  ...allElementKeys.map((ele) =>
    cmpGE(
      team.common.count[ele],
      1,
      cmpNE(own.char.ele, ele, team.common.count[ele])
    )
  )
)
const atk_ = cmpGE(
  sameElementTeammates,
  3,
  subscript(refinement, stackAtk_arrs[2]),
  cmpEq(
    sameElementTeammates,
    2,
    subscript(refinement, stackAtk_arrs[1]),
    subscript(refinement, stackAtk_arrs[0])
  )
)
const moveSPD_ = cmpGE(
  otherElementTeammates,
  3,
  subscript(refinement, moveSPD_arrs[2]),
  cmpEq(
    otherElementTeammates,
    2,
    subscript(refinement, moveSPD_arrs[1]),
    cmpEq(otherElementTeammates, 1, subscript(refinement, moveSPD_arrs[0]))
  )
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.charged.add(
    percent(subscript(refinement, charged_dmg_arr))
  ),
  ownBuff.premod.atk_.add(percent(atk_)),
  ownBuff.premod.moveSPD_.add(percent(moveSPD_))
)
