import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, cmpNE, prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allListConditionals,
  own,
  percent,
  register,
  target,
  teamBuff,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'HakushinRing'
const refinementEleBonusSrc = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const nonElectroEle = [
  'anemo',
  'geo',
  'hydro',
  'pyro',
  'cryo',
  'dendro',
] as const

const {
  weapon: { refinement },
} = own
const { SakuraSaiguu } = allListConditionals(key, [...nonElectroEle])

const eleDmg = percent(subscript(refinement, refinementEleBonusSrc))

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.dmg_.electro.addOnce(
    'hakushinelectro',
    cmpNE(SakuraSaiguu.value, 0, eleDmg),
    cmpEq(target.char.ele, 'electro', 1)
  ),
  ...nonElectroEle.flatMap((ele) =>
    teamBuff.premod.dmg_[ele].addOnce(
      `hakushin${ele}`,
      prod(
        eleDmg,
        SakuraSaiguu.map({
          anemo: ele === 'anemo' ? 1 : 0,
          geo: ele === 'geo' ? 1 : 0,
          hydro: ele === 'hydro' ? 1 : 0,
          pyro: ele === 'pyro' ? 1 : 0,
          cryo: ele === 'cryo' ? 1 : 0,
          dendro: ele === 'dendro' ? 1 : 0,
        })
      ),
      cmpEq(target.char.ele, ele, 1)
    )
  )
)
