import { ColorText } from '@genshin-optimizer/common/ui'
import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { allElementKeys, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  infoMut,
  input,
  lookup,
  min,
  naught,
  one,
  percent,
  prod,
  stellarDmgNode,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  stellarTalentDmgNode,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Vesna'
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
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
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
    skillDmg: skillParam_gen.skill[s++],
    sword1Dmg: skillParam_gen.skill[s++],
    sword2Dmg: skillParam_gen.skill[s++],
    sword2SpiritDmg: skillParam_gen.skill[s++],
    sword2SpiritStellarswirlDmg: skillParam_gen.skill[s++],
    sword3SpiritDmg: skillParam_gen.skill[s++], // x4
    sword3SpiritStellarswirlDmg: skillParam_gen.skill[s++], // x4
    sword3SpiritFinalDmg: skillParam_gen.skill[s++],
    sword3SpiritFinalStellarswirlDmg: skillParam_gen.skill[s++],
    windPinionDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    five: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    spiritDmg: skillParam_gen.burst[b++],
    spiritStellarswirlDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    maxStacks: skillParam_gen.passive1[1][0],
    spiritMult_: skillParam_gen.passive1[2][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    eleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    base_stellarswirl_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellarswirl_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    five: skillParam_gen.constellation1[0],
    stellarswirl_dmg_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    additionalBuffMult: skillParam_gen.constellation4[0],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    transposeDmg: skillParam_gen.constellation6[1],
    spiritDmg: skillParam_gen.constellation6[2],
    stellarswirl_specialDmg_: skillParam_gen.constellation6[3],
  },
} as const

const a0_stellarswirl_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarswirl_dmg_), input.total.atk, 1 / 100),
  percent(dm.passive3.maxBase_stellarswirl_dmg_)
)

const [condA0StellarRadiancePath, condA0StellarRadiance] = cond(
  key,
  'a0StellarRadiance'
)

const [condSkillArmedPath, condSkillArmed] = cond(key, 'skillArmed')
const skillArmed_infusion = equalStr(condSkillArmed, 'on', constant('anemo'))

const [condA1StacksPath, condA1Stacks] = cond(key, 'a1Stacks')
const a1StacksArr = range(1, dm.passive1.maxStacks)
const a1Stacks_spiritMult_ = sum(
  one,
  greaterEq(
    input.asc,
    1,
    prod(
      percent(dm.passive1.spiritMult_),
      lookup(
        condA1Stacks,
        objKeyMap(a1StacksArr, (v) => constant(v)),
        naught
      )
    )
  )
)

const a4Radiance_atk_ = greaterEq(
  input.asc,
  4,
  equal(
    condA0StellarRadiance,
    'ss',
    prod(
      percent(dm.passive2.atk_),
      sum(tally.anemo, tally.cryo),
      sum(
        1,
        greaterEq(input.constellation, 4, dm.constellation4.additionalBuffMult)
      )
    )
  )
)
const a4Radiance_eleMas = greaterEq(
  input.asc,
  4,
  equal(
    condA0StellarRadiance,
    'ss',
    prod(
      dm.passive2.eleMas,
      sum(
        ...allElementKeys
          .filter((k) => k !== 'anemo' && k !== 'cryo')
          .map((e) => tally[e])
      ),
      sum(
        1,
        greaterEq(input.constellation, 4, dm.constellation4.additionalBuffMult)
      )
    )
  )
)

const c1Armed_stellarswirl_dmg_ = greaterEq(
  input.constellation,
  1,
  equal(condSkillArmed, 'on', dm.constellation1.stellarswirl_dmg_)
)

const c2Stacks_atk_ = greaterEq(
  input.constellation,
  2,
  equal(condA1Stacks, dm.passive1.maxStacks.toFixed(), dm.constellation2.atk_)
)

