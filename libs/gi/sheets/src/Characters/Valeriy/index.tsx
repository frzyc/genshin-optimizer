import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
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
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { Typography } from '@mui/material'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
  plungingDmgNodes,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Valeriy'
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
    mortarDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    electro_dmgInc: skillParam_gen.auto[a++],
    stellarconduct_dmgInc: skillParam_gen.auto[a++],
    directiveStacks: skillParam_gen.auto[a++][0],
    directiveDuration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    shieldAtk_: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    shellDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    momentumGain: skillParam_gen.passive1[0][0],
    maxMomentumGain: skillParam_gen.passive1[1][0],
  },
  passive2: {
    nonRadiance_dmg_: skillParam_gen.passive2[0][0],
    radiance_dmg_: skillParam_gen.passive2[1][0],
    maxMomentum: 100,
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    maxEnergyRegen: skillParam_gen.constellation1[1],
    addlMomentumGain_: skillParam_gen.constellation1[2],
  },
  constellation2: {
    addlShield: skillParam_gen.constellation2[0],
    eleMas: skillParam_gen.constellation2[1],
    maxExcessMomentum: skillParam_gen.constellation2[2],
    duration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    chargingEff_: skillParam_gen.constellation4[0],
    momentumLimitInc: 30,
    maxMomentum: 104,
  },
  constellation6: {
    dmg_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    electro_critRate_: skillParam_gen.constellation6[2],
    electro_stellarconduct_critDMG_: skillParam_gen.constellation6[3],
  },
} as const

const [condA0StellarRadianceScPath, condA0StellarRadianceSc] = cond(
  key,
  'a0StellarRadianceSc'
)

const [condChargedOffensivePath, condChargedOffensive] = cond(
  key,
  'chargedOffensive'
)
const chargedOffensive_stellarconduct_dmgIncDisp = infoMut(
  equal(
    condChargedOffensive,
    'on',
    equal(
      condA0StellarRadianceSc,
      'sc',
      prod(
        subscript(input.total.autoIndex, dm.charged.stellarconduct_dmgInc, {
          unit: '%',
        }),
        input.premod.atk
      )
    )
  ),
  { path: 'stellarconduct_dmgInc', isTeamBuff: true }
)
const chargedOffensive_electro_dmgIncDisp = infoMut(
  equal(
    condChargedOffensive,
    'on',
    unequal(
      condA0StellarRadianceSc,
      'sc',
      prod(
        subscript(input.total.autoIndex, dm.charged.electro_dmgInc, {
          unit: '%',
        }),
        input.premod.atk
      )
    )
  ),
  { path: 'electro_dmgInc', isTeamBuff: true }
)
const chargedOffensive_stellarconduct_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  chargedOffensive_stellarconduct_dmgIncDisp
)
const chargedOffensive_electro_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  chargedOffensive_electro_dmgIncDisp
)

const a4MomentumSmallArr = range(5, dm.passive2.maxMomentum, 5)
const a4MomentumBigArr = range(
  5,
  dm.passive2.maxMomentum + dm.constellation4.momentumLimitInc,
  5
)
const [condA4MomentumPath, condA4Momentum] = cond(key, 'a4Momentum')
const a4Momentum = lookup(
  condA4Momentum,
  objKeyMap(a4MomentumBigArr, (momentum) =>
    momentum > dm.passive2.maxMomentum
      ? greaterEq(input.constellation, 4, momentum)
      : constant(momentum)
  ),
  naught
)
const a4Momentum_stellarconduct_dmgIncDisp = infoMut(
  greaterEq(
    input.asc,
    4,
    equal(
      condChargedOffensive,
      'on',
      equal(
        condA0StellarRadianceSc,
        'sc',
        prod(percent(dm.passive2.radiance_dmg_), input.premod.atk, a4Momentum)
      )
    )
  ),
  { path: 'stellarconduct_dmgInc', isTeamBuff: true }
)
const a4Momentum_electro_dmgIncDisp = infoMut(
  greaterEq(
    input.asc,
    4,
    equal(
      condChargedOffensive,
      'on',
      unequal(
        condA0StellarRadianceSc,
        'sc',
        prod(
          percent(dm.passive2.nonRadiance_dmg_),
          input.premod.atk,
          a4Momentum
        )
      )
    )
  ),
  { path: 'electro_dmgInc', isTeamBuff: true }
)
const a4Momentum_stellarconduct_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  a4Momentum_stellarconduct_dmgIncDisp
)
const a4Momentum_electro_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  a4Momentum_electro_dmgIncDisp
)

const [condC2SkillPath, condC2Skill] = cond(key, 'c2Skill')
const c2Skill_eleMas = greaterEq(
  input.constellation,
  2,
  equal(condC2Skill, 'on', dm.constellation2.eleMas)
)

const c6_shell_dmg_ = greaterEq(input.constellation, 6, dm.constellation6.dmg_)

