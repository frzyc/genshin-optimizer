import {
  objKeyMap,
  objKeyValMap,
  objMap,
  range,
} from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  naught,
  percent,
  prod,
  sum,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
  plungingDmgNodes,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'

const key: CharacterKey = 'Citlali'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    obsidianDmg: skillParam_gen.skill[s++],
    shieldMult: skillParam_gen.skill[s++],
    shieldBase: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    frostfallStormDmg: skillParam_gen.skill[s++],
    initialNs: skillParam_gen.skill[s++][0],
    nsConsumption: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    nsLimit: skillParam_gen.skill[s++][0],
  },
  burst: {
    iceStormDmg: skillParam_gen.burst[b++],
    skullDmg: skillParam_gen.burst[b++],
    iceStormNsGain: skillParam_gen.burst[b++][0],
    skullNsGain: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsGain: skillParam_gen.passive1[0][0],
    cd: skillParam_gen.passive1[1][0],
    pyroHydro_enemyRes_: skillParam_gen.passive1[2][0],
    duration: skillParam_gen.passive1[3][0],
  },
  passive2: {
    frostfallStorm_dmgInc: skillParam_gen.passive2[0][0],
    iceStorm_dmgInc: skillParam_gen.passive2[1][0],
    nsGain: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    dmgInc: skillParam_gen.constellation1[0],
    triggerQuota: skillParam_gen.constellation1[1],
    addlTrigger: skillParam_gen.constellation1[2],
    cd: skillParam_gen.constellation1[3],
    phlogDec: skillParam_gen.constellation1[4],
  },
  constellation2: {
    selfEleMas: skillParam_gen.constellation2[0],
    teamEleMas: skillParam_gen.constellation2[1],
    shieldMultMaybe: skillParam_gen.constellation2[2],
    pyroHydro_enemyRes_: skillParam_gen.constellation2[3],
    duration: skillParam_gen.constellation2[4],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    nsGain: skillParam_gen.constellation4[1],
    energyRestore: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
  },
  constellation6: {
    pyro_dmg_: skillParam_gen.constellation6[0],
    hydro_dmg_: skillParam_gen.constellation6[1],
    all_dmg_: skillParam_gen.constellation6[2],
    maxStacks: skillParam_gen.constellation6[3],
  },
} as const

const skillShield = shieldNodeTalent(
  'eleMas',
  dm.skill.shieldMult,
  dm.skill.shieldBase,
  'skill',
)

const [condA1NsFreezeMeltPath, condA1NsFreezeMelt] = cond(key, 'a1NsFreezeMelt')
const a1NsFreezeMelt_pyro_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(condA1NsFreezeMelt, 'on', -dm.passive1.pyroHydro_enemyRes_),
  {
    path: 'pyro_enemyRes_',
    isTeamBuff: true,
  },
)
const a1NsFreezeMelt_hydro_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(condA1NsFreezeMelt, 'on', -dm.passive1.pyroHydro_enemyRes_),
  {
    path: 'hydro_enemyRes_',
    isTeamBuff: true,
  },
)

const a4FrostfallStorm_dmgInc = greaterEq(
  input.asc,
  4,
  prod(input.total.eleMas, percent(dm.passive2.frostfallStorm_dmgInc)),
)
const a4IceStorm_dmgInc = greaterEq(
  input.asc,
  4,
  prod(input.total.eleMas, percent(dm.passive2.iceStorm_dmgInc)),
)

const [condC1BladeConsumePath, condC1BladeConsume] = cond(key, 'c1BladeConsume')
const c1BladeConsume_dmgInc_disp = objKeyValMap(
  ['normal', 'charged', 'plunging', 'skill', 'burst'],
  (key) => [
    `${key}_dmgInc`,
    greaterEq(
      input.constellation,
      1,
      equal(
        condC1BladeConsume,
        'on',
        prod(input.total.eleMas, percent(dm.constellation1.dmgInc)),
      ),
      { path: `${key}_dmgInc`, isTeamBuff: true },
    ),
  ],
)
const c1BladeConsume_dmgInc = objMap(c1BladeConsume_dmgInc_disp, (node) =>
  unequal(target.charKey, key, node),
)

const c2EleMas = greaterEq(input.constellation, 2, dm.constellation2.selfEleMas)
const [condC2ShieldEleMasPath, condC2ShieldEleMas] = cond(key, 'c2ShieldEleMas')
const c2ShieldEleMas_disp = greaterEq(
  input.constellation,
  2,
  equal(condC2ShieldEleMas, 'on', dm.constellation2.teamEleMas),
  { path: 'eleMas', isTeamBuff: true },
)
const c2ShieldEleMas = unequal(
  target.charKey,
  key,
  equal(target.charKey, input.activeCharKey, c2ShieldEleMas_disp),
)

const c2NsFreezeMelt_pyro_enemyRes_ = greaterEq(
  input.constellation,
  2,
  {
    ...a1NsFreezeMelt_pyro_enemyRes_,
  },
  { path: 'pyro_enemyRes_', isTeamBuff: true },
)
const c2NsFreezeMelt_hydro_enemyRes_ = greaterEq(
  input.constellation,
  2,
  {
    ...a1NsFreezeMelt_hydro_enemyRes_,
  },
  { path: 'hydro_enemyRes_', isTeamBuff: true },
)

