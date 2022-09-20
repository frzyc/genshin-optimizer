import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, greaterEqStr, infoMut, percent, prod, sum, unequal } from '../../../Formula/utils'
import { absorbableEle, CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, condReadNode, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KaedeharaKazuha"
const elementKey: ElementKey = "anemo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5x3
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
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    hold: skillParam_gen.skill[s++],
    cdHold: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    dot: skillParam_gen.burst[b++],
    add: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    asorbAdd: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    elemas_dmg_: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    elemas: skillParam_gen.constellation2[0],
  },
  constellation6: {
    auto_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  }
} as const

const [condBurstAbsorptionPath, condBurstAbsorption] = cond(key, "burstAbsorption")

const [condSkillAbsorptionPath, condSkillAbsorption] = cond(key, "skillAbsorption")

const condSwirlPaths = Object.fromEntries(absorbableEle.map(e => [e, [key, `swirl${e}`]]))
const condSwirls = Object.fromEntries(absorbableEle.map(e => [e, condReadNode(condSwirlPaths[e])]))
const asc4 = Object.fromEntries(absorbableEle.map(ele =>
  [`${ele}_dmg_`, greaterEq(input.asc, 4,
    equal(ele, condSwirls[ele],
      // Use premod since this is a percentage-based effect
      prod(percent(datamine.passive2.elemas_dmg_, { fixed: 2 }), input.premod.eleMas)
    ))]))

// 2 C2 conds for the 2 parts of his C2
const [condC2Path, condC2] = cond(key, "c2")
const c2EleMas = greaterEq(input.constellation, 2,
  equal("c2", condC2, datamine.constellation2.elemas))

const [condC2PPath, condC2P] = cond(key, "c2p")
const c2PEleMasDisp = greaterEq(input.constellation, 2,
  equal("c2p", condC2P, datamine.constellation2.elemas)
)
const c2PEleMas = equal(input.activeCharKey, target.charKey, // Apply to active character
  unequal(target.charKey, key, c2PEleMasDisp) // But not to Kazuha
)

const [condC6Path, condC6] = cond(key, "c6")
const c6infusion = greaterEqStr(input.constellation, 6,
  equalStr("c6", condC6, "anemo"))
const c6Dmg_ = greaterEq(input.constellation, 6,
  // Not sure if this should be premod or total. I am guessing premod
  equal("c6", condC6, prod(percent(datamine.constellation6.auto_), input.premod.eleMas))
)
// Share `match` and `prod` between the three nodes
const c6NormDmg_ = { ...c6Dmg_ }
const c6ChargedDmg_ = { ...c6Dmg_ }
const c6PlungingDmg_ = { ...c6Dmg_ }

