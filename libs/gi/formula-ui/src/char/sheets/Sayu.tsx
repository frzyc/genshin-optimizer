import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Sayu'
const ct = charTemplates(key)
const formula = formulas.Sayu
const cond = conditionals.Sayu

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
        ...(i === 2 ? { multi: 2 } : {}),
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
          fieldRef: formula.charged_spin.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_final.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
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
          title: ct.chg('skill.skillParams.5'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.skillAbsorption, {
      label: st('eleAbsor'),
      fields: [
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.eleWheelDmg_hydro.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.eleWheelDmg_pyro.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.eleWheelDmg_cryo.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.eleWheelDmg_electro.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.eleKickDmg_hydro.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.eleKickDmg_pyro.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.eleKickDmg_cryo.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.eleKickDmg_electro.tag,
        },
      ],
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('burstHits'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('healing'),
          fieldRef: formula.a1Heal.tag,
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('p2Heal'),
          fieldRef: formula.a4ExtraHeal.tag,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2SkillStack, {
      label: ct.ch('c2Cond'),
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
