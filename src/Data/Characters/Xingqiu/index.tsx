import { CharacterData } from 'pipeline'
import { input } from "../../../Formula/index"
import { constant, equal, greaterEq, infoMut, min, one, percent, prod, subscript, sum } from "../../../Formula/utils"
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, customHealNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Xingqiu"
const elementKey: ElementKey = "hydro"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      (skillParam_gen.auto[0]),//1
      (skillParam_gen.auto[1]),//2
      (skillParam_gen.auto[2]),//3
      // (skillParam_gen.auto[3]),
      (skillParam_gen.auto[4]),//4
      (skillParam_gen.auto[5]),//5
      // (skillParam_gen.auto[6]),
    ]
  },
  charged: {
    hit1: (skillParam_gen.auto[7]),
    hit2: (skillParam_gen.auto[8]),
    stamina: skillParam_gen.auto[9][0]
  },
  plunging: {
    dmg: (skillParam_gen.auto[10]),
    low: (skillParam_gen.auto[11]),
    high: (skillParam_gen.auto[12]),
  },
  skill: {
    hit1: (skillParam_gen.skill[s++]),
    hit2: (skillParam_gen.skill[s++]),
    dmgRed_: (skillParam_gen.skill[s++]),
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: (skillParam_gen.burst[b++]),
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    hydro_dmg_: 0.20
  },
  constellation2: {
    hydro_enemyRes_: -0.15,
    skill_duration: 3
  },
  constellation4: {
    dmg_: 0.50
  },
} as const

const nodeA4 = greaterEq(input.asc, 4, datamine.passive2.hydro_dmg_)

const [condC2Path, condC2] = cond(key, "c2")
const nodeC2 = greaterEq(input.constellation, 2,
  equal(condC2, "on", datamine.constellation2.hydro_enemyRes_))

const [condSkillPath, condSkill] = cond(key, "skill")

const [condBurstPath, condBurst] = cond(key, "burst")
const nodeC4 = greaterEq(input.constellation, 4,
  equal(condBurst, "on", datamine.constellation4.dmg_), { name: ct.tr("c4dmg_") })

const nodeSkillDmgRed_ = equal(condSkill, "on",
  sum(subscript(input.total.skillIndex, datamine.skill.dmgRed_, { unit: "%" }), min(percent(0.24), prod(percent(0.2), input.premod.hydro_dmg_))))

const nodeA4Heal = customHealNode(greaterEq(input.asc, 1, prod(input.total.hp, percent(0.06))))

export const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.hit1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.hit2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    // Multiplicative DMG increase requires customDmgNode
    press1: customDmgNode(prod(
      subscript(input.total.skillIndex, datamine.skill.hit1, { unit: "%" }),
      input.total.atk,
      sum(one, nodeC4)
    ), "skill"),
    press2: customDmgNode(prod(
      subscript(input.total.skillIndex, datamine.skill.hit2, { unit: "%" }),
      input.total.atk,
      sum(one, nodeC4)
    ), "skill"),
    dmgRed_: nodeSkillDmgRed_,
  },
  passive1: {
    healing: nodeA4Heal
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      hydro_enemyRes_: nodeC2,
      dmgRed_: infoMut(nodeSkillDmgRed_, KeyMap.keyToInfo("dmgRed_")),
    }
  },
  premod: {
    hydro_dmg_: nodeA4,
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: ct.tr("constellationName"),
  title: ct.tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: ct.tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.tr(`auto.skillParams.${i}`) }),
        multi: (i === 2 || i === 4) ? 2 : undefined
      }))
    }, {
      text: ct.tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { name: ct.tr(`auto.skillParams.5`) }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { name: ct.tr(`auto.skillParams.5`) }),
        textSuffix: "(2)"
      }, {
        text: ct.tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
      }]
    }, {
      text: ct.tr(`auto.fields.plunging`),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: sgt("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: sgt("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: sgt("plunging.high") }),
      }]
    }]),

    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.press1, { name: ct.tr(`skill.skillParams.0`) }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.skill.press2, { name: ct.tr(`skill.skillParams.0`) }),
        textSuffix: "(2)"
      }, {
        text: ct.tr("skill.skillParams.2"),
        value: data => data.get(input.constellation).value >= 2
          ? `${datamine.skill.duration}s + ${datamine.constellation2.skill_duration}`
          : `${datamine.skill.duration}`,
        unit: "s"
      }, {
        text: ct.tr("skill.skillParams.3"),
        value: datamine.skill.cd,
        unit: "s"
      }]
    }, ct.conditionalTemplate("skill", {
      teamBuff: true,
      value: condSkill,
      path: condSkillPath,
      name: ct.trm("skillCond"),
      states: {
        on: {
          fields: [{
            node: dmgFormulas.skill.dmgRed_,
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        text: ct.tr("burst.skillParams.2"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: ct.tr("burst.skillParams.3"),
        value: datamine.burst.cost,
      }]
    }, ct.conditionalTemplate("burst", {
      value: condBurst,
      path: condBurstPath,
      name: ct.trm("burstCond"),
      states: {
        on: {
          fields: [{
            node: infoMut(dmgFormulas.burst.dmg, { name: ct.tr(`burst.skillParams.0`) }),
          }, {
            text: ct.tr("burst.skillParams.1"),
            value: datamine.burst.duration,
            unit: "s"
          }, {
            node: nodeC4
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1", [ct.fieldsTemplate("passive1", {
      fields: [{
        node: infoMut(dmgFormulas.passive1.healing, { name: sgt(`healing`) }),
      }]
    })]),
    passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
      fields: [{
        node: nodeA4
      }]
    })]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
      value: condC2,
      path: condC2Path,
      teamBuff: true,
      name: ct.trm("c2Cond"),
      states: {
        on: {
          fields: [{
            node: nodeC2
          }]
        }
      }
    })]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}

export default new CharacterSheet(sheet, data, assets);
