import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Koleda'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_exSpecial_dazeInc_),
        {
          title: ch('core_dazeInc_'),
          fieldRef: buff.core_dazeInc_.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.exSpecial_debuff,
        fields: [fieldForBuff(buff.ability_chain_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.quick_use,
        fields: [
          fieldForBuff(buff.m1_special_dazeInc_),
          fieldForBuff(buff.m1_exSpecial_dazeInc_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.charge,
        fields: [
          fieldForBuff(buff.m4_chain_dmg_),
          fieldForBuff(buff.m4_ult_dmg_),
        ],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_dmg'),
          fieldRef: formula.m6_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
