import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Anton } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Anton'
const [, ch] = trans('char', key)
const cond = Anton.conditionals
const buff = Anton.buffs
const formula = Anton.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_piledriver_dmg_'),
          fieldRef: buff.core_piledriver_dmg_.tag,
        },
        {
          title: ch('core_drill_dmg_'),
          fieldRef: buff.core_drill_dmg_.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.burst_mode,
        fields: [fieldForBuff(buff.ability_electric_anom_mv_mult_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: st('shield'),
          fieldRef: formula.m2_shield.tag,
        },
      ],
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.2', {
          val1: '$t(skills.chain)',
          val2: '$t(skills.ult)',
        }),
        metadata: cond.chain_ult_used,
        fields: [fieldForBuff(buff.m4_crit_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.piledriver_crits,
        fields: [
          {
            title: ch('m6_dmg_'),
            fieldRef: buff.m6_dmg_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
