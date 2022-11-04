import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, percent, prod, sum, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, shieldElement, shieldNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Candace"
const elementKey: ElementKey = "hydro"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
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
    shield_hp_: skillParam_gen.skill[s++],
    shield_base: skillParam_gen.skill[s++],
    basic_dmg: skillParam_gen.skill[s++],
    charged_dmg: skillParam_gen.skill[s++],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skill_dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    dmg_bonus_: skillParam_gen.burst[b++][0],
    wave_dmg: skillParam_gen.burst[b++],
    num_waves: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive2: {
    normalEle_dmg_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    durationInc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    hp_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const normalEle_dmg_ = equal(condAfterBurst, "on", percent(dm.burst.dmg_bonus_), KeyMap.info("normalEle_dmg_"))

const hydroInfusion = equalStr(condAfterBurst, "on",
  lookup(target.weaponType,
    { "sword": constant("hydro"), "claymore": constant("hydro"), "polearm": constant("hydro") }, constant("")))

const a4_normalEle_dmg_ = greaterEq(input.asc, 4, equal(condAfterBurst, "on",
  prod(
    percent(dm.passive2.normalEle_dmg_),
    input.total.hp,
    1 / 1000
  )
), KeyMap.info("normalEle_dmg_"))

const [condC2AfterSkillHitPath, condC2AfterSkillHit] = cond(key, "c2AfterSkillHit")
const c2_hp_ = greaterEq(input.constellation, 2,
  equal(condC2AfterSkillHit, "on", percent(dm.constellation2.hp_))
)

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", dm.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    shield: shieldNodeTalent("hp", dm.skill.shield_hp_, dm.skill.shield_base, "skill"),
    hydroShield: shieldElement("hydro", shieldNodeTalent("hp", dm.skill.shield_hp_, dm.skill.shield_base, "skill")),
    basicDmg: dmgNode("hp", dm.skill.basic_dmg, "skill"),
    chargedDmg: dmgNode("hp", dm.skill.charged_dmg, "skill"),
  },
  burst: {
    skillDmg: dmgNode("hp", dm.burst.skill_dmg, "burst"),
    waveDmg: dmgNode("hp", dm.burst.wave_dmg, "burst"),
  },
  passive2: {
    normalEle_dmg_: a4_normalEle_dmg_
  },
  constellation6: {
    dmg: greaterEq(input.constellation, 6, customDmgNode(
      prod(
        dm.constellation6.dmg,
        input.total.hp
      ), "burst"
    ))
  }
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "sumeru", data_gen, dmgFormulas, {
  bonus: {
    burst: burstC3,
    skill: skillC5,
  },
  premod: {
    hp_: c2_hp_,
  },
  teamBuff: {
    premod: {
      normalEle_dmg_: sum(normalEle_dmg_, a4_normalEle_dmg_)
    },
    infusion: {
      team: hydroInfusion,
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
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i + (i < 3 ? 0 : -1)}`), textSuffix: i === 2 || i === 3 ? `(${i - 1})` : "" }),
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
        node: infoMut(dmgFormulas.skill.shield, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.skill.hydroShield, { name: st(`dmgAbsorption.hydro`) }),
      }, {
        node: infoMut(dmgFormulas.skill.basicDmg, { name: ct.chg(`skill.skillParams.1`) }),
      }, {
        node: infoMut(dmgFormulas.skill.chargedDmg, { name: ct.chg(`skill.skillParams.2`) }),
      }, {
        text: st("pressCD"),
        value: dm.skill.pressCd,
        unit: 's'
      }, {
        text: st("holdCD"),
        value: (data) => data.get(input.constellation).value >= 4
          ? dm.skill.pressCd
          : dm.skill.holdCd,
        unit: 's'
      }]
    }, ct.condTem("constellation2", {
      // Personal conditional
      path: condC2AfterSkillHitPath,
      value: condC2AfterSkillHit,
      name: st("hitOp.skill"),
      states: {
        on: {
          fields: [{
            node: c2_hp_
          }, {
            text: stg("duration"),
            value: dm.constellation2.duration,
            unit: "s"
          }]
        }
      }
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.skillDmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.burst.waveDmg, { name: ct.chg(`burst.skillParams.3`) })
      }, {
        text: ct.chg("burst.skillParams.4"),
        value: dm.burst.num_waves,
      }, {
        text: stg("cd"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: stg("energyCost"),
        value: dm.burst.cost,
      }]
    }, ct.condTem("burst", {
      path: condAfterBurstPath,
      value: condAfterBurst,
      teamBuff: true,
      name: st("afterUse.burst"),
      states: {
        on: {
          fields: [{
            node: normalEle_dmg_,
          }, {
            text: ct.ch("hydroInfusion")
          }, {
            text: stg("duration"),
            value: (data) => data.get(input.constellation).value >= 1
              ? `${dm.burst.duration}s + ${dm.constellation1.durationInc}s = ${dm.burst.duration + dm.constellation1.durationInc}`
              : dm.burst.duration,
            unit: "s"
          }]
        }
      }
    }), ct.headerTem("passive2", {
      teamBuff: true,
      canShow: equal(condAfterBurst, "on", 1),
      fields: [{
        node: a4_normalEle_dmg_
      }]
    }), ct.headerTem("constellation6", {
      fields: [{
        node: infoMut(dmgFormulas.constellation6.dmg, { name: ct.chg(`burst.skillParams.3`) })
      }]
    }), ct.condTem("constellation2", {
      // Team conditional
      path: condC2AfterSkillHitPath,
      value: condC2AfterSkillHit,
      name: st("hitOp.skill"),
      teamBuff: true,
      canShow: unequal(input.activeCharKey, key, greaterEq(input.asc, 4, equal(condAfterBurst, "on", 1))),
      states: {
        on: {
          fields: [{
            node: c2_hp_
          }, {
            text: stg("duration"),
            value: dm.constellation2.duration,
            unit: "s"
          }]
        }
      }
    })]),

    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: burstC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: skillC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  },
}
export default new CharacterSheet(sheet, data, assets)
