import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { Anby } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Anby'
const [, ch] = trans('char', key)
const cond = Anby.conditionals
const buff = Anby.buffs

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.core_after3rdBasic,
        fields: [
          {
            title: ch('core_dazeInc_'),
            fieldRef: buff.core_after3rdBasic_dazeInc_.tag,
          },
        ],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.m1After4thBasicHit,
        fields: [fieldForBuff(buff.m1_after4thHit_energyRegen_)],
      },
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m2_stunned_basic_dmg_),
        fieldForBuff(buff.m2_unstunned_ex_dazeInc_),
      ],
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m6Cond'),
        metadata: cond.m6ChargeConsumed,
        fields: [
          fieldForBuff(buff.m6_charge_basic_dmg_),
          fieldForBuff(buff.m6_charge_exSpecial_dmg_),
        ],
      },
    },
  ],
})

export default sheet
