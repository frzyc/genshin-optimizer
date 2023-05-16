import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  min,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  healNodeTalent,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'
import type { ICharacterSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Baizhu'
const elementKey: ElementKey = 'dendro'

const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3x2
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stamina: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    healHp: skillParam_gen.skill[s++],
    healBase: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    shieldHp: skillParam_gen.burst[b++],
    shieldBase: skillParam_gen.burst[b++],
    shieldDuration: skillParam_gen.burst[b++][0],
    shieldInterval: skillParam_gen.burst[b++][0],
    healHp: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    veinDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh_: skillParam_gen.passive1[0][0],
    heal_: skillParam_gen.passive1[1][0],
    dendro_dmg_: skillParam_gen.passive1[2][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    burningBloom_dmg_: skillParam_gen.passive2[1][0],
    aggSpread_dmg_: skillParam_gen.passive2[2][0],
    maxHp: skillParam_gen.passive2[3][0],
  },
  passive3: {
    heal: skillParam_gen?.passive3?.[0]?.[0] ?? 0,
  },
  constellation2: {
    atkAmount: skillParam_gen.constellation2[0],
    dmg: skillParam_gen.constellation2[1],
    heal: skillParam_gen.constellation2[2],
    cd: skillParam_gen.constellation2[3],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    healChance: skillParam_gen.constellation6[0],
    vein_dmgInc: skillParam_gen.constellation6[1],
  },
} as const

const [condA1HpStatusPath, condA1HpStatus] = cond(key, 'a1HpStatus')
const a1Below_heal_ = greaterEq(
  input.asc,
  1,
  equal(condA1HpStatus, 'below', dm.passive1.heal_)
)
const a1Above_dendro_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condA1HpStatus, 'above', dm.passive1.dendro_dmg_)
)

const [condA4AfterHealPath, condA4AfterHeal] = cond(key, 'a4AfterHeal')
const a4BurningBloom_dmg_ = greaterEq(
  input.asc,
  4,
  equal(
    condA4AfterHeal,
    'on',
    min(
      (dm.passive2.maxHp / 1000) * dm.passive2.burningBloom_dmg_,
      prod(percent(dm.passive2.burningBloom_dmg_), input.total.hp, 1 / 1000)
    )
  )
)
const a4AggSpread_dmg_ = greaterEq(
  input.asc,
  4,
  equal(
    condA4AfterHeal,
    'on',
    min(
      (dm.passive2.maxHp / 1000) * dm.passive2.aggSpread_dmg_,
      prod(percent(dm.passive2.aggSpread_dmg_), input.total.hp, 1 / 1000)
    )
  )
)

const [condC4AfterBurstPath, condC4AfterBurst] = cond(key, 'c4AfterBurst')
const c4AfterBurst_eleMas = greaterEq(
  input.constellation,
  4,
  equal(condC4AfterBurst, 'on', dm.constellation4.eleMas)
)

const burstShield = shieldNodeTalent(
  'hp',
  dm.burst.shieldHp,
  dm.burst.shieldBase,
  'burst'
)
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
    heal: healNodeTalent('hp', dm.skill.healHp, dm.skill.healBase, 'skill'),
  },
  burst: {
    shield: burstShield,
    shield_dendro: shieldElement('dendro', burstShield),
    heal: healNodeTalent('hp', dm.burst.healHp, dm.burst.healBase, 'burst'),
    dmg: dmgNode('atk', dm.burst.veinDmg, 'burst'),
  },
  passive2: {
    burning_dmg_: a4BurningBloom_dmg_,
    bloom_dmg_: { ...a4BurningBloom_dmg_ },
    hyperbloom_dmg_: { ...a4BurningBloom_dmg_ },
    burgeon_dmg_: { ...a4BurningBloom_dmg_ },
    aggravate_dmg_: a4AggSpread_dmg_,
    spread_dmg_: { ...a4AggSpread_dmg_ },
  },
  passive3: {
    heal: customHealNode(prod(percent(dm.passive3.heal), input.total.hp)),
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(percent(dm.constellation2.dmg), input.total.atk),
        'skill',
        { hit: { ele: constant(elementKey) } }
      )
    ),
    heal: greaterEq(
      input.constellation,
      2,
      healNode(
        'hp',
        prod(
          subscript(input.total.skillIndex, dm.skill.healHp, { unit: '%' }),
          percent(dm.constellation2.heal)
        ),
        subscript(input.total.skillIndex, dm.skill.healBase)
      )
    ),
  },
  constellation6: {
    vein_dmgInc: greaterEq(
      input.constellation,
      6,
      prod(percent(dm.constellation6.vein_dmgInc), input.total.hp)
    ),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)
const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'sumeru',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      heal_: a1Below_heal_,
      dendro_dmg_: a1Above_dendro_dmg_,
      burst_dmgInc: dmgFormulas.constellation6.vein_dmgInc,
    },
    teamBuff: {
      premod: {
        eleMas: c4AfterBurst_eleMas,
        ...dmgFormulas.passive2,
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
  gender: 'M',
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
            multi: i === 2 ? 2 : undefined,
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
            }),
          },
          {
            text: ct.chg('auto.skillParams.5'),
            value: dm.charged.stamina,
          },
        ],
      },
      {
        text: ct.chg(`auto.fields.plunging`),
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
            node: infoMut(dmgFormulas.skill.heal, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            canShow: (data) => data.get(input.constellation).value >= 1,
            text: st('charges'),
            value: 2,
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.headerTem('constellation1', {
        fields: [
          {
            text: st('addlCharges'),
            value: 1,
          },
        ],
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.shield, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.shield_dendro, {
              name: ct.ch(`seamlessDendro`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.1'),
            value: dm.burst.shieldDuration,
            unit: 's',
            fixed: 1,
          },
          {
            node: infoMut(dmgFormulas.burst.heal, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.dmg, {
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
            value: dm.burst.energyCost,
          },
        ],
      },
      ct.condTem('passive2', {
        path: condA4AfterHealPath,
        value: condA4AfterHeal,
        teamBuff: true,
        name: ct.ch('a4Cond'),
        states: {
          on: {
            fields: [
              ...Object.values(dmgFormulas.passive2).map((node) => ({ node })),
              {
                text: stg('duration'),
                value: dm.passive2.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.condTem('constellation4', {
        path: condC4AfterBurstPath,
        value: condC4AfterBurst,
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
      ct.headerTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.vein_dmgInc, {
              name: ct.ch('c6DmgInc'),
            }),
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.condTem('passive1', {
        path: condA1HpStatusPath,
        value: condA1HpStatus,
        name: st('activeChar'),
        states: {
          below: {
            name: st('lessPercentHP', { percent: dm.passive1.hpThresh_ * 100 }),
            fields: [
              {
                node: a1Below_heal_,
              },
            ],
          },
          above: {
            name: st('greaterEqPercentHP', {
              percent: dm.passive1.hpThresh_ * 100,
            }),
            fields: [
              {
                node: a1Above_dendro_dmg_,
              },
            ],
          },
        },
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.passive3.heal, { name: stg('healing') }),
          },
        ],
      },
    ]),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation2.dmg, {
              name: ct.ch('c2Dmg'),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation2.heal, {
              name: ct.ch('c2Heal'),
            }),
          },
          {
            canShow: (data) => data.get(input.constellation).value >= 2,
            text: stg('cd'),
            value: dm.constellation2.cd,
            unit: 's',
          },
        ],
      },
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