const c6_stellarswirl_specialDmg_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.stellarswirl_specialDmg_
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    sword1Dmg: dmgNode('atk', dm.skill.sword1Dmg, 'skill'),
    sword2Dmg: dmgNode('atk', dm.skill.sword2Dmg, 'skill'),
    sword2SpiritDmg: equal(
      condA0StellarRadiance,
      undefined,
      dmgNode(
        'atk',
        dm.skill.sword2SpiritDmg,
        'skill',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
    sword3SpiritDmg: equal(
      condA0StellarRadiance,
      undefined,
      dmgNode(
        'atk',
        dm.skill.sword3SpiritDmg,
        'skill',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
    sword3SpiritFinalDmg: equal(
      condA0StellarRadiance,
      undefined,
      dmgNode(
        'atk',
        dm.skill.sword3SpiritFinalDmg,
        'skill',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
    sword2SpiritStellarswirlDmg: equal(
      condA0StellarRadiance,
      'ss',
      stellarTalentDmgNode(
        'atk',
        dm.skill.sword2SpiritStellarswirlDmg,
        'skill',
        'stellarswirl',
        'anemo',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
    sword3SpiritStellarswirlDmg: equal(
      condA0StellarRadiance,
      'ss',
      stellarTalentDmgNode(
        'atk',
        dm.skill.sword3SpiritStellarswirlDmg,
        'skill',
        'stellarswirl',
        'anemo',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
    sword3SpiritFinalStellarswirlDmg: equal(
      condA0StellarRadiance,
      'ss',
      stellarTalentDmgNode(
        'atk',
        dm.skill.sword3SpiritFinalStellarswirlDmg,
        'skill',
        'stellarswirl',
        'anemo',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
    windPinionDmg: dmgNode('atk', dm.skill.windPinionDmg, 'skill'),
  },
  burst: {
    spiritDmg: equal(
      condA0StellarRadiance,
      undefined,
      dmgNode(
        'atk',
        dm.burst.spiritDmg,
        'burst',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
    spiritStellarswirlDmg: equal(
      condA0StellarRadiance,
      'ss',
      stellarTalentDmgNode(
        'atk',
        dm.burst.spiritStellarswirlDmg,
        'burst',
        'stellarswirl',
        'anemo',
        undefined,
        a1Stacks_spiritMult_
      )
    ),
  },
  passive3: {
    a0_stellarswirl_baseDmg_,
  },
  constellation6: {
    transposeDmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.transposeDmg), input.total.atk),
        'elemental'
      )
    ),
    swordDmg: greaterEq(
      input.constellation,
      6,
      equal(
        condA0StellarRadiance,
        undefined,
        customDmgNode(
          prod(
            percent(dm.constellation6.spiritDmg),
            input.total.atk,
            a1Stacks_spiritMult_
          ),
          'elemental'
        )
      )
    ),
    swordStellarswirlDmg: greaterEq(
      input.constellation,
      6,
      equal(
        condA0StellarRadiance,
        'ss',
        stellarDmgNode(
          percent(dm.constellation6.spiritDmg),
          'atk',
          'stellarswirl',
          'anemo',
          undefined,
          a1Stacks_spiritMult_
        )
      )
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      burstBoost: burstC5,
      skillBoost: skillC3,
      atk_: a4Radiance_atk_,
      eleMas: a4Radiance_eleMas,
      stellarswirl_dmg_: c1Armed_stellarswirl_dmg_,
      stellarswirl_specialDmg_: c6_stellarswirl_specialDmg_,
    },
    teamBuff: {
      premod: {
        stellarswirl_baseDmg_: a0_stellarswirl_baseDmg_,
      },
    },
    infusion: {
      nonOverridableSelf: skillArmed_infusion,
    },
    flags: {
      radiance: condA0StellarRadiance,
    },
  },
  {
    premod: {
      atk_: c2Stacks_atk_,
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
            name: ct.chg('auto.skillParams.6'),
          }),
        },
        {
          text: ct.chg('auto.skillParams.7'),
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
          node: infoMut(dmgFormulas.skill.skillDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword1Dmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword2Dmg, {
            name: ct.chg('skill.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword2SpiritDmg, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword3SpiritDmg, {
            name: ct.chg('skill.skillParams.4'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword3SpiritFinalDmg, {
            name: ct.chg('skill.skillParams.5'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword2SpiritStellarswirlDmg, {
            name: ct.chg('skill.skillParams.6'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword3SpiritStellarswirlDmg, {
            name: ct.chg('skill.skillParams.7'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sword3SpiritFinalStellarswirlDmg, {
            name: ct.chg('skill.skillParams.8'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.windPinionDmg, {
            name: ct.chg('skill.skillParams.9'),
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      path: condSkillArmedPath,
      value: condSkillArmed,
      name: ct.ch('skillArmedCond'),
      states: {
        on: {
          fields: [
            {
              text: <ColorText color="anemo">{st('infusion.anemo')}</ColorText>,
            },
            {
              text: ct.chg('skill.skillParams.10'),
              value: dm.skill.duration,
              unit: 's',
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
          node: infoMut(dmgFormulas.burst.spiritDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.spiritStellarswirlDmg, {
            name: ct.chg('burst.skillParams.1'),
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

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1StacksPath,
      value: condA1Stacks,
      name: ct.ch('a1StacksCond'),
      states: objKeyMap(a1StacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: infoMut(a1Stacks_spiritMult_, { name: ct.ch('spiritMult_') }),
          },
        ],
      })),
    }),
    ct.headerTem('constellation2', {
      canShow: greaterEq(c2Stacks_atk_, 0.01, 1),
      fields: [
        {
          node: c2Stacks_atk_,
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.fieldsTem('passive2', {
      canShow: equal(condA0StellarRadiance, 'ss', 1),
      fields: [
        {
          node: a4Radiance_atk_,
        },
        {
          node: a4Radiance_eleMas,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: [
        {
          node: a0_stellarswirl_baseDmg_,
        },
      ],
    }),
    ct.condTem('passive3', {
      path: condA0StellarRadiancePath,
      value: condA0StellarRadiance,
      name: st('elementalReaction.team.stellarswirl'),
      states: {
        ss: {
          fields: [
            {
              text: st('elementalReaction.stellar.gainRadianceSs'),
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condSkillArmedPath,
      value: condSkillArmed,
      name: ct.ch('skillArmedCond'),
      states: {
        on: {
          fields: [
            {
              node: c1Armed_stellarswirl_dmg_,
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
          text: st('talentEnhance.passive1'),
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.headerTem('constellation4', {
      fields: [
        {
          text: st('talentEnhance.passive2'),
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.transposeDmg, {
            name: ct.ch('transposeDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation6.swordDmg, {
            name: ct.ch('transposeSwordDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation6.swordStellarswirlDmg, {
            name: ct.ch('transposeSwordStellarswirlDmg'),
          }),
        },
      ],
    },
    {
      fields: [
        {
          node: c6_stellarswirl_specialDmg_,
        },
      ],
    },
  ]),
}
export default new CharacterSheet(sheet, data)
