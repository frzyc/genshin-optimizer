import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Gorou'
const ct = charTemplates(key)
const formula = formulas.Gorou
const cond = conditionals.Gorou

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
          fieldRef: formula.charged_aimed.tag,
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
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.inField, {
      teamBuff: true,
      fields: [
        {
          title: st('incInterRes'),
          fieldValue: '',
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
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.burst_duration.tag,
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
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.afterBurst, { teamBuff: true }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.afterSkillBurst, { teamBuff: true }),
  ]),
}

export default sheet
