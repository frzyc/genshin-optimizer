import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Aloy'
const ct = charTemplates(key)
const formula = formulas.Aloy
const cond = conditionals.Aloy

function normalParamIndex(index: number) {
  return index + (index < 1 ? 0 : -1)
}
function normalTitleSuffix(index: number) {
  if (index === 0) return ' (1)'
  if (index === 1) return ' (2)'
  return ''
}

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
        title: `${ct.chg(`auto.skillParams.${normalParamIndex(i)}`)}${normalTitleSuffix(i)}`,
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
          fieldRef: formula.charged_aimed.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_aimedCharged.tag,
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
          title: ct.chg('skill.skillParams.3'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.7'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    {
      type: 'text',
      text: ct.ch('normCryoInfus'),
    },
    charConditionalDocument(key, cond.coil, {
      label: ct.ch('skill.coil'),
      fields: [
        {
          title: ct.chg('skill.skillParams.6'),
          fieldRef: formula.skill_rushingDuration.tag,
          unit: 's',
        },
      ],
    }),
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
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.A1, {
      teamBuff: true,
      label: ct.ch('a1CondName'),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.A4, {
      label: ct.ch('skill.rushState'),
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
