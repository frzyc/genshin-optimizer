import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'SongOfTheVigil'

const atk_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const [condStellarPath, condStellar] = cond(key, 'stellar')
const stellar_atk_ = equal(
  'on',
  condStellar,
  subscript(input.weapon.refinement, atk_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: stellar_atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condStellar,
      path: condStellarPath,
      header: headerTemplate(key, st('conditional')),
      name: st('elementalReaction.stellarglimmer'),
      states: {
        on: {
          fields: [
            {
              node: stellar_atk_,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
