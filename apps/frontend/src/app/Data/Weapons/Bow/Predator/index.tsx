import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, percent, prod } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'Predator'
const data_gen = data_gen_json as WeaponData

const normalInc = percent(0.1)
const chargedInc = percent(0.1)
const [condPassivePath, condPassive] = cond(key, 'PressTheAdvantage')
const normal_dmg_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 2), (i) => prod(normalInc, i)),
  },
  naught
)
const charged_dmg_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 2), (i) => prod(chargedInc, i)),
  },
  naught
)
const atk = equal(input.activeCharKey, 'Aloy', 66)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_,
    charged_dmg_,
    atk,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.cryo'),
      states: Object.fromEntries(
        range(1, 2).map((c) => [
          c,
          {
            name: st('stack', { count: c }),
            fields: [
              {
                node: normal_dmg_,
              },
              {
                node: charged_dmg_,
              },
              {
                text: stg('duration'),
                value: 6,
                unit: 's',
              },
            ],
          },
        ])
      ),
    },
  ],
}

export default new WeaponSheet(key, sheet, data_gen, data)
