import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'ShikanoinHeizou'
const ct = charTemplates(key)
const formula = formulas.ShikanoinHeizou
const cond = conditionals.ShikanoinHeizou

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
          subtitle: '(1)',
          fieldRef: formula.normal_3.tag,
        },
        {
          title: ct.chg('auto.skillParams.3'),
          subtitle: '(2)',
          fieldRef: formula.normal_4.tag,
        },
        {
          title: ct.chg('auto.skillParams.3'),
          subtitle: '(3)',
          fieldRef: formula.normal_5.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.normal_6.tag,
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
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_stamina.tag,
          unit: '/s',
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
          fieldRef: formula.skill.tag,
        },
        {
          title: stg('cd'),
          fieldRef: formula.skill_cd.tag,
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.declensionStacks, {
      label: ct.chg('skill.description.6'),
    }),
    charConditionalDocument(key, cond.skillHit, { teamBuff: true }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_slugger.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_iris_hydro.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_iris_pyro.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_iris_cryo.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_iris_electro.tag,
        },
        {
          title: stg('cd'),
          fieldRef: formula.burst_cd.tag,
          unit: 's',
        },
        {
          title: stg('energyCost'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
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
    charConditionalDocument(key, cond.takeField, {
      label: ct.ch('takingField'),
    }),
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
