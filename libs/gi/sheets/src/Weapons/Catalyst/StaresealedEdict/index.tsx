import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  equal,
  inferInfoMut,
  input,
  lookup,
  mergeData,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'StarsealedEdict'

const critDMG_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const eleMasArr = [-1, 48, 60, 72, 84, 96]
const eleMasStackArr = [-1, 24, 30, 36, 42, 48]
const critDMGRadiance_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const critDMG_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, critDMG_arr)
)

const [condSkillPath, condSkill] = cond(key, 'skill')
const eleMas = equal(
  condSkill,
  'on',
  subscript(input.weapon.refinement, eleMasArr)
)

const [condStacksPath, condStacks] = cond(key, 'stacks')
const stacksArr = range(1, 3)
const stacks = lookup(
  condStacks,
  objKeyMap(stacksArr, (stack) => constant(stack)),
  naught
)
const eleMasStack = equal(
  condSkill,
  'on',
  prod(stacks, subscript(input.weapon.refinement, eleMasStackArr))
)
const critDMG_stack = equal(
  condSkill,
  'on',
  equal(
    input.flags.radiance,
    'sc',
    prod(stacks, subscript(input.weapon.refinement, critDMGRadiance_arr))
  )
)

const data = dataObjForWeaponSheet(
  key,
  mergeData([
    inferInfoMut({
      premod: {
        critDMG_,
        eleMas,
      },
    }),
    inferInfoMut({
      premod: {
        eleMas: eleMasStack,
        critDMG_: critDMG_stack,
      },
    }),
  ])
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: critDMG_,
        },
      ],
    },
    {
      value: condSkill,
      path: condSkillPath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: eleMas,
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
    {
      value: condStacks,
      path: condStacksPath,
      header: headerTemplate(key, st('stacks')),
      name: st('elementalReaction.team.any'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: eleMasStack,
          },
          {
            node: critDMG_stack,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
