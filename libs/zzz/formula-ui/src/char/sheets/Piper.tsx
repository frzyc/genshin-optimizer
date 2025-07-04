import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Piper'
const [, ch] = trans('char', key)
const cond = conditionals[key]
const buff = buffs[key]

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.power,
        fields: [fieldForBuff(buff.core_physical_anomBuildup_)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.power,
        fields: [fieldForBuff(buff.ability_common_dmg_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.extraPower,
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('coreCond'),
        metadata: cond.power,
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('m1Cond'),
        metadata: cond.extraPower,
        fields: [
          {
            title: ch('m2_physical_dmg_'),
            fieldRef: buff.m2_physical_dmg_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
