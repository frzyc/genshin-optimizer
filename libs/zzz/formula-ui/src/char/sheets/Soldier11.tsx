import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Soldier11'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

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
        label: ch('m6Cond'),
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
