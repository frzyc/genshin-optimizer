import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { compareEq, constant, equal, greaterEq, infoMut, lookup, one, percent, prod, subscript, sum, unequal } from "../../../Formula/utils"
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { INodeFieldDisplay } from '../../../Types/fieldDisplay'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Yoimiya"
const elementKey: ElementKey = "pyro"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], //x2
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3], //x2
      skillParam_gen.auto[4],
    ]
  },
  charged: {
    hit: skillParam_gen.auto[5],
    full: skillParam_gen.auto[6],
    kindling: skillParam_gen.auto[7],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg_: skillParam_gen.skill[3],
    duration: skillParam_gen.skill[1][0],
    cd: skillParam_gen.skill[2][0]
  },
  burst: {
    dmg: skillParam_gen.burst[0],
    exp: skillParam_gen.burst[1],
    duration: skillParam_gen.burst[3][0],
    cd: skillParam_gen.burst[4][0],
    cost: skillParam_gen.burst[5][0]
  },
  passive1: {
    pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: 10,
  },
  passive2: {
    fixed_atk_: skillParam_gen.passive2[0][0],
    var_atk_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    burst_durationInc: skillParam_gen.constellation1[0],
    atk_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2]
  },
  constellation2: {
    pyro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation3: {},
  constellation4: {
    cdRed: skillParam_gen.constellation4[0]
  },
  constellation5: {},
  constellation6: {
    chance: skillParam_gen.constellation6[0],
    dmg_: skillParam_gen.constellation6[1],
  },
}

const [condSkillPath, condSkill] = cond(key, "skill")
const [condBurstPath, condBurst] = cond(key, "burst")
const [condA1Path, condA1] = cond(key, "a1")
const [condC1Path, condC1] = cond(key, "c1")
const [condC2Path, condC2] = cond(key, "c2")
const const3TalentInc = greaterEq(input.constellation, 3, 3)
const const5TalentInc = greaterEq(input.constellation, 5, 3)
const normal_dmgMult = compareEq(condSkill, "skill", subscript(input.total.skillIndex, dm.skill.dmg_, { name: st("dmgMult.normal"), unit: "%" }), one)
const a1Stacks = lookup(condA1, Object.fromEntries(range(1, dm.passive1.maxStacks).map(i => [i, constant(i)])), 0)
const pyro_dmg_ = greaterEq(input.asc, 1, equal(condSkill, "skill", infoMut(prod(percent(dm.passive1.pyro_dmg_), a1Stacks), KeyMap.info("pyro_dmg_"))))
const atk_ = greaterEq(input.asc, 4, equal(condBurst, "on", unequal(input.activeCharKey, key,
  sum(percent(dm.passive2.fixed_atk_), prod(percent(dm.passive2.var_atk_), a1Stacks)))))
const c1atk_ = equal(condC1, 'c1', percent(dm.constellation1.atk_))
const c2pyro_dmg_ = greaterEq(input.constellation, 2,
  equal(condC2, 'c2', percent(dm.constellation2.pyro_dmg_), KeyMap.info("pyro_dmg_"))
)

const normalEntries = dm.normal.hitArr.map((arr, i) => [
  i,
  dmgNode("atk", arr, "normal", { hit: { ele: compareEq(condSkill, "skill", elementKey, "physical") } }, normal_dmgMult)
])

// This might just need to be a single dmgNode of her kindling arrow, with proper scaling applied.
const kindlingEntries = dm.normal.hitArr.map((arr, i) => [i, greaterEq(input.constellation, 6,
  equal(condSkill, "skill",
    customDmgNode(
      prod(
        subscript(input.total.autoIndex, arr, { unit: "%" }),
        constant(dm.constellation6.dmg_, { name: ct.ch("c6Key_"), unit: "%" }),
        input.total.atk,
        normal_dmgMult
      ),
      "normal", {
      hit: {
        ele: compareEq(condSkill, "skill", elementKey, "physical")
      }
    })
  )
)])

