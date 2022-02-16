import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { Translate } from '../../../Components/Translate'
import { input, target } from '../../../Formula'
import { constant, infoMut, match, matchFull, percent, prod, threshold, threshold_add, unmatch } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, condReadNode, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
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
  [`${ele}_dmg_`, threshold_add(input.asc, 4,
    match("swirl", condSwirls[ele],
      // TODO: this percent of 0.04% is displayed as 0.0%
      prod(percent(datamine.passive2.elemas_dmg_), input.premod.eleMas)
    ))]))

/** TODO: the C2 actually only applies to "active" character, so the following needs to be changed... */
const [condC2Path, condC2] = cond(key, "c2")
const c2EleMas = threshold_add(input.constellation, 2,
  match("c2", condC2, datamine.constellation2.elemas), { key: `eleMas` })

const [condC2PPath, condC2P] = cond(key, "c2p")
const c2PEleMas = threshold_add(input.constellation, 2,
  match("c2p", condC2P,
    unmatch(target.charKey, key, datamine.constellation2.elemas)
  ), { key: `eleMas` })

const [condC6Path, condC6] = cond(key, "c6")
const c6infusion = threshold(input.constellation, 6,
  matchFull("c6", condC6, "anemo", undefined),
  undefined
)
const c6Dmg_ = threshold_add(input.constellation, 6,
  match("c6", condC6, prod(percent(datamine.constellation6.auto_), input.premod.eleMas))
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
      [key, match(condBurstAbsorption, key, dmgNode("atk", datamine.burst.add, "burst", { hit: { ele: constant(key) } }))]))
  },
  passive1: Object.fromEntries(absorbableEle.map(key =>
    [key, match(condSkillAbsorption, key, customDmgNode(prod(input.total.atk, datamine.passive1.asorbAdd), "plunging", { hit: { ele: constant(key) } }))])),
  constellation6: {
    normal_dmg_: c6NormDmg_,
    charged_dmg_: c6ChargedDmg_,
    plunging_dmg_: c6PlungingDmg_,
  }
}
const const3 = threshold_add(input.constellation, 3, 3)
const const5 = threshold_add(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, "anemo", "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: const3,
    burst: const5,
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
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [{
          text: tr("auto.fields.normal"),
          fields: datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i < 3 ? 0 : -1)}` }),
            textSuffix: i === 2 ? "(1)" : i === 3 ? "(2)" : i === 5 ? <span>(<Translate ns="sheet" key18="hits" values={{ count: 3 }} />)</span> : ""
          }))
        }, {
          text: tr("auto.fields.charged"),
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
          text: tr(`auto.fields.plunging`),
          fields: [{
            node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
          }, {
            node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
          }, {
            node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
          }]
        }],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
          }, {
            text: tr("skill.skillParams.1"),
            value: data => data.get(input.constellation).value >= 1 ? `${datamine.skill.cd}s - 10%` : `${datamine.skill.cd}s`,
          }, {
            node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.2` }),
          }, {
            text: tr("skill.skillParams.1"),
            value: data => data.get(input.constellation).value >= 1 ? `${datamine.skill.cdHold}s - 10%` : `${datamine.skill.cdHold}s`,
          }, {
            canShow: data => data.get(input.constellation).value >= 1,
            text: trm("c1"),
          }]
        }, {
          fields: [{
            node: infoMut(dmgFormulas.skill.pdmg, { key: "sheet_gen:plunging.dmg" }),
          }, {
            node: infoMut(dmgFormulas.skill.plow, { key: "sheet_gen:plunging.low" }),
          }, {
            node: infoMut(dmgFormulas.skill.phigh, { key: "sheet_gen:plunging.high" }),
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
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
        }, {
          conditional: { // Burst Absorption
            value: condBurstAbsorption,
            path: condBurstAbsorptionPath,
            name: st("eleAbsor"),
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                node: infoMut(dmgFormulas.burst[eleKey], { key: `char_${key}_gen:burst.skillParams.2` }),
              }]
            }]))
          },
        }, {
          conditional: { // C2
            canShow: threshold_add(input.constellation, 2, 1,),
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
          },
        }, {
          conditional: { // C2 Party
            canShow: threshold_add(input.constellation, 2,
              unmatch(target.charKey, key, 1)),
            value: condC2P,
            path: condC2PPath,
            teamBuff: true,
            header: conditionalHeader("constellation2", tr, c2),
            description: tr("constellation2.description"),
            name: trm("c2p"),
            states: {
              c2p: {
                fields: [{
                  node: c2PEleMas
                }]
              }
            }
          },
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: { // Skill Absorption
            value: condSkillAbsorption,
            path: condSkillAbsorptionPath,
            name: st("eleAbsor"),
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                node: infoMut(dmgFormulas.passive1[eleKey], { key: `sheet_gen:addEleDMG` }),
              }]
            }]))
          },
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
        }, ...absorbableEle.map(eleKey => ({
          conditional: { // Poetics of Fuubutsu
            value: condSwirls[eleKey],
            path: condSwirlPaths[eleKey],
            teamBuff: true,
            header: conditionalHeader("passive2", tr, passive2),
            description: tr("passive2.description"),
            name: trm(`a4.name_${eleKey}`),
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
          },
        }))],
      },
      passive3: {
        name: tr("passive3.name"),
        img: passive3,
        sections: [{
          text: tr("passive3.description"),
          fields: [{ //TODO: put into subsection since this is teambuff
            //   header: conditionalHeader("passive3", tr, passive3),
            //   description: tr("passive3.description"),
            node: passive
          }]
        }],
      },
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: const3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: const5 }]),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: {//Crimson Momiji
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
                    canShow: data => data.get(c6infusion).value === "anemo",
                    text: <ColorText color="anemo">Anemo Infusion</ColorText>
                  },
                  {
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
          }
        }]
      }
    }
  },
};
export default new CharacterSheet(sheet, data);
