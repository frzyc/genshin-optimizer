import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  lookup,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { notOwnBuff, own, ownBuff, percent, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AThousandFloatingDreams'
const self_eleMasArr = [-1, 32, 40, 48, 56, 64]
const self_eleDmg_arr = [-1, 0.1, 0.14, 0.18, 0.22, 0.26]
const team_eleMasArr = [-1, 40, 42, 44, 46, 48]

const {
  weapon: { refinement },
} = own
const teamSameNum = lookup(
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
const numSameElement = cmpGE(teamSameNum, 2, sum(teamSameNum, -1))
const otherElementTeammates = sum(
  ...allElementKeys.map((ele) =>
    cmpNE(own.char.ele, ele, team.common.count[ele])
  )
)
const self_eleDmg_ = prod(
  otherElementTeammates,
  percent(subscript(refinement, self_eleDmg_arr))
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(
    prod(numSameElement, subscript(refinement, self_eleMasArr))
  ),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(cmpEq(own.char.ele, ele, self_eleDmg_))
  ),
  notOwnBuff.premod.eleMas.add(subscript(refinement, team_eleMasArr))
)
