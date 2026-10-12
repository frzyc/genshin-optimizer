import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { equal, equalStr, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'BreezeborneRefrain'
const [, trm] = trans('weapon', key)

const enerRech_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const stellar_dmg_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const enerRech_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, enerRech_arr)
)
const [condViperPath, condViper] = cond(key, 'viper')
const buffWrite = equalStr(condViper, 'on', input.charKey)
const stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  nonStackBuff(
    'breezeborne',
    `${k}_dmg_`,
    subscript(input.weapon.refinement, stellar_dmg_arr)
  ),
])

const data = dataObjForWeaponSheet(key, {
  premod: {
    enerRech_,
  },
  teamBuff: {
    premod: objMap(stellar_dmg_obj, (buffs) => buffs[0]),
    nonStacking: {
      breezeborne: buffWrite,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: enerRech_,
        },
      ],
    },
    {
      value: condViper,
      path: condViperPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('viperCond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            ...Object.values(stellar_dmg_obj).flatMap((nodes) =>
              nodes.map((node) => ({
                node,
              }))
            ),
            { text: stg('duration'), value: 12, unit: 's' },
          ],
        },
      },
    },
  ],
}

export default new WeaponSheet(sheet, data)
