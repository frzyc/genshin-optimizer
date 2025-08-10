import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Soukaku'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    chain: {
      UltimateJumboPuddingSlash: [
        {
          type: 'conditional',
          conditional: {
            label: ch('ultCond'),
            metadata: cond.masked,
            fields: [fieldForBuff(buff.ult_crit_)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.flyTheFlag,
        fields: [fieldForBuff(buff.core_atk)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond2'),
        metadata: cond.vortexConsumed,
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond2'),
        metadata: cond.vortexConsumed,
        fields: [fieldForBuff(buff.ability_ice_dmg_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m4Cond'),
        metadata: cond.flyTheFlagHit,
        fields: [fieldForBuff(buff.m4_ice_resRed_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.frostedBanner,
        fields: [
          {
            title: ch('m6_dmg_'),
            fieldRef: buff.m6_common_dmg_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
