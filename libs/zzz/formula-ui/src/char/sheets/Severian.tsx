import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Severian } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Severian'
const [, ch] = trans('char', key)
const cond = Severian.conditionals
const buff = Severian.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_crit_dmg_),
        fieldForBuff(buff.core_common_dmg_),
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_atk)],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_wind_resIgn_)],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('dodgeBasic'),
        metadata: cond.dodgeBasic,
        fields: [fieldForBuff(buff.m2_pen_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('inCombat'),
        metadata: cond.inCombat,
        fields: [fieldForBuff(buff.m4_atk_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_basic_addlMult_)],
    },
  ],
})

export default sheet
