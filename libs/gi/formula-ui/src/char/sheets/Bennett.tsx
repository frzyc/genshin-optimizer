import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Bennett'
const ct = charTemplates(key)
const formula = formulas.Bennett
const cond = conditionals.Bennett

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
          title: stg('press.cd'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.1'),
          subtitle: '(1)',
          fieldRef: formula.skill_hold1_1.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          subtitle: '(2)',
          fieldRef: formula.skill_hold1_2.tag,
        },
        {
          title: ct.ch('skill.lvl1CD'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.2'),
          subtitle: '(1)',
          fieldRef: formula.skill_hold2_1.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          subtitle: '(2)',
          fieldRef: formula.skill_hold2_2.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_explosion.tag,
        },
        {
          title: ct.ch('skill.lvl2CD'),
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
          fieldRef: formula.burst.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_regen.tag,
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
    charConditionalDocument(key, cond.activeInArea, { teamBuff: true }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.underHP),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c4DMG'),
          fieldRef: formula.c4.tag,
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'text',
      text: ct.ch('c6PyroInfusion'),
    },
  ]),
}

export default sheet
