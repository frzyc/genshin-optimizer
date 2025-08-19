import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Rina'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.minions_onField,
        fields: [fieldForBuff(buff.core_pen_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.shocked_enemy,
        fields: [fieldForBuff(buff.ability_electric_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.within_10m,
        fields: [
          {
            title: ch('m1_buff_'),
            fieldValue: dm.m1.core_buff_ * 100,
            unit: '%',
          },
        ],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: st('enterCombatOrSwitchIn'),
        metadata: cond.active_char,
        fields: [fieldForBuff(buff.m2_common_dmg_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.minions_onField,
        fields: [fieldForBuff(buff.m4_enerRegen)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.3', {
          val1: '$t(skills.exSpecial)',
          val2: '$t(skills.chain)',
          val3: '$t(skills.ult)',
        }),
        metadata: cond.exSpecial_chain_ult_hit,
        fields: [fieldForBuff(buff.m6_electric_dmg_)],
      },
    },
  ],
})

export default sheet
