import { ColorText } from '@genshin-optimizer/common/ui'
import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  inferInfoMut,
  infoMut,
  input,
  percent,
  prod,
  sum,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../SheetUtil'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode, hitEle } from '../dataUtil'

export default function pyro(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const condCharKey = 'TravelerPyro'
  const ct = charTemplates(key)
  const [, ch] = trans('char', condCharKey)

  const skillParam_gen = allStats.char.skillParam.TravelerPyroF
  let s = 0,
    b = 0
  const dm = {
    charged: {
      dmg1: skillParam_gen.auto[5],
      dmg2: skillParam_gen.auto[6],
    },
    skill: {
      blazingDmg: skillParam_gen.skill[s++],
      scorchingInstantDmg: skillParam_gen.skill[s++],
      scorchingDmg: skillParam_gen.skill[s++],
      nsLimit: skillParam_gen.skill[s++][0],
      cd: skillParam_gen.skill[s++][0],
    },
    burst: {
      dmg: skillParam_gen.burst[b++],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
    },
    lockedPassive: {
      charged_dmgInc: skillParam_gen.lockedPassive![7][0],
      cd: skillParam_gen.lockedPassive![8][0],
    },
    // TODO
    constellation1: {
      dmg_: 0.06, // skillParam_gen.constellation1[0],
      ns_dmg_: 0.09, // skillParam_gen.constellation1[1],
    },
    constellation4: {
      pyro_dmg_: 0.2, //skillParam_gen.constellation4[0],
      duration: 9, //skillParam_gen.constellation4[1],
    },
    constellation6: {
      crit_dmg_: 0.4, //skillParam_gen.constellation6[0],
    },
  } as const

  const [condC1SkillActivePath, condC1SkillActive] = cond(
    condCharKey,
    'c1SkillActive'
  )
  const [condC1NsPath, condC1Ns] = cond(condCharKey, 'c1Ns')
  const c1SkillActive_all_dmg_disp = greaterEq(
    input.constellation,
    1,
    equal(condC1SkillActive, 'on', dm.constellation1.dmg_),
    { path: 'all_dmg_', isTeamBuff: true }
  )
  const c1Ns_all_dmg_disp = greaterEq(
    input.constellation,
    1,
    equal(
      condC1SkillActive,
      'on',
      equal(condC1Ns, 'on', dm.constellation1.ns_dmg_)
    ),
    { path: 'all_dmg_', isTeamBuff: true }
  )
  const c1SkillActive_all_dmg_ = equal(
    input.activeCharKey,
    target.charKey,
    c1SkillActive_all_dmg_disp
  )
  const c1Ns_all_dmg_ = equal(
    input.activeCharKey,
    target.charKey,
    c1Ns_all_dmg_disp
  )

  const [condC4AfterBurstPath, condC4AfterBurst] = cond(
    condCharKey,
    'c4AfterBurst'
  )
  const c4AfterBurst_pyro_dmg_ = greaterEq(
    input.constellation,
    4,
    equal(condC4AfterBurst, 'on', dm.constellation4.pyro_dmg_)
  )

  const [condC6InNsPath, condC6InNs] = cond(condCharKey, 'c6InNs')
  const c6InNs_infusion = greaterEqStr(
    input.constellation,
    6,
    equalStr(condC6InNs, 'on', constant('pyro'))
  )
  const c6InNs_normal_critDMG_ = greaterEq(
    input.constellation,
    6,
    equal(condC6InNs, 'on', dm.constellation6.crit_dmg_)
  )
  const c6InNs_charged_critDMG_ = { ...c6InNs_normal_critDMG_ }
  const c6InNs_plunging_critDMG_ = { ...c6InNs_normal_critDMG_ }

  const [, condLockedPassive] = cond('Traveler', 'lockedPassive')
  const lockedPassive_charged_dmgInc = equal(
    condLockedPassive,
    'on',
    prod(percent(dm.lockedPassive.charged_dmgInc), input.total.atk)
  )
  const lockedPassiveData = inferInfoMut({
    ...hitEle.pyro,
    premod: { charged_dmgInc: lockedPassive_charged_dmgInc },
  })

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      blazingDmg: dmgNode('atk', dm.skill.blazingDmg, 'skill'),
      scorchingInstantDmg: dmgNode(
        'atk',
        dm.skill.scorchingInstantDmg,
        'skill'
      ),
      scorchingDmg: dmgNode('atk', dm.skill.scorchingDmg, 'skill'),
    },
    burst: {
      dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    },
    lockedPassive: {
      dmg1: equal(
        condLockedPassive,
        'on',
        dmgNode('atk', dm.charged.dmg1, 'charged', lockedPassiveData)
      ),
      dmg2: equal(
        condLockedPassive,
        'on',
        dmgNode('atk', dm.charged.dmg2, 'charged', lockedPassiveData)
      ),
    },
  } as const

  const skillC3 = greaterEq(input.constellation, 3, 3)
  const burstC5 = greaterEq(input.constellation, 5, 3)

  const data = dataObjForCharacterSheet(charKey, dmgFormulas, {
    premod: {
      burstBoost: burstC5,
      skillBoost: skillC3,
      pyro_dmg_: c4AfterBurst_pyro_dmg_,
      normal_critDMG_: c6InNs_normal_critDMG_,
      charged_critDMG_: c6InNs_charged_critDMG_,
      plunging_critDMG_: c6InNs_plunging_critDMG_,
    },
    infusion: {
      nonOverridableSelf: c6InNs_infusion,
    },
    teamBuff: {
      premod: {
        all_dmg_: sum(c1SkillActive_all_dmg_, c1Ns_all_dmg_),
      },
    },
  })

  const talent: TalentSheet = {
    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.blazingDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.scorchingInstantDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.scorchingDmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.nsLimit,
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('constellation1', {
        path: condC1SkillActivePath,
        value: condC1SkillActive,
        teamBuff: true,
        name: ch('c1Cond'),
        states: {
          on: {
            fields: [
              {
                node: c1SkillActive_all_dmg_disp,
              },
            ],
          },
        },
      }),
      ct.condTem('constellation1', {
        path: condC1NsPath,
        value: condC1Ns,
        canShow: equal(condC1SkillActive, 'on', 1),
        teamBuff: true,
        name: st('nightsoul.blessing'),
        states: {
          on: {
            fields: [
              {
                node: c1Ns_all_dmg_disp,
              },
            ],
          },
        },
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.dmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            text: stg('cd'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: stg('energyCost'),
            value: dm.burst.enerCost,
          },
        ],
      },
      ct.condTem('constellation4', {
        path: condC4AfterBurstPath,
        value: condC4AfterBurst,
        name: st('afterUse.burst'),
        states: {
          on: {
            fields: [
              {
                node: c4AfterBurst_pyro_dmg_,
              },
              {
                text: stg('duration'),
                value: dm.constellation4.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    lockedPassive: ct.talentTem('lockedPassive', [
      ct.fieldsTem('lockedPassive', {
        canShow: equal(condLockedPassive, 'on', 1),
        fields: [
          {
            node: infoMut(dmgFormulas.lockedPassive.dmg1, {
              name: ct.chg('auto.skillParams.5'),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.lockedPassive.dmg2, {
              name: ct.chg('auto.skillParams.5'),
              textSuffix: '(2)',
            }),
          },
          {
            node: lockedPassive_charged_dmgInc,
          },
          {
            text: stg('cd'),
            value: dm.lockedPassive.cd,
            unit: 's',
          },
        ],
      }),
    ]),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: skillC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        path: condC6InNsPath,
        value: condC6InNs,
        name: st('nightsoul.blessing'),
        states: {
          on: {
            fields: [
              {
                text: <ColorText color="pyro">{st('infusion.pyro')}</ColorText>,
              },
              {
                node: c6InNs_normal_critDMG_,
              },
              {
                node: c6InNs_charged_critDMG_,
              },
              {
                node: c6InNs_plunging_critDMG_,
              },
            ],
          },
        },
      }),
    ]),
  }

  return {
    talent,
    data,
  }
}
