import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { JuFufu } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'JuFufu'
const [, ch] = trans('char', key)
const cond = JuFufu.conditionals
const buff = JuFufu.buffs
const formula = JuFufu.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.tigers_roar,
        fields: [
          fieldForBuff(buff.core_crit_dmg_),
          fieldForBuff(buff.core_chain_dmg_),
          fieldForBuff(buff.core_ult_dmg_),
          fieldForBuff(buff.core_impact),
        ],
      },
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_crit_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.chain)' }),
        metadata: cond.chain_hit,
        fields: [fieldForBuff(buff.m1_stun_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.tigers_roar,
        fields: [fieldForBuff(buff.m2_crit_dmg_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.tigers_roar,
        fields: [fieldForBuff(buff.m4_crit_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m6_chain_dmg_),
        {
          title: st('dmg'),
          fieldRef: formula.m6_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
