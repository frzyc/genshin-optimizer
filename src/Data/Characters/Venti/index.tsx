import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { absorbableEle, CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Venti"
const elementKey: ElementKey = "anemo"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1x2
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++], // Aimed
    fully: skillParam_gen.auto[a++], // Fully-charged
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
    holdDmg: skillParam_gen.skill[s++],
    holdCD: skillParam_gen.skill[s++][0],
  },
  burst: {
    baseDmg: skillParam_gen.burst[b++],
    baseTicks: 20,
    absorbDmg: skillParam_gen.burst[b++],
    absorbTicks: 15,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0]
  },
  // No real p3/constellation datamine values :(
  passive3: {
    stam_: 0.20,
  },
  constellation1: {
    dmgRatio: 0.33,
  },
  constellation2: {
    res_: -0.12,
    duration: 10,
  },
  constellation4: {
    anemo_dmg_: 0.25,
    duration: 10,
  },
  constellation6: {
    res_: -0.20,
    duration: 10, // From KQM
  }
} as const

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const p3_staminaGlidingDec_ = constant(datamine.passive3.stam_)

const [condBurstAbsorptionPath, condBurstAbsorption] = cond(key, "burstAbsorption")

const [condC2Path, condC2] = cond(key, "c2")
const c2Hit_anemo_enemyRes_ = greaterEq(input.constellation, 2,
  lookup(condC2, {
    "hit": constant(datamine.constellation2.res_),
    "launched": prod(datamine.constellation2.res_, 2)
  },
    naught
  )
)
const c2Hit_phys_enemyRes__ = { ...c2Hit_anemo_enemyRes_ }

const [condC4Path, condC4] = cond(key, "c4")
const c4_anemo_dmg_ = greaterEq(input.constellation, 4, equal(condC4, "pickup",
  datamine.constellation4.anemo_dmg_))

