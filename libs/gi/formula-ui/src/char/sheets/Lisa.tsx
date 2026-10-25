import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Lisa'
const ct = charTemplates(key)
const formula = formulas.Lisa
const cond = conditionals.Lisa

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
          fieldValue: '',
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
          title: stg('hold.cd'),
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
          title: stg('skillDMG'),
          fieldRef: formula.burst_summon.tag,
        },
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_tick.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.LisaA4, { teamBuff: true }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.LisaC2, {
      fields: [
        {
          title: st('incInterRes'),
          fieldValue: '',
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
