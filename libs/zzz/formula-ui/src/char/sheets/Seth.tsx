import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Seth'
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
          title: ch('core_shield'),
          fieldRef: formula.core_shield.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.shield_active,
        fields: [fieldForBuff(buff.core_anomProf)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.chain_finish_hit,
        fields: [fieldForBuff(buff.ability_anomBuildupRes_)],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m1_shield_'),
          fieldValue: dm.m1.shield_ * 100,
          unit: '%',
        },
      ],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m2_basic_electric_anomBuildup_)],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m4_defensiveAssist_dazeInc_)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_dmg'),
          fieldRef: formula.m6_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
