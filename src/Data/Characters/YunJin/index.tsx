import { CharacterData } from 'pipeline'
import { input, tally } from '../../../Formula'
import { equal, greaterEq, infoMut, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { allElements, CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, shieldElement, shieldNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "YunJin"
const elementKey: ElementKey = "geo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5
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
    shield_: skillParam_gen.skill[s++],
    shield: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    dmgInc: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    triggerNum: skillParam_gen.burst[b++][0],
  },
  passive2: {
    dmgInc: skillParam_gen.passive2.map(a => a[0]),
  },
  constellation2: {
    normalInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    def_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    atkSpd: skillParam_gen.constellation6[0],
  }
} as const

const nodeA4 = greaterEq(input.asc, 4,
  subscript(sum(...allElements.map(ele => greaterEq(tally[ele], 1, 1))), [0, ...datamine.passive2.dmgInc], { key: '_' }))

const [condBurstPath, condBurst] = cond(key, "skill")
const nodeSkill = equal("on", condBurst, sum(
  prod(input.premod.def, sum(subscript(input.total.burstIndex, datamine.burst.dmgInc, { key: '_' }), nodeA4))))

const nodeC2 = greaterEq(input.constellation, 2, equal("on", condBurst, datamine.constellation2.normalInc))

const [condC4Path, condC4] = cond(key, "c4")
const nodeC4 = greaterEq(input.constellation, 4, equal("on", condC4, datamine.constellation4.def_))

const nodeC6 = greaterEq(input.constellation, 6, equal("on", condBurst, datamine.constellation6.atkSpd))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("def", datamine.skill.dmg, "skill"),
    dmg1: dmgNode("def", datamine.skill.dmg1, "skill"),
    dmg2: dmgNode("def", datamine.skill.dmg2, "skill"),
    shield: shieldElement("geo", shieldNodeTalent("hp", datamine.skill.shield_, datamine.skill.shield, "skill"))

  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    dmgInc: nodeSkill
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    def_: nodeC4,
    atkSPD_: nodeC6,
  },
  teamBuff: {
    premod: {
      normal_dmgInc: nodeSkill,
      normal_dmg_: nodeC2,
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i > 2 ? -1 : 0) + (i > 4 ? -1 : 0)}` }),
        textSuffix: (i === 2 || i === 4) ? "(1)" : (i === 3 || i === 5) ? "(2)" : ""
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
      }],
    }, {
      text: tr("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
      }],
    }]),

    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg1, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg2, { key: `char_${key}_gen:skill.skillParams.2` }),
      }, {
        node: infoMut(dmgFormulas.skill.shield, { key: `char_${key}_gen:skill.skillParams.3` }),
      }, {
        text: tr("skill.skillParams.4"),
        value: data => data.get(input.constellation).value >= 1
          ? `${datamine.skill.cd} - 18% = ${(datamine.skill.cd * (1 - 0.18)).toFixed(2)}`
          : `${datamine.skill.cd}`,
        unit: "s"
      }]
    }]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.5"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("burst", {
      teamBuff: true,
      value: condBurst,
      path: condBurstPath,
      name: trm("burst"),
      states: {
        on: {
          fields: [{
            node: nodeSkill
          }, {
            node: nodeC2
          }, {
            node: nodeC6
          }, {
            text: tr("burst.skillParams.2"),
            value: datamine.burst.duration,
            unit: "s"
          }, {
            text: tr("burst.skillParams.3"),
            value: datamine.burst.triggerNum,
          }]
        }
      }
    }), ct.conditionalTemplate("constellation4", {
      // C4 conditional in teambuff panel if burst is enabled
      teamBuff: true,
      canShow: unequal(input.activeCharKey, key, equal(condBurst, "on", 1)),
      value: condC4,
      path: condC4Path,
      name: trm("c4"),
      states: {
        on: {
          fields: [{
            node: nodeC4
          }, {
            text: sgt("duration"),
            value: datamine.constellation4.duration,
            unit: "s"
          },]
        }
      }
    })
    ]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
      fields: [{ node: infoMut(nodeA4, { key: `char_${key}:a4Inc_` }) }]
    })]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [{ fields: [{ node: nodeC2 }] }]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.conditionalTemplate("constellation4", {
      value: condC4,
      path: condC4Path,
      name: trm("c4"),
      states: {
        on: {
          fields: [{
            node: nodeC4
          }, {
            text: sgt("duration"),
            value: datamine.constellation4.duration,
            unit: "s"
          },]
        }
      }
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}
export default new CharacterSheet(sheet, data, assets)
