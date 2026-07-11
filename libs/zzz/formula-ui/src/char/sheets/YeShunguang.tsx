import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { YeShunguang } from '@genshin-optimizer/zzz/formula'
import { st } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'YeShunguang'
const buff = YeShunguang.buffs
const formula = YeShunguang.formulas

const sheet = createBaseSheet(key, {
  core: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.core_crit_),
        fieldForBuff(buff.core_common_dmg_),
        fieldForBuff(buff.core_veilVulnerabilityCap_),
      ],
    },
  ],
  m1: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m1_common_dmg_),
        fieldForBuff(buff.m1_defIgn_),
      ],
    },
  ],
  m2: [
    {
      type: 'fields',
      fields: [
        fieldForBuff(buff.m2_exSpecial_defIgn_),
        fieldForBuff(buff.m2_ult_defIgn_),
      ],
    },
  ],
  m4: [
    {
      type: 'fields',
      fields: [fieldForBuff(buff.core_veilVulnerabilityCap_)],
    },
  ],
  m6: [
    {
      type: 'fields',
      fields: [{ title: st('dmg'), fieldRef: formula.m6_dmg.tag }],
    },
  ],
})

export default sheet