const [condC6Path, condC6] = cond(key, "c6")
const c6_anemo_enemyRes_ = greaterEq(input.constellation, 6, equal(condC6, "takeDmg", datamine.constellation6.res_))
const c6_ele_enemyRes_arr = Object.fromEntries(absorbableEle.map(ele => [
  `${ele}_enemyRes_`,
  greaterEq(input.constellation, 6, equal(condC6, "takeDmg", equal(ele, condBurstAbsorption, datamine.constellation6.res_)))
]))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    fully: dmgNode("atk", datamine.charged.fully, "charged", { hit: { ele: constant(elementKey) } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.pressDmg, "skill"),
    hold: dmgNode("atk", datamine.skill.holdDmg, "skill"),
  },
  burst: {
    base: dmgNode("atk", datamine.burst.baseDmg, "burst"),
    absorb: unequal(condBurstAbsorption, undefined, dmgNode("atk", datamine.burst.absorbDmg, "burst", { hit: { ele: condBurstAbsorption } })),
  },
  constellation1: {
    aimed: greaterEq(input.constellation, 1,
      customDmgNode(
        prod(
          percent(datamine.constellation1.dmgRatio),
          subscript(input.total.autoIndex, datamine.charged.aimed, { unit: "%" }),
          input.total.atk
        ),
        "charged"
      )
    ),
    fully: greaterEq(input.constellation, 1,
      customDmgNode(
        prod(
          percent(datamine.constellation1.dmgRatio),
          subscript(input.total.autoIndex, datamine.charged.fully, { unit: "%" }),
          input.total.atk
        ),
        "charged", { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}

export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    burst: nodeC3,
    skill: nodeC5,
  },
  premod: {
    anemo_dmg_: c4_anemo_dmg_,
    staminaGlidingDec_: p3_staminaGlidingDec_,
  },
  teamBuff: {
    premod: {
      anemo_enemyRes_: sum(c2Hit_anemo_enemyRes_, c6_anemo_enemyRes_),
      physical_enemyRes_: c2Hit_phys_enemyRes__,
      ...c6_ele_enemyRes_arr,
    }
  }
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
        multi: (i === 0 || i === 3) ? 2 : undefined
      }))
    }, {
      text: ct.tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.aimed, { name: ct.tr(`auto.skillParams.6`) }),
      }, {
        node: infoMut(dmgFormulas.constellation1.aimed, { name: ct.tr("addAimed") })
      }, {
        node: infoMut(dmgFormulas.charged.fully, { name: ct.tr(`auto.skillParams.7`) }),
      }, {
        node: infoMut(dmgFormulas.constellation1.fully, { name: ct.tr("addFullAimed") })
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
        node: infoMut(dmgFormulas.skill.press, { name: ct.tr(`skill.skillParams.0`) })
      }, {
        text: ct.tr("skill.skillParams.1"),
        value: datamine.skill.pressCD,
        unit: "s"
      }, {
        node: infoMut(dmgFormulas.skill.hold, { name: ct.tr(`skill.skillParams.2`) })
      }, {
        text: st("holdCD"),
        value: datamine.skill.holdCD,
        unit: "s"
      }]
    }, ct.headerTemplate("passive1", {
      fields: [{
        text: ct.trm("upcurrentDuration"),
        value: datamine.passive1.duration,
        unit: "s"
      }]
    }), ct.conditionalTemplate("constellation2", {
      value: condC2,
      path: condC2Path,
      teamBuff: true,
      name: ct.tr("constellation2.name"),
      states: {
        hit: {
          name: ct.trm("c2.hit"),
          fields: [{
            node: infoMut(c2Hit_anemo_enemyRes_, KeyMap.keyToInfo("anemo_enemyRes_"))
          }, {
            node: c2Hit_phys_enemyRes__
          }]
        },
        launched: {
          name: ct.trm("c2.launched"),
          fields: [{
            node: infoMut(c2Hit_anemo_enemyRes_, KeyMap.keyToInfo("anemo_enemyRes_"))
          }, {
            node: c2Hit_phys_enemyRes__
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.base, { name: ct.tr(`burst.skillParams.0`), multi: datamine.burst.baseTicks }),

      }, {
        text: ct.tr("burst.skillParams.2"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: ct.tr("burst.skillParams.3"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: ct.tr("burst.skillParams.4"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("burst", {
      value: condBurstAbsorption,
      path: condBurstAbsorptionPath,
      name: st("eleAbsor"),
      states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
        name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
        fields: [{
          node: infoMut(dmgFormulas.burst.absorb, { name: ct.tr(`burst.skillParams.1`) }),
          multi: datamine.burst.absorbTicks
        }]
      }]))
    }), ct.headerTemplate("passive2", {
      fields: [{
        text: ct.trm("regenEner"),
      }, {
        text: ct.trm("q"),
      }]
    }), ct.conditionalTemplate("constellation6", { // C6 Anemo
      value: condC6,
      path: condC6Path,
      teamBuff: true,
      name: ct.trm("c6"),
      states: {
        takeDmg: {
          fields: [{
            node: infoMut(c6_anemo_enemyRes_, KeyMap.keyToInfo("anemo_enemyRes_"))
          }]
        }
      }
    }), ct.headerTemplate("constellation6", { // C6 elemental self-display
      fields: absorbableEle.map(eleKey => (
        { node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`] }
      )),
      canShow: unequal(condBurstAbsorption, undefined,
        equal(condC6, "takeDmg",
          equal(target.charKey, key, 1)
        )
      ),
    }), ct.conditionalTemplate("constellation6", { // C6 elemental team-display
      value: condBurstAbsorption,
      path: condBurstAbsorptionPath,
      name: st("eleAbsor"),
      teamBuff: true,
      canShow: equal(condC6, "takeDmg", unequal(input.activeCharKey, key, 1)),
      states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
        name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
        fields: [{
          node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`]
        }]
      }]))
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3", [{ fields: [{ node: p3_staminaGlidingDec_ }] }]),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [
      ct.conditionalTemplate("constellation4", {
        value: condC4,
        path: condC4Path,
        name: ct.trm("c4"),
        states: {
          pickup: {
            fields: [{
              node: c4_anemo_dmg_,
            }]
          }
        }
      }),
    ]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets)
