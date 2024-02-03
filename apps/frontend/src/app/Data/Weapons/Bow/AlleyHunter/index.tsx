import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'AlleyHunter'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)
const dmgInc = [-1, 0.02, 0.025, 0.03, 0.035, 0.04]

const [condPassivePath, condPassive] = cond(key, 'OppidanAmbush')
const all_dmg_ = lookup(
  condPassive,
  {
    ...objKeyMap(range(1, 10), (i) =>
      prod(subscript(input.weapon.refinement, dmgInc), i)
    ),
  },
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: Object.fromEntries(
        range(1, 10).map((c) => [
          c,
          {
            name: st('seconds', { count: c }),
            fields: [
              {
                node: all_dmg_,
              },
            ],
          },
        ])
      ),
    },
  ],
}

export default new WeaponSheet(key, sheet, data_gen, data)
