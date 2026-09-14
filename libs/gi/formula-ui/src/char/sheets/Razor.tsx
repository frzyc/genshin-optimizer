import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Razor'
const ct = charTemplates(key)
const formula = formulas.Razor
const cond = conditionals.Razor

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
          title: ct.chg('auto.skillParams.6'),
          unit: '/s',
          fieldRef: formula.charged_stamina.tag,
        },
        {
          title: ct.chg('auto.skillParams.7'),
          unit: 's',
          fieldRef: formula.charged_duration.tag,
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
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill_press.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_hold.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.ElectroSigil, {
      label: ct.ch('electroSigil'),
      fields: [
        {
          title: ct.chg('skill.skillParams.4'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.ch('electroSigilAbsorbed'),
          fieldRef: formula.skill_enerRegen.tag,
        },
      ],
    }),
    charConditionalDocument(key, cond.lockHomework, { teamBuff: true }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: st('hexerei.becomeHexerei', { val: key }),
          fieldValue: '',
        },
        {
          title: st('hexerei.talentEnhance'),
          fieldValue: '',
        },
      ],
    },
    charConditionalDocument(key, cond.TheWolfWithin, {
      fields: [
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_duration.tag,
          unit: 's',
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [charConditionalDocument(key, cond.A4)]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.C1, {
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.C2),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.C4, { teamBuff: true }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.lock_dmg.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.lockC6Sigil, {
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
}

export default sheet
