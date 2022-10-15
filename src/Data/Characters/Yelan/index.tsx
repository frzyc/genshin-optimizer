import { CharacterData } from 'pipeline'
import { input, tally, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Yelan"
const elementKey: ElementKey = "hydro"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x3
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    barb: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    resetChance: skillParam_gen.skill[s++][0],
    maxDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    throwDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hp_Arr: [0, ...skillParam_gen.passive1.map(([a]) => a)],
  },
  passive2: {
    baseDmg_: skillParam_gen.passive2[0][0],
    stackDmg_: skillParam_gen.passive2[1][0],
    maxDmg_: skillParam_gen.passive2[2][0],
    maxStacks: 14,
  },
  constellation1: {
    addlCharge: skillParam_gen.constellation1[0],
  },
  constellation2: {
    arrowDmg_: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation4: {
    bonusHp_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    maxHp_: skillParam_gen.constellation4[2],
    maxStacks: 4,
  },
  constellation6: {
    charges: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    dmg_: skillParam_gen.constellation6[2],
  }
}

const a1_hp_ = greaterEq(input.asc, 1, subscript(tally.ele, datamine.passive1.hp_Arr))

const [condA4StacksPath, condA4Stacks] = cond(key, "a4Stacks")
const a4Stacks = range(0, datamine.passive2.maxStacks)
const a4Dmg_Disp = greaterEq(input.asc, 4,
  lookup(condA4Stacks, Object.fromEntries(a4Stacks.map(stacks => [
    stacks,
    sum(percent(datamine.passive2.baseDmg_), prod(stacks, percent(datamine.passive2.stackDmg_)))
  ])),
    naught)
)
const a4Dmg = equal(target.charKey, input.activeCharKey, a4Dmg_Disp)

const [condC4StacksPath, condC4Stacks] = cond(key, "c4Stacks")
const c4Stacks = range(1, datamine.constellation4.maxStacks)
const c4Hp_ = greaterEq(input.constellation, 4,
  lookup(condC4Stacks, Object.fromEntries(c4Stacks.map(stacks => [
    stacks,
    prod(stacks, percent(datamine.constellation4.bonusHp_))
  ])),
    naught)
)

const [condC6ActivePath, condC6Active] = cond(key, "c6Active")
const c6Active = greaterEq(input.constellation, 6, equal(condC6Active, "on", 1))

const hitEle = { hit: { ele: constant(elementKey) } }
const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, unequal(c6Active, 1, dmgNode("atk", arr, "normal"))])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", hitEle),
    barb: dmgNode("hp", datamine.charged.barb, "charged", hitEle),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("hp", datamine.skill.dmg, "skill"),
  },
  burst: {
    pressDmg: dmgNode("hp", datamine.burst.pressDmg, "burst"),
    throwDmg: dmgNode("hp", datamine.burst.throwDmg, "burst"),
  },
  constellation2: {
    arrowDmg: greaterEq(input.constellation, 2, customDmgNode(
      prod(
        percent(datamine.constellation2.arrowDmg_),
        input.total.hp
      ),
      "burst",
      hitEle
    ))
  },
  constellation6: {
    barbDmg: equal(c6Active, 1, customDmgNode(
      prod(
        subscript(input.total.autoIndex, datamine.charged.barb, { unit: "%" }),
        percent(datamine.constellation6.dmg_),
        input.total.hp
      ),
      "charged",
      hitEle
    )),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC5,
    burst: burstC3,
  },
  premod: {
    hp_: a1_hp_,
  },
  teamBuff: {
    premod: {
      all_dmg_: a4Dmg,
      hp_: c4Hp_,
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      canShow: unequal(c6Active, 1, 1),
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: i === 3 ? 2 : undefined,
        }),
      }))
    }, ct.condTem("constellation6", {
      path: condC6ActivePath,
      value: condC6Active,
      name: ct.ch("c6.condName"),
      states: {
        on: {
          fields: [{
            node: infoMut(dmgFormulas.constellation6.barbDmg, { name: ct.ch("c6.dmg") }),
          }, {
            text: st("charges"),
            value: datamine.constellation6.charges,
          }, {
            text: stg("duration"),
            value: datamine.constellation6.duration
          }]
        }
      }
    }), {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.aimed, { name: ct.chg(`auto.skillParams.4`) }),
      }, {
        node: infoMut(dmgFormulas.charged.aimedCharged, { name: ct.chg(`auto.skillParams.5`) }),
      }]
    }, {
      text: ct.chg(`auto.fields.breakthrough`),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.barb, { name: ct.chg(`auto.skillParams.6`) }),
      }]
    }, {
      text: ct.chg(`auto.fields.plunging`),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }]
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        text: ct.chg("skill.skillParams.1"),
        value: datamine.skill.maxDuration,
        unit: "s"
      }, {
        text: stg("cd"),
        value: datamine.skill.cd,
        unit: "s"
      }, {
        canShow: (data) => data.get(input.constellation).value >= 1,
        text: st("charges"),
        value: 2
      }]
    }, ct.headerTem("constellation1", {
      fields: [{
        text: st("addlCharge"),
        value: datamine.constellation1.addlCharge,
      }]
    }), ct.condTem("constellation4", {
      path: condC4StacksPath,
      value: condC4Stacks,
      teamBuff: true,
      name: ct.ch("c4.condName"),
      states: Object.fromEntries(c4Stacks.map(stacks => [
        stacks,
        {
          name: st("stack", { count: stacks }),
          fields: [{
            node: c4Hp_,
          }, {
            text: stg("duration"),
            value: datamine.constellation4.duration,
            unit: "s"
          }]
        }
      ]))
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.pressDmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.burst.throwDmg, { name: ct.chg(`burst.skillParams.1`) }),
      }, {
        text: stg("duration"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: stg("cd"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: stg("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.condTem("passive2", {
      path: condA4StacksPath,
      value: condA4Stacks,
      teamBuff: true,
      name: st("afterUse.burst"),
      states: Object.fromEntries(a4Stacks.map(stack => [
        stack,
        {
          name: st("seconds", { count: stack }),
          fields: [{
            node: infoMut(a4Dmg_Disp, KeyMap.info("all_dmg_")),
          }]
        }
      ]))
    }), ct.headerTem("constellation2", {
      fields: [{
        node: infoMut(dmgFormulas.constellation2.arrowDmg, { name: ct.ch("c2.dmg") })
      }, {
        text: stg("cd"),
        value: datamine.constellation2.cd,
        unit: "s",
        fixed: 1,
      }]
    })]),

    passive1: ct.talentTem("passive1", [ct.fieldsTem("passive1", {
      fields: [{
        node: a1_hp_
      }]
    })]),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: burstC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: skillC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  }
}
export default new CharacterSheet(sheet, data, assets)
