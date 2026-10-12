import { allElementKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  cmpGE,
  cmpNE,
  lookup,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'JadeVista'
const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const eleMasArr = [-1, 64, 80, 96, 112, 128]

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
const sameEle = cmpGE(teamSameNum, 2, sum(teamSameNum, -1))
const diffEle = sum(
  ...allElementKeys.map((ele) =>
    cmpNE(own.char.ele, ele, team.common.count[ele])
  )
)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(percent(subscript(refinement, atk_arr)), diffEle)
  ),
  ownBuff.premod.eleMas.add(prod(subscript(refinement, eleMasArr), sameEle))
)
