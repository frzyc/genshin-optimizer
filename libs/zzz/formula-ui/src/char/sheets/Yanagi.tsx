import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Yanagi'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

// TODO: check basic attack and ex special text
// TODO: limit m2 cond to 2 stacks
const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      BasicAttackTsukuyomiKagura: [
        {
          type: 'conditional',
          conditional: {
            label: ch('jougenCond'),
            metadata: cond.jougen,
            fields: [fieldForBuff(buff.basic_electric_dmg_)],
          },
        },
        {
          type: 'conditional',
          conditional: {
            label: ch('kagenCond'),
            metadata: cond.kagen,
            fields: [fieldForBuff(buff.basic_pen_)],
          },
        },
      ],
    },
    special: {
      EXSpecialAttackGekkaRuten: [
        {
          type: 'conditional',
          conditional: {
            label: ch('polarityDisorderCond'),
            metadata: cond.exSpecial_polarity_disorder,
            fields: [
              fieldForBuff(buff.exSpecial_anom_base_),
              fieldForBuff(buff.exSpecial_anom_flat_dmg),
            ],
          },
        },
        {
          type: 'conditional',
          conditional: {
            label: ch('m2Cond'),
            metadata: cond.thrusts,
          },
        },
      ],
    },
    chain: {
      ChainAttackCelestialHarmony: [
        {
          type: 'conditional',
          conditional: {
            label: ch('polarityDisorderCond'),
            metadata: cond.chain_polarity_disorder,
            fields: [
              fieldForBuff(buff.chain_anom_base_),
              fieldForBuff(buff.chain_anom_flat_dmg),
            ],
          },
        },
        {
          type: 'conditional',
          conditional: {
            label: ch('m2Cond'),
            metadata: cond.thrusts,
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.exSpecial_used,
        fields: [
          fieldForBuff(buff.core_add_disorder_),
          fieldForBuff(buff.core_electric_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.basic)' }),
        metadata: cond.basic_hit,
        fields: [fieldForBuff(buff.ability_electric_anomBuildup_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.clarity,
        fields: [fieldForBuff(buff.m1_anomProf)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_electric_anomBuildup_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.thrusts,
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.exposed,
        fields: [fieldForBuff(buff.m4_pen_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.shinrabanshou,
        fields: [fieldForBuff(buff.m6_exSpecial_dmg_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.thrusts,
      },
    },
  ],
})

export default sheet
