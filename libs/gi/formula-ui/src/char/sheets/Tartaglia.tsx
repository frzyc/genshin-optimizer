import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Tartaglia'
const ct = charTemplates(key)
const formula = formulas.Tartaglia

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
          fieldRef: formula.charged_aimedCharged.tag,
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.riptide'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.10'),
          fieldValue: '',
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
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_normal1.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_normal2.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_normal3.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_normal4.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldRef: formula.skill_normal5.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          subtitle: '(1)',
          fieldRef: formula.skill_normal61.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          subtitle: '(2)',
          fieldRef: formula.skill_normal62.tag,
        },
        {
          title: ct.chg('skill.skillParams.7'),
          subtitle: '(1)',
          fieldRef: formula.skill_charged1.tag,
        },
        {
          title: ct.chg('skill.skillParams.7'),
          subtitle: '(2)',
          fieldRef: formula.skill_charged2.tag,
        },
        {
          title: ct.chg('skill.skillParams.9'),
          fieldRef: formula.skill_riptideSlash.tag,
        },
        {
          title: ct.chg('skill.skillParams.10'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.chg('skill.skillParams.11'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.12'),
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
          title: ct.chg('burst.skillParams.4'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldValue: '',
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldValue: '',
        },
      ],
    },
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
