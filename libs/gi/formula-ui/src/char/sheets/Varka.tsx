import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Varka'
const ct = charTemplates(key)
const formula = formulas.Varka
const cond = conditionals.Varka

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
        formula.normal_5,
        formula.normal_6,
        formula.normal_7,
        formula.normal_8,
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
          title: ct.chg('skill.skillParams.9'),
          subtitle: '(1)',
          fieldRef: formula.skill_ca1.tag,
        },
        {
          title: ct.chg('skill.skillParams.9'),
          subtitle: '(2)',
          fieldRef: formula.skill_ca2.tag,
        },
        {
          title: ct.chg('skill.skillParams.10'),
          subtitle: '(1)',
          fieldRef: formula.skill_fourWind1.tag,
        },
        {
          title: ct.chg('skill.skillParams.10'),
          subtitle: '(2)',
          fieldRef: formula.skill_fourWind2.tag,
        },
        {
          title: ct.chg('skill.skillParams.11'),
          subtitle: '(1)',
          multi: 2,
          fieldRef: formula.skill_azure1.tag,
        },
        {
          title: ct.chg('skill.skillParams.11'),
          subtitle: '(2)',
          multi: 2,
          fieldRef: formula.skill_azure2.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.12'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.c4Swirlcryo),
    charConditionalDocument(key, cond.c4Swirlelectro),
    charConditionalDocument(key, cond.c4Swirlhydro),
    charConditionalDocument(key, cond.c4Swirlpyro),
    charConditionalDocument(key, cond.lockHomework),
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
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4Stacks),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('constellation2.skillParams.0'),
          fieldRef: formula.c2.tag,
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'text',
      text: ct.ch('c6Text'),
    },
  ]),
}

export default sheet
