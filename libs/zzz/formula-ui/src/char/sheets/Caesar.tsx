import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Caesar } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Caesar'
const [, ch] = trans('char', key)
const cond = Caesar.conditionals
const buff = Caesar.buffs
const formula = Caesar.formulas
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      StanceSwitch: [
        {
          type: 'conditional',
          conditional: {
            label: ch('stanceSwitchCond'),
            metadata: cond.stance_switch,
            fields: [fieldForBuff(buff.stance_switch_impact_)],
          },
        },
      ],
    },
    chain: {
      UltimateSavageSmash: [
        {
          type: 'conditional',
          conditional: {
            label: ch('ultCond'),
            metadata: cond.enemy_shielded,
            fields: [fieldForBuff(buff.ult_dazeInc_)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: st('shield'),
          fieldRef: formula.core_shield.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.radiant_aegis,
        fields: [fieldForBuff(buff.core_atk)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityTeamCond'),
        metadata: cond.can_defensive_assist,
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.ability_debuff,
        fields: [fieldForBuff(buff.ability_dmgInc_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.radiant_aegis,
        fields: [fieldForBuff(buff.m1_resRed_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.radiant_aegis,
        fields: [
          fieldForBuff(buff.m2_enerRegen_),
          {
            title: ch('m2_atkInc_'),
            fieldValue: dm.m2.atk_increase_ * 100,
            unit: '%',
          },
        ],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_exSpecial_assistFollowup_crit_'),
          fieldRef: buff.m6_exSpecial_assistFollowup_crit_.tag,
        },
        {
          title: ch('m6_dmg_'),
          fieldRef: buff.m6_dmg_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.exSpecial_assistFollowup_used,
        fields: [fieldForBuff(buff.m6_crit_), fieldForBuff(buff.m6_crit_dmg_)],
      },
    },
  ],
})

export default sheet
