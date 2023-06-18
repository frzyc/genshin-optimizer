import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { allTravelerKeys } from '@genshin-optimizer/consts'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
} from '../../../../Formula/utils'
import { objectKeyMap } from '../../../../Util/Util'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'SwordOfDescension'
const data_gen = allStats.weapon.data[key]

const atk = lookup(
  input.charKey,
  objectKeyMap(allTravelerKeys, (_) => constant(66)),
  naught
)
const dmg_ = equal(
  input.weapon.key,
  key,
  customDmgNode(prod(percent(2), input.premod.atk), 'elemental', {
    hit: { ele: constant('physical') },
  })
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      atk,
    },
  },
  {
    dmg_,
  }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk,
        },
        {
          node: infoMut(dmg_, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
