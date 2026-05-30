import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Grace } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Grace'
const [, ch] = trans('char', key)
const cond = Grace.conditionals
const buff = Grace.buffs

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      Pulse: [
        {
          type: 'conditional',
          conditional: {
            label: ch('abloom'),
            metadata: cond.abloom,
            fields: [
              fieldForBuff(buff.special_ether_anom_mv_mult_),
              fieldForBuff(buff.special_electric_anom_mv_mult_),
              fieldForBuff(buff.special_fire_anom_mv_mult_),
              fieldForBuff(buff.special_physical_anom_mv_mult_),
              fieldForBuff(buff.special_ice_anom_mv_mult_),
            ],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.fullZap,
        fields: [
          fieldForBuff(buff.core_special_electric_anomBuildup_),
          fieldForBuff(buff.core_exSpecial_electric_anomBuildup_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.exSpecialHit,
        fields: [fieldForBuff(buff.ability_shock_dmg_)],
      },
    },
  ],
  potential: [
    {
      type: 'conditional',
      conditional: {
        label: ch('potentialCond'),
        metadata: cond.zapConsumed,
        fields: [fieldForBuff(buff.potential_electric_dmg_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.grenadeHit,
        fields: [
          fieldForBuff(buff.m2_electric_resRed_),
          fieldForBuff(buff.m2_electric_anomBuildupResRed_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.chargeConsumed,
        fields: [fieldForBuff(buff.m4_enerRegen_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.fullZap,
        fields: [
          fieldForBuff(buff.m6_special_mv_mult_),
          fieldForBuff(buff.m6_exSpecial_mv_mult_),
        ],
      },
    },
  ],
})

export default sheet
