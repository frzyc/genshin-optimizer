import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Pulchra'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.hunters_gait,
        fields: [fieldForBuff(buff.core_dazeInc_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.binding_trap,
        fields: [fieldForBuff(buff.ability_aftershock_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.binding_trap,
        fields: [fieldForBuff(buff.m1_crit_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.hunters_gait,
        fields: [fieldForBuff(buff.m2_atk_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_special_dmg_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.binding_trap,
        fields: [fieldForBuff(buff.m6_common_dmg_)],
      },
    },
  ],
})

export default sheet
