import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Valeriy'
const ct = charTemplates(key)
const formula = formulas.Valeriy
const cond = conditionals.Valeriy

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    { type: 'text', text: ct.chg('auto.fields.normal') },
    {
      type: 'fields',
      fields: [formula.normal_0, formula.normal_1, formula.normal_2].map(
        ({ tag }, i) => ({
          title: ct.chg(`auto.skillParams.${i}`),
          fieldRef: tag,
        })
      ),
    },
    { type: 'text', text: ct.chg('auto.fields.charged') },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_mortarDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_stam.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.chargedOffensive, {
      teamBuff: true,
      label: ct.ch('offensiveCond'),
      fields: [
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_electro_dmgInc.tag,
        },
        {
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged_stellarconduct_dmgInc.tag,
        },
        {
          title: ct.chg('auto.skillParams.8'),
          fieldRef: formula.charged_directiveStacks.tag,
        },
        {
          title: ct.chg('auto.skillParams.9'),
          unit: 's',
          fieldRef: formula.charged_directiveDuration.tag,
        },
      ],
    }),
    { type: 'text', text: ct.chg('auto.fields.plunging') },
    {
      type: 'fields',
      fields: [
        { title: stg('plunging.dmg'), fieldRef: formula.plunging_dmg.tag },
        { title: stg('plunging.low'), fieldRef: formula.plunging_low.tag },
        { title: stg('plunging.high'), fieldRef: formula.plunging_high.tag },
      ],
    },
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_shield.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_shield_electro.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          unit: 's',
          fieldRef: formula.skill_shieldDuration.tag,
        },
        { title: stg('cd'), unit: 's', fieldRef: formula.skill_cd.tag },
      ],
    },
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_skillDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_shellDmg.tag,
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.burst_duration.tag,
        },
        { title: stg('cd'), unit: 's', fieldRef: formula.burst_cd.tag },
        { title: stg('energyCost'), fieldRef: formula.burst_enerCost.tag },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', []),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4Momentum, {
      teamBuff: true,
      label: ct.ch('momentumCond'),
      fields: [
        {
          title: ct.ch('a4Momentum_electro_dmgInc'),
          fieldRef: formula.a4Momentum_electro_dmgInc.tag,
        },
        {
          title: ct.ch('a4Momentum_stellarconduct_dmgInc'),
          fieldRef: formula.a4Momentum_stellarconduct_dmgInc.tag,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    charConditionalDocument(key, cond.a0StellarRadianceSc, {
      teamBuff: true,
      label: st('elementalReaction.polestar.inside'),
    }),
  ]),
  constellation1: ct.talentTem('constellation1', []),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2Skill, {
      teamBuff: true,
      label: st('afterUse.skill'),
      fields: [
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.c2_duration.tag,
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', []),
  constellation4: ct.talentTem('constellation4', [
    { type: 'text', text: ct.ch('momentumLimitInc') },
  ]),
  constellation5: ct.talentTem('constellation5', []),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6Hit, {
      teamBuff: true,
      label: ct.ch('c6HitCond'),
      fields: [
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.c6_duration.tag,
        },
      ],
    }),
  ]),
}

export default sheet
