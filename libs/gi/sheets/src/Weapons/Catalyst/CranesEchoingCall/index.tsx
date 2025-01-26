import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { equalStr, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CranesEchoingCall'

const plunging_dmg_arr = [-1, 0.28, 0.41, 0.54, 0.67, 0.8]

const [condPassivePath, condPassive] = cond(key, 'passive')
const nonstackWrite = equalStr(condPassive, 'on', input.charKey)
const [plunging_dmg_, plunging_dmg_inactive] = nonStackBuff(
  'crane',
  'plunging_dmg_',
  subscript(input.weapon.refinement, plunging_dmg_arr, { unit: '%' })
)

const data = dataObjForWeaponSheet(key, {
  teamBuff: {
    premod: {
      plunging_dmg_,
    },
    nonStacking: {
      crane: nonstackWrite,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.plunging'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: plunging_dmg_,
            },
            {
              node: plunging_dmg_inactive,
            },
            {
              text: stg('duration'),
              value: 20,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
