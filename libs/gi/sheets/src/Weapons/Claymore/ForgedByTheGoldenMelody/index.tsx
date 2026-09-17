import { objKeyValMap } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  equal,
  inferInfoMut,
  input,
  mergeData,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'ForgedByTheGoldenMelody'
const [, trm] = trans('weapon', key)

const atk_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]
const eleMasArr = [-1, 120, 150, 180, 210, 240]
const stellar_dmg_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const [condMovementPath, condMovement] = cond(key, 'movement')
const [condContraPath, condContra] = cond(key, 'contra')
const movement_atk_ = equal(
  condMovement,
  '1',
  subscript(input.weapon.refinement, atk_arr)
)
const contra_atk_ = equal(
  condContra,
  '1',
  subscript(input.weapon.refinement, atk_arr)
)
const movement_eleMas = equal(
  condMovement,
  '2',
  subscript(input.weapon.refinement, eleMasArr)
)
const contra_eleMas = equal(
  condContra,
  '2',
  subscript(input.weapon.refinement, eleMasArr)
)
const movement_stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (key) => [
  `${key}_dmg_`,
  equal(condMovement, '3', subscript(input.weapon.refinement, stellar_dmg_arr)),
])
const contra_stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (key) => [
  `${key}_dmg_`,
  equal(condContra, '3', subscript(input.weapon.refinement, stellar_dmg_arr)),
])

const data = dataObjForWeaponSheet(
  key,
  mergeData([
    inferInfoMut({
      premod: {
        atk_: movement_atk_,
        eleMas: movement_eleMas,
        ...movement_stellar_dmg_obj,
      },
    }),
    inferInfoMut({
      premod: {
        atk_: contra_atk_,
        eleMas: contra_eleMas,
        ...contra_stellar_dmg_obj,
      },
    }),
  ])
)

const sheet: IWeaponSheet = {
  document: [
    {
      value: condMovement,
      path: condMovementPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('movementCond'),
      states: {
        1: {
          name: trm('move1'),
          fields: [
            {
              node: movement_atk_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
        2: {
          name: trm('move2'),
          fields: [
            {
              node: movement_eleMas,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
        3: {
          name: trm('move3'),
          fields: [
            ...Object.values(movement_stellar_dmg_obj).map((node) => ({
              node,
            })),
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
      value: condContra,
      path: condContraPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('contraCond'),
      states: {
        1: {
          name: trm('move1'),
          fields: [
            {
              node: contra_atk_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
        2: {
          name: trm('move2'),
          fields: [
            {
              node: contra_eleMas,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
        3: {
          name: trm('move3'),
          fields: [
            ...Object.values(contra_stellar_dmg_obj).map((node) => ({ node })),
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
