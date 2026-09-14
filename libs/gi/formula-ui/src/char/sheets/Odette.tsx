import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Odette'
const ct = charTemplates(key)
const formula = formulas.Odette
const cond = conditionals.Odette

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
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_stam.tag,
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
          fieldRef: formula.skill_codaDotDmg.tag,
        },
        {
          title: ct.ch('codaStellarconductDmg'),
          fieldRef: formula.skill_codaStellarconductDmg.tag,
        },
        {
          title: ct.ch('codaStellarswirlDmg'),
          fieldRef: formula.skill_codaStellarswirlDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_plumeDmg.tag,
        },
        {
          title: ct.ch('plumeStellarconductDmg'),
          fieldRef: formula.skill_plumeStellarconductDmg.tag,
        },
        {
          title: ct.ch('plumeStellarswirlDmg'),
          fieldRef: formula.skill_plumeStellarswirlDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldRef: formula.skill_wingDmg.tag,
        },
        {
          title: ct.ch('wingStellarconductDmg'),
          fieldRef: formula.skill_wingStellarconductDmg.tag,
        },
        {
          title: ct.ch('wingStellarswirlDmg'),
          fieldRef: formula.skill_wingStellarswirlDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.7'),
          unit: 's',
          fieldRef: formula.skill_codaCd.tag,
        },
        {
          title: ct.chg('skill.skillParams.8'),
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
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          multi: 3,
          fieldRef: formula.burst_slashDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_finalDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.4'),
          unit: 's',
          fieldRef: formula.burst_soloDuration.tag,
        },
        {
          title: stg('energyCost'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burst),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1TeamSplendor, { teamBuff: true }),
  ]),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a4_stellar_mult_'),
          fieldRef: formula.a4_stellar_mult_.tag,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3', [
    charConditionalDocument(key, cond.a0StellarRadiance, { teamBuff: true }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: st('elementalReaction.stellar.gainRadianceSc'),
          fieldValue: '',
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2NearOpponent, { teamBuff: true }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('cd'),
          fieldRef: formula.c4_cd.tag,
          unit: 's',
        },
        {
          title: ct.chg('constellation4.skillParams.0'),
          fieldRef: formula.c4_stellarconduct_dmg.tag,
        },
        {
          title: ct.chg('constellation4.skillParams.1'),
          fieldRef: formula.c4_stellarswirl_dmg.tag,
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
