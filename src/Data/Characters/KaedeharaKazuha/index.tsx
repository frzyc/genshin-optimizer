import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, greaterEqStr, infoMut, percent, prod, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, condReadNode, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { absorbableEle, customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KaedeharaKazuha"
const elementKey: ElementKey = "anemo"
const [tr, trm] = trans("char", key)

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
    equal("swirl", condSwirls[ele],
      // TODO: this percent of 0.04% is displayed as 0.0%
      prod(percent(datamine.passive2.elemas_dmg_), input.premod.eleMas)
    ))]))

/** TODO: the C2 actually only applies to "active" character, so the following needs to be changed... */
const [condC2Path, condC2] = cond(key, "c2")
const c2EleMas = greaterEq(input.constellation, 2,
  equal("c2", condC2, datamine.constellation2.elemas))

const [condC2PPath, condC2P] = cond(key, "c2p")
const c2PEleMas = greaterEq(input.constellation, 2,
  equal("c2p", condC2P,
    equal(input.activeCharKey, target.charKey, // Apply to active character
      unequal(target.charKey, key, datamine.constellation2.elemas) // But not to Kazuha
    )
  )
)

const [condC6Path, condC6] = cond(key, "c6")
const c6infusion = greaterEqStr(input.constellation, 6,
  equalStr("c6", condC6, "anemo"))
const c6Dmg_ = greaterEq(input.constellation, 6,
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
      ...asc4,
      staminaSprintDec_: passive,
    },
    total: {
      eleMas: c2PEleMas,
    },
  },
  infusion: c6infusion,
  premod: {
    normal_dmg_: c6NormDmg_,
    charged_dmg_: c6ChargedDmg_,
    plunging_dmg_: c6PlungingDmg_,
  },
  total: {
    eleMas: c2EleMas,
  },
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
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i < 3 ? 0 : -1)}` }),
            textSuffix: i === 2 ? "(1)" : i === 3 ? "(2)" : i === 5 ? st("brHits", { count: 3 }) : ""
          }))
        ),
        text: tr("auto.fields.normal")
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
            node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
            textSuffix: "(1)"
          }, {
            node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:auto.skillParams.5` }),
            textSuffix: "(2)"
          }, {
            text: tr("auto.skillParams.6"),
            value: datamine.charged.stamina,
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
        node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: tr("skill.skillParams.1"),
        value: data => data.get(input.constellation).value >= 1 
          ? `${datamine.skill.cd} - 10% = ${datamine.skill.cd*(1-0.10)}` 
          : `${datamine.skill.cd}`,
        unit: "s"
      }, {
        node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.2` }),
      }, {
        text: st("holdCD"),
        value: data => data.get(input.constellation).value >= 1
          ? `${datamine.skill.cdHold} - 10% = ${datamine.skill.cdHold*(1-0.10)}` 
          : `${datamine.skill.cdHold}`,
        unit: "s"
      }], undefined, [
        {...sectionTemplate("skill", tr, skill, [{
            node: infoMut(dmgFormulas.skill.pdmg, { key: "sheet_gen:plunging.dmg" }),
          }, {
            node: infoMut(dmgFormulas.skill.plow, { key: "sheet_gen:plunging.low" }),
          }, {
            node: infoMut(dmgFormulas.skill.phigh, { key: "sheet_gen:plunging.high" }),
          }]),
          fieldsHeader: { ...conditionalHeader("skill", tr, skill), title: trm("skillPlunge") }
        },
        sectionTemplate("constellation1", tr, c1, [{
          node: infoMut(greaterEq(input.constellation, 1, percent(0.1)), { key: "skillCDRed_" })
        }, {
          text: trm("c1"),
        }], undefined, data => data.get(input.constellation).value >= 1, false, true),
      ]),
      burst: talentTemplate("burst", tr, burst, [{
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
      }], { // Burst absorption
        value: condBurstAbsorption,
        path: condBurstAbsorptionPath,
        name: st("eleAbsor"),
        header: conditionalHeader("burst", tr, burst),
        states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          fields: [{
            node: infoMut(dmgFormulas.burst[eleKey], { key: `char_${key}_gen:burst.skillParams.2` }),
          }]
        }]))
      }, [
        sectionTemplate("constellation2", tr, c2, undefined, {
          canShow: greaterEq(input.constellation, 2, 1),
          value: condC2,
          path: condC2Path,
          name: trm("c2"),
          header: conditionalHeader("constellation2", tr, c2),
          states: {
            c2: {
              fields: [{
                node: c2EleMas
              }]
            }
          }
        }), sectionTemplate("constellation2", tr, c2, undefined, { // C2 Party
          canShow: greaterEq(input.constellation, 2, unequal(input.activeCharKey, key, 1)),
          value: condC2P,
          path: condC2PPath,
          teamBuff: true,
          description: tr("constellation2.description"),
          name: trm("c2p"),
          header: conditionalHeader("constellation2", tr, c2),
          states: {
            c2p: {
              fields: [{
                node: c2PEleMas
              }]
            }
          }
        }),
      ]),
      passive1: talentTemplate("passive1", tr, passive1, undefined, {
        // Skill Absorption
        value: condSkillAbsorption,
        path: condSkillAbsorptionPath,
        name: st("eleAbsor"),
        canShow: greaterEq(input.asc, 1, 1),
        states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          fields: [{
            node: infoMut(dmgFormulas.passive1[eleKey], { key: `sheet_gen:addEleDMG` }),
          }]
        }]))
      }),
      passive2: talentTemplate("passive2", tr, passive2, undefined, undefined, absorbableEle.map(eleKey => 
        sectionTemplate("passive2", tr, passive2, undefined, { // Poetics of Fuubutsu
          value: condSwirls[eleKey],
          path: condSwirlPaths[eleKey],
          teamBuff: true,
          // Only show the description once. Can't be truly blank or it will be filled in with a default.
          description: eleKey === "hydro" ? tr("passive2.description"): " ",
          name: trm(`a4.name_${eleKey}`),
          header: conditionalHeader("passive2", tr, passive2),
          canShow: greaterEq(input.asc, 4, 1),
          states: {
            swirl: {
              fields: [{
                node: asc4[`${eleKey}_dmg_`]
              }, {
                text: sgt("duration"),
                value: datamine.passive2.duration,
                unit: "s"
              }]
            }
          }
        }),
      )),
      passive3: talentTemplate("passive3", tr, passive3, undefined, undefined, [
        sectionTemplate("passive3", tr, passive3, [{
          node: passive
        }], undefined, undefined, true, true),
      ]),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        // Crimson Momiji
        canShow: greaterEq(input.constellation, 6, 1),
        value: condC6,
        path: condC6Path,
        name: trm("c6.after"),
        states: {
          c6: {
            fields: [
              // { // TODO:
              //   node: c6infusion
              // },
              {
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
      })
    }
  },
};
export default new CharacterSheet(sheet, data);
