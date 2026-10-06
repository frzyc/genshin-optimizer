import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  equal,
  infoMut,
  input,
  lookup,
  max,
  min,
  naught,
  percent,
  prod,
  subscript,
  sum,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'HymnOfTheMaelstrom'
const [, trm] = trans('weapon', key)

const heal_arr = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]
const hp_arr = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]
const atk_arr = [-1, 0.004, 0.005, 0.006, 0.007, 0.008]
const maxAtk_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const stacksArr = range(1, 3)

const heal_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, heal_arr)
)

const [condStacksPath, condStacks] = cond(key, 'stacks')
const [condFrozenSwirlPath, condFrozenSwirl] = cond(key, 'frozenSwirl')
const stacks = lookup(
  condStacks,
  objKeyMap(stacksArr, (s) => constant(s)),
  naught
)
const hp_base = prod(
  stacks,
  subscript(input.weapon.refinement, hp_arr, { unit: '%' })
)
const atk_baseDisp = prod(
  stacks,
  min(
    max(
      prod(
        subscript(input.weapon.refinement, atk_arr, { unit: '%' }),
        sum(input.premod.hp, -40000),
        1 / 1000
      ),
      0
    ),
    subscript(input.weapon.refinement, maxAtk_arr, { unit: '%' })
  )
)
const atk_base = equal(input.activeCharKey, target.charKey, atk_baseDisp)
const hp_more = equal(condFrozenSwirl, 'on', prod(percent(0.75), hp_base))
const atk_moreDisp = equal(
  condFrozenSwirl,
  'on',
  prod(percent(0.75), atk_baseDisp)
)
const atk_more = equal(input.activeCharKey, target.charKey, atk_moreDisp)

const data = dataObjForWeaponSheet(key, {
  premod: {
    heal_,
    hp_: sum(hp_base, hp_more),
  },
  teamBuff: {
    premod: {
      atk_: sum(atk_base, atk_more),
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: heal_,
        },
      ],
    },
    {
      value: condStacks,
      path: condStacksPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: st('afterPerformHeal'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: infoMut(hp_base, { path: 'hp_' }),
          },
          {
            node: infoMut(atk_baseDisp, { path: 'atk_', isTeamBuff: true }),
          },
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
        ],
      })),
    },
    {
      value: condFrozenSwirl,
      path: condFrozenSwirlPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('frozenSwirlCond'),
      canShow: unequal(condStacks, undefined, 1),
      states: {
        on: {
          fields: [
            {
              node: infoMut(hp_more, { path: 'hp_' }),
            },
            {
              node: infoMut(atk_moreDisp, { path: 'atk_', isTeamBuff: true }),
            },
            {
              text: stg('duration'),
              value: 5,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
