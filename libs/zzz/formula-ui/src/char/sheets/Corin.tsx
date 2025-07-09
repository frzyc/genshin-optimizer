import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Corin'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  // TODO: Add missing text for some hits
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_common_dmg_'),
          fieldRef: buff.core_common_dmg_.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_common_dmg_)],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.chain_ult_hit,
        fields: [fieldForBuff(buff.m1_common_dmg_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.exSpecial_chain_ult_hits,
        fields: [fieldForBuff(buff.m2_physical_resRed_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.charge,
        fields: [
          {
            title: ch('m6_dmg'),
            fieldRef: formula.m6_dmg.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
