import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import { equal, equalStr, greaterEq, infoMut, lessThan, min, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { allElementsWithPhy, CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customHealNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "HuTao"
const elementKey: ElementKey = "pyro"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5.1
      skillParam_gen.auto[a++], // 5.2
      skillParam_gen.auto[a++], // 6
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
    activationCost: skillParam_gen.skill[s++][0],
    atkInc: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    bloodBlossomDuration: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    maxAtkInc: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    lowHpDmg: skillParam_gen.burst[b++],
    regen: skillParam_gen.burst[b++],
    lowHpRegen: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    minHp: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRateInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    minHp: skillParam_gen.passive2[p2++][0],
    pyroDmgInc: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    bloodBlossomDmgInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    critRateInc: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    minHp: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    elePhysResInc: skillParam_gen.constellation6[2],
    critRateInc: skillParam_gen.constellation6[3],
  },
} as const

const [condAfterlifePath, condAfterlife] = cond(key, "GuideToAfterlifeVoyage")
const atk = equal("on", condAfterlife, min(
  prod(subscript(input.total.skillIndex, datamine.skill.atkInc), input.premod.hp),
  prod(percent(datamine.skill.maxAtkInc), input.base.atk)))
const infusion = equalStr("on", condAfterlife, elementKey)

const [condA1Path, condA1] = cond(key, "FlutterBy")
const critRateTeam_1 = equal("on", condA1, unequal(input.activeCharKey, input.charKey, percent(datamine.passive1.critRateInc), KeyMap.info("critRate_")))
const [condA2Path, condA2] = cond(key, "SanguineRouge")
const pyro_dmg_ = equal("on", condA2, percent(datamine.passive2.pyroDmgInc))

const [condC4Path, condC4] = cond(key, "GardenOfEternalRest")
const critRateTeam_2 = equal("on", condC4, unequal(input.activeCharKey, input.charKey, percent(datamine.constellation4.critRateInc), KeyMap.info("critRate_")))

const [condC6Path, condC6] = cond(key, "ButterflysEmbrace")
const critRate_ = equal("on", condC6, greaterEq(input.constellation, 6, percent(datamine.constellation6.critRateInc)))
const ele_res_s = Object.fromEntries(allElementsWithPhy.map(ele => [ele, equal("on", condC6, greaterEq(input.constellation, 6, percent(datamine.constellation6.elePhysResInc)))]))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: lessThan(input.constellation, 2, dmgNode("atk", datamine.skill.dmg, "skill")),
    dmgC2: greaterEq(input.constellation, 2, dmgNode("atk", datamine.skill.dmg, "skill", { hit: { dmgInc: prod(input.total.hp, datamine.constellation2.bloodBlossomDmgInc) } })),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    lowHpDmg: dmgNode("atk", datamine.burst.lowHpDmg, "burst"),
    regen: customHealNode(prod(input.total.hp, subscript(input.total.burstIndex, datamine.burst.regen, { unit: "%" }))),
    lowHpRegen: customHealNode(prod(input.total.hp, subscript(input.total.burstIndex, datamine.burst.lowHpRegen, { unit: "%" }))),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  premod: {
    pyro_dmg_,
    ...Object.fromEntries(allElementsWithPhy.map(ele => [`${ele}_res_`, ele_res_s[ele]])),
    critRate_
  },
  total: {
    atk
  },
  teamBuff: {
    premod: {
      critRate_: sum(critRateTeam_1, critRateTeam_2)
    }
  },
  infusion: {
    nonOverridableSelf: infusion
  },
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
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i + (i < 5 ? 0 : -1)}`), textSuffix: i === 4 ? "(1)" : i === 5 ? "(2)" : "" }),

      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.6`) }),
      }, {
        text: ct.chg("auto.skillParams.7"),
        value: datamine.charged.stamina,
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
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.2`) })
      }, {
        node: infoMut(dmgFormulas.skill.dmgC2, { name: ct.chg("constellation2.skillParams.2") }),
      }, {
        text: ct.chg("skill.skillParams.3"),
        value: datamine.skill.bloodBlossomDuration,
        unit: 's'
      }]
    }, ct.condTem("skill", {
      value: condAfterlife,
      path: condAfterlifePath,
      name: ct.ch("paramita.enter"),
      states: {
        on: {
          fields: [{
            text: ct.chg("skill.skillParams.0"),
            value: datamine.skill.activationCost * 100, // Convert to percentage
            unit: '% Current HP'
          }, {
            node: atk,
          }, {
            text: <ColorText color="pyro">Pyro Infusion</ColorText>
          }, {
            text: ct.chg("skill.skillParams.4"),
            value: datamine.skill.duration,
            unit: 's'
          }, {
            text: ct.chg("skill.skillParams.5"),
            value: datamine.skill.cd,
            unit: 's'
          }]
        }
      }
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) })
      }, {
        node: infoMut(dmgFormulas.burst.lowHpDmg, { name: ct.chg(`burst.skillParams.1`) })
      }, {
        node: infoMut(dmgFormulas.burst.regen, { name: ct.chg(`burst.skillParams.2`) })
      }, {
        node: infoMut(dmgFormulas.burst.lowHpRegen, { name: ct.chg(`burst.skillParams.3`) })
      }, {
        text: ct.chg("burst.skillParams.4"),
        value: datamine.burst.cd,
        unit: 's'
      }, {
        text: ct.chg("burst.skillParams.5"),
        value: datamine.burst.enerCost
      }, {
        canShow: (data) => data.get(input.constellation).value > 1,
        text: ct.ch("constellation2.applyBloodBlossom"),
      }]
    }]),

    passive1: ct.talentTem("passive1", [ct.condTem("passive1", {
      value: condA1,
      path: condA1Path,
      teamBuff: true,
      canShow: unequal(input.activeCharKey, input.charKey, 1),
      name: ct.ch("paramita.end"),
      states: {
        on: {
          fields: [{
            node: critRateTeam_1,
          }, {
            text: stg("duration"),
            value: datamine.passive1.duration,
            unit: 's'
          }]
        }
      }
    })]),
    passive2: ct.talentTem("passive2", [ct.condTem("passive2", {
      value: condA2,
      path: condA2Path,
      name: st("lessEqPercentHP", { percent: datamine.passive2.minHp * 100 }),
      states: {
        on: {
          fields: [{
            node: pyro_dmg_,
          }]
        }
      }
    })]),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4", [ct.condTem("constellation4", {
      value: condC4,
      path: condC4Path,
      teamBuff: true,
      canShow: unequal(input.activeCharKey, input.charKey, 1),
      name: ct.ch("constellation4.condName"),
      states: {
        on: {
          fields: [{
            node: critRateTeam_2,
          }, {
            text: stg("duration"),
            value: datamine.constellation4.duration,
            unit: 's'
          }]
        }
      }
    })]),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6", [ct.condTem("constellation6", {
      value: condC6,
      path: condC6Path,
      name: ct.ch("constellation6.condName"),
      states: {
        on: {
          fields: [...allElementsWithPhy.map(ele => ({ node: ele_res_s[ele] })), {
            node: critRate_,
          }, {
            text: stg("duration"),
            value: datamine.constellation6.duration,
            unit: 's'
          }, {
            text: stg("cd"),
            value: 60,
            unit: 's'
          }]
        }
      }
    })]),
  },
}
export default new CharacterSheet(sheet, data, assets)
