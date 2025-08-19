import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Nekomata'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.dodgeCounter_quickAssist_hit,
        fields: [fieldForBuff(buff.core_common_dmg_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('abilityCond'),
        metadata: cond.assaults_inflicted,
        fields: [fieldForBuff(buff.ability_exSpecial_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.from_behind,
        fields: [fieldForBuff(buff.m1_physical_resIgn_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2Cond'),
        metadata: cond.one_enemy_onField,
        fields: [fieldForBuff(buff.m2_enerRegen_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.exSpecials_used,
        fields: [fieldForBuff(buff.m4_crit_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.2', {
          val1: '$t(skills.chain)',
          val2: '$t(skills.ult)',
        }),
        metadata: cond.chain_ult_used,
        fields: [fieldForBuff(buff.m6_crit_dmg_)],
      },
    },
  ],
})

export default sheet
