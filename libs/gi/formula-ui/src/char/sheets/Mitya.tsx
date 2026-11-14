import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Mitya'
const ct = charTemplates(key)
const formula = formulas.Mitya
const cond = conditionals.Mitya

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    { type: 'text', text: ct.chg('auto.fields.normal') },
    {
      type: 'fields',
      fields: [formula.normal_0, formula.normal_1, formula.normal_2].map(
        ({ tag }, i) => ({
          title: ct.chg(`auto.skillParams.${i}`),
          fieldRef: tag,
        })
      ),
    },
    { type: 'text', text: ct.chg('auto.fields.charged') },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_stam.tag,
        },
        {
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged_detonationDmg.tag,
        },
        {
          title: ct.chg('auto.skillParams.8'),
          fieldRef: formula.charged_detonationStellarDmg.tag,
        },
      ],
    },
    { type: 'text', text: ct.chg('auto.fields.plunging') },
    {
      type: 'fields',
      fields: [
        { title: stg('plunging.dmg'), fieldRef: formula.plunging_dmg.tag },
        { title: stg('plunging.low'), fieldRef: formula.plunging_low.tag },
        { title: stg('plunging.high'), fieldRef: formula.plunging_high.tag },
      ],
    },
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill_tapDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_holdDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_steadyDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_steadyConsumptionDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_steadyDetonationDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        { title: stg('cd'), unit: 's', fieldRef: formula.skill_cd.tag },
      ],
    },
    charConditionalDocument(key, cond.skillDetonation, {
      label: ct.ch('skillDetonationCond'),
      fields: [
        {
          title: ct.ch('detonationMult_'),
          fieldRef: formula.skillDetonationMult_.tag,
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
          fieldRef: formula.burst_skillDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_beaconsCreated.tag,
        },
        { title: stg('cd'), unit: 's', fieldRef: formula.burst_cd.tag },
        { title: stg('energyCost'), fieldRef: formula.burst_enerCost.tag },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1Beacons, {
      teamBuff: true,
      label: ct.ch('a1BeaconsCond'),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4Stacks, {
      label: ct.ch('a4StacksCond'),
      fields: [
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.a4_duration.tag,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a0_stellarconduct_baseDmg_'),
          fieldRef: formula.a0_stellarconduct_baseDmg_.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.a0StellarRadianceSc, {
      teamBuff: true,
      label: st('elementalReaction.polestar.inside'),
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    { type: 'text', text: ct.ch('c1Text') },
    charConditionalDocument(key, cond.c1Core, {
      teamBuff: true,
      label: ct.ch('c1CoreCond'),
      fields: [{ title: stg('cd'), unit: 's', fieldRef: formula.c1_cd.tag }],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2CoreField, {
      teamBuff: true,
      label: ct.ch('c2CoreFieldCond'),
    }),
    charConditionalDocument(key, cond.c2CoreType, {
      teamBuff: true,
      label: ct.ch('c2CoreTypeCond'),
    }),
  ]),
  constellation3: ct.talentTem('constellation3', []),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'fields',
      fields: [{ title: st('dmg'), fieldRef: formula.c4.tag }],
    },
  ]),
  constellation5: ct.talentTem('constellation5', []),
  constellation6: ct.talentTem('constellation6', []),
}

export default sheet
