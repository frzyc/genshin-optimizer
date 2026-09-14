import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Skirk'
const ct = charTemplates(key)
const formula = formulas.Skirk
const cond = conditionals.Skirk

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
          multi: 2,
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
        formula.skill_0,
        formula.skill_1,
        formula.skill_2,
        formula.skill_3,
        formula.skill_4,
      ].map(({ tag }, i) => ({
        title: ct.chg(`skill.skillParams.${i}`),
        fieldRef: tag,
        ...(i === 2 || i === 3 ? { multi: 2 } : {}),
      })),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.5'),
          multi: 3,
          fieldRef: formula.skill_chargedDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldValue: '',
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: stg('plunging.dmg'),
          fieldRef: formula.skill_plunging_dmg.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.skill_plunging_low.tag,
        },
        {
          title: stg('plunging.high'),
          fieldRef: formula.skill_plunging_high.tag,
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.9'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.10'),
          fieldValue: '',
        },
        {
          title: stg('cd'),
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
          multi: 5,
          fieldRef: formula.burst_skillDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_finalDmg.tag,
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.burstSerpentOver),
    charConditionalDocument(key, cond.burstVoidAbsorb),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4DeathStacks),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2AfterBurst, {
      fields: [
        {
          title: ct.ch('c2Atk_blurb'),
          fieldValue: '',
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
    {
      type: 'text',
      text: ct.ch('c2Atk_blurb'),
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
