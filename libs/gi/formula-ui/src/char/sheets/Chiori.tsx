import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Chiori'
const ct = charTemplates(key)
const formula = formulas.Chiori
const cond = conditionals.Chiori

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
      type: 'fields',
      fields: [
        {
          title: st('dmgInc.normal'),
          fieldRef: formula.c6_normal_dmgInc.tag,
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
          unit: 's',
          fieldRef: formula.skill_turretDuration.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          unit: 's',
          fieldRef: formula.skill_turretInterval.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
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
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.dollDmg.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.a1Infusion, {
      label: ct.ch('a1Cond'),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4Construct, {
      label: ct.ch('a4Cond'),
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.c2_dollDmg.tag,
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
