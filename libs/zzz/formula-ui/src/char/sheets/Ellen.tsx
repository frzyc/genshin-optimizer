import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Ellen'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_basic_crit_dmg_),
        fieldForBuff(buff.core_dash_crit_dmg_),
        fieldForBuff(buff.core_chain_crit_dmg_),
        fieldForBuff(buff.core_ult_crit_dmg_),
      ],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.ice_attacks,
        fields: [fieldForBuff(buff.ability_ice_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.flash_freeze_consumed,
        fields: [fieldForBuff(buff.m1_crit_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.flash_freeze,
        fields: [fieldForBuff(buff.m2_exSpecial_crit_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.exSpecial_chain_quickCharge,
        fields: [fieldForBuff(buff.m6_pen_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond2'),
        metadata: cond.feast_begins,
        fields: [fieldForBuff(buff.m6_dash_mv_mult_)],
      },
    },
  ],
})

export default sheet