const [condC6HitPath, condC6Hit] = cond(key, 'c6Hit')
const c6Hit_electro_critRate_ = greaterEq(
  input.constellation,
  6,
  equal(condC6Hit, 'on', dm.constellation6.electro_critRate_)
)
const c6Hit_stellarconduct_electro_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6Hit, 'on', dm.constellation6.electro_stellarconduct_critDMG_)
)

const skillShield = shieldNodeTalent(
  'atk',
  dm.skill.shieldAtk_,
  dm.skill.shieldFlat,
  'skill'
)
const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
    mortarDmg: dmgNode('atk', dm.charged.mortarDmg, 'charged', hitEle.electro),
    electro_dmgInc: chargedOffensive_electro_dmgIncDisp,
    stellarconduct_dmgInc: chargedOffensive_stellarconduct_dmgIncDisp,
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    skillShield,
    skillShield_electro: shieldElement('electro', skillShield),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    shellDmg: dmgNode('atk', dm.burst.shellDmg, 'burst', {
      premod: { burst_dmg_: c6_shell_dmg_ },
    }),
  },
  passive2: {
    a4Momentum_electro_dmgIncDisp,
    a4Momentum_stellarconduct_dmgIncDisp,
  },
}
const autoC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      autoBoost: autoC3,
    },
    teamBuff: {
      premod: {
        electro_dmgInc: chargedOffensive_electro_dmgInc,
        stellarconduct_dmgInc: chargedOffensive_stellarconduct_dmgInc,
        eleMas: c2Skill_eleMas,
        electro_critRate_: c6Hit_electro_critRate_,
        stellarconduct_electro_critDMG_: c6Hit_stellarconduct_electro_critDMG_,
      },
    },
    flags: {
      radiance: condA0StellarRadianceSc,
    },
  },
  {
    teamBuff: {
      premod: {
        electro_dmgInc: a4Momentum_electro_dmgInc,
        stellarconduct_dmgInc: a4Momentum_stellarconduct_dmgInc,
      },
    },
  }
)

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
            name: ct.chg('auto.skillParams.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.mortarDmg, {
            name: ct.chg('auto.skillParams.4'),
          }),
        },
        {
          text: ct.chg('auto.skillParams.5'),
          value: dm.charged.stam,
        },
      ],
    },
    // Manually insert Offensive Directive because it is a nested tooltip
    {
      text: (
        <>
          <Typography
            gutterBottom
            sx={{
              fontWeight: 'bold',
            }}
          >
            <Translate ns="tooltips_gen" key18="11370002.name" />
          </Typography>
          <Translate ns="tooltips_gen" key18="11370002.description" />
        </>
      ),
    },
    ct.condTem('auto', {
      path: condChargedOffensivePath,
      value: condChargedOffensive,
      teamBuff: true,
      name: ct.ch('offensiveCond'),
      states: {
        on: {
          fields: [
            {
              node: chargedOffensive_electro_dmgIncDisp,
            },
            {
              node: chargedOffensive_stellarconduct_dmgIncDisp,
            },
            {
              text: ct.chg('auto.skillParams.8'),
              value: dm.charged.directiveStacks,
            },
            {
              text: ct.chg('auto.skillParams.9'),
              value: dm.charged.directiveDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
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
          node: infoMut(dmgFormulas.skill.skillDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.skillShield, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.skillShield_electro, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.shieldDuration,
          unit: 's',
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.shellDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        {
          text: stg('duration'),
          value: dm.burst.duration,
          unit: 's',
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
      path: condA4MomentumPath,
      value: condA4Momentum,
      teamBuff: true,
      canShow: equal(condChargedOffensive, 'on', 1),
      name: ct.ch('momentumCond'),
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value >= 4
            ? a4MomentumBigArr
            : a4MomentumSmallArr,
          (momentum) => ({
            name: `${momentum}`,
            fields: [
              {
                node: a4Momentum_electro_dmgIncDisp,
              },
              {
                node: a4Momentum_stellarconduct_dmgIncDisp,
              },
            ],
          })
        ),
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    ct.condTem('passive3', {
      path: condA0StellarRadianceScPath,
      value: condA0StellarRadianceSc,
      teamBuff: true,
      name: st('elementalReaction.polestar.inside'),
      states: {
        sc: {
          fields: [
            {
              text: st('elementalReaction.stellar.gainRadianceSc'),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2SkillPath,
      value: condC2Skill,
      teamBuff: true,
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: c2Skill_eleMas,
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
    { fields: [{ node: autoC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.headerTem('constellation4', {
      teamBuff: true,
      fields: [
        {
          text: ct.ch('momentumLimitInc'),
          value: dm.constellation4.momentumLimitInc,
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(c6_shell_dmg_, {
            name: ct.ch('shell_dmg_'),
            unit: '%',
          }),
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condC6HitPath,
      value: condC6Hit,
      teamBuff: true,
      name: ct.ch('c6HitCond'),
      states: {
        on: {
          fields: [
            {
              node: c6Hit_electro_critRate_,
            },
            {
              node: c6Hit_stellarconduct_electro_critDMG_,
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
}
export default new CharacterSheet(sheet, data)
