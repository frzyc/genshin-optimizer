import { objKeyValMap } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lessThan,
  percent,
  prod,
  subscript,
  sum,
  tally,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Xilonen'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[(a += 2)], // 2x2
      skillParam_gen.auto[++a], // 3
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  nightsoul: {
    hitArr: [
      skillParam_gen.auto[++a],
      skillParam_gen.auto[++a],
      skillParam_gen.auto[++a],
      skillParam_gen.auto[++a],
    ],
  },
  skill: {
    rushDmg: skillParam_gen.skill[s++],
    enemyRes_: skillParam_gen.skill[s++].map((val) => -val),
    sourceDuration: skillParam_gen.skill[s++][0],
    nsPointTimeLimit: skillParam_gen.skill[s++][0],
    nsPointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    healMult: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    healDuration: skillParam_gen.burst[b++][0],
    beatDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsPointGain: skillParam_gen.passive1[0][0],
    dmg_: skillParam_gen.passive1[1][0],
  },
  passive2: {
    cd: skillParam_gen.passive2[0][0],
    def_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    nsPointConsumeReduce: skillParam_gen.constellation1[0],
  },
  constellation2: {
    pyro_atk_: skillParam_gen.constellation2[0],
    hydro_hp_: skillParam_gen.constellation2[1],
    cryo_critDMG_: skillParam_gen.constellation2[2],
    geo_critDMG_: skillParam_gen.constellation2[3],
    electro_energy: skillParam_gen.constellation2[4],
    electro_burstCdReduce: skillParam_gen.constellation2[5],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
    triggerQuota: skillParam_gen.constellation4[1],
    duration: skillParam_gen.constellation4[2],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    dmgInc: skillParam_gen.constellation6[1],
    cd: skillParam_gen.constellation6[2],
    heal: skillParam_gen.constellation6[3],
  },
} as const

const [condSourceActivePath, condSourceActive] = cond(key, 'sourceActive')
const [condNsBlessingPath, condNsBlessing] = cond(key, 'nsBlessing')
const buffableEle = ['pyro', 'hydro', 'cryo', 'electro'] as const
const convertedSources = sum(...buffableEle.map((ele) => tally[ele]))
const geoSourcePossible = lessThan(convertedSources, 3, 1)
const skill_enemyRes_ = subscript(input.total.skillIndex, dm.skill.enemyRes_, {
  unit: '%',
})
const sourceActive_geo_enemyRes_ = greaterEq(
  sum(
    equal(condSourceActive, 'on', 1),
    equal(condNsBlessing, 'on', 1),
    greaterEq(input.constellation, 2, 1),
  ),
  1,
  equal(geoSourcePossible, 1, skill_enemyRes_),
)
const sourceActive_other_enemyRes_ = objKeyValMap(buffableEle, (ele) => [
  `${ele}_enemyRes_`,
  equal(condSourceActive, 'on', greaterEq(tally[ele], 1, skill_enemyRes_)),
])

const a1_normal_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condNsBlessing, 'on', lessThan(convertedSources, 2, dm.passive1.dmg_)),
)
const a1_plunging_dmg_ = { ...a1_normal_dmg_ }

const [condNsBurstPath, condNsBurst] = cond(key, 'nsBurst')
const a4_nsBurst_def_ = greaterEq(
  input.asc,
  4,
  equal(condNsBurst, 'on', dm.passive2.def_),
)

const ns_plunge_nodes = plungingDmgNodes('def', dm.plunging, {
  infusion: { nonOverridableSelf: constant('geo') },
})

