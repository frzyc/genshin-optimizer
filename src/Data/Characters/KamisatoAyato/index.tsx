import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KamisatoAyato"
const elementKey: ElementKey = "hydro"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[a++], // 1
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmgArr: [
      skillParam_gen.skill[s++],
      skillParam_gen.skill[s++],
      skillParam_gen.skill[s++],
    ],
    stateDuration: skillParam_gen.skill[s++][0],
    stackHpDmgInc: skillParam_gen.skill[s++],
    maxStacks: 4,
    illusionDmg: skillParam_gen.skill[s++],
    illusionDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    normal_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stacksGained: skillParam_gen.passive1[0][0],
  },
  passive2: {
    enerThres_: skillParam_gen.passive2[0][0],
    cd: skillParam_gen.passive2[1][0],
    energyRestore: skillParam_gen.passive2[2][0]
  },
  constellation1: {
    oppHpThres_: skillParam_gen.constellation1[0],
    shunDmg_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    extraStacks: skillParam_gen.constellation2[0],
    stackThresh: 3,
    hp_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    atkSPD: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    extraStrikes: 2,
    dmg: skillParam_gen.constellation6[0],
  }
} as const

const [condInSkillPath, condInSkill] = cond(key, "inSkill")

const [condSkillStacksPath, condSkillStacks] = cond(key, "skillStacks")
const skillStacks_dmgInc = equal(condInSkill, "on",
  lookup(condSkillStacks, Object.fromEntries(range(1, 5).map(stacks => [
    stacks,
    prod(
      stacks,
      subscript(input.total.skillIndex, datamine.skill.stackHpDmgInc, { unit: "%" }),
      input.total.hp,
    )
  ])), naught)
)

const [condBurstInAreaPath, condBurstInArea] = cond(key, "burstInArea")
const burst_normal_dmg_Disp = equal(condBurstInArea, "on",
  subscript(input.total.burstIndex, datamine.burst.normal_dmg_)
)
const burst_normal_dmg_ = equal(input.activeCharKey, target.charKey, burst_normal_dmg_Disp)

const [condC1OppHpPath, condC1OppHp] = cond(key, "c1OppHp")
const c1Shun_dmg_ = greaterEq(input.constellation, 1, equal(condC1OppHp, "on", datamine.constellation1.shunDmg_))

// Not sure what "Max HP increased by 50%" means
const c2_hp_ = greaterEq(input.constellation, 2, equal(condInSkill, "on",
  lookup(condSkillStacks, Object.fromEntries(range(datamine.constellation2.stackThresh, 5).map(stacks => [
    stacks,
    percent(datamine.constellation2.hp_)
  ])), naught)
))

const [condC4AfterBurstPath, condC4AfterBurst] = cond(key, "c4AfterBurst")
const c4_atkSPD_ = greaterEq(input.constellation, 4, equal(condC4AfterBurst, "on", datamine.constellation4.atkSPD))

