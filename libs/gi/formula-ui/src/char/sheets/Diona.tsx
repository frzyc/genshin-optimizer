import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Diona'
const ct = charTemplates(key)
const formula = formulas.Diona
const cond = conditionals.Diona

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: [
        formula.normal_0,
        formula.normal_1,
        formula.normal_2,
        formula.normal_3,
        formula.normal_4,
      ].map(({ tag }, i) => ({
        title: ct.chg(`auto.skillParams.${i}`),
        fieldRef: tag,
      })),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_aimed.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_aimedCharged.tag,
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.plunging'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: stg('plunging.dmg'),
          fieldRef: formula.plunging_dmg.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.plunging_low.tag,
        },
        {
          title: stg('plunging.high'),
          fieldRef: formula.plunging_high.tag,
        },
      ],
    },
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('skillDuration'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.3'),
          unit: 's',
          fieldRef: formula.skill_cdPress.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          unit: 's',
          fieldRef: formula.skill_cdHold.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.lockRevelation, { teamBuff: true }),
    charConditionalDocument(key, cond.lockStellarRadianceSc, {
      teamBuff: true,
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: st('elementalReaction.stellar.gainRadianceSc'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.Ascension1, {
      teamBuff: true,
      label: ct.ch('a1shielded'),
      fields: [
        {
          title: st('staminaDec_'),
          fieldRef: formula.a1_staminaDec_.tag,
          unit: '%',
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('pressShield'),
          fieldRef: formula.c2_pressShield.tag,
        },
        {
          title: ct.ch('pressCryoShield'),
          fieldRef: formula.c2_pressCryoShield.tag,
        },
        {
          title: ct.ch('holdShield'),
          fieldRef: formula.c2_holdShield.tag,
        },
        {
          title: ct.ch('holdCryoShield'),
          fieldRef: formula.c2_holdCryoShield.tag,
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.Constellation6, { teamBuff: true }),
  ]),
}

export default sheet
