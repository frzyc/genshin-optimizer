import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, st, stg } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'LightOfFoliarIncision'
const data_gen = allStats.weapon.data[key]

const critRate_arr = [0.04, 0.05, 0.06, 0.07, 0.08]
const critRate_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refineIndex, critRate_arr)
)

const [condAfterNormalElePath, condAfterNormalEle] = cond(key, 'afterNormalEle')
const dmgIncArr = [1.2, 1.5, 1.8, 2.1, 2.4]
// TODO: Check if this is total or premod. Probably will be total since it is dmgInc
const normal_dmgInc = equal(
  input.weapon.key,
  key,
  equal(
    condAfterNormalEle,
    'on',
    prod(
      subscript(input.weapon.refineIndex, dmgIncArr, { unit: '%' }),
      input.total.eleMas
    )
  )
)
const skill_dmgInc = { ...normal_dmgInc }

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      normal_dmgInc,
      skill_dmgInc,
      critRate_,
    },
  },
  {
    normal_dmgInc,
    skill_dmgInc,
  }
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: critRate_ }],
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterNormalElePath,
      value: condAfterNormalEle,
      name: st('hitOp.normalEle'),
      states: {
        on: {
          fields: [
            {
              node: normal_dmgInc,
            },
            {
              node: skill_dmgInc,
            },
            {
              text: st('triggerQuota'),
              value: 28,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
