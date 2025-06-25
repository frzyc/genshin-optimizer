import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Qingyi'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    basic: {
      BasicAttackEnchantedMoonlitBlossoms: [
        {
          type: 'conditional',
          conditional: {
            label: ch('flashConnectCond'),
            metadata: cond.flash_connect_consumed,
            fields: [
              fieldForBuff(buff.flash_connect_dmg_),
              fieldForBuff(buff.flash_connect_dazeInc_),
            ],
          },
        },
      ],
    },
    chain: {
      ChainAttackTranquilSerenade: [
        {
          type: 'fields',
          fields: [fieldForBuff(buff.chain_dmg_)],
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('subjugationCond'),
        metadata: cond.subjugation,
        fields: [fieldForBuff(buff.core_stun_)],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_basic_dazeInc_),
        fieldForBuff(buff.ability_atk),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m1_defRed_), fieldForBuff(buff.m1_crit_)],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_stun_'),
          fieldValue: dm.m2.stun_mult_ * 100,
          unit: '%',
        },
        fieldForBuff(buff.m2_dazeInc_),
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_shield'),
          fieldRef: formula.m4_shield.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.m6_crit_dmg_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.moonlit_blossoms_hit,
        fields: [fieldForBuff(buff.m6_resRed_)],
      },
    },
  ],
})

export default sheet
