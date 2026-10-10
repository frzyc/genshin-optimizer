import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'KamisatoAyato'
const ct = charTemplates(key)
const formula = formulas.KamisatoAyato
const cond = conditionals.KamisatoAyato

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
        ...(i === 3 ? { multi: 2 } : {}),
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
          fieldRef: formula.charged.tag,
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
          fieldRef: formula.skill_illusionDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.skillStacks, {
      label: ct.ch('skill.namisenStacks'),
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
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('energyCost'),
          fieldValue: '',
        },
      ],
    },
    charConditionalDocument(key, cond.burstInArea, { teamBuff: true }),
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'text',
      text: ct.ch('passive1.afterUse'),
    },
    {
      type: 'text',
      text: ct.ch('passive1.afterExplode'),
    },
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.c1OppHp),
  ]),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'text',
      text: ct.ch('c2.addlStacks'),
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4AfterBurst, { teamBuff: true }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
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
}

export default sheet
