import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Ben'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      SpecialAttackFiscalFist: [
        {
          type: 'fields',
          fields: [
            {
              title: st('shield'),
              fieldRef: formula.special_shield.tag,
            },
          ],
        },
      ],
      EXSpecialAttackCashflowCounter: [
        {
          type: 'fields',
          fields: [
            {
              title: st('shield'),
              fieldRef: formula.special_shield.tag,
            },
          ],
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_atk),
        {
          title: st('shield'),
          fieldRef: formula.core_shield.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.shieldOn,
        fields: [fieldForBuff(buff.ability_crit_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.enemyBlocked,
        fields: [fieldForBuff(buff.m1_dmg_red_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.m2_dmg.tag,
        },
      ],
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.enemyBlocked,
        fields: [
          {
            title: ch('m4_dmg_'),
            fieldRef: buff.m4_dmg_.tag,
          },
        ],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.attackLaunched,
        fields: [
          fieldForBuff(buff.m6_basic_dazeInc_),
          fieldForBuff(buff.m6_dash_dazeInc_),
          fieldForBuff(buff.m6_dodgeCounter_dazeInc_),
        ],
      },
    },
  ],
})

export default sheet
