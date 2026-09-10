import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Wanderer'
const ct = charTemplates(key)
const formula = formulas.Wanderer
const cond = conditionals.Wanderer

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
          ...(i === 2 ? { multi: 2 } : {}),
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
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_stamina.tag,
          unit: '/s',
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
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_skyDwellerPoints.tag,
        },
        {
          title: stg('cd'),
          fieldRef: formula.skill_cd.tag,
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.afterSkill, {
      label: ct.ch('windfavoredState'),
    }),
    charConditionalDocument(key, cond.skillPyroContact, {
      label: ct.ch('p1.pyroCondName'),
    }),
    charConditionalDocument(key, cond.skillCryoContact, {
      label: ct.ch('p1.cryoCondName'),
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst.tag,
          multi: 5,
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
    charConditionalDocument(key, cond.c2Points, {
      label: ct.ch('c2CondName'),
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('p2Dmg'),
          fieldRef: formula.passive2.tag,
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
      fields: [formula.c6_0, formula.c6_1, formula.c6_2].map(({ tag }, i) => ({
        title: ct.chg(`auto.skillParams.${i}`),
        fieldRef: tag,
        ...(i === 2 ? { multi: 2 } : {}),
      })),
    },
  ]),
}

export default sheet
