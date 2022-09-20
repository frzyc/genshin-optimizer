import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Razor"
const elementKey: ElementKey = "electro"
const regionKey: Region = "mondstadt"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++]
    ]
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0]
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++]
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    erBonus: skillParam_gen.skill[s++][0],
    enerRegen: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0]
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    companionDmg: skillParam_gen.burst[b++],
    atkSpdBonus: skillParam_gen.burst[b++],
    electroResBonus: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    cdRed: 0.18
  },
  passive2: {
    enerThreshold: 0.5,
    erInc: 0.3
  },
  passive3: {
    sprintStaminaDec: 0.2
  },
  constellation1: {
    allDmgInc: 0.1,
    duration: 8
  },
  constellation2: {
    hpThreshold: 0.3,
    critRateInc: 0.1
  },
  constellation4: {
    defDec: 0.15,
    duration: 7
  },
  constellation6: {
    dmg: 1,
    electroSigilGenerated: 1,
    cd: 10
  }
} as const

const [condElectroSigilPath, condElectroSigil] = cond(key, "ElectroSigil")
const [condTheWolfWithinPath, condTheWolfWithin] = cond(key, "TheWolfWithin")
const [condA4Path, condA4] = cond(key, "A4")
const [condC1Path, condC1] = cond(key, "C1")
const [condC2Path, condC2] = cond(key, "C2")
const [condC4Path, condC4] = cond(key, "C4")

const enerRechElectroSigil_ = lookup(condElectroSigil, objectKeyMap(range(1, 3), i => prod(i, percent(datamine.skill.erBonus))),
  naught, { key: "enerRech_" })
