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
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_spin.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_final.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_stamina.tag,
          unit: '/s',
        },
        {
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged_duration.tag,
          unit: 's',
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
          fieldRef: formula.skill_pressCd.tag,
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_hold.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldRef: formula.skill_holdCd.tag,
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.ElectroSigil, {
      label: ct.ch('electroSigil'),
      fields: [
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_duration.tag,
          unit: 's',
        },
        {
          title: ct.ch('electroSigilAbsorbed'),
          fieldRef: formula.skill_enerRegen.tag,
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
          title: ct.ch('soulCompanion.1'),
          fieldRef: formula.companionDmg1.tag,
        },
        {
          title: ct.ch('soulCompanion.2'),
          fieldRef: formula.companionDmg2.tag,
        },
        {
          title: ct.ch('soulCompanion.3'),
          fieldRef: formula.companionDmg3.tag,
        },
        {
          title: ct.ch('soulCompanion.4'),
          fieldRef: formula.companionDmg4.tag,
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldRef: formula.burst_cd.tag,
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.6'),
          fieldRef: formula.burst_enerCost.tag,
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
    charConditionalDocument(key, cond.C1),
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
          title: st('dmg'),
          fieldRef: formula.c6.tag,
        },
        {
          title: ct.ch('electroSigilPerProc'),
          fieldRef: formula.skill_enerRegen.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.lockHomework, { teamBuff: true }),
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.lock_dmg.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.lockC6Sigil),
  ]),
}

export default sheet
