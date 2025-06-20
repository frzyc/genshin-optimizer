import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'AstraYao'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]
const dm = mappedStats.char[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      IdyllicCadenza: [
        {
          type: 'conditional',
          conditional: {
            label: ch('idyllic_cadenzaCond'),
            metadata: cond.idyllic_cadenza,
            fields: [
              fieldForBuff(buff.common_dmg_),
              fieldForBuff(buff.crit_dmg_),
            ],
          },
        },
      ],
    },
    chain: {
      UltimateFantasianSonata: [
        {
          type: 'fields',
          fields: [
            { title: ch('ult_heal'), fieldRef: formula.ultimate_heal.tag },
          ],
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_atk)],
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.attack_hits,
        fields: [fieldForBuff(buff.m1_resRed_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m2_atkBuffInc_'),
          fieldValue: dm.m2.atk_ * 100,
          unit: '%',
        },
        {
          title: ch('m2_maxIncrease'),
          fieldValue: dm.m2.max_increase,
        },
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m4_attack_quickAssist_extraDmg),
        fieldForBuff(buff.m4_anomaly_quickAssist_anomBuildup_),
        fieldForBuff(buff.m4_stun_quickAssist_dazeInc_),
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_mv_mult_'),
          fieldRef: buff.m6_mv_mult_.tag,
        },
        {
          title: ch('m6_crit_'),
          fieldRef: buff.m6_crit_.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.precise_assist_triggered,
        fields: [
          {
            title: ch('m6_capriccio_crit_'),
            fieldRef: buff.m6_capriccio_crit_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