const electro_res_ = equal("on", condTheWolfWithin, percent(datamine.burst.electroResBonus))
const atkSPD_ = equal("on", condTheWolfWithin, subscript(input.total.burstIndex, datamine.burst.atkSpdBonus, { key: "_" }))
const enerRechA4_ = greaterEq(input.asc, 4, equal("on", condA4, percent(datamine.passive2.erInc, { key: "enerRech_" })))
const all_dmg_ = greaterEq(input.constellation, 1, equal("on", condC1, percent(datamine.constellation1.allDmgInc)))
const critRate_ = greaterEq(input.constellation, 2, equal("on", condC2, percent(datamine.constellation2.critRateInc)))
const enemyDefRed_ = greaterEq(input.constellation, 4, equal("on", condC4, percent(datamine.constellation4.defDec)))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", datamine.charged.spinningDmg, "charged"),
    finalDmg: dmgNode("atk", datamine.charged.finalDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
    hold: dmgNode("atk", datamine.skill.hold, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    companionDmg1: customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[0]),
      subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst"),
    companionDmg2: customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[1]),
      subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst"),
    companionDmg3: customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[2]),
      subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst"),
    companionDmg4: customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[3]),
      subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst"),
    // TODO: this is for the additional section to calculate the full burst dmg where the full burst dmg = sum of normal dmg and burst companion dmg
    // However, the final dmg then defaults to Electro text color which is sort of incorrect?
    // Is there a way to disable the electro text color and default it to just normal color instead?
    fullBurstDmg1: sum(customDmgNode(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[0]), input.total.atk), "normal"),
      customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[0]),
        subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst")),
    fullBurstDmg2: sum(customDmgNode(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[1]), input.total.atk), "normal"),
      customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[1]),
        subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst")),
    fullBurstDmg3: sum(customDmgNode(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[2]), input.total.atk), "normal"),
      customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[2]),
        subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst")),
    fullBurstDmg4: sum(customDmgNode(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[3]), input.total.atk), "normal"),
      customDmgNode(prod(prod(subscript(input.total.autoIndex, datamine.normal.hitArr[3]),
        subscript(input.total.burstIndex, datamine.burst.companionDmg)), input.total.atk), "burst"))
  },
  constellation6: {
    dmg: greaterEq(input.constellation, 6, customDmgNode(prod(percent(datamine.constellation6.dmg), input.total.atk), "elemental",
      { hit: { ele: constant(elementKey) } }))
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, regionKey, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    enerRech_: sum(enerRechElectroSigil_, enerRechA4_),
    electro_res_,
    atkSPD_,
    all_dmg_,
    critRate_
  },
  teamBuff: {
    premod: {
      enemyDefRed_
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.4` }),
      }, {
        node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.5` }),
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
        unit: '/s'
      }, {
        text: tr("auto.skillParams.7"),
        value: datamine.charged.duration,
        unit: 's'
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
        node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: tr("skill.skillParams.5"),
        value: (data) => data.get(input.asc).value >= 1
          ? datamine.skill.pressCd - (datamine.skill.pressCd * datamine.passive1.cdRed)
          : datamine.skill.pressCd,
        unit: 's'
      }, {
        node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        text: tr("skill.skillParams.6"),
        value: (data) => data.get(input.asc).value >= 1
          ? datamine.skill.holdCd - (datamine.skill.holdCd * datamine.passive1.cdRed)
          : datamine.skill.holdCd,
        unit: 's'
      }]
    }, ct.conditionalTemplate("skill", { // Electro Sigil
      value: condElectroSigil,
      path: condElectroSigilPath,
      name: trm("electroSigil"),
      states: {
        ...objectKeyMap(range(1, 3), i => ({
          name: st("stack", { count: i }),
          fields: [{
            node: enerRechElectroSigil_
          }, {
            text: tr("skill.skillParams.4"),
            value: datamine.skill.duration,
            unit: "s"
          }, {
            text: trm("electroSigilAbsorbed"),
            value: datamine.skill.enerRegen * i,
          }]
        })),
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.companionDmg1, { key: `char_${key}_gen:burst.skillParams.1` }),
        textSuffix: tr("auto.skillParams.0")
      }, {
        node: infoMut(dmgFormulas.burst.companionDmg2, { key: `char_${key}_gen:burst.skillParams.1` }),
        textSuffix: tr("auto.skillParams.1")
      }, {
        node: infoMut(dmgFormulas.burst.companionDmg3, { key: `char_${key}_gen:burst.skillParams.1` }),
        textSuffix: tr("auto.skillParams.2")
      }, {
        node: infoMut(dmgFormulas.burst.companionDmg4, { key: `char_${key}_gen:burst.skillParams.1` }),
        textSuffix: tr("auto.skillParams.3")
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.duration,
        unit: 's'
      }, {
        text: tr("burst.skillParams.5"),
        value: datamine.burst.cd,
        unit: 's'
      }, {
        text: tr("burst.skillParams.6"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("burst", { // The Wolf Within
      value: condTheWolfWithin,
      path: condTheWolfWithinPath,
      name: tr("burst.description.3"),
      states: {
        "on": {
          fields: [{
            node: electro_res_
          }, {
            node: atkSPD_
          }, {
            text: st("incInterRes")
          }]
        }
      }
    }), {
      text: trm("fullBurstDMG.description"),
    }, ct.headerTemplate("burst", {
      fields: [{
        node: infoMut(dmgFormulas.burst.fullBurstDmg1, { key: `char_${key}:fullBurstDMG.dmg1` })
      }, {
        node: infoMut(dmgFormulas.burst.fullBurstDmg2, { key: `char_${key}:fullBurstDMG.dmg2` })
      }, {
        node: infoMut(dmgFormulas.burst.fullBurstDmg3, { key: `char_${key}:fullBurstDMG.dmg3` })
      }, {
        node: infoMut(dmgFormulas.burst.fullBurstDmg4, { key: `char_${key}:fullBurstDMG.dmg4` })
      }]
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.conditionalTemplate("passive2", {
      value: condA4,
      path: condA4Path,
      name: st("lessPercentEnergy", { percent: datamine.passive2.enerThreshold * 100 }),
      states: {
        "on": {
          fields: [{
            node: enerRechA4_
          }]
        }
      }
    })]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1", [ct.conditionalTemplate("constellation1", {
      value: condC1,
      path: condC1Path,
      name: trm("pickUpElementalOrbParticle"),
      states: {
        "on": {
          fields: [{
            node: all_dmg_
          }, {
            text: sgt("duration"),
            value: datamine.constellation1.duration,
            unit: "s"
          }]
        }
      }
    })]),
    constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
      value: condC2,
      path: condC2Path,
      name: st("enemyLessPercentHP", { percent: datamine.constellation2.hpThreshold * 100 }),
      states: {
        "on": {
          fields: [{
            node: critRate_
          }]
        }
      }
    })]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.conditionalTemplate("constellation4", {
      value: condC4,
      path: condC4Path,
      teamBuff: true,
      name: trm("opHitWithClawAndThunder"),
      states: {
        "on": {
          fields: [{
            node: enemyDefRed_
          }, {
            text: sgt("duration"),
            value: datamine.constellation4.duration,
            unit: "s"
          }]
        }
      }
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6", [ct.fieldsTemplate("constellation6", {
      fields: [{
        node: infoMut(dmgFormulas.constellation6.dmg, { key: "sheet:dmg" })
      }, {
        text: trm("electroSigilPerProc"),
        value: datamine.constellation6.electroSigilGenerated
      }, {
        text: st("cooldown"),
        value: datamine.constellation6.cd,
        unit: "s"
      }]
    })]),
  },
}

export default new CharacterSheet(sheet, data, assets);
