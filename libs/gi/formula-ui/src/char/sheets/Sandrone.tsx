import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Sandrone'
const ct = charTemplates(key)
const formula = formulas.Sandrone
const cond = conditionals.Sandrone

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
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.charged_sweepDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_beamDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_beamStellarDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_beamSsDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged_overdriveDmg.tag,
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
          title: stg('plunging.high'),
          fieldRef: formula.plunging_high.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.plunging_low.tag,
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
          subtitle: '(1)',
          fieldRef: formula.skill_prismDmg1.tag,
        },
        {
          title: ct.chg('skill.skillParams.0'),
          subtitle: '(2)',
          fieldRef: formula.skill_prismDmg2.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_prismStellarDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_prismSsDmg.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
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
          multi: 3,
          fieldRef: formula.burst_bombardDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_rayDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_rayStellarDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldRef: formula.burst_raySsDmg.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: stg('energyCost'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1Decoding),
    charConditionalDocument(key, cond.a1Tactics),
  ]),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a4_eleMas'),
          fieldRef: formula.a4_eleMas.tag,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3', [
    charConditionalDocument(key, cond.a0StellarRadianceSc, {
      fields: [
        {
          title: st('elementalReaction.stellar.gainRadianceSc'),
          fieldValue: '',
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.c1Decoding, { teamBuff: true }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2Stacks),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('constellation4.skillParams.0'),
          fieldRef: formula.c4.tag,
        },
        {
          title: stg('cd'),
          fieldRef: formula.c4_cd.tag,
          unit: 's',
        },
        {
          title: ct.chg('constellation4.skillParams.1'),
          fieldRef: formula.c4_ssDmg.tag,
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('constellation6.skillParams.0'),
          fieldRef: formula.c6.tag,
        },
        {
          title: ct.chg('constellation6.skillParams.1'),
          fieldRef: formula.c6_dmg2.tag,
        },
        {
          title: ct.chg('constellation6.skillParams.2'),
          fieldRef: formula.c6_ssDmg.tag,
        },
      ],
    },
  ]),
}

export default sheet
