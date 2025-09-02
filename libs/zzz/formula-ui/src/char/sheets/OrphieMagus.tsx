import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'OrphieMagus'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_crit_),
        fieldForBuff(buff.core_aftershock_dmg_),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.zeroedIn,
        fields: [fieldForBuff(buff.core_atk)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.zeroedIn,
        fields: [fieldForBuff(buff.ability_aftershock_defIgn_)],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_fire_resIgn_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.zeroedIn,
        fields: [fieldForBuff(buff.m1_common_dmg_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.ultUsed,
        fields: [fieldForBuff(buff.m2_atk_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_common_dmg_)],
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
