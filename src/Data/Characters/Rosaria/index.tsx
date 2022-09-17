import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { equal, greaterEq, infoMut, min, percent, prod, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Rosaria"
const elementKey: ElementKey = "cryo"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0, c1i = 0, c6i = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5.1
      skillParam_gen.auto[a++], // 5.2
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
    hit1: skillParam_gen.skill[s++],
    hit2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    hit1: skillParam_gen.burst[b++],
    hit2: skillParam_gen.burst[b++],
    dotDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    crInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0]
  },
  passive2: {
    crBonus: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
    maxBonus: skillParam_gen.passive2[p2++][0]
  },
  constellation1: {
    atkSpdInc: skillParam_gen.constellation1[c1i++],
    dmgInc: skillParam_gen.constellation1[c1i++],
    duration: skillParam_gen.constellation1[c1i++],
  },
  constellation6: {
    physShred: skillParam_gen.constellation6[c6i++],
    duration: skillParam_gen.constellation6[c6i++],
  },
} as const

const [condA1Path, condA1] = cond(key, "RosariaA1")
const [condA4Path, condA4] = cond(key, "RosariaA4")
const [condC1Path, condC1] = cond(key, "RosariaC1")
const [condC6Path, condC6] = cond(key, "DilucC6")

const nodeA1CritInc = equal(condA1, "on", greaterEq(input.asc, 1, datamine.passive1.crInc))
const nodeA4CritBonusDisp = equal(condA4, "on",
  greaterEq(input.asc, 4, min(
    prod(percent(datamine.passive2.crBonus), input.premod.critRate_),
    percent(datamine.passive2.maxBonus)
  ))
)
const nodeA4CritBonus = unequal(target.charKey, key, nodeA4CritBonusDisp)

const nodeC1AtkSpd = equal(condC1, "on", greaterEq(input.constellation, 1, datamine.constellation1.atkSpdInc))
const nodeC1NormalInc = equal(condC1, "on", greaterEq(input.constellation, 1, datamine.constellation1.dmgInc))
const nodeC6PhysShred = equal(condC6, "on", greaterEq(input.constellation, 6, -datamine.constellation6.physShred))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    hit1: dmgNode("atk", datamine.skill.hit1, "skill"),
    hit2: dmgNode("atk", datamine.skill.hit2, "skill"),
  },
  burst: {
    hit1: dmgNode("atk", datamine.burst.hit1, "burst"),
    hit2: dmgNode("atk", datamine.burst.hit2, "burst"),
    dotDmg: dmgNode("atk", datamine.burst.dotDmg, "burst"),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  premod: {
    critRate_: nodeA1CritInc,
    atkSPD_: nodeC1AtkSpd,
    normal_dmg_: nodeC1NormalInc,
  },
  teamBuff: {
    premod: {
      physical_enemyRes_: nodeC6PhysShred
    },
    total: {
      critRate_: nodeA4CritBonus
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i < 5 ? 0 : -1)}` }),
          textSuffix: i === 2 ? st("brHits", { count: 2 }) : i === 4 ? "(1)" : i === 5 ? "(2)" : ""
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          text: tr("auto.skillParams.6"),
          value: datamine.charged.stamina,
        }]
      }, {
        text: tr("auto.fields.plunging"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }]
      }]),

      skill: ct.talentTemplate("skill", [{
        fields: [{
          node: infoMut(dmgFormulas.skill.hit1, { key: `char_${key}_gen:skill.skillParams.0` }),
          textSuffix: "(1)"
        }, {
          node: infoMut(dmgFormulas.skill.hit2, { key: `char_${key}_gen:skill.skillParams.0` }),
          textSuffix: "(2)"
        }, {
          text: tr("skill.skillParams.1"),
          value: datamine.skill.cd,
          unit: 's'
        }]
      }]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.hit1, { key: `char_${key}_gen:burst.skillParams.0` }),
          textSuffix: "(1)"
        }, {
          node: infoMut(dmgFormulas.burst.hit2, { key: `char_${key}_gen:burst.skillParams.0` }),
          textSuffix: "(2)"
        }, {
          node: infoMut(dmgFormulas.burst.dotDmg, { key: `char_${key}_gen:burst.skillParams.1` })
        }, {
          text: tr("burst.skillParams.3"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: tr("burst.skillParams.4"),
          value: datamine.burst.cost,
        }]
      }, ct.conditionalTemplate("constellation6", {
        value: condC6,
        path: condC6Path,
        name: st("hitOp.skill"),
        teamBuff: true,
        states: {
          on: {
            fields: [{
              node: nodeC6PhysShred
            }, {
              text: sgt("duration"),
              value: datamine.constellation6.duration,
              unit: 's'
            }]
          }
        }
      })]),

      passive1: ct.talentTemplate("passive1", [ct.conditionalTemplate("passive1", {
        name: trm("a1"),
        value: condA1,
        path: condA1Path,
        states: {
          on: {
            fields: [{
              node: nodeA1CritInc
            }, {
              text: sgt("duration"),
              value: datamine.passive1.duration,
              unit: 's'
            }]
          }
        }
      })]),
      passive2: ct.talentTemplate("passive2", [ct.conditionalTemplate("passive2", {
        name: st("afterUse.burst"),
        value: condA4,
        path: condA4Path,
        teamBuff: true,
        // Hide for Rosaria
        canShow: unequal(input.activeCharKey, key, 1),
        states: {
          on: {
            fields: [{
              node: infoMut(nodeA4CritBonusDisp, { key: "critRate_", isTeamBuff: true }),
            }, {
              text: sgt("duration"),
              value: datamine.passive2.duration,
              unit: 's'
            }]
          }
        }
      }), ct.conditionalTemplate("passive1", {
        // A1 conditional in teambuff, if A4 is active
        path: condA1Path,
        value: condA1,
        name: trm("a1"),
        teamBuff: true,
        canShow: unequal(input.activeCharKey, key, equal(condA4, "on", 1)),
        states: {
          on: {
            fields: [{
              node: nodeA1CritInc
            }, {
              text: sgt("duration"),
              value: datamine.passive1.duration,
              unit: 's'
            }]
          }
        }
      })]),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1", [ct.conditionalTemplate("constellation1", {
        value: condC1,
        path: condC1Path,
        name: st("hitOp.crit"),
        states: {
          on: {
            fields: [{
              node: nodeC1NormalInc
            }, {
              node: nodeC1AtkSpd,
            }, {
              text: sgt("duration"),
              value: datamine.constellation1.duration,
              unit: 's'
            }]
          }
        }
      })]),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data, assets)
