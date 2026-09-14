import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Nahida'
const ct = charTemplates(key)
const formula = formulas.Nahida
const cond = conditionals.Nahida

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
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldValue: '',
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
          title: ct.chg('skill.skillParams.3'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('press.cd'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('hold.cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.a1ActiveInBurst, { teamBuff: true }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'text',
      text: ct.ch('karmaIntervalDec'),
    },
    charConditionalDocument(key, cond.partyInBurst, {
      fields: [
        {
          title: ct.ch('noBurstEffect'),
          fieldValue: '',
        },
        {
          title: st('durationInc'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'text',
      text: ct.ch('c1Key'),
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2Bloom, {
      teamBuff: true,
    }),
    charConditionalDocument(key, cond.c2QSA, {
      teamBuff: true,
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4Count, {
      teamBuff: true,
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
