import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Vodyanitsa'
const ct = charTemplates(key)
const formula = formulas.Vodyanitsa
const cond = conditionals.Vodyanitsa

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
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill.tag,
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          unit: 's',
          fieldRef: formula.skill_hornDmgInterval.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_hornDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_songHeal.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          unit: 's',
          fieldRef: formula.skill_songHealInterval.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skillHit, {
      teamBuff: true,
      label: st('hitOp.skill'),
      fields: [
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.skill_resDuration.tag,
        },
      ],
    }),
    {
      type: 'text',
      text: st('durationInc'),
    },
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
    charConditionalDocument(key, cond.skillSong, {
      teamBuff: true,
      label: ct.ch('skillSongCond'),
      fields: [
        {
          title: st('dmgMult.burst'),
          fieldRef: formula.skillSong_burst_mult_.tag,
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1Vortex, {
      teamBuff: true,
      label: ct.ch('a1Cond'),
      fields: [
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.a1Vortex_duration.tag,
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4LeadVocal, {
      teamBuff: true,
      label: ct.ch('a4LeadVocalCond'),
      fields: [
        {
          title: st('dmgInc.hydro'),
          fieldRef: formula.a4LeadVocal_hydro_dmgInc.tag,
        },
        {
          title: st('dmgInc.cryo'),
          fieldRef: formula.a4LeadVocal_cryo_dmgInc.tag,
        },
        {
          title: st('dmgInc.stellarswirl'),
          fieldRef: formula.a4LeadVocal_stellarswirl_dmgInc.tag,
        },
      ],
    }),
    charConditionalDocument(key, cond.a4Chorus, {
      teamBuff: true,
      label: ct.ch('a4ChorusCond'),
      fields: [
        {
          title: st('dmgInc.hydro'),
          fieldRef: formula.a4Chorus_hydro_dmgInc.tag,
        },
        {
          title: st('dmgInc.cryo'),
          fieldRef: formula.a4Chorus_cryo_dmgInc.tag,
        },
        {
          title: st('dmgInc.stellarswirl'),
          fieldRef: formula.a4Chorus_stellarswirl_dmgInc.tag,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.c1Heal, {
      teamBuff: true,
      label: ct.ch('c1Cond'),
      fields: [
        {
          title: ct.ch('c1Heal_atk'),
          fieldRef: formula.c1Heal_atk.tag,
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2State, {
      teamBuff: true,
      label: ct.ch('c2Cond'),
      fields: [
        {
          title: st('critDMG_.hydro'),
          fieldRef: formula.c2State_hydro_critDMG_.tag,
        },
        {
          title: st('critDMG_.cryo'),
          fieldRef: formula.c2State_cryo_critDMG_.tag,
        },
        {
          title: st('critDMG_.stellarswirl'),
          fieldRef: formula.c2State_stellarswirl_critDMG_.tag,
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4State, {
      teamBuff: true,
      label: ct.ch('c1Cond'),
      fields: [
        {
          title: ct.ch('c4HealMult_'),
          unit: '%',
          fieldRef: formula.c4State_heal_.tag,
        },
        {
          title: st('hp_'),
          fieldRef: formula.c4State_hp_.tag,
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'text',
      text: st('talentEnhance.constellation.2'),
    },
    charConditionalDocument(key, cond.skillSong, {
      teamBuff: true,
      label: ct.ch('skillSongCond'),
      fields: [
        {
          title: st('dmg_.hydro'),
          fieldRef: formula.c6Song_hydro_dmg_.tag,
        },
        {
          title: st('dmg_.cryo'),
          fieldRef: formula.c6Song_cryo_dmg_.tag,
        },
        {
          title: st('dmg_.stellarswirl'),
          fieldRef: formula.c6Song_stellarswirl_specialDMG_.tag,
        },
      ],
    }),
  ]),
}

export default sheet
