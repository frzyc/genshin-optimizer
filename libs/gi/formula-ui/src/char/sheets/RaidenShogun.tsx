import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'RaidenShogun'
const ct = charTemplates(key)
const formula = formulas.RaidenShogun
const cond = conditionals.RaidenShogun

const normalTitleIdx = [0, 1, 2, 3, 3, 4]

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
        title: ct.chg(`auto.skillParams.${normalTitleIdx[i]}`),
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
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged.tag,
        },
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
          fieldRef: formula.skill_coorDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skillEye),
    charConditionalDocument(key, cond.skillEyeTeam, { teamBuff: true }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('burst.burstDmg'),
          fieldRef: formula.burst.tag,
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldRef: formula.burst_hit1.tag,
        },
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_hit2.tag,
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldRef: formula.burst_hit3.tag,
        },
        {
          title: ct.chg('burst.skillParams.6'),
          subtitle: '(1)',
          fieldRef: formula.burst_hit41.tag,
        },
        {
          title: ct.chg('burst.skillParams.6'),
          subtitle: '(2)',
          fieldRef: formula.burst_hit42.tag,
        },
        {
          title: ct.chg('burst.skillParams.7'),
          fieldRef: formula.burst_hit5.tag,
        },
        {
          title: ct.chg('burst.skillParams.8'),
          subtitle: '(1)',
          fieldRef: formula.burst_charged1.tag,
        },
        {
          title: ct.chg('burst.skillParams.8'),
          subtitle: '(2)',
          fieldRef: formula.burst_charged2.tag,
        },
        {
          title: ct.chg('burst.skillParams.9'),
          fieldRef: formula.burst_stam.tag,
        },
        {
          title: ct.chg('burst.skillParams.10'),
          fieldRef: formula.burst_plunge.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.burst_plungeLow.tag,
        },
        {
          title: stg('plunging.high'),
          fieldRef: formula.burst_plungeHigh.tag,
        },
        {
          title: ct.chg('burst.skillParams.12'),
          fieldRef: formula.burst_energyGen.tag,
        },
        {
          title: ct.chg('burst.skillParams.13'),
          unit: 's',
          fieldRef: formula.burst_duration.tag,
        },
        {
          title: ct.chg('burst.skillParams.14'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: ct.chg('burst.skillParams.15'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burstResolve),
    charConditionalDocument(key, cond.InBurst),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: st('infusion.electro'),
          fieldValue: '',
        },
        {
          title: st('incInterRes'),
          fieldValue: '',
        },
        {
          title: st('immuneToElectroCharged'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4, { teamBuff: true }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
