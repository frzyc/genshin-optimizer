import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Claret } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Claret'
const [, ch] = trans('char', key)
const cond = Claret.conditionals
const buff = Claret.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_initial_crit_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('crimsonInscription'),
        metadata: cond.crimsonInscription,
        fields: [fieldForBuff(buff.core_crit_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('perfectDodge'),
        metadata: cond.perfectDodge,
        fields: [fieldForBuff(buff.core_basic_dmg_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('remnantEdge'),
        metadata: cond.remnantEdge,
        fields: [fieldForBuff(buff.ability_laceration_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_maim_mult_)],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('crimsonInscription'),
        metadata: cond.crimsonInscription,
        fields: [fieldForBuff(buff.m2_electric_resIgn_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_basic_dmg_),
        fieldForBuff(buff.m4_chain_dmg_),
        fieldForBuff(buff.m4_ult_dmg_),
      ],
    },
  ],
})

export default sheet
