import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'ZhuYuan'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]
const formula = formulas[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('core_dmg_'),
          fieldRef: buff.core_dmg_.tag,
        },
      ],
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.3', {
          val1: '$t(skills.exSpecial)',
          val2: '$t(skills.chain)',
          val3: '$t(skills.ult)',
        }),
        metadata: cond.ex_chain_ult_used,
        fields: [fieldForBuff(buff.ability_crit_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m2SuppresiveModeCond'),
        metadata: cond.suppresive_mode,
        fields: [fieldForBuff(buff.m2_dmg_red_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m2BasicDashEtherCond'),
        metadata: cond.shotshells_hit,
        fields: [
          {
            title: ch('m2_basic_dash_ether_dmg_'),
            fieldRef: buff.m2_basic_dash_ether_dmg_.tag,
          },
        ],
      },
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m4_ether_resIgn_'),
          fieldRef: buff.m4_basic_dash_ether_res_ign_.tag,
        },
      ],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_ether_afterglow'),
          fieldRef: formula.m6_ether_afterglow.tag,
        },
      ],
    },
  ],
})

export default sheet
