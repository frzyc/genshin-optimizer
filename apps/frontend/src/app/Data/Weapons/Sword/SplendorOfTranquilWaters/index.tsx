import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SplendorOfTranquilWaters'
const data_gen = allStats.weapon.data[key]

const skill_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const hp_arr = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]

const [condSelfHpChangePath, condSelfHpChange] = cond(key, 'selfHpChange')
const selfHpChangeArr = range(1, 3)
const skill_dmg_ = lookup(
  condSelfHpChange,
  objKeyMap(selfHpChangeArr, (stack) =>
    prod(
      stack,
      subscript(input.weapon.refinement, skill_dmg_arr, { unit: '%' })
    )
  ),
  naught
)

const [condTeamHpChangePath, condTeamHpChange] = cond(key, 'teamHpChange')
const teamHpChangeArr = range(1, 2)
const hp_ = lookup(
  condTeamHpChange,
  objKeyMap(teamHpChangeArr, (stack) =>
    prod(stack, subscript(input.weapon.refinement, hp_arr, { unit: '%' }))
  ),
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_,
    skill_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condSelfHpChange,
      path: condSelfHpChangePath,
      header: headerTemplate(key, st('stacks')),
      name: st('hpChange'),
      states: objKeyMap(selfHpChangeArr, (changes) => ({
        name: st('times', { count: changes }),
        fields: [
          {
            node: skill_dmg_,
          },
          {
            text: stg('duration'),
            value: 6,
            unit: 's',
          },
        ],
      })),
    },
    {
      value: condTeamHpChange,
      path: condTeamHpChangePath,
      header: headerTemplate(key, st('stacks')),
      name: st('otherHpChange'),
      states: objKeyMap(teamHpChangeArr, (changes) => ({
        name: st('times', { count: changes }),
        fields: [
          {
            node: hp_,
          },
          {
            text: stg('duration'),
            value: 6,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
