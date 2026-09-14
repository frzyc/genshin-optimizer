import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'YunJin'
const ct = charTemplates(key)
const formula = formulas.YunJin
const cond = conditionals.YunJin

function normalSkillParamIndex(i: number) {
  return i + (i > 2 ? -1 : 0) + (i > 4 ? -1 : 0)
}
function normalSkillParamSuffix(i: number) {
  if (i === 2 || i === 4) return '(1)'
  if (i === 3 || i === 5) return '(2)'
  return ''
}

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
      ].map(({ tag }, i) => ({
        title: (
          <>
            {ct.chg(`auto.skillParams.${normalSkillParamIndex(i)}`)}
            {normalSkillParamSuffix(i)}
          </>
        ),
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
          fieldRef: formula.charged.tag,
        },
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
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_dmg1.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_dmg2.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_shield.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldValue: '',
          unit: 's',
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
          fieldRef: formula.burst.tag,
        },
        {
          title: ct.chg('burst.skillParams.4'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldValue: '',
        },
      ],
    },
    charConditionalDocument(key, cond.skill, {
      teamBuff: true,
      label: ct.ch('burst'),
      fields: [
        {
          title: ct.chg('burst.skillParams.2'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldValue: '',
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4, {
      teamBuff: true,
      label: st('elementalReaction.crystallizeOrLunar'),
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