const [condC6NsConsumedPath, condC6NsConsumed] = cond(key, 'c6NsConsumed')
const c6NsConsumedArr = range(
  dm.constellation6.maxStacks / 20,
  dm.constellation6.maxStacks,
  dm.constellation6.maxStacks / 20,
)
const c6NsConsumed = lookup(
  condC6NsConsumed,
  objKeyMap(c6NsConsumedArr, (ns) => constant(ns)),
  naught,
)
const c6NsConsumed_pyro_dmg_ = greaterEq(
  input.constellation,
  6,
  prod(c6NsConsumed, dm.constellation6.pyro_dmg_),
)
const c6NsConsumed_hydro_dmg_ = greaterEq(
  input.constellation,
  6,
  prod(c6NsConsumed, dm.constellation6.hydro_dmg_),
)
const c6NsConsumed_all_dmg_ = greaterEq(
  input.constellation,
  6,
  prod(c6NsConsumed, dm.constellation6.all_dmg_),
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    obsidianDmg: dmgNode('atk', dm.skill.obsidianDmg, 'skill'),
    frostfallStormDmg: dmgNode('atk', dm.skill.frostfallStormDmg, 'skill', {
      premod: { skill_dmgInc: a4FrostfallStorm_dmgInc },
    }),
    shield: skillShield,
    shieldCryo: shieldElement('cryo', skillShield),
  },
  burst: {
    iceStormDmg: dmgNode('atk', dm.burst.iceStormDmg, 'burst', {
      premod: { burst_dmgInc: a4IceStorm_dmgInc },
    }),
    skullDmg: dmgNode('atk', dm.burst.skullDmg, 'burst'),
  },
  constellation1: {
    ...c1BladeConsume_dmgInc_disp,
  },
  constellation4: {
    dmg: greaterEq(
      input.constellation,
      4,
      customDmgNode(
        prod(input.total.eleMas, percent(dm.constellation4.dmg)),
        'elemental',
        hitEle.cryo,
      ),
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    eleMas: c2EleMas,
    all_dmg_: c6NsConsumed_all_dmg_,
  },
  teamBuff: {
    premod: {
      hydro_enemyRes_: sum(
        a1NsFreezeMelt_hydro_enemyRes_,
        c2NsFreezeMelt_hydro_enemyRes_,
      ),
      pyro_enemyRes_: sum(
        a1NsFreezeMelt_pyro_enemyRes_,
        c2NsFreezeMelt_pyro_enemyRes_,
      ),
      ...c1BladeConsume_dmgInc,
      eleMas: c2ShieldEleMas,
      pyro_dmg_: c6NsConsumed_pyro_dmg_,
      hydro_dmg_: c6NsConsumed_hydro_dmg_,
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
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.obsidianDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shield, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shieldCryo, {
            name: st('dmgAbsorption.cryo'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.shieldDuration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.shieldDuration, // TODO: maybe a new value for this?
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.nsConsumption,
          unit: '/s',
        },
        {
          node: infoMut(dmgFormulas.skill.frostfallStormDmg, {
            name: ct.chg('skill.skillParams.5'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.6'),
          value: dm.skill.nsLimit,
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.headerTem('passive2', {
      fields: [
        {
          node: infoMut(a4FrostfallStorm_dmgInc, {
            name: ct.ch('frostfallStorm_dmgInc'),
          }),
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condC6NsConsumedPath,
      value: condC6NsConsumed,
      teamBuff: true,
      name: st('nightsoul.consumed'),
      states: objKeyMap(c6NsConsumedArr, (ns) => ({
        name: st('points', { count: ns }),
        fields: [
          {
            node: c6NsConsumed_pyro_dmg_,
          },
          {
            node: c6NsConsumed_hydro_dmg_,
          },
          {
            node: c6NsConsumed_all_dmg_,
          },
        ],
      })),
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.iceStormDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.1'),
          value: dm.burst.iceStormNsGain,
        },
        {
          node: infoMut(dmgFormulas.burst.skullDmg, {
            name: ct.chg('burst.skillParams.2'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: dm.burst.skullNsGain,
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
    ct.headerTem('passive2', {
      fields: [
        {
          node: infoMut(a4IceStorm_dmgInc, { name: ct.ch('iceStorm_dmgInc') }),
        },
      ],
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      value: condA1NsFreezeMelt,
      path: condA1NsFreezeMeltPath,
      teamBuff: true,
      name: ct.ch('a1Cond'),
      states: {
        on: {
          fields: [
            {
              node: a1NsFreezeMelt_pyro_enemyRes_,
            },
            {
              node: a1NsFreezeMelt_hydro_enemyRes_,
            },
            {
              text: stg('duration'),
              value: dm.passive1.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation2', {
      canShow: equal(condA1NsFreezeMelt, 'on', 1),
      teamBuff: true,
      fields: [
        {
          node: c2NsFreezeMelt_pyro_enemyRes_,
        },
        {
          node: c2NsFreezeMelt_hydro_enemyRes_,
        },
        {
          text: stg('duration'),
          value: dm.constellation2.duration,
          unit: 's',
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1BladeConsumePath,
      value: condC1BladeConsume,
      teamBuff: true,
      name: ct.ch('c1Cond'),
      states: {
        on: {
          fields: [
            ...Object.values(c1BladeConsume_dmgInc_disp).map((node) => ({
              node,
            })),
            {
              text: st('triggerQuota'),
              value: dm.constellation1.triggerQuota,
            },
          ],
        },
      },
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: c2EleMas,
        },
      ],
    }),
    ct.condTem('constellation2', {
      path: condC2ShieldEleMasPath,
      value: condC2ShieldEleMas,
      teamBuff: true,
      name: ct.ch('c2Cond'),
      states: {
        on: {
          fields: [
            {
              node: c2ShieldEleMas_disp,
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    {
      fields: [
        { node: infoMut(dmgFormulas.constellation4.dmg, { name: st('dmg') }) },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
