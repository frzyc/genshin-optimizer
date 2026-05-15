import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Evelyn } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Evelyn'
const [, ch] = trans('char', key)
const cond = Evelyn.conditionals
const buff = Evelyn.buffs
const formula = Evelyn.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.binding_seal,
        fields: [fieldForBuff(buff.core_crit_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('ability_dmg_'),
          fieldRef: buff.ability_chain_ult_dmg_.tag,
        },
        {
          title: ch('ability_mv_mult'),
          fieldRef: buff.ability_chainSkill_mv_mult.tag,
        },
      ],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.enemy_bound,
        fields: [fieldForBuff(buff.m1_defIgn_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_atk_)],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_shield'),
          fieldRef: formula.m4_shield.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.m4_shield_exists,
        fields: [fieldForBuff(buff.m4_crit_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_follow_up_dmg'),
          fieldRef: formula.m6_follow_up_dmg_.tag,
        },
      ],
    },
  ],
})

export default sheet
