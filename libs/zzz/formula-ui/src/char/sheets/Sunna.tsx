import {
  allAttributeKeys,
  type CharacterKey,
  elementalData,
  specialtyData,
} from '@genshin-optimizer/zzz/consts'
import { Sunna } from '@genshin-optimizer/zzz/formula'
import { st, trans } from '../../util'
import { createBaseSheet, fieldForBuff } from '../sheetUtil'

const key: CharacterKey = 'Sunna'
const [, ch] = trans('char', key)
const cond = Sunna.conditionals
const buff = Sunna.buffs
const formula = Sunna.formulas

const sheet = createBaseSheet(key, {
  perSkillAbility: {
    special: {
      EXSpecialAttackSpecialPhotographyTechnique: [
        {
          type: 'conditional',
          conditional: {
            label: ch('etherVeil'),
            metadata: cond.etherVeil,
            fields: [fieldForBuff(buff.exSpecial_atk)],
          },
        },
      ],
    },
  },
  core: [
    {
      type: 'fields',
      fields: [
        ...allAttributeKeys.flatMap((attr) =>
          ['attack' as const, 'anomaly' as const].map((type) => ({
            title: `${specialtyData[type]} ${elementalData[attr]} DMG`,
            fieldRef: formula[`core_${type}_${attr}_dmg`].tag,
          }))
        ),
        fieldForBuff(buff.core_crit_),
        fieldForBuff(buff.core_crit_dmg_),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('angelicChordination'),
        metadata: cond.angelicChordination,
        fields: [fieldForBuff(buff.core_atk)],
      },
    },
  ],
  ability: [
    {
      type: 'conditional',
      conditional: {
        label: ch('etherVeil'),
        metadata: cond.etherVeil,
        fields: [fieldForBuff(buff.ability_stun_)],
      },
    },
  ],
  m1: [
    {
      type: 'conditional',
      conditional: {
        label: ch('catsGaze'),
        metadata: cond.catsGaze,
        fields: [fieldForBuff(buff.m1_defRed_)],
      },
    },
  ],
  m2: [
    {
      type: 'conditional',
      conditional: {
        label: ch('inAnyEtherVeil'),
        metadata: cond.inAnyEtherVeil,
        fields: [fieldForBuff(buff.m2_atk_)],
      },
    },
  ],
  m4: [
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.ult)' }),
        metadata: cond.ultUsed,
        fields: [fieldForBuff(buff.m4_common_dmg_)],
      },
    },
  ],
  m6: [
    {
      type: 'conditional',
      conditional: {
        label: ch('focusedCreation'),
        metadata: cond.focusedCreation,
        fields: [
          fieldForBuff(buff.m6_crit_),
          fieldForBuff(buff.m6_crit_dmg_),
          {
            title: ch('m6_dmg'),
            fieldRef: formula.m6_dmg.tag,
          },
          {
            title: ch('m6_common_dmg_'),
            fieldRef: buff.m6_common_dmg_.tag,
          },
        ],
      },
    },
  ],
})

export default sheet
