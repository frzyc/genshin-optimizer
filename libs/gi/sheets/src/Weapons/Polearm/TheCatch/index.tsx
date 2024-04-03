import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { input, subscript } from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheCatch'

const burstDmgSrc_ = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const burstCritSrc_ = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const burst_dmg_ = subscript(input.weapon.refinement, burstDmgSrc_)
const burst_critRate_ = subscript(input.weapon.refinement, burstCritSrc_)

const data = dataObjForWeaponSheet(key, {
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
export default new WeaponSheet(sheet, data)
