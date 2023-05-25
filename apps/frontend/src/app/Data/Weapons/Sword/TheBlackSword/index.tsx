import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { customHealNode } from '../../../Characters/dataUtil'
import { stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'TheBlackSword'
const data_gen = allStats.weapon.data[key]

const autoSrc = [0.2, 0.25, 0.3, 0.35, 0.4]
const hpRegenSrc = [0.6, 0.7, 0.8, 0.9, 1]
const normal_dmg_ = subscript(input.weapon.refineIndex, autoSrc)
const charged_dmg_ = subscript(input.weapon.refineIndex, autoSrc)
const heal = equal(
  input.weapon.key,
  key,
  customHealNode(
    prod(
      subscript(input.weapon.refineIndex, hpRegenSrc, { unit: '%' }),
      input.total.atk
    )
  )
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      normal_dmg_,
      charged_dmg_,
    },
  },
  { heal }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: normal_dmg_,
        },
        {
          node: charged_dmg_,
        },
        {
          node: infoMut(heal, { name: stg('healing'), variant: 'heal' }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
