import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Amber"
const elementKey: ElementKey = "pyro"
const region: Region = "mondstadt"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++]
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++]
  },
  skill: {
    inheritedHp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    unknown: skillParam_gen.skill[s++], // what is this??
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmgPerWave: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    rainDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0]
  },
  passive1: {
    critRateInc: skillParam_gen.passive1[p1++][0],
    aoeInc: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    atkInc: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    secArrowDmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    manualDetionationDmg: skillParam_gen.constellation2[0],
  },
  constellation6: {
    moveSpdInc: skillParam_gen.constellation6[0],
    atkInc: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2]
  }
} as const

const burst_critRate_ = greaterEq(input.asc, 1, percent(dm.passive1.critRateInc))
const [condA4Path, condA4] = cond(key, "A4")
const atk_ = greaterEq(input.asc, 4, equal("on", condA4, percent(dm.passive2.atkInc)))

const [condC6Path, condC6] = cond(key, "C6")
const moveSPD_ = greaterEq(input.constellation, 6, equal("on", condC6, percent(dm.constellation6.moveSpdInc)))
const teamAtk_ = greaterEq(input.constellation, 6, equal("on", condC6, percent(dm.constellation6.atkInc)))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", dm.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", dm.charged.aimedCharged, "charged", { hit: { ele: constant('pyro') } }),
    secondAimed: greaterEq(input.constellation, 1, prod(percent(dm.constellation1.secArrowDmg), dmgNode("atk", dm.charged.aimed, "charged"))),
    secondAimedCharged: greaterEq(input.constellation, 1, prod(dmgNode("atk", dm.charged.aimedCharged, "charged",
      { hit: { ele: constant('pyro') } }), percent(dm.constellation1.secArrowDmg))),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    inheritedHp: prod(subscript(input.total.skillIndex, dm.skill.inheritedHp), input.total.hp),
    dmg: dmgNode("atk", dm.skill.dmg, "skill"),
  },
  burst: {
    rainDmg: dmgNode("atk", dm.burst.rainDmg, "burst"),
    dmgPerWave: dmgNode("atk", dm.burst.dmgPerWave, "burst"),
  },
  constellation2: {
    manualDetonationDmg: greaterEq(input.constellation, 2, dmgNode("atk", dm.skill.dmg, "skill", { premod: { skill_dmg_: percent(dm.constellation2.manualDetionationDmg) } })),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    atk_,
    burst_critRate_,
  },
  teamBuff: {
    premod: {
      moveSPD_,
      atk_: teamAtk_
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
      text: ct.chg("auto.fields.normal")
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
      })),
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.aimed, { name: ct.chg(`auto.skillParams.5`) }),
      }, {
        node: infoMut(dmgFormulas.charged.secondAimed, { name: ct.chg(`auto.skillParams.5`), textSuffix: ct.ch("secondArrow") }),
      }, {
        node: infoMut(dmgFormulas.charged.aimedCharged, { name: ct.chg(`auto.skillParams.6`) }),
      }, {
        node: infoMut(dmgFormulas.charged.secondAimedCharged, { name: ct.chg(`auto.skillParams.6`), textSuffix: ct.ch("secondArrow") }),
      },],
    }, {
      text: ct.chg("auto.fields.plunging"),
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
        node: infoMut(dmgFormulas.skill.inheritedHp, { name: ct.chg(`skill.skillParams.0`), variant: "heal" }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.1`) }),
      }, {
        node: infoMut(dmgFormulas.constellation2.manualDetonationDmg, { name: ct.ch("manualDetonationDmg") }),
      }, {
        text: ct.chg("skill.skillParams.2"),
        value: (data) => data.get(input.constellation).value >= 4 ? dm.skill.cd - dm.skill.cd * 0.2 : dm.skill.cd,
        unit: "s"
      }, {
        canShow: (data) => data.get(input.constellation).value >= 4,
        text: st("charges"),
        value: 2,
      }]
    }]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmgPerWave, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.burst.rainDmg, { name: ct.chg(`burst.skillParams.1`) }),
      }, {
        text: ct.chg("burst.skillParams.2"),
        value: dm.burst.duration,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.3"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.4"),
        value: `${dm.burst.enerCost}`,
      }]
    }, ct.condTem("constellation6", {
      value: condC6,
      path: condC6Path,
      name: ct.ch("c6CondName"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: teamAtk_
          }, {
            node: moveSPD_
          }, {
            text: stg("duration"),
            value: dm.passive2.duration,
            unit: "s"
          }]
        }
      }
    })]),

    passive1: ct.talentTem("passive1", [ct.fieldsTem("passive1", {
      fields: [{
        text: ct.ch("critRateBonus"),
        value: dm.passive1.critRateInc * 100,
        unit: "%"
      }, {
        text: ct.ch("aoeRangeBonus"),
        value: dm.passive1.aoeInc * 100,
        unit: "%"
      }, {
        node: burst_critRate_
      }]
    })]),
    passive2: ct.talentTem("passive2", [ct.condTem("passive2", {
      value: condA4,
      path: condA4Path,
      name: ct.ch("a4CondName"),
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
    })]),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  },
}
export default new CharacterSheet(sheet, data, assets);
