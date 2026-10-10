import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpEq, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SolarPearl'
const refinementVals = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const {
  weapon: { refinement },
} = own
const { solarShineNormal } = allListConditionals(key, ['normal'])
const { solarShineSkillBurst } = allListConditionals(key, ['skillBurst'])

const refineVal = percent(subscript(refinement, refinementVals))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(cmpEq(solarShineNormal.value, 1, refineVal)),
  ownBuff.premod.dmg_.burst.add(cmpEq(solarShineNormal.value, 1, refineVal)),
  ownBuff.premod.dmg_.normal.add(
    cmpEq(solarShineSkillBurst.value, 1, refineVal)
  )
)
