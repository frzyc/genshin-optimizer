import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Lycaon'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_dazeInc_'),
          fieldRef: buff.core_dazeInc_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.exSpecial_assistFollowUp_hit,
        fields: [fieldForBuff(buff.core_ice_resRed_)],
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
          title: ch('m4_shield'),
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
