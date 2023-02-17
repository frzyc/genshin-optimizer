import { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from "../../../Formula/index"
import { compareEq, constant, equal, greaterEq, infoMut, min, one, percent, prod, subscript, sum } from "../../../Formula/utils"
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { customHealNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Xingqiu"
const elementKey: ElementKey = "hydro"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey)

let s = 0, b = 0
const dm = {
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
    burst_duration: 3
  },
  constellation4: {
    dmg_: 1.50
  },
} as const

const nodeA4 = greaterEq(input.asc, 4, dm.passive2.hydro_dmg_)

const [condC2Path, condC2] = cond(key, "c2")
const nodeC2 = greaterEq(input.constellation, 2,
  equal(condC2, "on", dm.constellation2.hydro_enemyRes_))

const [condBurstPath, condBurst] = cond(key, "burst")
const nodeC4 = compareEq(
  greaterEq(input.constellation, 4, equal(condBurst, "on", 1)),
  1,
  dm.constellation4.dmg_,
  one,
  { name: st("dmgMult.skill"), unit: "%" }
)

const nodeSkillDmgRed_ = sum(subscript(input.total.skillIndex, dm.skill.dmgRed_, { unit: "%" }), min(percent(0.24), prod(percent(0.2), input.premod.hydro_dmg_)))

const nodeA4Heal = customHealNode(greaterEq(input.asc, 1, prod(input.total.hp, percent(0.06))))

export const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", dm.charged.hit1, "charged"),
    dmg2: dmgNode("atk", dm.charged.hit2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press1: dmgNode("atk", dm.skill.hit1, "skill", undefined, nodeC4),
    press2: dmgNode("atk", dm.skill.hit2, "skill", undefined, nodeC4),
    dmgRed_: nodeSkillDmgRed_,
  },
  passive1: {
    healing: nodeA4Heal
  },
  burst: {
    dmg: dmgNode("atk", dm.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  teamBuff: {
    premod: {
      hydro_enemyRes_: nodeC2,
    }
  },
  premod: {
    skillBoost: nodeC5,
    burstBoost: nodeC3,
    hydro_dmg_: nodeA4,
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`), multi: (i === 2 || i === 4) ? 2 : undefined }),

      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { name: ct.chg(`auto.skillParams.5`), textSuffix: "(1)" }),
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { name: ct.chg(`auto.skillParams.5`), textSuffix: "(2)" }),
      }, {
        text: ct.chg("auto.skillParams.6"),
        value: dm.charged.stamina,
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
        node: infoMut(dmgFormulas.skill.press1, { name: ct.chg(`skill.skillParams.0`), textSuffix: "(1)" }),
      }, {
        node: infoMut(dmgFormulas.skill.press2, { name: ct.chg(`skill.skillParams.0`), textSuffix: "(2)" }),
      }, {
        node: infoMut(dmgFormulas.skill.dmgRed_, KeyMap.info("dmgRed_")),
      }, {
        text: ct.chg("skill.skillParams.2"),
        value: dm.skill.duration,
        unit: "s"
      }, {
        text: ct.chg("skill.skillParams.3"),
        value: dm.skill.cd,
        unit: "s"
      }]
    }]),

    burst: ct.talentTem("burst", [{
      fields: [{
        text: ct.chg("burst.skillParams.2"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.3"),
        value: dm.burst.cost,
      }]
    }, ct.condTem("burst", {
      value: condBurst,
      path: condBurstPath,
      name: ct.ch("burstCond"),
      states: {
        on: {
          fields: [{
            node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) }),
          }, {
            text: ct.chg("burst.skillParams.1"),
            value: data => data.get(input.constellation).value >= 2
              ? `${dm.burst.duration}s + ${dm.constellation2.burst_duration}s = ${dm.burst.duration + dm.constellation2.burst_duration}`
              : `${dm.burst.duration}`,
            unit: "s"
          }, {
            node: nodeC4
          }]
        }
      }
    })]),

    passive1: ct.talentTem("passive1", [ct.fieldsTem("passive1", {
      fields: [{
        node: infoMut(dmgFormulas.passive1.healing, { name: stg(`healing`) }),
      }]
    })]),
    passive2: ct.talentTem("passive2", [ct.fieldsTem("passive2", {
      fields: [{
        node: nodeA4
      }]
    })]),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2", [ct.condTem("constellation2", {
      value: condC2,
      path: condC2Path,
      teamBuff: true,
      name: ct.ch("c2Cond"),
      states: {
        on: {
          fields: [{
            node: nodeC2
          }]
        }
      }
    })]),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  },
}

export default new CharacterSheet(sheet, data);
