import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Lighter'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.morale_consumed'),
        metadata: cond.morale_consumed,
        fields: [fieldForBuff(buff.core_impact_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond.morale_burst_hit'),
        metadata: cond.morale_burst_hit,
        fields: [
          fieldForBuff(buff.core_ice_resRed_),
          fieldForBuff(buff.core_fire_resRed_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.elation,
        fields: [
          fieldForBuff(buff.ability_ice_dmg_),
          fieldForBuff(buff.ability_fire_dmg_),
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('collapseCond'),
        metadata: cond.collapse,
        fields: [
          fieldForBuff(buff.m1_ice_resRed_),
          fieldForBuff(buff.m1_fire_resRed_),
        ],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('m1_finishing_move_dmg_'),
          fieldRef: buff.m1_finishing_move_dmg_.tag,
        },
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('collapseCond'),
        metadata: cond.collapse,
        fields: [fieldForBuff(buff.m2_stun_)],
      },
    },
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_elation_inc_'),
          fieldValue: dm.m2.ability_buff_inc_ * 100,
          unit: '%',
        },
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_enerRegen_)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_blazing_impact_dmg'),
          fieldRef: formula.m6_blazing_impact_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
