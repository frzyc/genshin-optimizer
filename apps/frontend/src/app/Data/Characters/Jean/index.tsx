import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import {
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import {
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
} from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Jean'
const elementKey: ElementKey = 'anemo'
const regionKey: RegionKey = 'mondstadt'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
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
    dmg: skillParam_gen.skill[s++],
    stamina: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    enterExitDmg: skillParam_gen.burst[b++],
    burstActivationAtkModifier: skillParam_gen.burst[b++],
    burstActionFlatModifier: skillParam_gen.burst[b++],
    burstRegenAtkModifier: skillParam_gen.burst[b++],
    burstRegenFlatModifier: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chance: skillParam_gen.passive1[p1++][0],
    atkPercentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    energyRegen: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    increaseDmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    moveSpd: skillParam_gen.constellation2[0],
    atkSpd: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    anemoRes: skillParam_gen.constellation4[0],
  },
  constellation6: {
    dmgReduction: skillParam_gen.constellation6[0],
  },
} as const

const regen = healNodeTalent(
  'atk',
  dm.burst.burstActivationAtkModifier,
  dm.burst.burstActionFlatModifier,
  'burst'
)
const contRegen = healNodeTalent(
  'atk',
  dm.burst.burstRegenAtkModifier,
  dm.burst.burstRegenFlatModifier,
  'burst'
)
const a1Regen = greaterEq(
  input.asc,
  1,
  customHealNode(prod(percent(dm.passive1.atkPercentage), input.total.atk))
)

const [condC1Path, condC1] = cond(key, 'c1')
const skill_dmg_ = equal(
  condC1,
  'on',
  greaterEq(input.constellation, 1, dm.constellation1.increaseDmg)
)

const [condC2Path, condC2] = cond(key, 'c2')
const atkSPD_ = equal(
  condC2,
  'on',
  greaterEq(input.constellation, 2, percent(dm.constellation2.atkSpd))
)
const moveSPD_ = equal(
  condC2,
  'on',
  greaterEq(input.constellation, 2, percent(dm.constellation2.moveSpd))
)

const [condC4Path, condC4] = cond(key, 'c4')
const anemo_enemyRes_ = equal(
  condC4,
  'on',
  greaterEq(
    input.constellation,
    4,
    percent(-Math.abs(dm.constellation4.anemoRes))
  )
)

const [condC6Path, condC6] = cond(key, 'c6')
const dmgRed_disp = equal(
  condC6,
  'on',
  greaterEq(input.constellation, 6, percent(dm.constellation6.dmgReduction))
)
const dmgRed_ = equal(input.activeCharKey, target.charKey, dmgRed_disp)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    enterExitDmg: dmgNode('atk', dm.burst.enterExitDmg, 'burst'),
    regen,
    contRegen,
  },
  passive1: {
    a1Regen,
  },
  constellation2: {
    atkSPD_,
    moveSPD_,
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  regionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC5,
      burstBoost: nodeC3,
      skill_dmg_,
    },
    teamBuff: {
      premod: {
        atkSPD_,
        moveSPD_,
        anemo_enemyRes_,
        dmgRed_,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: 'F',
  constellationName: ct.chg('constellationName'),
  title: ct.chg('title'),
  talent: {
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
              name: ct.chg(`auto.skillParams.5`),
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
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: `${dm.skill.stamina}`,
            unit: '/s',
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: `${dm.skill.duration}`,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: `${dm.skill.cd}`,
            unit: 's',
          },
        ],
      },
      ct.condTem('constellation1', {
        value: condC1,
        path: condC1Path,
        name: ct.ch('c1CondName'),
        states: {
          on: {
            fields: [
              {
                text: ct.ch('c1PullSpeed'),
              },
              {
                node: skill_dmg_,
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
            node: infoMut(dmgFormulas.burst.enterExitDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.regen, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.contRegen, {
              name: ct.chg(`burst.skillParams.3`),
            }),
          },
          {
            text: stg('duration'),
            value: 11,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: `${dm.burst.cd}`,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.5'),
            value: `${dm.burst.enerCost}`,
          },
        ],
      },
      ct.condTem('constellation4', {
        value: condC4,
        path: condC4Path,
        teamBuff: true,
        name: st('opponentsField'),
        states: {
          on: {
            fields: [
              {
                node: anemo_enemyRes_,
              },
            ],
          },
        },
      }),
      ct.condTem('constellation6', {
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        name: st('activeCharField'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(dmgRed_disp, KeyMap.info('dmgRed_')),
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.a1Regen, {
              name: stg(`healing`),
            }),
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            text: st('energyRegen'),
            value: dm.passive2.energyRegen,
          },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        value: condC2,
        path: condC2Path,
        teamBuff: true,
        name: st('getElementalOrbParticle'),
        states: {
          on: {
            fields: [
              {
                node: atkSPD_,
              },
              {
                node: moveSPD_,
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
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
