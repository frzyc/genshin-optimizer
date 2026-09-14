import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Varesa'
const ct = charTemplates(key)
const formula = formulas.Varesa
const cond = conditionals.Varesa

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
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.charged_dmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_stam.tag,
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
      text: ct.chg('auto.fields.plunging'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.10'),
          fieldRef: formula.charged_fpDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.11'),
          fieldValue: '',
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.fieryPassion'),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.fpNormal'),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.fpCharged'),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.fpPlunging'),
    },
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill_rushDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_fpRushDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_nsLimit.tag,
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
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_kickDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_fpKickDmg.tag,
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
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_volcanoDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldRef: formula.burst_volcanoCost.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1Rainbow, {
      fields: [
        {
          title: ct.ch('a1Rainbow_impact_dmgInc'),
          fieldRef: formula.a1Rainbow_impact_dmgInc.tag,
        },
        {
          title: ct.ch('a1Rainbow_fpImpact_dmgInc'),
          fieldRef: formula.a1Rainbow_fpImpact_dmgInc.tag,
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4NsBurst),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'text',
      text: ct.ch('c1Text'),
    },
    {
      type: 'text',
      text: ct.ch('c1Effect'),
    },
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4Diligent, {
      fields: [
        {
          title: ct.ch('c4Diligent_impact_dmgInc'),
          fieldRef: formula.c4Diligent_impact_dmgInc.tag,
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
    charConditionalDocument(key, cond.c4FpApex),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
