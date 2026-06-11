import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Miyabi } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Miyabi'
const [, ch] = trans('char', key)
const cond = Miyabi.conditionals
const buff = Miyabi.buffs
const formula = Miyabi.formulas

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    chain: {
      UltimateLingeringSnow: [
        {
          type: 'conditional',
          conditional: {
            label: st('uponLaunch.1', { val1: '$t(skills.ult)' }),
            metadata: cond.ult_used,
            fields: [fieldForBuff(buff.ult_ice_dmg_)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreIcefireCond'),
        metadata: cond.icefire,
        fields: [fieldForBuff(buff.core_frost_anomBuildup_)],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_frostburnBreak_dmg'),
          fieldRef: formula.core_frostburnBreak_dmg.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreFrostburnCond'),
        metadata: cond.frostburn,
        fields: [fieldForBuff(buff.core_anomBuildup_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('ability_dmg_'),
          fieldRef: buff.ability_dmg_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.disorder_triggered,
        fields: [
          {
            title: ch('ability_ice_resIgn_'),
            fieldRef: buff.ability_ice_resIgn_.tag,
          },
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.fallen_frost,
        fields: [
          {
            title: ch('m1_defIgn_'),
            fieldRef: buff.m1_defIgn_.tag,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond2'),
        metadata: cond.level_3_charge_hit,
        fields: [fieldForBuff(buff.m1_anomBuildup_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_dmg_'),
          fieldRef: buff.m2_dmg_.tag,
        },
        fieldForBuff(buff.m2_dodgeCounter_dmg_),
        fieldForBuff(buff.m2_crit_),
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_frostburnBreak_dmg_'),
          fieldRef: buff.m4_frostburnBreak_dmg_.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.polar,
        fields: [
          {
            title: ch('m6_dmg_'),
            fieldRef: buff.m6_dmg_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
