import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Clorinde'
const ct = charTemplates(key)
const formula = formulas.Clorinde
const cond = conditionals.Clorinde

const autoMultis: Record<number, number> = {
  2: 2,
  3: 3,
}

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
        ...(autoMultis[i] ? { multi: autoMultis[i] } : {}),
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
          title: ct.chg('skill.skillParams.0'),
          subtitle: st('level', { count: 1 }),
          fieldRef: formula.skill_normalDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.0'),
          subtitle: st('level', { count: 2 }),
          fieldRef: formula.skill_piercingDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          subtitle: st('level', { count: 1 }),
          fieldRef: formula.skill_thrust1Dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          subtitle: st('level', { count: 2 }),
          fieldRef: formula.skill_thrust2Dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          subtitle: st('level', { count: 3 }),
          multi: 3,
          fieldRef: formula.skill_thrust3Dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          subtitle: st('level', { count: 2 }),
          fieldValue: '',
          unit: st('bond.percentOf'),
        },
        {
          title: ct.chg('skill.skillParams.3'),
          subtitle: st('level', { count: 3 }),
          fieldValue: '',
          unit: st('bond.percentOf'),
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldValue: '',
          unit: '%',
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldRef: formula.skill_bladeDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldValue: '',
          unit: 's',
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
      ],
    },
    charConditionalDocument(key, cond.c6AfterSkill, {
      label: st('afterUse.skill'),
      fields: [
        {
          title: ct.ch('c6AfterSkill_critRate_'),
          fieldValue: '',
          unit: '%',
        },
        {
          title: ct.ch('c6AfterSkill_critDMG_'),
          fieldValue: '',
          unit: '%',
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          multi: 5,
          fieldRef: formula.burst.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldValue: '',
          unit: '%',
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
    charConditionalDocument(key, cond.c4BondPercent, {
      label: st('bond.current'),
      fields: [
        {
          title: ct.ch('c4_burst_dmg_'),
          fieldValue: '',
          unit: '%',
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1Reactions, {
      label: st('teamHitOp.electroReaction'),
      fields: [
        {
          title: ct.ch('a1Reactions_normal_dmgInc'),
          fieldValue: '',
        },
        {
          title: ct.ch('a1Reactions_burst_dmgInc'),
          fieldValue: '',
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4BondChanges, {
      label: st('bond.changes'),
      fields: [
        {
          title: ct.ch('a4BondChanges_critRate_'),
          fieldValue: '',
          unit: '%',
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          multi: 2,
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
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.c6.tag,
        },
      ],
    },
  ]),
}

export default sheet
