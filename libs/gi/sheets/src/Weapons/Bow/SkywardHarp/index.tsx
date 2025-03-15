import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  equal,
  infoMut,
  input,
  percent,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SkywardHarp'

const critd_s = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const dmgPerc = percent(1.25)
const critDMG_ = subscript(input.weapon.refinement, critd_s)
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(prod(dmgPerc, input.total.atk), 'elemental', {
    hit: { ele: constant('physical') },
  }),
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      critDMG_,
    },
  },
  {
    dmg,
  },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: critDMG_,
        },
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}

export default new WeaponSheet(sheet, data)
