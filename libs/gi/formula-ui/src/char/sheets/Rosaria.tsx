import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Rosaria'
const ct = charTemplates(key)
const formula = formulas.Rosaria
const cond = conditionals.Rosaria

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.0'),
          fieldRef: formula.normal_0.tag,
        },
        {
          title: ct.chg('auto.skillParams.1'),
          fieldRef: formula.normal_1.tag,
        },
        {
          title: ct.chg('auto.skillParams.2'),
          fieldRef: formula.normal_2.tag,
        },
        {
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.normal_3.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          subtitle: '(1)',
          fieldRef: formula.normal_4.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          subtitle: '(2)',
          fieldRef: formula.normal_5.tag,
        },
      ],
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
          fieldRef: formula.charged.tag,
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
          subtitle: '(1)',
          fieldRef: formula.skill_hit1.tag,
        },
        {
          title: ct.chg('skill.skillParams.0'),
          subtitle: '(2)',
          fieldRef: formula.skill_hit2.tag,
        },
      ],
    },
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          subtitle: '(1)',
          fieldRef: formula.burst_hit1.tag,
        },
        {
          title: ct.chg('burst.skillParams.0'),
          subtitle: '(2)',
          fieldRef: formula.burst_hit2.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_dotDmg.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.DilucC6, { teamBuff: true }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.RosariaA1),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.RosariaA4, { teamBuff: true }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.RosariaC1),
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
