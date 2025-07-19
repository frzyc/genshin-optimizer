import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Burnice'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_afterburn_dmg'),
          fieldRef: formula.core_afterburn_dmg.tag,
        },
        {
          title: ch('core_afterburn_anomBuildup'),
          fieldRef: formula.core_afterburn_anomBuildup.tag,
        },

        {
          title: ch('core_afterburn_dmg_'),
          fieldRef: buff.core_afterburn_dmg_.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_fire_anomBuildup_)],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        // Not sure about this one
        {
          title: ch('m1_afterburn_mv_mult'),
          fieldValue: dm.m1.afterburn_dmg * 100,
          unit: '%',
        },
        {
          title: ch('m1_afterburn_anomBuildup'),
          fieldRef: buff.m1_afterburn_fire_anomBuildup_.tag,
        },
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.thermal_penetration,
        fields: [fieldForBuff(buff.m2_pen_)],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_exSpecial_crit_'),
          fieldRef: buff.m4_exSpecial_crit_.tag,
        },
        {
          title: ch('m4_assistSkill_crit_'),
          fieldRef: buff.m4_assistSkill_crit_.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_additional_afterburn_dmg'),
          fieldRef: formula.m6_additional_afterburn_dmg.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.exSpecial_active,
        fields: [
          fieldForBuff(buff.m6_burn_fire_resIgn_),
          {
            title: ch('m6_fire_resIgn'),
            fieldRef: buff.m6_fire_resIgn_.tag,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6CondBurn'),
        metadata: cond.additional_burn,
        fields: [fieldForBuff(buff.m6_fire_anom_mv_mult_)],
      },
    },
  ],
})

export default sheet
