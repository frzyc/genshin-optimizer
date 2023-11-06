import {
  allRegionKeys,
  type CharacterKey,
  type ElementKey,
  type RegionKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input, tally } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  sum,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  healNodeTalent,
} from '../dataUtil'
import type { ICharacterSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Charlotte'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

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
    thornDmg: skillParam_gen.auto[8],
    thornInterval: skillParam_gen.auto[9][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    photoPressDmg: skillParam_gen.skill[s++],
    photoHoldDmg: skillParam_gen.skill[s++],
    snapMarkDmg: skillParam_gen.skill[s++],
    snapMarkInterval: skillParam_gen.skill[s++][0],
    snapMarkDuration: skillParam_gen.skill[s++][0],
    focusMarkDmg: skillParam_gen.skill[s++],
    focusMarkInterval: skillParam_gen.skill[s++][0],
    focusMarkDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    finisherCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    castHealBase: skillParam_gen.burst[b++],
    castHealFlat: skillParam_gen.burst[b++],
    skillDmg: skillParam_gen.burst[b++],
    kameraHealBase: skillParam_gen.burst[b++],
    kameraHealFlat: skillParam_gen.burst[b++],
    kameraDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdReduction: skillParam_gen.passive1[0][0],
    triggers: skillParam_gen.passive1[1][0],
    cd: skillParam_gen.passive1[2][0],
  },
  passive2: {
    heal_: skillParam_gen.passive2[0][0],
    cryo_dmg_: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    healInterval: skillParam_gen.constellation1[0],
    heal: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    atk1: skillParam_gen.constellation2[0],
    atk2: skillParam_gen.constellation2[1],
    atk3: skillParam_gen.constellation2[2],
    duration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    dmg_: skillParam_gen.constellation4[0],
    energyRegen: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
    triggers: skillParam_gen.constellation4[3],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    heal: skillParam_gen.constellation6[1],
    cd: skillParam_gen.constellation6[2],
  },
} as const

const numOtherFontainians = infoMut(sum(tally.fontaine, -1), { asConst: true })
const a4_heal_ = greaterEq(
  input.asc,
  4,
  prod(numOtherFontainians, percent(dm.passive2.heal_))
)
const numNonFontainians = infoMut(
  sum(
    ...Object.entries(tally)
      .filter(
        ([key]) =>
          (allRegionKeys as readonly string[]).includes(key) &&
          key !== 'fontaine'
      )
      .map(([_key, value]) => value)
  ),
  { asConst: true }
)
const a4_cryo_dmg_ = greaterEq(
  input.asc,
  4,
  prod(numNonFontainians, percent(dm.passive2.cryo_dmg_))
)

const c2HitArr = range(1, 3)
const [condC2HitPath, condC2Hit] = cond(key, 'c2Hit')
const c2Hit_atk_ = greaterEq(
  input.constellation,
  2,
  lookup(
    condC2Hit,
    objKeyMap(c2HitArr, (hit) => percent(dm.constellation2[`atk${hit}`])),
    naught
  )
)

