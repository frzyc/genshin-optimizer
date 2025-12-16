import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Dialyn } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Dialyn'
const [, ch] = trans('char', key)
const cond = Dialyn.conditionals
const buff = Dialyn.buffs
const formula = Dialyn.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_impact)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('maliciousComplaint'),
        metadata: cond.malicious_complaint,
        fields: [fieldForBuff(buff.core_stun_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.ability_exSpecial_crit_dmg_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('overwhelminglyPositive'),
        metadata: cond.overwhelmingly_positive,
        fields: [fieldForBuff(buff.ability_common_dmg_)],
      },
    },
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_attack_dmg),
        fieldForBuff(buff.ability_rupture_dmg),
      ],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('overwhelminglyPositive'),
        metadata: cond.overwhelmingly_positive,
        fields: [fieldForBuff(buff.m1_resIgn_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('maliciousComplaint'),
        metadata: cond.malicious_complaint,
        fields: [
          fieldForBuff(buff.m2_stun_),
          fieldForBuff(buff.m2_common_dmg_),
        ],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('overwhelminglyPositive'),
        metadata: cond.overwhelmingly_positive,
        fields: [fieldForBuff(buff.m4_atk)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [{ title: st('dmg'), fieldRef: formula.m6_dmg.tag }],
    },
  ],
})

export default sheet
