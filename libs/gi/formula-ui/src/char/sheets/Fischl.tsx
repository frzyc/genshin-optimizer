import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Fischl'
const ct = charTemplates(key)
const formula = formulas.Fischl
const cond = conditionals.Fischl

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
          fieldRef: formula.charged_aimed.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_aimedCharged.tag,
        },
      ],
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
          title: ct.chg('skill.skillParams.2'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a2Name'),
          fieldRef: formula.a4.tag,
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c6OzDmg'),
          fieldRef: formula.c6_oz.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.lockHomework, { teamBuff: true }),
    charConditionalDocument(key, cond.lockOverload, { teamBuff: true }),
    charConditionalDocument(key, cond.lockEcLc, { teamBuff: true }),
  ]),
  burst: ct.talentTem('burst', [
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
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c4AoeDmg'),
          fieldRef: formula.c4.tag,
        },
        {
          title: stg('healing'),
          fieldRef: formula.c4_heal.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c1Name'),
          fieldRef: formula.c1.tag,
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.lockC6Oz, { teamBuff: true }),
  ]),
}

export default sheet