const shunAddl: Data = {
  hit: {
    ele: constant(elementKey)
  },
  premod: {
    normal_dmgInc: skillStacks_dmgInc,
    normal_dmg_: c1Shun_dmg_
  }
}

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    ...Object.fromEntries(datamine.skill.dmgArr.map((arr, i) =>
      [`dmg${i}`, equal(condInSkill, "on", customDmgNode(prod(
        subscript(input.total.skillIndex, arr, { unit: "%" }),
        input.total.atk,
      ), "normal", shunAddl))])),
    illusionDmg: dmgNode("atk", datamine.skill.illusionDmg, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
  constellation6: {
    // Not sure if this benefits from C1 or not
    dmg: greaterEq(input.constellation, 6, customDmgNode(prod(percent(datamine.constellation6.dmg), input.total.atk), "normal", { hit: { ele: constant(elementKey) }, premod: { normal_dmg_: c1Shun_dmg_ } }))
  }
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC3,
    burst: burstC5,
  },
  teamBuff: {
    premod: {
      normal_dmg_: burst_normal_dmg_,
      atkSPD_: c4_atkSPD_,
    }
  },
  premod: {
    hp_: c2_hp_,
  },
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
      text: ct.tr("auto.fields.normal")
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.tr(`auto.skillParams.${i}`) }),
        multi: i === 3 ? 2 : undefined
      }))
    }, {
      text: ct.tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.tr(`auto.skillParams.5`) }),
      }, {
        text: ct.tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
      }]
    }, {
      text: ct.tr("auto.fields.plunging"),
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
        node: infoMut(dmgFormulas.skill.illusionDmg, { name: ct.tr(`skill.skillParams.5`) })
      }, {
        text: ct.tr("skill.skillParams.6"),
        value: datamine.skill.illusionDuration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s",
      }]
    }, ct.conditionalTemplate("skill", {
      value: condInSkill,
      path: condInSkillPath,
      name: st("afterUse.skill"),
      states: {
        on: {
          fields: [
            ...datamine.skill.dmgArr.map((_, i) => ({
              node: infoMut(dmgFormulas.skill[`dmg${i}`], { name: ct.tr(`skill.skillParams.${i}`) })
            })), {
              text: st("incInterRes"),
            }, {
              text: ct.trm("skill.unableToAuto"),
            }, {
              text: sgt("duration"),
              value: datamine.skill.stateDuration,
              unit: "s"
            }]
        }
      }
    }), ct.conditionalTemplate("skill", {
      value: condSkillStacks,
      path: condSkillStacksPath,
      name: ct.trm("skill.namisenStacks"),
      canShow: equal(condInSkill, "on", 1),
      states: Object.fromEntries(range(1, 5).map(stacks => [
        stacks, {
          name: st("stack", { count: stacks }),
          fields: [{
            node: infoMut(skillStacks_dmgInc, { name: ct.tr("skill.shun_dmgInc") })
          }, {
            text: st("maxStacks"),
            value: data => data.get(input.constellation).value >= 2
              ? datamine.skill.maxStacks + datamine.constellation2.extraStacks
              : datamine.skill.maxStacks
          }]
        }
      ]))
    }), ct.headerTemplate("passive1", {
      canShow: equal(condInSkill, "on", 1),
      fields: [{
        text: ct.trm("passive1.afterUse"),
        value: datamine.passive1.stacksGained,
      }, {
        text: ct.trm("passive1.afterExplode"),
        value: data => data.get(input.constellation).value >= 2
          ? datamine.skill.maxStacks + datamine.constellation2.extraStacks
          : datamine.skill.maxStacks
      }]
    }), ct.conditionalTemplate("constellation1", {
      value: condC1OppHp,
      path: condC1OppHpPath,
      name: st("enemyLessEqPercentHP", { percent: datamine.constellation1.oppHpThres_ * 100 }),
      canShow: equal(condInSkill, "on", 1),
      states: {
        on: {
          fields: [{
            node: infoMut(c1Shun_dmg_, { name: ct.tr("c1.shun_dmg_") }),
          }]
        }
      }
    }), ct.headerTemplate("constellation2", {
      fields: [{
        text: ct.trm("c2.addlStacks"),
        value: datamine.constellation2.extraStacks,
      }, {
        canShow: data => data.get(c2_hp_).value !== 0,
        node: c2_hp_,
      }]
    }), ct.headerTemplate("constellation6", {
      canShow: equal(condInSkill, "on", 1),
      fields: [{
        node: infoMut(dmgFormulas.constellation6.dmg, {
          name: ct.tr("c6.dmg"),
          multi: datamine.constellation6.extraStrikes,
        }),
      }]
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { name: ct.tr(`burst.skillParams.0`) }),
      }, {
        text: sgt("duration"),
        value: datamine.burst.duration,
        unit: "s",
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("burst", {
      value: condBurstInArea,
      path: condBurstInAreaPath,
      name: st("activeCharField"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: infoMut(burst_normal_dmg_Disp, KeyMap.keyToInfo("normal_dmg_"))
          }]
        }
      }
    }), ct.conditionalTemplate("constellation4", {
      value: condC4AfterBurst,
      path: condC4AfterBurstPath,
      name: st("afterUse.burst"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: c4_atkSPD_
          }, {
            text: sgt("duration"),
            value: datamine.constellation4.duration,
            unit: "s"
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}
export default new CharacterSheet(sheet, data, assets)