const passive = percent(0.2)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.dmg2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
    hold: dmgNode("atk", datamine.skill.hold, "skill"),
    pdmg: dmgNode("atk", datamine.plunging.dmg, "plunging", { hit: { ele: constant("anemo") } }),
    plow: dmgNode("atk", datamine.plunging.low, "plunging", { hit: { ele: constant("anemo") } }),
    phigh: dmgNode("atk", datamine.plunging.high, "plunging", { hit: { ele: constant("anemo") } }),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    dot: dmgNode("atk", datamine.burst.dot, "burst"),
    ...Object.fromEntries(absorbableEle.map(key =>
      [key, equal(condBurstAbsorption, key, dmgNode("atk", datamine.burst.add, "burst", { hit: { ele: constant(key) } }))]))
  },
  passive1: Object.fromEntries(absorbableEle.map(key =>
    [key, equal(condSkillAbsorption, key, customDmgNode(prod(input.total.atk, datamine.passive1.asorbAdd), "plunging", { hit: { ele: constant(key) } }))])),
  passive2: asc4,
  constellation6: {
    normal_dmg_: c6NormDmg_,
    charged_dmg_: c6ChargedDmg_,
    plunging_dmg_: c6PlungingDmg_,
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, "anemo", "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  teamBuff: {
    premod: {
      staminaSprintDec_: passive,
      eleMas: c2PEleMas,
    },
    total: {
      // Should be in total, since other character abilities should not scale off this
      // if those abilities are percentage-based (e.g. XQ skill dmg red.)
      ...asc4,
    }
  },
  infusion: {
    overridableSelf: c6infusion,
  },
  total: {
    normal_dmg_: c6NormDmg_,
    charged_dmg_: c6ChargedDmg_,
    plunging_dmg_: c6PlungingDmg_,
  },
  premod: {
    eleMas: c2EleMas,
  },
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
      text: tr("auto.fields.normal")
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i < 3 ? 0 : -1)}` }),
        textSuffix: i === 2 ? "(1)" : i === 3 ? "(2)" : i === 5 ? st("brHits", { count: 3 }) : ""
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:auto.skillParams.5` }),
        textSuffix: "(2)"
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
        node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: tr("skill.skillParams.1"),
        value: data => data.get(input.constellation).value >= 1
          ? `${datamine.skill.cd} - 10% = ${datamine.skill.cd * (1 - 0.10)}`
          : `${datamine.skill.cd}`,
        unit: "s"
      }, {
        node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.2` }),
      }, {
        text: st("holdCD"),
        value: data => data.get(input.constellation).value >= 1
          ? `${datamine.skill.cdHold} - 10% = ${datamine.skill.cdHold * (1 - 0.10)}`
          : `${datamine.skill.cdHold}`,
        unit: "s"
      }]
    }, ct.headerTemplate("skill", {
      fields: [{
        node: infoMut(dmgFormulas.skill.pdmg, { key: "sheet_gen:plunging.dmg" }),
      }, {
        node: infoMut(dmgFormulas.skill.plow, { key: "sheet_gen:plunging.low" }),
      }, {
        node: infoMut(dmgFormulas.skill.phigh, { key: "sheet_gen:plunging.high" }),
      }]
    }), ct.headerTemplate("constellation1", {
      fields: [{
        node: infoMut(greaterEq(input.constellation, 1, percent(0.1)), { key: "skillCDRed_" })
      }, {
        text: trm("c1"),
      }]
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.dot, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.5"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("burst", { // Burst absorption
      value: condBurstAbsorption,
      path: condBurstAbsorptionPath,
      name: st("eleAbsor"),
      states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
        name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
        fields: [{
          node: infoMut(dmgFormulas.burst[eleKey], { key: `char_${key}_gen:burst.skillParams.2` }),
        }]
      }]))
    }), ct.conditionalTemplate("constellation2", { // C2 self
      value: condC2,
      path: condC2Path,
      name: trm("c2"),
      states: {
        c2: {
          fields: [{
            node: c2EleMas
          }]
        }
      }
    }), ct.conditionalTemplate("constellation2", { // C2 Party
      canShow: unequal(input.activeCharKey, key, 1),
      value: condC2P,
      path: condC2PPath,
      teamBuff: true,
      name: st("activeCharField"),
      states: {
        c2p: {
          fields: [{
            node: infoMut(c2PEleMasDisp, { key: "eleMas" })
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1", [ct.conditionalTemplate("passive1", {
      // Skill Absorption
      value: condSkillAbsorption,
      path: condSkillAbsorptionPath,
      name: st("eleAbsor"),
      states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
        name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
        fields: [{
          node: infoMut(dmgFormulas.passive1[eleKey], { key: `sheet_gen:addEleDMG` }),
        }]
      }]))
    })]),
    passive2: ct.talentTemplate("passive2", [ct.conditionalTemplate("passive2", { // Poetics of Fuubutsu
      teamBuff: true,
      states: Object.fromEntries(absorbableEle.map(ele => [ele, {
        value: condSwirls[ele],
        path: condSwirlPaths[ele],
        name: st(`swirlReaction.${ele}`),
        fields: [{
          node: asc4[`${ele}_dmg_`]
        }, {
          text: sgt("duration"),
          value: datamine.passive2.duration,
          unit: "s"
        }]
      }]))
    }), ct.conditionalTemplate("constellation2", { // C2 self, in teambuff panel
      value: condC2,
      path: condC2Path,
      // Show C2 self buff if A4 is enabled
      teamBuff: true,
      canShow: unequal(input.activeCharKey, key,
        greaterEq(input.asc, 4,
          sum(...Object.values(condSwirls).map(val => unequal(val, undefined, 1)))
        )
      ),
      name: trm("c2"),
      states: {
        c2: {
          fields: [{
            node: c2EleMas
          }]
        }
      }
    })
    ]),
    passive3: ct.talentTemplate("passive3", [ct.headerTemplate("passive3", {
      teamBuff: true,
      fields: [{
        node: passive
      }]
    })]),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
      // Crimson Momiji
      value: condC6,
      path: condC6Path,
      name: trm("c6.after"),
      states: {
        c6: {
          fields: [{
            canShow: data => data.get(c6infusion).value === elementKey,
            text: <ColorText color={elementKey}>{st("infusion.anemo")}</ColorText>
          }, {
            node: c6NormDmg_
          }, {
            node: c6ChargedDmg_
          }, {
            node: c6PlungingDmg_
          }, {
            text: sgt("duration"),
            value: datamine.constellation6.duration,
            unit: "s",
          }]
        }
      }
    })])
  },
}

export default new CharacterSheet(sheet, data, assets)
