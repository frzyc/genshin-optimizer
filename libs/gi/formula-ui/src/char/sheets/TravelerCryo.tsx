import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'TravelerCryo'
const ct = charTemplates(key)
const formula = formulas.TravelerCryo
const cond = conditionals.TravelerCryo

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
          fieldRef: formula.charged_1.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_2.tag,
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
          title: stg('plunging.high'),
          fieldRef: formula.plunging_high.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.plunging_low.tag,
        },
      ],
    },
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_crystalDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.bonusCanned),
    charConditionalDocument(key, cond.bonusSkirk1),
    charConditionalDocument(key, cond.bonusSkirk2),
    charConditionalDocument(key, cond.bonusSkirk3),
    charConditionalDocument(key, cond.lockedPassive),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_javelinDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_javelinStellarconductDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_javelinStellarswirlDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.6'),
          fieldValue: '',
        },
        {
          title: ct.chg('burst.skillParams.7'),
          fieldValue: '',
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('energyCost'),
          fieldValue: '',
        },
      ],
    },
    charConditionalDocument(key, cond.burstFrostglow),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1ScStar),
  ]),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: st('infusion.cryo'),
          variant: 'cryo',
          fieldValue: '',
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3', [
    charConditionalDocument(key, cond.a0StellarRadiance, {
      fields: [
        {
          title: st('elementalReaction.stellar.gainRadianceSc'),
          fieldValue: '',
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2Crystal, {
      teamBuff: true,
    }),
    charConditionalDocument(key, cond.c2ActiveStellar, {
      teamBuff: true,
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
