import { objKeyMap } from '@genshin-optimizer/common/util'
import { type CharacterKey, absorbableEle } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
  plungingDmgNodes,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'

const key: CharacterKey = 'LanYan'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
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
    ringDmg: skillParam_gen.skill[s++],
    shieldMult: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
  },
  passive2: {
    skill_dmgInc: skillParam_gen.passive2[0][0],
    burst_dmgInc: skillParam_gen.passive2[1][0],
  },
  constellation2: {
    shieldRestore: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
} as const

const skillShield = shieldNodeTalent(
  'atk',
  dm.skill.shieldMult,
  dm.skill.shieldFlat,
  'skill'
)

const a4_skill_dmgInc = greaterEq(
  input.asc,
  4,
  prod(input.total.eleMas, percent(dm.passive2.skill_dmgInc))
)
const a4_burst_dmgInc = greaterEq(
  input.asc,
  4,
  prod(input.total.eleMas, percent(dm.passive2.burst_dmgInc))
)

const [condC4AfterBurstPath, condC4AfterBurst] = cond(key, 'c4AfterBurst')
const c4AfterBurst_eleMas = greaterEq(
  input.constellation,
  4,
  equal(condC4AfterBurst, 'on', dm.constellation4.eleMas)
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    ringDmg: dmgNode('atk', dm.skill.ringDmg, 'skill'),
    shield: skillShield,
    anemoShield: shieldElement('anemo', skillShield),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive1: {
    ...objKeyMap(absorbableEle, (ele) =>
      greaterEq(
        input.asc,
        1,
        dmgNode(
          'atk',
          dm.skill.ringDmg,
          'skill',
          hitEle[ele],
          percent(dm.passive1.dmg)
        )
      )
    ),
  },
  passive2: {
    a4_skill_dmgInc,
    a4_burst_dmgInc,
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    skill_dmgInc: a4_skill_dmgInc,
    burst_dmgInc: a4_burst_dmgInc,
  },
  teamBuff: {
    premod: {
      eleMas: c4AfterBurst_eleMas,
    },
  },
})

function autoIndex(index: number) {
  if (index > 3) {
    return index - 2
  } else if (index > 1) {
    return index - 1
  }
  return index
}
function autoSuffix(index: number) {
  if (index === 1 || index === 3) {
    return '(1)'
  } else if (index === 2 || index === 4) {
    return '(2)'
  }
  return undefined
}

const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      text: ct.chg('auto.fields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${autoIndex(i)}`),
          textSuffix: autoSuffix(i),
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
            name: ct.chg(`auto.skillParams.4`),
            multi: 3,
          }),
        },
        {
          text: ct.chg('auto.skillParams.5'),
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
          node: infoMut(dmgFormulas.skill.ringDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shield, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.anemoShield, {
            name: st('dmgAbsorption.anemo'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.duration,
          unit: 's',
          fixed: 1,
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
          node: a4_skill_dmgInc,
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.dmg, {
            name: ct.chg('burst.skillParams.0'),
            multi: 3,
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
      value: condC4AfterBurst,
      path: condC4AfterBurstPath,
      teamBuff: true,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              node: c4AfterBurst_eleMas,
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
    ct.headerTem('passive2', {
      fields: [
        {
          node: a4_burst_dmgInc,
        },
      ],
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      fields: absorbableEle.map((ele) => ({
        node: infoMut(dmgFormulas.passive1[ele], { name: st('dmg') }),
      })),
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
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
