import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  percent,
  prod,
  stellarDmg,
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Qiqi'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockRevelationPath, condLockRevelation] = cond(key, 'lockRevelation')
const lockRevelation = equal(condLockRevelation, 'on', 1)

const ct = charTemplates(key, lockRevelation)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    hitRegenPercent: skillParam_gen.skill[s++],
    hitRegenFlat: skillParam_gen.skill[s++],
    contRegenPercent: skillParam_gen.skill[s++],
    contRegenFlat: skillParam_gen.skill[s++],
    tickDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    castDmg: skillParam_gen.skill[s++],
    frostCoordDmg: skillParam_gen.skill[s++],
    frostCoordCd: skillParam_gen.skill[s++][0],
    newCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    healPercent: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
    stellarDmg: skillParam_gen.burst[b++],
  },
  passive2: {
    addlChance: skillParam_gen.passive2[0][0],
    cdReduce: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    newCd: skillParam_gen.lockedPassive![0][0],
    sc_dmg_: skillParam_gen.lockedPassive![1][0],
  },
  constellation1: {
    energyRestore: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    heal: skillParam_gen.constellation4[0],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    stellarconduct_dmgInc: skillParam_gen.constellation6[1],
    stacks: skillParam_gen.constellation6[2],
  },
} as const

const [condLockStellarRadianceScPath, condLockStellarRadianceSc] = cond(
  key,
  'lockStellarRadianceSc'
)

const [condLkPath, condLk] = cond(key, 'QiqiLk')
const [condA1Path, condA1] = cond(key, 'QiqiA1')
const [condC2Path, condC2] = cond(key, 'QiqiC2')
const [condC6Path, condC6] = cond(key, 'QiqiC6')

const nodeLkSuperconduct_dmg_ = equal(
  condLockRevelation,
  'on',
  equal(
    condLockStellarRadianceSc,
    'on',
    equal(condLk, 'on', dm.lockedPassive.sc_dmg_)
  )
)
const nodeLkStellarconduct_dmg_ = { ...nodeLkSuperconduct_dmg_ }
// Values here doesn't exist in skillParam_gen
const nodeA1HealingBonus_disp = greaterEq(
  input.asc,
  1,
  equal(condA1, 'on', 0.2, { path: 'incHeal_' })
)
const nodeA1HealingBonus = equal(
  input.activeCharKey,
  target.charKey,
  nodeA1HealingBonus_disp
)
const nodeC2ChargedDmgInc = equal(
  condC2,
  'on',
  greaterEq(input.constellation, 2, 0.15)
)
const nodeC2NormalDmgInc = equal(
  condC2,
  'on',
  greaterEq(input.constellation, 2, 0.15)
)
const nodeC2Atk_ = greaterEq(
  input.constellation,
  2,
  equal(
    condLockRevelation,
    'on',
    equal(condLockStellarRadianceSc, 'on', dm.constellation2.atk_)
  )
)

