import { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Lisa"
const elementKey: ElementKey = "electro"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0, p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ]
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
    stack0: skillParam_gen.skill[s++],
    stack1: skillParam_gen.skill[s++],
    stack2: skillParam_gen.skill[s++],
    stack3: skillParam_gen.skill[s++],
    holdCD: skillParam_gen.skill[s++][0],
    press: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
  },
  burst: {
    tick: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    unknown: skillParam_gen.passive1[0][0] // I have no idea what this is
  },
  passive2: {
    defShred: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0]
  }
} as const

const [condA4Path, condA4] = cond(key, "LisaA4")
const [condC2Path, condC2] = cond(key, "LisaC2")

const nodeA4DefShred = equal(condA4, "on", greaterEq(input.asc, 1, dm.passive2.defShred))
const nodeC2DefIncrease = equal(condC2, "on", greaterEq(input.constellation, 2, constant(0.25))) // Doesn't exist in skillParam_gen

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", dm.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    stack0: dmgNode("atk", dm.skill.stack0, "skill"),
    stack1: dmgNode("atk", dm.skill.stack1, "skill"),
    stack2: dmgNode("atk", dm.skill.stack2, "skill"),
    stack3: dmgNode("atk", dm.skill.stack3, "skill"),
    press: dmgNode("atk", dm.skill.press, "skill")
  },
  burst: {
    tick: dmgNode("atk", dm.burst.tick, "burst")
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  premod: {
    burstBoost: nodeC3,
    skillBoost: nodeC5,
    def_: nodeC2DefIncrease,
  },
  teamBuff: {
    premod: {
      enemyDefRed_: nodeA4DefShred
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {  auto: ct.talentTem("auto", [{
        text: ct.chg("auto.fields.normal"),
      }, {
        fields: dm.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) })
        }))
      }, {
        text: ct.chg("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.4`) }),
        }, {
          text: ct.chg("auto.skillParams.5"),
          value: dm.charged.stamina,
        }]
      }, {
        text: ct.chg("auto.fields.plunging"),
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
          node: infoMut(dmgFormulas.skill.press, { name: ct.chg(`skill.skillParams.0`) }),
        },
        ...range(0, 3).map(i => ({
          node: infoMut(dmgFormulas.skill[`stack${i}`], { name: ct.chg(`skill.skillParams.${2 + i}`) })
        })), {
          text: stg("press.cd"),
          value: dm.skill.pressCD,
          unit: 's'
        }, {
          text: stg("hold.cd"),
          value: dm.skill.holdCD,
          unit: 's'
        }]
      }]),

      burst: ct.talentTem("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.tick, { name: ct.chg(`burst.skillParams.0`) }),
        }, {
          text: ct.chg("burst.skillParams.1"),
          value: dm.burst.duration,
          unit: "s"
        }, {
          text: ct.chg("burst.skillParams.2"),
          value: dm.burst.cd,
          unit: "s"
        }, {
          text: ct.chg("burst.skillParams.3"),
          value: dm.burst.cost,
        }]
      }]),

      passive1: ct.talentTem("passive1"),
      passive2: ct.talentTem("passive2", [ct.condTem("passive2", {
        name: ct.ch("a4C"),
        value: condA4,
        path: condA4Path,
        teamBuff: true,
        states: {
          on: {
            fields: [{
              node: nodeA4DefShred
            }, {
              text: stg("duration"),
              value: dm.passive2.duration,
              unit: 's'
            }]
          }
        }
      })]),
      passive3: ct.talentTem("passive3"),
      constellation1: ct.talentTem("constellation1"),
      constellation2: ct.talentTem("constellation2", [ct.condTem("constellation2", {
        value: condC2,
        path: condC2Path,
        name: ct.ch("c2C"),
        states: {
          on: {
            fields: [{
              node: nodeC2DefIncrease
            }, {
              text: st("incInterRes")
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
export default new CharacterSheet(sheet, data)
