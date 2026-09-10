import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Zhongli'
const ct = charTemplates(key)
const formula = formulas.Zhongli
const cond = conditionals.Zhongli

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
          fieldRef: formula.charged.tag,
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
          title: ct.ch('skill.stele'),
          fieldRef: formula.skill_stele.tag,
        },
        {
          title: ct.ch('skill.resonance'),
          fieldRef: formula.skill_resonance.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_holdDMG.tag,
        },
        {
          title: stg('dmgAbsorption'),
          fieldRef: formula.skill_shield.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skill, { teamBuff: true }),
    charConditionalDocument(key, cond.p1, { teamBuff: true }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('talents.auto'),
          fieldRef: formula.p4normalDmgInc.tag,
        },
        {
          title: stg('charged.dmg'),
          fieldRef: formula.p4ChargedDmgInc.tag,
        },
        {
          title: stg('plunging.dmg'),
          fieldRef: formula.p4PlungingDmgInc.tag,
        },
        {
          title: stg('skillDMG'),
          fieldRef: formula.p4SKillDmgInc.tag,
        },
        {
          title: stg('burstDMG'),
          fieldRef: formula.p4BurstDmgInc.tag,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c6heal'),
          fieldRef: formula.c6_heal.tag,
        },
      ],
    },
  ]),
}

export default sheet
