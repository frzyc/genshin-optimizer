import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Lucy'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      CheerOn: [
        {
          type: 'conditional',
          conditional: {
            label: ch('cheerOnCond'),
            metadata: cond.cheerOn,
            fields: [fieldForBuff(buff.exSpecial_atk)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('cheerOnCond'),
        metadata: cond.cheerOn,
        fields: [fieldForBuff(buff.core_atk)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_crit_),
        fieldForBuff(buff.ability_crit_dmg_),
      ],
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('cheerOnCond'),
        metadata: cond.cheerOn,
        fields: [fieldForBuff(buff.m4_crit_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.m6_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
