import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Trigger'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.aftershock_hit,
        fields: [fieldForBuff(buff.core_stun_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('ability_dazeInc_'),
          fieldRef: buff.ability_aftershock_dazeInc_.tag,
        },
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_stun_)],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.hunters_gaze,
        fields: [fieldForBuff(buff.m2_crit_dmg_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_disconnect_dmg'),
          fieldRef: formula.m4_disconnect_dmg.tag,
        },
        {
          title: ch('m4_disconnect_daze'),
          fieldRef: formula.m4_disconnect_daze.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_armor_break_rounds_dmg'),
          fieldRef: formula.m6_armor_break_rounds_dmg.tag,
        },
        {
          title: ch('m6_armor_break_rounds_dmg_'),
          fieldRef: buff.m6_armor_break_rounds_dmg_.tag,
        },
      ],
    },
  ],
})

export default sheet
