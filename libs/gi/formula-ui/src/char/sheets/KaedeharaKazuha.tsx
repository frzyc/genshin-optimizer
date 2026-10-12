import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'KaedeharaKazuha'
const ct = charTemplates(key)
const formula = formulas.KaedeharaKazuha
const cond = conditionals.KaedeharaKazuha

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
        title: ct.chg(`auto.skillParams.${i + (i < 3 ? 0 : -1)}`),
        fieldRef: tag,
        ...(i === 5 ? { multi: 3 } : {}),
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
          fieldRef: formula.skill_press.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_hold.tag,
        },
        {
          title: stg('hold.cd'),
          fieldValue: '',
          unit: 's',
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
    charConditionalDocument(key, cond.swirlpyro, { teamBuff: true }),
    charConditionalDocument(key, cond.swirlhydro, { teamBuff: true }),
    charConditionalDocument(key, cond.swirlelectro, { teamBuff: true }),
    charConditionalDocument(key, cond.swirlcryo, { teamBuff: true }),
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
          fieldRef: formula.burst_dot.tag,
        },
        {
          title: ct.chg('burst.skillParams.3'),
          unit: 's',
          fieldRef: formula.burst_duration.tag,
        },
        {
          title: ct.chg('burst.skillParams.4'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burstAbsorption, {
      label: st('eleAbsor'),
      fields: [
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_absorb_hydro.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_absorb_pyro.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_absorb_cryo.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_absorb_electro.tag,
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.skillAbsorption, {
      label: st('eleAbsor'),
      fields: [
        {
          title: stg('addEleDMG'),
          fieldRef: formula.a1_absorb_hydro.tag,
        },
        {
          title: stg('addEleDMG'),
          fieldRef: formula.a1_absorb_pyro.tag,
        },
        {
          title: stg('addEleDMG'),
          fieldRef: formula.a1_absorb_cryo.tag,
        },
        {
          title: stg('addEleDMG'),
          fieldRef: formula.a1_absorb_electro.tag,
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', []),
  passive3: ct.talentTem('passive3', [
    {
      type: 'fields',
      fields: [
        {
          title: st('staminaSprintDec_'),
          fieldRef: formula.p3_staminaSprintDec_.tag,
          unit: '%',
        },
      ],
    },
  ]),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'text',
      text: ct.ch('c1'),
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2, {
      label: ct.ch('c2'),
      teamBuff: true,
    }),
    charConditionalDocument(key, cond.c2p, {
      label: st('activeCharField'),
      teamBuff: true,
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6, {
      label: ct.ch('c6.after'),
    }),
  ]),
}

export default sheet
