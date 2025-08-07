import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Yixuan'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_hpSheerForce),
        {
          title: ch('core_dmg_'),
          fieldRef: buff.core_dmg_.tag,
        },
        fieldForBuff(buff.core_exSpecial_dmg_),
        fieldForBuff(buff.core_assistFollowUp_dmg_),
        fieldForBuff(buff.core_chain_dmg_),
        fieldForBuff(buff.core_ult_dmg_),
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('ability_dmg'),
          fieldRef: formula.ability_dmg.tag,
        },
        {
          title: ch('ability_dmg_'),
          fieldRef: buff.ability_dmg_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('meditationCond'),
        metadata: cond.meditation,
        fields: [fieldForBuff(buff.ability_crit_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m1_crit_),
        {
          title: ch('m1_dmg'),
          fieldRef: formula.m1_dmg.tag,
        },
      ],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m2_ult_ether_resIgn_),
        fieldForBuff(buff.m2_exSpecial_ether_resIgn_),
        {
          title: ch('m2_dmg'),
          fieldRef: formula.m2_dmg.tag,
        },
      ],
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.tranquility,
        fields: [
          {
            title: ch('m4_dmg_'),
            fieldRef: buff.m4_dmg_.tag,
          },
        ],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_sheer_dmg_)],
    },
  ],
})

export default sheet