// Don't need disp node here, since target is always Xilonen in UI
const c2_sourceActive_geo_all_dmg_ = greaterEq(
  input.constellation,
  2,
  lessThan(
    sourceActive_geo_enemyRes_,
    -0.01,
    equal(target.charEle, 'geo', dm.constellation2.geo_critDMG_),
  ),
)
const c2_sourceActive_pyro_atk_disp = greaterEq(
  input.constellation,
  2,
  greaterEq(
    tally.pyro,
    1,
    equal(condSourceActive, 'on', dm.constellation2.pyro_atk_),
  ),
  { path: 'atk_', isTeamBuff: true },
)
const c2_sourceActive_pyro_atk_ = equal(
  target.charEle,
  'pyro',
  c2_sourceActive_pyro_atk_disp,
)
const c2_sourceActive_hydro_hp_disp = greaterEq(
  input.constellation,
  2,
  greaterEq(
    tally.hydro,
    1,
    equal(condSourceActive, 'on', dm.constellation2.hydro_hp_),
  ),
  { path: 'hp_', isTeamBuff: true },
)
const c2_sourceActive_hydro_hp_ = equal(
  target.charEle,
  'hydro',
  c2_sourceActive_hydro_hp_disp,
)
const c2_sourceActive_cryo_critDMG_disp = greaterEq(
  input.constellation,
  2,
  greaterEq(
    tally.cryo,
    1,
    equal(condSourceActive, 'on', dm.constellation2.cryo_critDMG_),
  ),
  { path: 'critDMG_', isTeamBuff: true },
)
const c2_sourceActive_cryo_critDMG_ = equal(
  target.charEle,
  'cryo',
  c2_sourceActive_cryo_critDMG_disp,
)

const [condC4BloomingPath, condC4Blooming] = cond(key, 'c4Blooming')
const c4_normal_dmgInc = greaterEq(
  input.constellation,
  4,
  equal(
    condC4Blooming,
    'on',
    prod(percent(dm.constellation4.dmgInc), input.total.def),
  ),
)
const c4_charged_dmgInc = { ...c4_normal_dmgInc }
const c4_plunging_dmgInc = { ...c4_normal_dmgInc }

const [condC6ImperishablePath, condC6Imperishable] = cond(key, 'c6Imperishable')
const c6Imperishable_normal_dmgInc = greaterEq(
  input.constellation,
  6,
  equal(
    condC6Imperishable,
    'on',
    prod(percent(dm.constellation6.dmgInc), input.total.def),
  ),
)
const c6Imperishable_plunging_dmgInc = { ...c6Imperishable_normal_dmgInc }

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
    ),
    ...Object.fromEntries(
      dm.nightsoul.hitArr.map((arr, i) => [
        `ns${i}`,
        dmgNode('def', arr, 'normal', {
          infusion: { nonOverridableSelf: constant('geo') },
        }),
      ]),
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: {
    ...plungingDmgNodes('def', dm.plunging),
    ns_dmg: ns_plunge_nodes.dmg,
    ns_low: ns_plunge_nodes.low,
    ns_high: ns_plunge_nodes.high,
  },
  skill: {
    rushDmg: dmgNode('def', dm.skill.rushDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('def', dm.burst.skillDmg, 'burst'),
    heal: healNodeTalent('def', dm.burst.healMult, dm.burst.healFlat, 'burst'),
    beatDmg: dmgNode('def', dm.burst.beatDmg, 'burst'),
  },
  constellation6: {
    heal: greaterEq(
      input.constellation,
      6,
      customHealNode(prod(input.total.def, percent(dm.constellation6.heal))),
    ),
    c6Imperishable_normal_dmgInc,
    c6Imperishable_plunging_dmgInc,
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    normal_dmg_: a1_normal_dmg_,
    plunging_dmg_: a1_plunging_dmg_,
    def_: a4_nsBurst_def_,
    normal_dmgInc: c6Imperishable_normal_dmgInc,
    plunging_dmgInc: c6Imperishable_plunging_dmgInc,
  },
  teamBuff: {
    premod: {
      geo_enemyRes_: sourceActive_geo_enemyRes_,
      ...sourceActive_other_enemyRes_,
      atk_: c2_sourceActive_pyro_atk_,
      hp_: c2_sourceActive_hydro_hp_,
      all_dmg_: c2_sourceActive_geo_all_dmg_,
      critDMG_: c2_sourceActive_cryo_critDMG_,
      normal_dmgInc: c4_normal_dmgInc,
      charged_dmgInc: c4_charged_dmgInc,
      plunging_dmgInc: c4_plunging_dmgInc,
    },
  },
})