const nodeC6Stellarconduct_dmgIncDisp = greaterEq(
  input.constellation,
  6,
  equal(
    condLockRevelation,
    'on',
    equal(
      condC6,
      'on',
      prod(percent(dm.constellation6.stellarconduct_dmgInc), input.total.atk)
    )
  )
)
const nodeC6Stellarconduct_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  unequal(input.activeCharKey, key, nodeC6Stellarconduct_dmgIncDisp)
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
    castDmg: dmgNode('atk', dm.skill.castDmg, 'skill'),
    tickDmg: dmgNode('atk', dm.skill.tickDmg, 'skill'),
    hitRegen: healNodeTalent(
      'atk',
      dm.skill.hitRegenPercent,
      dm.skill.hitRegenFlat,
      'skill'
    ),
    contRegen: healNodeTalent(
      'atk',
      dm.skill.contRegenPercent,
      dm.skill.contRegenFlat,
      'skill'
    ),
    frostCoordDmg: equal(
      condLockRevelation,
      'on',
      dmgNode('atk', dm.skill.frostCoordDmg, 'skill')
    ),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    heal: healNodeTalent(
      'atk',
      dm.burst.healPercent,
      dm.burst.healFlat,
      'burst'
    ),
    stellarDmg: equal(
      condLockRevelation,
      'on',
      equal(
        condLockStellarRadianceSc,
        'on',
        stellarDmg(
          subscript(input.total.burstIndex, dm.burst.stellarDmg, { unit: '%' }),
          'atk',
          'stellarconduct',
          'cryo'
        )
      )
    ),
  },
  constellation4: {
    heal: greaterEq(
      input.constellation,
      4,
      equal(
        condLockRevelation,
        'on',
        customHealNode(prod(percent(dm.constellation4.heal), input.total.atk))
      )
    ),
  },
  constellation6: {
    nodeC6Stellarconduct_dmgIncDisp,
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: nodeC3,
    skillBoost: nodeC5,
    normal_dmg_: nodeC2NormalDmgInc,
    charged_dmg_: nodeC2ChargedDmgInc,
    atk_: nodeC2Atk_,
  },
  teamBuff: {
    premod: {
      incHeal_: nodeA1HealingBonus,
      superconduct_dmg_: nodeLkSuperconduct_dmg_,
      stellarconduct_dmg_: nodeLkStellarconduct_dmg_,
      stellarconduct_dmgInc: nodeC6Stellarconduct_dmgInc,
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
          multi: i === 2 || i === 3 ? 2 : undefined,
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
            name: ct.chg(`auto.skillParams.5`),
            multi: 2,
          }),
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.stamina,
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
          node: infoMut(dmgFormulas.skill.castDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.hitRegen, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.contRegen, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.tickDmg, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.frostCoordDmg, {
            name: ct.chg(`skill.skillParams.6`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.7'),
          value: dm.skill.frostCoordCd,
          unit: 's',
          fixed: 1,
        },
        {
          text: ct.chg('skill.skillParams.5'),
          value: (data) =>
            data.get(condLockRevelation).value === 'on'
              ? dm.skill.newCd
              : dm.skill.cd,
          unit: 's',
        },
      ],
    },
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
          node: infoMut(dmgFormulas.burst.heal, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.stellarDmg, {
            name: ct.chg(`burst.skillParams.5`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: dm.skill.cd,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.4'),
          value: dm.burst.cost,
        },
      ],
    },
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      teamBuff: true,
      name: ct.ch('a1C'),
      value: condA1,
      path: condA1Path,
      states: {
        on: {
          fields: [
            {
              node: nodeA1HealingBonus_disp,
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
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockRevelationPath,
      value: condLockRevelation,
      teamBuff: true,
      name: st('revelation.done'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.talentEnhance'),
            },
          ],
        },
      },
    }),
    ct.condTem('lockedPassive', {
      path: condLockStellarRadianceScPath,
      value: condLockStellarRadianceSc,
      teamBuff: true,
      canShow: lockRevelation,
      name: st('elementalReaction.polestar.inside'),
      states: {
        on: {
          fields: [
            {
              text: st('elementalReaction.gainRadianceSc'),
            },
          ],
        },
      },
    }),
    ct.condTem('lockedPassive', {
      path: condLkPath,
      value: condLk,
      teamBuff: true,
      canShow: equal(
        condLockRevelation,
        'on',
        equal(condLockStellarRadianceSc, 'on', 1)
      ),
      name: ct.ch('lockCond'),
      states: {
        on: {
          fields: [
            {
              node: nodeLkSuperconduct_dmg_,
            },
            {
              node: nodeLkStellarconduct_dmg_,
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      value: condC2,
      path: condC2Path,
      name: st('enemyAffected.cryo'),
      states: {
        on: {
          fields: [
            {
              node: nodeC2NormalDmgInc,
            },
            {
              node: nodeC2ChargedDmgInc,
            },
          ],
        },
      },
    }),
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: nodeC2Atk_,
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.heal, {
            name: stg('healing'),
          }),
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6Path,
      value: condC6,
      teamBuff: true,
      canShow: equal(condLockRevelation, 'on', 1),
      name: ct.ch('c6Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(nodeC6Stellarconduct_dmgIncDisp, {
                path: 'stellarconduct_dmgInc',
                isTeamBuff: true,
              }),
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
