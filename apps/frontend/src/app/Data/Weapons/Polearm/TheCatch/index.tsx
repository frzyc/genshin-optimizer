import { input } from '../../../../Formula'
import { subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'TheCatch'
const data_gen = allStats.weapon.data[key]

const burstDmgSrc_ = [0.16, 0.2, 0.24, 0.28, 0.32]
const burstCritSrc_ = [0.06, 0.075, 0.09, 0.105, 0.12]
const burst_dmg_ = subscript(input.weapon.refineIndex, burstDmgSrc_)
const burst_critRate_ = subscript(input.weapon.refineIndex, burstCritSrc_)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    burst_dmg_,
    burst_critRate_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: burst_dmg_ }, { node: burst_critRate_ }],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
