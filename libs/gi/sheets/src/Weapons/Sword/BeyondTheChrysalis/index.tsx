import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'BeyondTheChrysalis'
const [, trm] = trans('weapon', key)

const critDMG_arr = [-1, 0.56, 0.72, 0.88, 1.04, 1.2]
const stellarswirl_dmg_arr = [-1, 0.36, 0.45, 0.54, 0.63, 0.72]

const [condDevotionPath, condDevotion] = cond(key, 'devotion')
const devotion_critDMG_ = equal(
  condDevotion,
  'on',
  subscript(input.weapon.refinement, critDMG_arr)
)
const [codnDefiancePath, condDefiance] = cond(key, 'defiance')
const defiance_stellarswirl_dmg_ = equal(
  condDefiance,
  'on',
  subscript(input.weapon.refinement, stellarswirl_dmg_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    critDMG_: devotion_critDMG_,
    stellarswirl_dmg_: defiance_stellarswirl_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condDevotion,
      path: condDevotionPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('devotionCond'),
      states: {
        on: {
          fields: [
            {
              node: devotion_critDMG_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condDefiance,
      path: codnDefiancePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('defianceCond'),
      states: {
        on: {
          fields: [
            {
              node: defiance_stellarswirl_dmg_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
