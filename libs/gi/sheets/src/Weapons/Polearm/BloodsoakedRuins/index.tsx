import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BloodsoakedRuins'
const lunarcharged_dmg_arr = [-1, 0.36, 0.48, 0.6, 0.72, 0.84]
const critDMG_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const lunarcharged_dmg_ = equal(
  condAfterBurst,
  'on',
  subscript(input.weapon.refinement, lunarcharged_dmg_arr, { unit: '%' })
)

const [condAfterLcPath, condAfterLc] = cond(key, 'afterLc')
const critDMG_ = equal(
  condAfterLc,
  'on',
  subscript(input.weapon.refinement, critDMG_arr, { unit: '%' })
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    lunarcharged_dmg_,
    critDMG_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterBurstPath,
      value: condAfterBurst,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              node: lunarcharged_dmg_,
            },
            {
              text: stg('duration'),
              value: 3.5,
              unit: 's',
              fixed: 1,
            },
          ],
        },
      },
    },
    {
      value: condAfterLc,
      path: condAfterLcPath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.none'),
      states: {
        on: {
          fields: [
            {
              node: critDMG_,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
