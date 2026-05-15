import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Hugo } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Hugo'
const [, ch] = trans('char', key)
const cond = Hugo.conditionals
const buff = Hugo.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreDarkAbyssReverb'),
        metadata: cond.dark_abyss_reverb,
        fields: [
          fieldForBuff(buff.core_crit_),
          fieldForBuff(buff.core_crit_dmg_),
        ],
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_atk)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreStunLeft'),
        metadata: cond.stun_left,
        fields: [
          fieldForBuff(buff.core_exSpecial_mv_mult_),
          fieldForBuff(buff.core_ult_mv_mult_),
        ],
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_exSpecial_dazeInc_)],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.normal_enemy,
        fields: [fieldForBuff(buff.ability_chain_dmg_)],
      },
    },
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_exSpecial_dmg_),
        fieldForBuff(buff.ability_ult_dmg_),
      ],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreDarkAbyssReverb'),
        metadata: cond.dark_abyss_reverb,
        fields: [
          fieldForBuff(buff.m1_exSpecial_crit_),
          fieldForBuff(buff.m1_exSpecial_crit_dmg_),
          fieldForBuff(buff.m1_ult_crit_),
          fieldForBuff(buff.m1_ult_crit_dmg_),
        ],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m2_exSpecial_defIgn_),
        fieldForBuff(buff.m2_ult_defIgn_),
      ],
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.charged_shot_hit,
        fields: [fieldForBuff(buff.m4_ice_resIgn_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m6_exSpecial_dmg_),
        fieldForBuff(buff.m6_ult_dmg_),
        fieldForBuff(buff.m6_exSpecial_mv_mult_),
      ],
    },
  ],
})

export default sheet
