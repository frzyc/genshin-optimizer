import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ThunderingPulse'
const naStack1 = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const naStack2 = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const naStack3 = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const ruleKeys = ['1', '2', '3'] as const

const {
  weapon: { refinement },
} = own
const { RuleByThunder } = allListConditionals(key, [...ruleKeys])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.normal.add(
    lookup(
      subscript(RuleByThunder.value, ['', ...ruleKeys]),
      {
        '1': percent(subscript(refinement, naStack1)),
        '2': percent(subscript(refinement, naStack2)),
        '3': percent(subscript(refinement, naStack3)),
      },
      0
    )
  )
)
