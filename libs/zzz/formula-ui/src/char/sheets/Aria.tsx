import {
  allAttributeAnomalyKeys,
  type CharacterKey,
} from '@genshin-optimizer/zzz/consts'
import { Aria } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Aria'
const [, ch] = trans('char', key)
const cond = Aria.conditionals
const buff = Aria.buffs

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    chain: {
      Ultimate100Energy: [
        {
          type: 'conditional',
          conditional: {
            label: ch('ult_etherVeil'),
            metadata: cond.etherVeil,
            fields: [fieldForBuff(buff.ult_atk)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_anomProf)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('abloom'),
        metadata: cond.abloom,
        fields: allAttributeAnomalyKeys.map((attr) =>
          fieldForBuff(buff[`core_${attr}_anom_mv_mult_`])
        ),
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m1_basic_ether_anomBuildupResIgn_),
        fieldForBuff(buff.m1_special_ether_anomBuildupResIgn_),
        fieldForBuff(buff.m1_exSpecial_ether_anomBuildupResIgn_),
        fieldForBuff(buff.m1_abloom_anom_crit_),
        fieldForBuff(buff.m1_abloom_anom_crit_dmg_),
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('momentOfDelusion'),
        metadata: cond.momentOfDelusion,
        fields: [fieldForBuff(buff.m2_defIgn_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('momentOfDelusion'),
        metadata: cond.momentOfDelusion,
        fields: [
          fieldForBuff(buff.m6_basic_ether_dmg_),
          fieldForBuff(buff.m6_ult_ether_dmg_),
        ],
      },
    },
  ],
})

export default sheet
