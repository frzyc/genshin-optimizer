import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Banyue } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Banyue'
const [, ch] = trans('char', key)
const cond = Banyue.conditionals
const buff = Banyue.buffs
const formula = Banyue.formulas
const dm = mappedStats.char[key]

const coreCondText = st('uponLaunch.2', {
  val1: '$t(skills.exSpecial)',
  val2: '$t(skills.assistFollowUp)',
})

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_hpSheerForce)],
    },
    {
      type: 'conditional',
      conditional: {
        label: coreCondText,
        metadata: cond.exSpecialBasicUsed,
        fields: [
          fieldForBuff(buff.core_sheerForce),
          fieldForBuff(buff.core_fire_dmg_),
          fieldForBuff(buff.core_crit_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.vidyaraja,
        fields: [fieldForBuff(buff.ability_fire_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.tremor,
        fields: [
          fieldForBuff(buff.m1_fire_resRed_),
          fieldForBuff(buff.m1_exSpecial_sheer_dmg_),
          fieldForBuff(buff.m1_basic_sheer_dmg_),
        ],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: coreCondText,
        metadata: cond.exSpecialBasicUsed,
        fields: [
          fieldForBuff(buff.m2_fire_dmg_),
          fieldForBuff(buff.m2_crit_dmg_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_exSpecial_dmg_),
        fieldForBuff(buff.m4_basic_dmg_),
      ],
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.vidyaraja,
        fields: [
          {
            title: ch('m6Bonus'),
            fieldValue: dm.m6.fire_dmg_ * 100,
            unit: '%',
          },
        ],
      },
    },
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
