import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Soldier0Anby } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Soldier0Anby'
const [, ch] = trans('char', key)
const cond = Soldier0Anby.conditionals
const buff = Soldier0Anby.buffs
const formula = Soldier0Anby.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.markedWithSilverStar,
        fields: [
          fieldForBuff(buff.core_common_dmg_),
          fieldForBuff(buff.core_markedWithSilverStar_crit_dmg_),
        ],
      },
    },
  ],
  ability: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.ability_crit_),
        fieldForBuff(buff.ability_aftershock_dmg_),
      ],
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.markedWithSilverStar,
        fields: [fieldForBuff(buff.m2_crit_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.markedWithSilverStar,
        fields: [fieldForBuff(buff.m4_electric_resIgn_)],
      },
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [
        {
          title: ch('m6_additional_dmg'),
          fieldRef: formula.m6_additional_dmg.tag,
        },
      ],
    },
  ],
})

export default sheet
