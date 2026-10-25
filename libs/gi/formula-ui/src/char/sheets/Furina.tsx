import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Furina'
const ct = charTemplates(key)
const formula = formulas.Furina
const cond = conditionals.Furina

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
          fieldRef: formula.charged_stam.tag,
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.arkhe'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.8'),
          fieldRef: formula.thornBladeDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.9'),
          unit: 's',
          fieldRef: formula.bladeThornInterval.tag,
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
          fieldRef: formula.skill_bubbleDmg.tag,
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_usherDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_chevalDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_crabDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldValue: '',
          unit: st('percentMaxHP'),
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldValue: '',
          unit: st('percentMaxHP'),
        },
        {
          title: ct.chg('skill.skillParams.7'),
          fieldValue: '',
          unit: st('percentMaxHP'),
        },
        {
          title: ct.chg('skill.skillParams.8'),
          fieldRef: formula.skill_streamsHeal.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skillHpConsumeStacks),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_skillDmg.tag,
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.burst_duration.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldValue: '',
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: stg('energyCost'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burstFanfare, { teamBuff: true }),
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('contHealing'),
          fieldRef: formula.a1_heal.tag,
        },
        {
          title: st('interval'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('healing'),
          fieldRef: formula.a4_healInterval.tag,
          unit: 's',
        },
        {
          title: ct.ch('a4_member_dmg_'),
          fieldRef: formula.a4_member_dmg_.tag,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'text',
      text: ct.ch('c1Inc'),
    },
    {
      type: 'text',
      text: ct.ch('c1Bonus'),
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2Overstack, { teamBuff: true }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('constellation6.skillParams.0'),
          fieldRef: formula.c6_heal.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c6, {
      fields: [
        {
          title: st('infusion.hydro'),
          variant: 'hydro',
          fieldValue: '',
        },
        {
          title: ct.ch('c6_normal_dmgInc'),
          fieldValue: '',
        },
        {
          title: ct.ch('c6_charged_dmgInc'),
          fieldValue: '',
        },
        {
          title: ct.ch('c6_plunging_dmgInc'),
          fieldValue: '',
        },
      ],
    }),
    charConditionalDocument(key, cond.c6Pneuma, {
      fields: [
        {
          title: ct.ch('c6Pneuma_normal_dmgInc'),
          fieldValue: '',
        },
        {
          title: ct.ch('c6Pneuma_charged_dmgInc'),
          fieldValue: '',
        },
        {
          title: ct.ch('c6Pneuma_plunging_impact_dmgInc'),
          fieldValue: '',
        },
      ],
    }),
  ]),
}

export default sheet
