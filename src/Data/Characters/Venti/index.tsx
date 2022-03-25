import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import { reactions } from '../../../Formula/reaction'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { absorbableEle, CharacterKey, ElementKey } from '../../../Types/consts'
import { objectKeyMap } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import {  customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Venti"
const elementKey: ElementKey = "anemo"
const [tr, trm] = trans("char", key)

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
    "launched": prod(datamine.constellation2.res_, 2) },
    naught
  )
)
const c2Hit_phys_enemyRes__ = {...c2Hit_anemo_enemyRes_}

const [condC4Path, condC4] = cond(key, "c4")
const c4_anemo_dmg_ = greaterEq(input.constellation, 4, equal(condC4, "pickup",
  datamine.constellation4.anemo_dmg_))

const [condC6Path, condC6] = cond(key, "c6")
const c6_anemo_enemyRes_ = equal(condC6, "takeDmg", datamine.constellation6.res_)
const c6_ele_enemyRes_arr = Object.fromEntries(absorbableEle.map(ele => [
  `${ele}_enemyRes_`,
  greaterEq(input.constellation, 6, equal(ele, condBurstAbsorption, constant(datamine.constellation6.res_)))
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
    absorb: unequal(condBurstAbsorption, "", dmgNode("atk", datamine.burst.absorbDmg, "burst", { hit: { ele: condBurstAbsorption }})),
    full7: unequal(condBurstAbsorption, undefined, sum(
      prod(dmgNode("atk", datamine.burst.baseDmg, "burst"), 20),
      prod(dmgNode("atk", datamine.burst.absorbDmg, "burst", { hit: { ele: condBurstAbsorption }}), 15),
      prod(lookup(condBurstAbsorption, objectKeyMap(absorbableEle, ele => reactions.anemo[`${ele}Swirl`]), naught), 7)
    )),
    full14: unequal(condBurstAbsorption, "hydro", unequal(condBurstAbsorption, undefined, sum(
      prod(dmgNode("atk", datamine.burst.baseDmg, "burst"), 20),
      prod(dmgNode("atk", datamine.burst.absorbDmg, "burst", { hit: { ele: condBurstAbsorption }}), 15),
      prod(lookup(condBurstAbsorption, objectKeyMap(absorbableEle, ele => reactions.anemo[`${ele}Swirl`]), naught), 14)
    )))
  },
  constellation1: {
    aimed: greaterEq(input.constellation, 1,
      customDmgNode(
        prod(
          percent(datamine.constellation1.dmgRatio),
          subscript(input.total.autoIndex, datamine.charged.aimed, { key: "_" }),
          input.total.atk
        ),
        "charged"
      )
    ),
    fully: greaterEq(input.constellation, 1,
      customDmgNode(
        prod(
          percent(datamine.constellation1.dmgRatio),
          subscript(input.total.autoIndex, datamine.charged.fully, { key: "_" }),
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
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: talentTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), undefined, undefined, [{
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey),
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
            textSuffix: (i === 0 || i === 3) ? st("brHits", { count: 2 }) : ""
          }))
        ),
        text: tr("auto.fields.normal")
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
            node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.6` }),
          }, {
            node: infoMut(dmgFormulas.constellation1.aimed, { key: `char_${key}:addAimed` })
          }, {
            node: infoMut(dmgFormulas.charged.fully, { key: `char_${key}_gen:auto.skillParams.7` }),
          }, {
            node: infoMut(dmgFormulas.constellation1.fully, { key: `char_${key}:addFullAimed` })
          }]
        ),
        text: tr("auto.fields.charged"),
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
            node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
          }, {
            node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
          }, {
            node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
          }]
        ),
        text: tr("auto.fields.plunging"),
      }]),
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        text: tr("skill.skillParams.1"),
        value: datamine.skill.pressCD,
        unit: "s"
      }, {
        node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.2` })
      }, {
        text: st("holdCD"),
        value: datamine.skill.holdCD,
        unit: "s"
      }],
      undefined, [
        sectionTemplate("passive1", tr, passive1, [{
          text: trm("upcurrentDuration"),
          value: datamine.passive1.duration,
          unit: "s"
        }], undefined, data => data.get(input.asc).value >= 1, false, true
        ), sectionTemplate("constellation2", tr, c2, undefined, {
          value: condC2,
          path: condC2Path,
          teamBuff: true,
          canShow: greaterEq(input.constellation, 2, 1),
          name: tr("constellation2.name"),
          states: {
            hit: {
              name: trm("c2.hit"),
              fields: [{
                node: infoMut(c2Hit_anemo_enemyRes_, { key: "anemo_enemyRes_", variant: "anemo" })
              }, {
                node: c2Hit_phys_enemyRes__
              }]
            },
            launched: {
              name: trm("c2.launched"),
              fields: [{
                node: infoMut(c2Hit_anemo_enemyRes_, { key: "anemo_enemyRes_", variant: "anemo" })
              }, {
                node: c2Hit_phys_enemyRes__
              }]
            }
          }
        })
      ]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.base, { key: `char_${key}_gen:burst.skillParams.0` }),
        textSuffix: st("brHits", { count: datamine.burst.baseTicks })
      }, {
        text: tr("burst.skillParams.2"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.enerCost,
      }], {
        value: condBurstAbsorption,
        path: condBurstAbsorptionPath,
        name: st("eleAbsor"),
        states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          fields: [{
            node: infoMut(dmgFormulas.burst.absorb, { key: `char_${key}_gen:burst.skillParams.1` }),
            textSuffix: st("brHits", { count: datamine.burst.absorbTicks })
          }]
        }]))
      }, [{
        // Custom burst formula
        ...sectionTemplate("burst", tr, burst, [{
          node: infoMut(dmgFormulas.burst.full7, { key: `char_${key}:fullBurstDMG.dmg7`, variant: "physical" }),
        }, {
          node: infoMut(dmgFormulas.burst.full14, { key: `char_${key}:fullBurstDMG.dmg14`, variant: "physical" }),
        }], undefined, data => data.get(condBurstAbsorption).value !== undefined, undefined, true),
        text: trm("fullBurstDMG.description"),
        }, sectionTemplate("passive2", tr, passive2, [{
            text: trm("regenEner"),
          }, {
            text: trm("q"),
          }], undefined, data => data.get(input.asc).value >= 4, false, true
        ), 
        // C6 anemo team-display
        sectionTemplate("constellation6", tr, c6, undefined, {
          value: condC6,
          path: condC6Path,
          description: tr("constellation6.description.0"),
          teamBuff: true,
          name: trm("c6"),
          canShow: greaterEq(input.constellation, 6, 1),
          states: {
            takeDmg: {
              fields: [{
                node: infoMut(c6_anemo_enemyRes_, { key: "anemo_enemyRes_", variant: "anemo" })
              }]
            }
          }
        }), 
        // C6 elemental self-display
        sectionTemplate("constellation6", tr, c6, absorbableEle.map(eleKey => (
            { node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`] }
          )),
          undefined,
          data => data.get(input.constellation).value >= 6
            && data.get(condBurstAbsorption).value !== undefined
            && data.get(equal(target.charKey, key, 1)).value === 1,
          false,
          true
        ),
        // C6 elemental team-display
        sectionTemplate("constellation6", tr, c6, undefined, {
          value: condBurstAbsorption,
          path: condBurstAbsorptionPath,
          description: tr("constellation6.description.1"),
          name: st("eleAbsor"),
          teamBuff: true,
          canShow: greaterEq(input.constellation, 6, unequal(input.activeCharKey, key, 1)),
          states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
            name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
            fields: [{
              node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`]
            }]
          }]))
        })
      ]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3, [{ node: p3_staminaGlidingDec_ }]),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, undefined, {
        value: condC4,
        path: condC4Path,
        name: trm("c4"),
        canShow: greaterEq(input.constellation, 4, 1),
        states: {
          pickup: {
            fields: [{
              node: c4_anemo_dmg_,
            }]
          }
        }
      }),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    }
  }
}
export default new CharacterSheet(sheet, data)
