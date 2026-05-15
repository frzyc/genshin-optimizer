import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Alice } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Alice'
const [, ch] = trans('char', key)
const cond = Alice.conditionals
const buff = Alice.buffs
const formula = Alice.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.physical_anomaly_inflicted,
        fields: [fieldForBuff(buff.core_anom_mv_mult_)],
      },
    },
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_addl_disorder_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond2'),
        metadata: cond.assault_triggered,
        fields: [fieldForBuff(buff.core_physical_anomBuildup_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_anomProf)],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond2'),
        metadata: cond.assault_triggered,
        fields: [fieldForBuff(buff.m1_defRed_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m2_physical_anomaly_buff_),
        fieldForBuff(buff.m2_physical_anomaly_buff_),
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_physical_resIgn_),
        fieldForBuff(buff.m4_basic_anomBuildup_),
      ],
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
