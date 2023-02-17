import { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "KukiShinobu"
const elementKey: ElementKey = "electro"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
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
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    ringHealHP_: skillParam_gen.skill[s++],
    ringHealFlat: skillParam_gen.skill[s++],
    ringDmg: skillParam_gen.skill[s++],
    cost: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    singleDmg: skillParam_gen.burst[b++],
    maxDmgBase: skillParam_gen.burst[b++],
    maxDmgExtend: skillParam_gen.burst[b++],
    durationBase: skillParam_gen.burst[b++][0],
    durationExtend: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    hpThresh_: skillParam_gen.passive1[p1++][0],
    heal_: skillParam_gen.passive1[p1++][0]
  },
  passive2: {
    emSkillHeal_: skillParam_gen.passive2[p2++][0],
    emSkillDmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    aoeInc: 0.5,
  },
  constellation2: {
    skillDurInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    markDmg: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    hpThresh_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    em: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const [condUnderHPPath, condUnderHP] = cond(key, "underHP")
const a1Heal_ = greaterEq(input.asc, 1, equal(condUnderHP, "on", dm.passive1.heal_))

const a4Skill_healInc = greaterEq(input.asc, 4, prod(percent(dm.passive2.emSkillHeal_), input.total.eleMas))
const a4Skill_dmgInc = greaterEq(input.asc, 4, prod(percent(dm.passive2.emSkillDmg_), input.total.eleMas))

const [condC6TriggerPath, condC6Trigger] = cond(key, "c6Trigger")
const c6eleMas = greaterEq(input.constellation, 6, equal(condC6Trigger, "on", dm.constellation6.em))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", dm.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", dm.charged.dmg2, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    pressDmg: dmgNode("atk", dm.skill.pressDmg, "skill"),
    ringHeal: healNodeTalent("hp", dm.skill.ringHealHP_, dm.skill.ringHealFlat, "skill",
      { premod: { healInc: a4Skill_healInc } }
    ),
    ringDmg: dmgNode("atk", dm.skill.ringDmg, "skill"),
  },
  burst: {
    singleDmg: dmgNode("hp", dm.burst.singleDmg, "burst"),
  },
  passive2: {
    a4Skill_dmgInc,
    a4Skill_healInc,
  },
  constellation4: {
    markDmg: greaterEq(input.constellation, 4, customDmgNode(prod(percent(dm.constellation4.markDmg), input.total.hp), "skill", { hit: { ele: constant(elementKey) } })),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    heal_: a1Heal_,
    skill_dmgInc: a4Skill_dmgInc,
    eleMas: c6eleMas,
  },
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
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { name: ct.chg(`auto.skillParams.4`), textSuffix: "(1)" }),
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { name: ct.chg(`auto.skillParams.4`), textSuffix: "(2)" }),
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
        node: infoMut(dmgFormulas.skill.pressDmg, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.skill.ringHeal, { name: ct.chg(`skill.skillParams.1`) })
      }, {
        node: infoMut(dmgFormulas.skill.ringDmg, { name: ct.chg(`skill.skillParams.2`) }),
      }, {
        text: ct.chg("skill.skillParams.3"),
        value: dm.skill.cost * 100,
        unit: ct.ch("skill.cost"),
      }, {
        text: stg("duration"),
        value: (data) => data.get(input.constellation).value >= 2
          ? `${dm.skill.duration}s + ${dm.constellation2.skillDurInc}s = ${dm.skill.duration + dm.constellation2.skillDurInc}`
          : dm.skill.duration,
        unit: "s",
      }, {
        text: stg("cd"),
        value: dm.skill.cd,
        unit: "s"
      }]
    }, ct.headerTem("passive2", {
      fields: [{
        node: infoMut(a4Skill_healInc, { name: ct.ch("a4.heal"), variant: "heal" }),
      }, {
        node: a4Skill_dmgInc
      }]
    }), ct.headerTem("constellation2", {
      fields: [{
        text: st("durationInc"),
        value: dm.constellation2.skillDurInc,
        unit: "s",
      }]
    }), ct.headerTem("constellation4", {
      fields: [{
        node: infoMut(dmgFormulas.constellation4.markDmg, { name: ct.ch("c4.dmg") })
      }, {
        text: stg("cd"),
        value: dm.constellation4.cd,
        unit: "s",
      }]
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.singleDmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        text: stg("duration"),
        value: (data) => data.get(condUnderHP).value === "on"
          ? `${dm.burst.durationBase}s + ${dm.burst.durationExtend - dm.burst.durationBase}s = ${dm.burst.durationExtend}`
          : dm.burst.durationBase,
        unit: "s",
      }, {
        text: stg("cd"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: stg("energyCost"),
        value: dm.burst.cost,
      }]
    }, ct.condTem("burst", {
      name: st("lessEqPercentHP", { percent: dm.passive1.hpThresh_ * 100 }),
      value: condUnderHP,
      path: condUnderHPPath,
      states: {
        on: {
          fields: [{
            text: st("durationInc"),
            value: dm.burst.durationExtend - dm.burst.durationBase,
            fixed: 1,
            unit: "s",
          }]
        }
      }
    }), ct.headerTem("constellation1", {
      fields: [{
        text: st("aoeInc"),
        value: dm.constellation1.aoeInc * 100,
        unit: "%",
      }]
    })]),

    passive1: ct.talentTem("passive1", [ct.condTem("passive1", {
      name: st("lessEqPercentHP", { percent: dm.passive1.hpThresh_ * 100 }),
      value: condUnderHP,
      path: condUnderHPPath,
      states: {
        on: {
          fields: [{
            node: a1Heal_
          }]
        }
      }
    })]),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTem("constellation6", [ct.condTem("constellation6", {
      value: condC6Trigger,
      path: condC6TriggerPath,
      name: st("lessPercentHP", { percent: dm.constellation6.hpThresh_ * 100 }),
      states: {
        on: {
          fields: [{
            node: c6eleMas,
          }, {
            text: stg("duration"),
            value: dm.constellation6.duration,
            unit: "s",
          }, {
            text: stg("cd"),
            value: dm.constellation6.cd,
            unit: "s",
          }]
        }
      }
    })]),
  },
}
export default new CharacterSheet(sheet, data)
