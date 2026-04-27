import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Lycaon } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Lycaon'
const [, ch] = trans('char', key)
const cond = Lycaon.conditionals
const buff = Lycaon.buffs
const formula = Lycaon.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_basic_dazeInc_),
        fieldForBuff(buff.core_dodgeCounter_dazeInc_),
        fieldForBuff(buff.core_dash_dazeInc_),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.exSpecial_assistFollowUp_hit,
        fields: [
          fieldForBuff(buff.core_ice_resRed_),
          fieldForBuff(buff.core_ether_resRed_),
          fieldForBuff(buff.core_electric_resRed_),
          fieldForBuff(buff.core_fire_resRed_),
          fieldForBuff(buff.core_physical_resRed_),
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('durationLeft'),
        metadata: cond.durationLeft,
        fields: [fieldForBuff(buff.core_assistFollowUp_dazeInc_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.stunned_enemy_hit,
        fields: [fieldForBuff(buff.ability_stun_)],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m1_dazeInc_'),
          fieldRef: buff.m1_dazeInc_.tag,
        },
        {
          title: ch('m1_fullCharge_dazeInc_'),
          fieldRef: buff.m1_fullCharge_dazeInc_.tag,
        },
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: st('shield'),
          fieldRef: formula.m4_shield.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.charged_hits,
        fields: [fieldForBuff(buff.m6_common_dmg_)],
      },
    },
  ],
})

export default sheet
