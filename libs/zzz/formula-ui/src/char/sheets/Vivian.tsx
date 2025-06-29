import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Vivian'
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [, ch] = trans('char', key)
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cond = conditionals[key]
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreAbloom'),
        metadata: cond.abloom,
        fields: [
          fieldForBuff(buff.core_ether_abloom),
          fieldForBuff(buff.core_electric_abloom),
          fieldForBuff(buff.core_fire_abloom),
          fieldForBuff(buff.core_physical_abloom),
          fieldForBuff(buff.core_ice_abloom),
        ],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_prophecy_dmg'),
          fieldRef: formula.core_prophecy_dmg.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_corruption_dmg_),
        fieldForBuff(buff.ability_corruption_disorder_dmg_),
      ],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('prophecyCond'),
        metadata: cond.prophecy,
        fields: [
          fieldForBuff(buff.m1_anomaly_dmg_),
          fieldForBuff(buff.m1_disorder_dmg_),
        ],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_ether_anomBuildup_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreAbloom'),
        metadata: cond.abloom,
        fields: [
          fieldForBuff(buff.m2_anom_mv_mult_),
          fieldForBuff(buff.m2_resIgn_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_crit_'),
          fieldRef: buff.m4_crit_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.fluttering_featherbloom_used,
        fields: [fieldForBuff(buff.m4_atk_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_ether_dmg_)],
    },
  ],
})

export default sheet
