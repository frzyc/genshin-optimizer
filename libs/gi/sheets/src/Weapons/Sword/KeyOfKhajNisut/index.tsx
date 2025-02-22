import { range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  equalStr,
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'KeyOfKhajNisut'

const selfEmSrc = [-1, 0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const teamEmSrc = [-1, 0.002, 0.0025, 0.003, 0.0035, 0.004]
const stacksArr = range(1, 3)
const hp_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const hp_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, hp_arr, { unit: '%' })
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
          subscript(input.weapon.refinement, selfEmSrc, {
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

const nonstackWrite = equalStr(condAfterSkillStacks, '3', input.charKey)
const [teamEleMas, teamEleMasInactive] = nonStackBuff(
  'key',
  'eleMas',
  prod(
    subscript(input.weapon.refinement, teamEmSrc, { unit: '%', fixed: 2 }),
    input.total.hp
  )
)

const data = dataObjForWeaponSheet(
  key,
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
      nonStacking: {
        key: nonstackWrite,
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
          node: teamEleMasInactive,
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
export default new WeaponSheet(sheet, data)