const [condC4MarkedPath, condC4Marked] = cond(key, 'c4Marked')
const c4Marked_burst_dmg_ = greaterEq(
  input.constellation,
  4,
  equal(condC4Marked, 'on', dm.constellation4.dmg_)
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
    thornDmg: dmgNode('atk', dm.charged.thornDmg, 'normal'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    photoPressDmg: dmgNode('atk', dm.skill.photoPressDmg, 'skill'),
    photoHoldDmg: dmgNode('atk', dm.skill.photoHoldDmg, 'skill'),
    snapMarkDmg: dmgNode('atk', dm.skill.snapMarkDmg, 'skill'),
    focusMarkDmg: dmgNode('atk', dm.skill.focusMarkDmg, 'skill'),
  },
  burst: {
    castHeal: healNodeTalent(
      'atk',
      dm.burst.castHealBase,
      dm.burst.castHealFlat,
      'burst'
    ),
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    kameraHeal: healNodeTalent(
      'atk',
      dm.burst.kameraHealBase,
      dm.burst.kameraHealFlat,
      'burst'
    ),
    kameraDmg: dmgNode('atk', dm.burst.kameraDmg, 'burst'),
  },
  constellation1: {
    heal: greaterEq(
      input.constellation,
      1,
      healNode('atk', dm.constellation1.heal, 0)
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'burst',
        { hit: { ele: constant('cryo') } }
      )
    ),
    heal: greaterEq(
      input.constellation,
      6,
      healNode('atk', percent(dm.constellation6.heal), 0)
    ),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  data_gen.ele as ElementKey,
  data_gen.region as RegionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      heal_: a4_heal_,
      cryo_dmg_: a4_cryo_dmg_,
      atk_: c2Hit_atk_,
      burst_dmg_: c4Marked_burst_dmg_,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey: data_gen.ele!,
  weaponTypeKey: data_gen.weaponType,
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
        text: ct.chg('auto.fields.arkhe'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.thornDmg, {
              name: ct.chg('auto.skillParams.7'),
            }),
          },
          {
            text: ct.chg('auto.skillParams.8'),
            value: dm.charged.thornInterval,
            unit: 's',
          },
        ],
      },
    ]),

    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.photoPressDmg, {
              name: ct.chg('skill.skillParams.0'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.photoHoldDmg, {
              name: ct.chg('skill.skillParams.1'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.snapMarkDmg, {
              name: ct.chg('skill.skillParams.2'),
            }),
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.snapMarkInterval,
            unit: 's',
            fixed: 1,
          },
          {
            text: ct.chg('skill.skillParams.4'),
            value: dm.skill.snapMarkDuration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.focusMarkDmg, {
              name: ct.chg('skill.skillParams.5'),
            }),
          },
          {
            text: ct.chg('skill.skillParams.6'),
            value: dm.skill.focusMarkInterval,
            unit: 's',
            fixed: 1,
          },
          {
            text: ct.chg('skill.skillParams.7'),
            value: dm.skill.focusMarkDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.9'),
            value: dm.skill.finisherCd,
            unit: 's',
          },
        ],
      },
      ct.condTem('constellation2', {
        value: condC2Hit,
        path: condC2HitPath,
        name: ct.ch('c2Cond'),
        states: objKeyMap(c2HitArr, (hit) => ({
          name: st('opponents', { count: hit }),
          fields: [
            { node: c2Hit_atk_ },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
          ],
        })),
      }),
      ct.condTem('constellation4', {
        value: condC4Marked,
        path: condC4MarkedPath,
        name: ct.ch('c4Cond'),
        states: {
          on: {
            fields: [
              {
                node: c4Marked_burst_dmg_,
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
            node: infoMut(dmgFormulas.burst.castHeal, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.skillDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.kameraHeal, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.kameraDmg, {
              name: ct.chg(`burst.skillParams.3`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.4'),
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
      ct.headerTem('constellation1', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation1.heal, {
              name: stg('healing'),
            }),
          },
          {
            text: st('interval'),
            value: dm.constellation1.healInterval,
            unit: 's',
          },
          {
            text: stg('duration'),
            value: dm.constellation1.duration,
            unit: 's',
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      {
        fields: [
          {
            canShow: (data) => data.get(numOtherFontainians).value > 0,
            node: a4_heal_,
          },
          {
            canShow: (data) => data.get(numNonFontainians).value > 0,
            node: a4_cryo_dmg_,
          },
        ],
      },
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.fieldsTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
          },
          {
            node: infoMut(dmgFormulas.constellation6.heal, {
              name: stg('healing'),
            }),
          },
          {
            text: stg('cd'),
            value: dm.constellation6.cd,
            unit: 's',
          },
        ],
      }),
    ]),
  },
}
export default new CharacterSheet(sheet, data)
