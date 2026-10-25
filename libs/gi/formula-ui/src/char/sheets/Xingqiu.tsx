import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Xingqiu'
const ct = charTemplates(key)
const formula = formulas.Xingqiu
const cond = conditionals.Xingqiu

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
        ...(i === 2 || i === 4 ? { multi: 2 } : {}),
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
          subtitle: '(1)',
          fieldRef: formula.charged_dmg1.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          subtitle: '(2)',
          fieldRef: formula.charged_dmg2.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_stamina.tag,
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
          fieldRef: formula.skill_press1.tag,
        },
        {
          title: ct.chg('skill.skillParams.0'),
          subtitle: '(2)',
          fieldRef: formula.skill_press2.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skill, {
      teamBuff: true,
      fields: [
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_dmgRed_.tag,
          unit: '%',
        },
      ],
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.2'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('healing'),
          fieldRef: formula.a1_heal.tag,
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2, { teamBuff: true }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.burst),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
