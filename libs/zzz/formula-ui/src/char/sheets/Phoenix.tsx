import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Phoenix } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Phoenix'
const [, ch] = trans('char', key)
const cond = Phoenix.conditionals
const buff = Phoenix.buffs
const formula = Phoenix.formulas

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      BasicAttackPurifyingFlame: [
        {
          type: 'conditional',
          conditional: {
            label: ch('basicAbloom'),
            metadata: cond.basicAbloom,
            fields: [
              fieldForBuff(buff.basic_abloom_anom_mv_mult_),
              fieldForBuff(buff.basic_abloom_anom_crit_dmg_),
            ],
          },
        },
      ],
    },
    chain: {
      SoulSearchingBlaze: [
        {
          type: 'conditional',
          conditional: {
            label: ch('ultAbloom'),
            metadata: cond.ultAbloom,
            fields: [
              fieldForBuff(buff.ult_abloom_anom_mv_mult_),
              fieldForBuff(buff.ult_abloom_anom_crit_dmg_),
            ],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_anomProf)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('sear'),
        metadata: cond.sear,
        fields: [
          fieldForBuff(buff.core_anom_crit_),
          fieldForBuff(buff.core_anom_crit_dmg_),
        ],
      },
    },
    {
      type: 'fields',
      fields: [{ title: st('dmg'), fieldRef: formula.core_dmg.tag }],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('sear'),
        metadata: cond.sear,
        fields: [fieldForBuff(buff.ability_anom_crit_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('sear'),
        metadata: cond.sear,
        fields: [fieldForBuff(buff.m1_anom_crit_dmg_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('sear'),
        metadata: cond.sear,
        fields: [fieldForBuff(buff.m2_common_dmg_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Abloom'),
        metadata: cond.m4Abloom,
        fields: [fieldForBuff(buff.m4_abloom_anom_mv_mult_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m6_resIgn_),
        fieldForBuff(buff.m6_abloom_defIgn_),
      ],
    },
  ],
})

export default sheet
