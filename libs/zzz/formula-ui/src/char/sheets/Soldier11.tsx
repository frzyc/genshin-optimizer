import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Soldier11 } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Soldier11'
const [, ch] = trans('char', key)
const cond = Soldier11.conditionals
const buff = Soldier11.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_common_dmg_'),
          fieldRef: buff.core_common_dmg_.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_fire_dmg_)],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.m2_stacks,
        fields: [
          {
            title: ch('m2_common_dmg_'),
            fieldRef: buff.m2_common_dmg_.tag,
          },
          fieldForBuff(buff.m2_dodgeCounter_dmg_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.fireSuppression_triggered,
        fields: [fieldForBuff(buff.m4_dmg_red_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond2'),
        metadata: cond.fireSuppression_4th_hit,
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.3', {
          val1: '$t(skills.exSpecial)',
          val2: '$t(skills.chain)',
          val3: '$t(skills.ult)',
        }),
        metadata: cond.charge_consumed,
        fields: [
          {
            title: ch('m6_fire_resIgn_'),
            fieldRef: buff.m6_fire_resIgn_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
