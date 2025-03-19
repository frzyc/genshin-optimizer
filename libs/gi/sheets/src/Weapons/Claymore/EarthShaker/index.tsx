import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'EarthShaker'

const skill_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const [condPyroReactionPath, condPyroReaction] = cond(key, 'pyroReaction')
const pyroReaction_skill_dmg_ = equal(
  condPyroReaction,
  'on',
  subscript(input.weapon.refinement, skill_dmg_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    skill_dmg_: pyroReaction_skill_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPyroReaction,
      path: condPyroReactionPath,
      header: headerTemplate(key, st('conditional')),
      name: st('elementalReaction.team.pyro'),
      states: {
        on: {
          fields: [
            {
              node: pyroReaction_skill_dmg_,
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
