import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Yaoyao'
const ct = charTemplates(key)
const formula = formulas.Yaoyao
const cond = conditionals.Yaoyao

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.0'),
          fieldRef: formula.normal_0.tag,
        },
        {
          title: ct.chg('auto.skillParams.1'),
          fieldRef: formula.normal_1.tag,
        },
        {
          title: ct.chg('auto.skillParams.2'),
          subtitle: '(1)',
          fieldRef: formula.normal_2.tag,
        },
        {
          title: ct.chg('auto.skillParams.2'),
          subtitle: '(2)',
          fieldRef: formula.normal_3.tag,
        },
        {
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.normal_4.tag,
        },
      ],
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
          fieldRef: formula.skill.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_heal.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_throwDuration.tag,
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_radishDuration.tag,
          unit: 's',
        },
        {
          title: stg('cd'),
          fieldRef: formula.skill_cd.tag,
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
          fieldRef: formula.burst_radish.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_radishHeal.tag,
        },
        {
          title: stg('cd'),
          fieldRef: formula.burst_cd.tag,
          unit: 's',
        },
        {
          title: stg('energyCost'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.adeptalLegacy, {
      label: ct.ch('inLegacy'),
      fields: [
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_duration.tag,
          unit: 's',
        },
      ],
    }),
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('megaDmg'),
          fieldRef: formula.c6.tag,
        },
        {
          title: ct.ch('megaHeal'),
          fieldRef: formula.c6_heal.tag,
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
          title: stg('contHealing'),
          fieldRef: formula.a4_heal.tag,
        },
        {
          title: st('interval'),
          fieldRef: formula.a4_cd.tag,
          unit: 's',
        },
        {
          title: stg('duration'),
          fieldRef: formula.a4_duration.tag,
          unit: 's',
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.c1Explode, {
      teamBuff: true,
      label: ct.ch('inExplosionAoE'),
      fields: [
        {
          title: st('stamRestored'),
          fieldRef: formula.c1_staminaRestore.tag,
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4AfterSkillBurst, {
      label: st('afterUse.skillOrBurst'),
      fields: [
        {
          title: stg('eleMas'),
          fieldRef: formula.c4_eleMas.tag,
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
