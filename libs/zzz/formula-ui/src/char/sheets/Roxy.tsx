import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { anomalyMeta, Roxy } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Roxy'
const [, ch] = trans('char', key)
const cond = Roxy.conditionals
const buff = Roxy.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_atk), fieldForBuff(buff.core_impact)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('contamination'),
        metadata: cond.contamination,
        fields: [
          fieldForBuff(buff.core_crit_dmg_),
          fieldForBuff(buff.core_laceration_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_common_dmg_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('enemyHit'),
        metadata: cond.enemyHit,
        fields: [fieldForBuff(buff.ability_stun_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('windswept'),
        metadata: anomalyMeta.conditionals.windswept,
        fields: [fieldForBuff(buff.ability_direct_dmg_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.exSpecialUsed,
        fields: [fieldForBuff(buff.ability_anomBuildup_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('kindlyHits'),
        metadata: cond.kindlyHits,
        fields: [fieldForBuff(buff.m1_resRed_)],
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_crit_dmg_)],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_exSpecial_dazeInc_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('chillHits'),
        metadata: cond.chillHits,
        fields: [fieldForBuff(buff.m2_stun_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_ult_dmg_),
        fieldForBuff(buff.m4_ult_dazeInc_),
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m6_wind_resIgn_),
        fieldForBuff(buff.m6_special_mv_mult_),
        fieldForBuff(buff.m6_special_dazeInc_),
      ],
    },
  ],
})

export default sheet
