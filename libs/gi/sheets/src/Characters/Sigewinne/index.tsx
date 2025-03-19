import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  max,
  min,
  naught,
  percent,
  prod,
  sum,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  healNodeTalent,
  plungingDmgNodes,
  shieldElement,
  shieldNode,
} from '../dataUtil'

const key: CharacterKey = 'Sigewinne'
const skillParam_gen = allStats.char.skillParam[key]
const ele = allStats.char.data[key].ele!
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
    bubble: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    teammateHealMult: skillParam_gen.skill[s++],
    teammateHealFlat: skillParam_gen.skill[s++],
    selfHealMult: skillParam_gen.skill[s++][0],
    bond: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    energyGainPerHp: skillParam_gen.skill[s++][0],
    maxEnergyGain: skillParam_gen.skill[s++][0],
    tier_dmg: 0.05,
    tier_heal: 0.05,
  },
  burst: {
    spoutDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmgInc: skillParam_gen.passive1[0][0],
    maxDmgInc: skillParam_gen.passive1[1][0],
    duration: skillParam_gen.passive1[2][0],
    hydro_dmg_: skillParam_gen.passive1[3][0],
    triggers: skillParam_gen.passive1[4][0],
    hpThresh: skillParam_gen.passive1[5][0],
  },
  passive2: {
    heal_: skillParam_gen.passive2[0][0],
    maxHeal_: skillParam_gen.passive2[1][0],
  },
  // TODO: Updaet once DM is fixed
  constellation1: {
    dmgInc: 100,
    maxDmgInc: 3500,
  },
  constellation2: {
    shield: skillParam_gen.constellation2[0],
    hydro_enemyRes_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    durationInc: 3,
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
    maxCritRate_: skillParam_gen.constellation6[3],
    maxCritDMG_: skillParam_gen.constellation6[4],
  },
} as const

const skillTierArr = range(1, 2)
const [condSkillTierPath, condSkillTier] = cond(key, 'skillTier')
const skillTier = lookup(
  condSkillTier,
  objKeyMap(skillTierArr, (tier) => constant(tier)),
  naught
)
const skillTier_skill_dmg_ = prod(percent(dm.skill.tier_dmg), skillTier)
const skillTier_heal_ = {
  premod: { heal_: prod(percent(dm.skill.tier_heal), skillTier) },
}

const [condA1BedrestPath, condA1Bedrest] = cond(key, 'a1BedRest')
const a1Bedrest_hydro_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condA1Bedrest, 'on', dm.passive1.hydro_dmg_)
)

const [condA1ConvaPath, condA1Conva] = cond(key, 'a1Conva')
const convaAdjustedHp = max(0, sum(input.total.hp, -dm.passive1.hpThresh))
const convaMaxDmgInc = threshold(
  input.constellation,
  1,
  dm.constellation1.maxDmgInc,
  dm.passive1.maxDmgInc
)
const convaDmgInc = threshold(
  input.constellation,
  1,
  dm.constellation1.dmgInc / 1000,
  dm.passive1.dmgInc / 1000
)
const a1Conva_skill_dmgInc = greaterEq(
  input.asc,
  1,
  equal(
    condA1Conva,
    'on',
    min(convaMaxDmgInc, prod(convaAdjustedHp, convaDmgInc))
  )
)

const a4TeamBondArr = range(1000, 10000, 1000)
const [condA4TeamBondPath, condA4TeamBond] = cond(key, 'a4TeamBond')
const a4TeamBond = lookup(
  condA4TeamBond,
  objKeyMap(a4TeamBondArr, (bond) => constant(bond)),
  naught
)
const a4TeamBond_heal_ = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.heal_ / 1000), a4TeamBond)
)

const c2Shield = shieldNode('hp', percent(dm.constellation2.shield), 0)

const [condC2AfterHitPath, condC2AfterHit] = cond(key, 'c2AfterHit')
const c2AfterHit_hydro_enemyRes_ = greaterEq(
  input.constellation,
  2,
  equal(condC2AfterHit, 'on', -dm.constellation2.hydro_enemyRes_)
)

