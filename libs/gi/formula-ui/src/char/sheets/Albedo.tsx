import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Albedo'
const ct = charTemplates(key)
const formula = formulas.Albedo
const cond = conditionals.Albedo

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
          title: ct.chg('auto.skillParams.6'),
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
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_blossom.tag,
        },
        {
          title: ct.ch('blossomCD'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.2'),
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
    charConditionalDocument(key, cond.lockHomework, { teamBuff: true }),
    charConditionalDocument(key, cond.lockCreateSolar, { teamBuff: true }),
    charConditionalDocument(key, cond.lockCreateSilver, { teamBuff: true }),
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
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.p1EnemyHp),
    charConditionalDocument(key, cond.a1LockSilver),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.burstUsed, { teamBuff: true }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'text',
      text: ct.ch('enerPerBlossom'),
    },
    charConditionalDocument(key, cond.c1LockAfterSkill),
  ]),
  constellation2: ct.talentTem('constellation2', [
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
    charConditionalDocument(key, cond.c2Stacks, { teamBuff: true }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.skillInField, { teamBuff: true }),
    charConditionalDocument(key, cond.c4LockAfterJump, {
      teamBuff: true,
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.c4_plunging_impact_dmg_.tag,
          unit: '%',
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6Crystallize, { teamBuff: true }),
    charConditionalDocument(key, cond.c6LockAfterDestroy, {
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
}

export default sheet
