import { allElementWithPhyKeys, CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { CharacterData } from '@genshin-optimizer/pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import { equal, equalStr, greaterEq, infoMut, min, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { customHealNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { ICharacterSheet } from '../ICharacterSheet.d'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "HuTao"
const elementKey: ElementKey = "pyro"
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const dm = {
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
  prod(subscript(input.total.skillIndex, dm.skill.atkInc), input.premod.hp),
  prod(percent(dm.skill.maxAtkInc), input.base.atk)))
const infusion = equalStr("on", condAfterlife, elementKey)

const [condA1Path, condA1] = cond(key, "FlutterBy")
const critRateTeam_1 = equal("on", condA1, unequal(input.activeCharKey, input.charKey, percent(dm.passive1.critRateInc), KeyMap.info("critRate_")))
const [condA2Path, condA2] = cond(key, "SanguineRouge")
const pyro_dmg_ = equal("on", condA2, percent(dm.passive2.pyroDmgInc))

const [condC4Path, condC4] = cond(key, "GardenOfEternalRest")
const critRateTeam_2 = equal("on", condC4, unequal(input.activeCharKey, input.charKey, percent(dm.constellation4.critRateInc), KeyMap.info("critRate_")))

const [condC6Path, condC6] = cond(key, "ButterflysEmbrace")
const critRate_ = equal("on", condC6, greaterEq(input.constellation, 6, percent(dm.constellation6.critRateInc)))
const ele_res_s = Object.fromEntries(allElementWithPhyKeys.map(ele => [ele, equal("on", condC6, greaterEq(input.constellation, 6, percent(dm.constellation6.elePhysResInc)))]))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", dm.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", dm.skill.dmg, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", dm.burst.dmg, "burst"),
    lowHpDmg: dmgNode("atk", dm.burst.lowHpDmg, "burst"),
    regen: customHealNode(prod(input.total.hp, subscript(input.total.burstIndex, dm.burst.regen, { unit: "%" }))),
    lowHpRegen: customHealNode(prod(input.total.hp, subscript(input.total.burstIndex, dm.burst.lowHpRegen, { unit: "%" }))),
  },
  constellation2: {
    skill_dmgInc: greaterEq(input.constellation, 2, prod(input.total.hp, percent(dm.constellation2.bloodBlossomDmgInc))),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  premod: {
    skillBoost: nodeC3,
    burstBoost: nodeC5,
    pyro_dmg_,
    ...Object.fromEntries(allElementWithPhyKeys.map(ele => [`${ele}_res_`, ele_res_s[ele]])),
    critRate_,
    skill_dmgInc: dmgFormulas.constellation2.skill_dmgInc
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
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i + (i < 5 ? 0 : -1)}`), textSuffix: i === 4 ? "(1)" : i === 5 ? "(2)" : "" }),

      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.6`) }),
      }, {
        text: ct.chg("auto.skillParams.7"),
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
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.2`) })
      }, {
        text: ct.chg("skill.skillParams.3"),
        value: dm.skill.bloodBlossomDuration,
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
            value: dm.skill.activationCost * 100, // Convert to percentage
            unit: '% Current HP'
          }, {
            node: atk,
          }, {
            text: <ColorText color="pyro">Pyro Infusion</ColorText>
          }, {
            text: ct.chg("skill.skillParams.4"),
            value: dm.skill.duration,
            unit: 's'
          }, {
            text: ct.chg("skill.skillParams.5"),
            value: dm.skill.cd,
            unit: 's'
          }]
        }
      }
    }), ct.headerTem("constellation2", {
      fields: [{
        node: dmgFormulas.constellation2.skill_dmgInc
      }]
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
        value: dm.burst.cd,
        unit: 's'
      }, {
        text: ct.chg("burst.skillParams.5"),
        value: dm.burst.enerCost
      }]
    }, ct.headerTem("constellation2", {
      fields: [{
        text: ct.ch("constellation2.applyBloodBlossom"),
      }]
    })]),

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
            value: dm.passive1.duration,
            unit: 's'
          }]
        }
      }
    })]),
    passive2: ct.talentTem("passive2", [ct.condTem("passive2", {
      value: condA2,
      path: condA2Path,
      name: st("lessEqPercentHP", { percent: dm.passive2.minHp * 100 }),
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
            value: dm.constellation4.duration,
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
          fields: [...allElementWithPhyKeys.map(ele => ({ node: ele_res_s[ele] })), {
            node: critRate_,
          }, {
            text: stg("duration"),
            value: dm.constellation6.duration,
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
export default new CharacterSheet(sheet, data)