const [condC6AfterHealPath, condC6AfterHeal] = cond(key, 'c6AfterHeal')
const c6AdjustedHp = prod(input.total.hp, 1 / 1000)
const c6AfterHeal_burst_critRate_ = greaterEq(
  input.constellation,
  6,
  min(
    prod(c6AdjustedHp, percent(dm.constellation6.critRate_)),
    percent(dm.constellation6.maxCritRate_)
  )
)
const c6AfterHeal_burst_critDMG_ = greaterEq(
  input.constellation,
  6,
  min(
    prod(c6AdjustedHp, percent(dm.constellation6.critDMG_)),
    percent(dm.constellation6.maxCritDMG_)
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fullyAimed: dmgNode('atk', dm.charged.fullyAimed, 'charged', {
      hit: { ele: constant(ele) },
    }),
    bubble: dmgNode('atk', dm.charged.bubble, 'charged', {
      hit: { ele: constant(ele) },
    }),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg: dmgNode('hp', dm.skill.dmg, 'skill'),
    teammateHeal: healNodeTalent(
      'hp',
      dm.skill.teammateHealMult,
      dm.skill.teammateHealFlat,
      'skill',
      skillTier_heal_
    ),
    selfHeal: healNode('hp', dm.skill.selfHealMult, 0),
    bladeDmg: dmgNode('hp', dm.skill.bladeDmg, 'skill'),
    a1Conva_skill_dmgInc,
  },
  burst: {
    spoutDmg: dmgNode('hp', dm.burst.spoutDmg, 'burst'),
  },
  constellation2: {
    shield: greaterEq(input.constellation, 2, c2Shield),
    hydroShield: greaterEq(
      input.constellation,
      2,
      shieldElement('hydro', c2Shield)
    ),
  },
  constellation6: {
    c6AfterHeal_burst_critRate_,
    c6AfterHeal_burst_critDMG_,
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    hydro_dmg_: a1Bedrest_hydro_dmg_,
    skill_dmg_: skillTier_skill_dmg_,
    heal_: a4TeamBond_heal_,
    burst_critRate_: c6AfterHeal_burst_critRate_,
    burst_critDMG_: c6AfterHeal_burst_critDMG_,
  },
  teamBuff: {
    premod: {
      skill_dmgInc: a1Conva_skill_dmgInc,
      hydro_enemyRes_: c2AfterHit_hydro_enemyRes_,
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
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.aimed, {
            name: ct.chg('auto.skillParams.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.fullyAimed, {
            name: ct.chg('auto.skillParams.4'),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.bubble, {
            name: ct.chg('auto.skillParams.5'),
          }),
        },
      ],
    },
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.dmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.teammateHeal, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.selfHeal, {
            name: ct.chg('skill.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.bladeDmg, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.bladeInterval,
          unit: 's',
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      value: condSkillTier,
      path: condSkillTierPath,
      name: ct.ch('skillTierCond'),
      states: objKeyMap(skillTierArr, (tier) => ({
        name: `${tier}`,
        fields: [
          {
            node: skillTier_skill_dmg_,
          },
          {
            node: infoMut(skillTier_heal_.premod.heal_, {
              name: ct.ch('bubbleHeal_'),
              unit: '%',
              variant: 'heal',
              icon: (
                <StatIcon
                  statKey="heal_"
                  iconProps={{
                    fontSize: 'inherit',
                    color: 'heal',
                  }}
                />
              ),
            }),
          },
        ],
      })),
    }),
    ct.condTem('passive1', {
      value: condA1Bedrest,
      path: condA1BedrestPath,
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: a1Bedrest_hydro_dmg_,
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
    ct.condTem('passive1', {
      value: condA1Conva,
      path: condA1ConvaPath,
      name: ct.ch('convaCond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: a1Conva_skill_dmgInc,
            },
            {
              text: st('triggerQuota'),
              value: dm.passive1.triggers,
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
          node: infoMut(dmgFormulas.burst.spoutDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          text: stg('duration'),
          value: (data: UIData) =>
            data.get(input.constellation).value >= 4
              ? `${dm.burst.duration}s + ${dm.constellation4.durationInc}s = ${
                  dm.burst.duration + dm.constellation4.durationInc
                }`
              : dm.burst.duration,
          unit: 's',
          fixed: 1,
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
    ct.headerTem('constellation4', {
      fields: [
        {
          text: st('durationInc'),
          value: dm.constellation4.durationInc,
          unit: 's',
        },
      ],
    }),
    ct.condTem('constellation6', {
      value: condC6AfterHeal,
      path: condC6AfterHealPath,
      name: st('afterPerformHeal'),
      states: {
        on: {
          fields: [
            {
              node: c6AfterHeal_burst_critRate_,
            },
            {
              node: c6AfterHeal_burst_critDMG_,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condA4TeamBond,
      path: condA4TeamBondPath,
      name: ct.ch('a4Cond'),
      states: objKeyMap(a4TeamBondArr, (bond) => ({
        name: `${bond}`,
        fields: [
          {
            node: a4TeamBond_heal_,
          },
        ],
      })),
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.shield, {
            name: st('dmgAbsorption.none'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation2.hydroShield, {
            name: st('dmgAbsorption.hydro'),
          }),
        },
      ],
    }),
    ct.condTem('constellation2', {
      value: condC2AfterHit,
      path: condC2AfterHitPath,
      teamBuff: true,
      name: st('hitOp.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: c2AfterHit_hydro_enemyRes_,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
