import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Durin'
const ct = charTemplates(key)
const formula = formulas.Durin
const cond = conditionals.Durin

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
          fieldRef: formula.skill_purityDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          subtitle: '(1)',
          fieldRef: formula.skill_darkDmg1.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          subtitle: '(2)',
          fieldRef: formula.skill_darkDmg2.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          subtitle: '(3)',
          fieldRef: formula.skill_darkDmg3.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldValue: '',
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.a1WhiteAnemo),
    charConditionalDocument(key, cond.a1WhiteElectro),
    charConditionalDocument(key, cond.a1WhiteGeo),
    charConditionalDocument(key, cond.c2Cryo),
    charConditionalDocument(key, cond.lockHomework),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: st('hexerei.becomeHexerei', { val: key }),
          fieldValue: '',
        },
        {
          title: st('hexerei.talentEnhance'),
          fieldValue: '',
        },
      ],
    },
    charConditionalDocument(key, cond.burstForm, { teamBuff: true }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1WhiteDendro, { teamBuff: true }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4Stack, {
      fields: [
        {
          title: ct.ch('burstPeriodic_mult_'),
          fieldRef: formula.a4Stack_burstPeriodic_mult_.tag,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.c1Stacks, { teamBuff: true }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2AfterBurst, { teamBuff: true }),
    charConditionalDocument(key, cond.c2Hydro, { teamBuff: true }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c6_burst_defIgn_'),
          fieldRef: formula.c6_burst_defIgn_.tag,
        },
        {
          title: ct.ch('c6_dark_burst_defIgn_'),
          fieldRef: formula.c6_dark_burst_defIgn_.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c6LightBurstHit, { teamBuff: true }),
  ]),
}

export default sheet
