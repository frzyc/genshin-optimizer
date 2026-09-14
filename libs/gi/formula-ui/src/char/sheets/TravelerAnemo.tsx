import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'TravelerAnemo'
const ct = charTemplates(key)
const formula = formulas.TravelerAnemo
const cond = conditionals.TravelerAnemo

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
          fieldRef: formula.charged_1.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_2.tag,
        },
        {
          title: ct.ch('charged_stamina'),
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
          title: stg('plunging.high'),
          fieldRef: formula.plunging_high.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.plunging_low.tag,
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
          multi: 2,
          fieldRef: formula.skill_initial_dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          multi: 4,
          fieldRef: formula.skill_initial_max.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_storm_dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_storm_max.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          unit: 's',
          fieldRef: formula.skill_maxCd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skillAbsorption),
    charConditionalDocument(key, cond.anemoBurstAbsorption),
    charConditionalDocument(key, cond.anemoC6Hit),
    charConditionalDocument(key, cond.bonusCanned),
    charConditionalDocument(key, cond.bonusSkirk1),
    charConditionalDocument(key, cond.bonusSkirk2),
    charConditionalDocument(key, cond.bonusSkirk3),
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
    charConditionalDocument(key, cond.lockedPassive),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
