import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Seed'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.onslaught'),
        metadata: cond.onslaught,
        fields: [
          fieldForBuff(buff.core_atk),
          fieldForBuff(buff.core_crit_dmg_),
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.directStrike'),
        metadata: cond.directStrike,
        fields: [
          fieldForBuff(buff.core_vanguard_atk),
          fieldForBuff(buff.core_vanguard_crit_dmg_),
        ],
        targeted: true,
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_dmg_)],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_basic_dmg_),
        fieldForBuff(buff.ability_basic_electric_resIgn_),
        fieldForBuff(buff.ability_ult_dmg_),
        fieldForBuff(buff.ability_ult_electric_resIgn_),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_basic_crit_dmg_)],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.onslaught'),
        metadata: cond.onslaught,
        fields: [fieldForBuff(buff.m2_defIgn_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.directStrike'),
        metadata: cond.directStrike,
        fields: [fieldForBuff(buff.m2_vanguard_defIgn_)],
        targeted: true,
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.energy_consumed,
        fields: [fieldForBuff(buff.m2_basic_dmg_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.onslaught'),
        metadata: cond.onslaught,
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.directStrike'),
        metadata: cond.directStrike,
        targeted: true,
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_ult_dmg_)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m6_crit_dmg_),
        {
          title: st('dmg'),
          fieldRef: formula.m6_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
