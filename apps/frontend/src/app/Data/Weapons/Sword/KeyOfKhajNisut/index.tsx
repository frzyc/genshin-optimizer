import { input } from '../../../../Formula'
import {
  equal,
  lookup,
  naught,
  prod,
  subscript,
} from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { range } from '../../../../Util/Util'
import { cond, st, stg } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'KeyOfKhajNisut'
const data_gen = allStats.weapon.data[key]

const selfEmSrc = [0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const teamEmSrc = [0.002, 0.0025, 0.003, 0.0035, 0.004]
const stacksArr = range(1, 3)
const hp_arr = [0.2, 0.25, 0.3, 0.35, 0.4]
const hp_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refineIndex, hp_arr, { unit: '%' })
)

const [condAfterSkillStacksPath, condAfterSkillStacks] = cond(key, 'afterSkill')
const selfEleMas = equal(
  input.weapon.key,
  key,
  lookup(
    condAfterSkillStacks,
    Object.fromEntries(
      stacksArr.map((stack) => [
        stack,
        prod(
          stack,
          subscript(input.weapon.refineIndex, selfEmSrc, {
            unit: '%',
            fixed: 2,
          }),
          input.total.hp
        ),
      ])
    ),
    naught
  )
)
const teamEleMas = equal(
  input.weapon.key,
  key,
  equal(
    condAfterSkillStacks,
    '3',
    prod(
      subscript(input.weapon.refineIndex, teamEmSrc, { unit: '%', fixed: 2 }),
      input.total.hp
    )
  )
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      hp_,
    },
    total: {
      eleMas: selfEleMas,
    },
    teamBuff: {
      total: {
        eleMas: teamEleMas,
      },
    },
  },
  {
    selfEleMas,
    teamEleMas,
  }
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: hp_ }],
    },
    {
      header: headerTemplate(key, st('stacks')),
      teamBuff: true,
      path: condAfterSkillStacksPath,
      value: condAfterSkillStacks,
      name: st('hitOp.skill'),
      states: Object.fromEntries(
        stacksArr.map((stack) => [
          stack,
          {
            name: st('stack', { count: stack }),
            fields: [
              {
                node: selfEleMas,
              },
              {
                text: stg('duration'),
                value: 20,
                unit: 's',
              },
            ],
          },
        ])
      ),
    },
    {
      header: headerTemplate(key, st('teamBuff')),
      canShow: equal(condAfterSkillStacks, '3', 1),
      teamBuff: true,
      fields: [
        {
          node: teamEleMas,
        },
        {
          text: stg('duration'),
          value: 20,
          unit: 's',
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
