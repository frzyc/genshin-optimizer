import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Grace'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.fullZap,
        fields: [
          fieldForBuff(buff.core_special_electric_anomBuildup_),
          fieldForBuff(buff.core_exSpecial_electric_anomBuildup_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.exSpecialHit,
        fields: [fieldForBuff(buff.ability_shock_dmg_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.grenadeHit,
        fields: [
          fieldForBuff(buff.m2_electric_resRed_),
          fieldForBuff(buff.m2_electric_anomBuildupResRed_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.chargeConsumed,
        fields: [fieldForBuff(buff.m4_enerRegen_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.fullZap,
        fields: [
          fieldForBuff(buff.m6_special_mv_mult_),
          fieldForBuff(buff.m6_exSpecial_mv_mult_),
        ],
      },
    },
  ],
})

export default sheet