export const dmgFormulas = {
  normal: Object.fromEntries(normalEntries),
  charged: {
    hit: dmgNode("atk", dm.charged.hit, "charged"),
    full: dmgNode("atk", dm.charged.full, "charged", { hit: { ele: constant(elementKey) } }),
    kindling: unequal(condSkill, "skill", dmgNode("atk", dm.charged.kindling, "charged", { hit: { ele: constant(elementKey) } }))
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {},
  burst: {
    dmg: dmgNode("atk", dm.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
    exp: dmgNode("atk", dm.burst.exp, "burst", { hit: { ele: constant(elementKey) } }),
  },
  constellation6: Object.fromEntries(kindlingEntries)
}

export const dataObj = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: const3TalentInc,
    burst: const5TalentInc,
  },
  teamBuff: {
    premod: {
      atk_,
    }
  },
  premod: {
    atk_: c1atk_,
    pyro_dmg_: sum(pyro_dmg_, c2pyro_dmg_),
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
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: [0, 3].includes(i) ? 2 : undefined,
        }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.hit, { name: ct.chg(`auto.skillParams.5`) }),
      }, {
        node: infoMut(dmgFormulas.charged.full, { name: ct.chg(`auto.skillParams.6`) }),
      }, {
        node: infoMut(dmgFormulas.charged.kindling, { name: ct.chg(`auto.skillParams.7`) }),
      }],
    }, {
      text: ct.chg(`auto.fields.plunging`),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }],
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        text: ct.chg("skill.skillParams.2"),
        value: dm.skill.cd,
        unit: 's'
      }]
    }, ct.condTem("skill", {
      name: st("afterUse.skill"),
      path: condSkillPath,
      value: condSkill,
      states: {
        skill: {
          fields: [{
            node: normal_dmgMult
          }, {
            text: ct.ch("normPyroInfus"),
          }, {
            text: ct.chg("skill.skillParams.1"),
            value: dm.skill.duration,
            unit: 's'
          }]
        }
      }
    }), ct.condTem("passive1", {
      // Conditional for self display
      canShow: equal(condSkill, "skill", 1),
      value: condA1,
      path: condA1Path,
      name: ct.chg("passive1.name"),
      states: Object.fromEntries(range(1, dm.passive1.maxStacks).map(i =>
        [i, {
          name: `${i} stack`,
          fields: [{
            node: pyro_dmg_
          }, {
            text: stg("duration"),
            value: dm.passive1.duration,
            unit: "s"
          }]
        }]
      ))
    }), ct.headerTem("constellation6", {
      canShow: equal(condSkill, "skill", 1),
      fields: dm.normal.hitArr.map((_, i): INodeFieldDisplay => ({
        node: infoMut(dmgFormulas.constellation6[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: ([0, 3].includes(i)) ? 2 : undefined,
        }),
      }))
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.burst.exp, { name: ct.chg(`burst.skillParams.1`) }),
      }, {
        text: ct.chg("burst.skillParams.2"),
        value: uiData => dm.burst.duration + (uiData.get(input.constellation).value >= 1 ? dm.constellation1.burst_durationInc : 0),
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.3"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.4"),
        value: 60,
      }]
    }, ct.headerTem("constellation1", {
      fields: [{
        text: st("durationInc"),
        value: dm.constellation1.burst_durationInc,
        unit: "s"
      }]
    }), ct.condTem("constellation1", {
      name: ct.ch("c1"),
      value: condC1,
      path: condC1Path,
      states: {
        c1: {
          fields: [{
            node: constant(dm.constellation1.atk_, KeyMap.info("atk_"))
          }, {
            text: stg("duration"),
            value: dm.constellation1.duration,
            unit: 's'
          }]
        }
      }
    })]),

    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2", [ct.condTem("passive2", {
      teamBuff: true,
      // Hide for Yoimiya
      canShow: unequal(input.activeCharKey, key, 1),
      path: condBurstPath,
      value: condBurst,
      name: ct.chg("burst.name"),
      states: {
        on: {
          fields: [{
            node: atk_
          }, {
            text: stg("duration"),
            value: dm.passive2.duration,
            unit: "s"
          }]
        }
      }
    }), ct.condTem("passive1", {
      // Conditional from P1 for team buff display when P2 is activated
      canShow: unequal(input.activeCharKey, key,
        equal(condBurst, "on", greaterEq(input.asc, 4, 1))
      ),
      teamBuff: true,
      value: condA1,
      path: condA1Path,
      name: ct.chg("passive1.name"),
      states: Object.fromEntries(range(1, dm.passive1.maxStacks).map(i =>
        [i, {
          name: `${i} stack`,
          fields: [{
            node: pyro_dmg_
          }, {
            text: stg("duration"),
            value: dm.passive1.duration,
            unit: "s"
          }]
        }]
      ))
    })]),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2", [ct.condTem("constellation2", {
      name: ct.ch("c2"),
      value: condC2,
      path: condC2Path,
      states: {
        c2: {
          fields: [{
            node: c2pyro_dmg_
          }, {
            text: stg("duration"),
            value: dm.constellation2.duration,
            unit: "s"
          }]
        }
      }
    })]),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: const3TalentInc }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: const5TalentInc }] }]),
    constellation6: ct.talentTem("constellation6")
  },
}

export default new CharacterSheet(sheet, dataObj, assets)
