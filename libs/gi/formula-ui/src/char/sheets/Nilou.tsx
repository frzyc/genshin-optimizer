import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Nilou'
const ct = charTemplates(key)
const formula = formulas.Nilou
const cond = conditionals.Nilou

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: [formula.normal_0, formula.normal_1, formula.normal_2].map(
        ({ tag }, i) => ({
          title: ct.chg(`auto.skillParams.${i}`),
          fieldRef: tag,
        })
      ),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.3'),
          subtitle: '(1)',
          fieldRef: formula.charged_1.tag,
        },
        {
          title: ct.chg('auto.skillParams.3'),
          subtitle: '(2)',
          fieldRef: formula.charged_2.tag,
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
          fieldRef: formula.skill_skill.tag,
        },
        {
          title: ct.ch('skill.dance1'),
          fieldRef: formula.skill_dance1.tag,
        },
        {
          title: ct.ch('skill.whirl1'),
          fieldRef: formula.skill_whirl1.tag,
        },
        {
          title: ct.ch('skill.dance2'),
          fieldRef: formula.skill_dance2.tag,
        },
        {
          title: ct.ch('skill.whirl2'),
          fieldRef: formula.skill_whirl2.tag,
        },
        {
          title: ct.ch('skill.illusion'),
          fieldRef: formula.skill_moon.tag,
        },
        {
          title: ct.ch('skill.wheel'),
          fieldRef: formula.skill_wheel.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c4AfterPirHit),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_skill.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_aeon.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1AfterSkill, { teamBuff: true }),
    charConditionalDocument(key, cond.a1AfterHit, { teamBuff: true }),
    charConditionalDocument(key, cond.c2Hydro, { teamBuff: true }),
    charConditionalDocument(key, cond.c2Dendro, { teamBuff: true }),
  ]),
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