const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      text: ct.chg('auto.fields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: i === 1 ? 2 : undefined,
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.4'),
          value: dm.charged.stam,
        },
      ],
    },
    {
      text: ct.chg('auto.fields.plunging'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.plunging.dmg, {
            name: stg('plunging.dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.low, {
            name: stg('plunging.low'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.high, {
            name: stg('plunging.high'),
          }),
        },
      ],
    },
    {
      text: ct.chg('auto.fields.nightsoul'),
    },
    {
      fields: [
        ...dm.nightsoul.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[`ns${i}`], {
            name: ct.chg(`auto.skillParams.${i + 7}`),
          }),
        })),
        {
          node: infoMut(dmgFormulas.plunging.ns_dmg, {
            name: ct.ch('ns_dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.ns_low, {
            name: ct.ch('ns_low'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.ns_high, {
            name: ct.ch('ns_high'),
          }),
        },
      ],
    },
    ct.headerTem('passive1', {
      canShow: lessThan(convertedSources, 2, 1),
      fields: [
        {
          node: a1_normal_dmg_,
        },
        {
          node: a1_plunging_dmg_,
        },
      ],
    }),
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.rushDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.nsPointTimeLimit,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.nsPointLimit,
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      path: condSourceActivePath,
      value: condSourceActive,
      name: ct.ch('sourceCond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              text: ct.ch('sourceActive'),
            },
            {
              text: stg('duration'),
              value: dm.skill.sourceDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.condTem('skill', {
      path: condNsBlessingPath,
      value: condNsBlessing,
      name: st('nightsoul.blessing'),
      canShow: equal(geoSourcePossible, 1, 1),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              text: ct.ch('geoSourceActive'),
            },
          ],
        },
      },
    }),
    ct.headerTem('skill', {
      teamBuff: true,
      fields: [
        {
          node: sourceActive_geo_enemyRes_,
        },
        ...Object.values(sourceActive_other_enemyRes_).map((node) => ({
          node,
        })),
      ],
    }),
    ct.headerTem('constellation2', {
      teamBuff: true,
      // Only show when any Source Sample is active
      canShow: greaterEq(
        sum(
          lessThan(sourceActive_geo_enemyRes_, -0.01, 1),
          greaterEq(convertedSources, 0, equal(condSourceActive, 'on', 1)),
        ),
        1,
        1,
      ),
      fields: [
        {
          canShow: (data) => data.get(geoSourcePossible).value === 1,
          text: ct.ch('geoSourceActive'),
        },
        {
          node: infoMut(
            { ...c2_sourceActive_geo_all_dmg_ },
            { variant: 'geo' },
          ),
        },
        {
          node: infoMut(
            { ...c2_sourceActive_pyro_atk_disp },
            { variant: 'pyro' },
          ),
        },
        {
          node: infoMut(
            { ...c2_sourceActive_hydro_hp_disp },
            { variant: 'hydro' },
          ),
        },
        {
          node: infoMut(
            { ...c2_sourceActive_cryo_critDMG_disp },
            { variant: 'cryo' },
          ),
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.heal, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          text: stg('duration'),
          value: dm.burst.healDuration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.burst.beatDmg, {
            name: ct.chg(`burst.skillParams.3`),
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
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condNsBurst,
      path: condNsBurstPath,
      name: st('nightsoul.partyBurst'),
      states: {
        on: {
          fields: [
            {
              node: a4_nsBurst_def_,
            },
            {
              text: stg('duration'),
              value: dm.passive2.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      value: condC4Blooming,
      path: condC4BloomingPath,
      teamBuff: true,
      name: ct.ch('c4Cond'),
      states: {
        on: {
          fields: [
            {
              node: c4_normal_dmgInc,
            },
            {
              node: c4_charged_dmgInc,
            },
            {
              node: c4_plunging_dmgInc,
            },
            {
              text: st('triggerQuota'),
              value: dm.constellation4.triggerQuota,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
            },
          ],
        },
      },
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.heal, {
            name: stg('healing'),
          }),
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condC6ImperishablePath,
      value: condC6Imperishable,
      name: ct.ch('c6Cond'),
      states: {
        on: {
          fields: [
            {
              node: c6Imperishable_normal_dmgInc,
            },
            {
              node: c6Imperishable_plunging_dmgInc,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: dm.constellation6.cd,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
