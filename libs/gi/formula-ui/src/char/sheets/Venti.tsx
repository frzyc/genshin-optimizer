import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Venti'
const ct = charTemplates(key)
const formula = formulas.Venti
const cond = conditionals.Venti

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
          fieldRef: formula.charged_aimed.tag,
        },
        {
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged_fully.tag,
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
    {
      type: 'text',
      text: ct.chg('auto.upgradedFields.hexerei'),
    },
    {
      type: 'fields',
      fields: [
        formula.hex_0,
        formula.hex_1,
        formula.hex_2,
        formula.hex_3,
        formula.hex_4,
        formula.hex_5,
      ].map(({ tag }, i) => ({
        title: ct.chg(`auto.skillParams.${i}`),
        fieldRef: tag,
      })),
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
          title: ct.chg('skill.skillParams.1'),
          unit: 's',
          fieldRef: formula.skill_pressCD.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_hold.tag,
        },
        {
          title: stg('hold.cd'),
          unit: 's',
          fieldRef: formula.skill_holdCD.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.lockHomework, { teamBuff: true }),
    charConditionalDocument(key, cond.lockBurstSwirl, {
      label: ct.ch('lockCond'),
      teamBuff: true,
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.2'),
          unit: 's',
          fieldRef: formula.burst_duration.tag,
        },
        {
          title: ct.chg('burst.skillParams.3'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burstAbsorption, {
      label: st('eleAbsor'),
      fields: [
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_absorb_hydro.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_absorb_pyro.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_absorb_cryo.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_absorb_electro.tag,
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'text',
      text: ct.ch('upcurrentDuration'),
    },
  ]),
  passive2: ct.talentTem('passive2', [
    {
      type: 'text',
      text: ct.ch('regenEner'),
    },
    {
      type: 'text',
      text: ct.ch('q'),
    },
  ]),
  passive3: ct.talentTem('passive3', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('p3_staminaGlidingDec_'),
          fieldRef: formula.p3_staminaGlidingDec_.tag,
        },
      ],
    },
  ]),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('addAimed'),
          fieldRef: formula.c1_aimed.tag,
        },
        {
          title: ct.ch('addFullAimed'),
          fieldRef: formula.c1_fully.tag,
        },
        {
          title: ct.chg('auto.skillParams.0'),
          fieldRef: formula.c1_hex_0.tag,
        },
        {
          title: ct.chg('auto.skillParams.1'),
          fieldRef: formula.c1_hex_1.tag,
        },
        {
          title: ct.chg('auto.skillParams.2'),
          fieldRef: formula.c1_hex_2.tag,
        },
        {
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.c1_hex_3.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.c1_hex_4.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.c1_hex_5.tag,
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.c2_skill.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c2, {
      label: ct.chg('constellation2.name'),
      teamBuff: true,
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4, {
      label: st('getElementalOrbParticle'),
    }),
    charConditionalDocument(key, cond.lockC4SkillBurst, {
      label: st('afterUse.skillOrBurst'),
      teamBuff: true,
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6, {
      label: ct.ch('c6'),
      teamBuff: true,
    }),
  ]),
}

export default sheet
