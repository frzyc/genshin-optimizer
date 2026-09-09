import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Noelle'
const ct = charTemplates(key)
const formula = formulas.Noelle
const cond = conditionals.Noelle

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
          fieldRef: formula.charged_spinning.tag,
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
        { title: ct.chg('skill.skillParams.0'), fieldRef: formula.skill.tag },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_shield.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_heal.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_healChance.tag,
          unit: '%',
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_duration.tag,
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldRef: formula.skill_cd.tag,
          unit: 's',
        },
      ],
    },
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        { title: ct.chg('burst.skillParams.0'), fieldRef: formula.burst.tag },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_skill.tag,
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldRef: formula.burst_duration.tag,
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_cd.tag,
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        metadata: cond.SweepingTime,
        label: ct.chg('burst.name'),
        fields: [
          {
            title: ct.chg('burst.skillParams.2'),
            fieldRef: formula.burst_atkFromDef.tag,
          },
        ],
      },
    },
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.a1_shield.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.a1_duration.tag,
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldRef: formula.a1_cd.tag,
          unit: 's',
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: st('staminaDec_'),
          fieldRef: formula.c2_staminaChargedDec_.tag,
          unit: '%',
        },
        {
          title: st('dmg.charged'),
          fieldRef: formula.c2_charged_dmg_.tag,
          unit: '%',
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'fields',
      fields: [{ title: ct.ch('c4dmg'), fieldRef: formula.c4.tag }],
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
