import { CharacterData } from 'pipeline'
import { Translate } from '../../../Components/Translate'
import { input } from '../../../Formula'
import { customStringRead, infoMut, match, prod, subscript, threshold_add } from '../../../Formula/utils'
import { CharacterKey, WeaponTypeKey } from '../../../Types/consts'
import CharacterSheet, { ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { conditionalHeader, normalSrc, talentTemplate } from '../SheetUtil_WR'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const characterKey: CharacterKey = "Shenhe"
const tr = (strKey: string) => <Translate ns={`char_${characterKey}_gen`} key18={strKey} />
const tran = (strKey: string) => <Translate ns={`char_${characterKey}`} key18={strKey} />

let s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3
      skillParam_gen.auto[3], // 4x2
      skillParam_gen.auto[5], // 5
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[6],
    stamina: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    dmgAtk_: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    durationHold: skillParam_gen.skill[s++][0],
    trigger: skillParam_gen.skill[s++][0],
    triggerHold: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    res_: skillParam_gen.burst[b++],
    dot: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cryo_dmg_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    press_dmg_: skillParam_gen.passive2[p2++][0],
    durationPress: skillParam_gen.passive2[p2++][0],
    hold_dmg_: skillParam_gen.passive2[p2++][0],
    durationHold: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    elemas: skillParam_gen.constellation2[0],
  },
  constellation6: {
    auto_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  }
} as const

const condQuillPath = [characterKey, "quill"]
const condQuill = customStringRead(["conditional", ...condQuillPath])

const quillDmg = match("quill", condQuill,
  prod(input.premod.atk, subscript(input.total.skillIndex, datamine.skill.dmgAtk_, { key: '_' })))


const condBurstPath = [characterKey, "burst"]
const condBurst = customStringRead(["conditional", ...condBurstPath])

const enemyRes_ = match("burst", condBurst,
  subscript(input.total.burstIndex, datamine.burst.res_.map(x => -x), { key: '_' }))

const cryo_enemyRes_ = { ...enemyRes_ }
const physical_enemyRes_ = { ...enemyRes_ }

const condAsc1Path = [characterKey, "asc1"]
const condAsc1 = customStringRead(["conditional", ...condAsc1Path])
const asc1Buff = threshold_add(input.asc, 1,
  match(condAsc1, "field",
    match(input.activeCharKey, input.charKey,
      datamine.passive1.cryo_dmg_
    )
  )
)

const condAsc4Path = [characterKey, "asc4"]
const condAsc4 = customStringRead(["conditional", ...condAsc4Path])
const buffAsc4Press = threshold_add(input.asc, 1,
  match(condAsc4, "press",
    datamine.passive2.press_dmg_
  )
)
const buffAsc4Press_skill_dmg_ = { ...buffAsc4Press }
const buffAsc4Press_burst_dmg_ = { ...buffAsc4Press }
const buffAsc4Hold = threshold_add(input.asc, 1,
  match(condAsc4, "hold",
    datamine.passive2.hold_dmg_
  )
)
const buffAsc4Hold_normal_dmg_ = { ...buffAsc4Hold }
const buffAsc4Hold_charged_dmg_ = { ...buffAsc4Hold }
const buffAsc4Hold_plunging_dmg_ = { ...buffAsc4Hold }

const con2Buff = threshold_add(input.constellation, 2,
  match(condAsc1, "field",
    match(input.activeCharKey, input.charKey,
      datamine.passive1.cryo_dmg_
    )
  )
)


const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
    hold: dmgNode("atk", datamine.skill.hold, "skill"),
    quillDmg
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    dot: dmgNode("atk", datamine.burst.dot, "burst"),
  },
  // passive1: Object.fromEntries(absorbableEle.map(key =>
  //   [key, match(condSkillAbsorption, key, singleDmgNode("atk", datamine.passive1.asorbAdd, "plunging", { hit: { ele: constant(key) } }))])),
  // constellation6: {
  //   normal_dmg_: c6NormDmg_,
  //   charged_dmg_: c6ChargedDmg_,
  //   plunging_dmg_: c6PlungingDmg_,
  // }
}

export const data = dataObjForCharacterSheet(characterKey, "cryo", "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: threshold_add(input.constellation, 3, 3),
    burst: threshold_add(input.constellation, 5, 3),
  },
  teamBuff: {
    premod: {
      all_dmgInc: quillDmg,
      cryo_enemyRes_,
      physical_enemyRes_,
      cryo_dmg_: asc1Buff,
      skill_dmg_: buffAsc4Press_skill_dmg_,
      burst_dmg_: buffAsc4Press_burst_dmg_,
      normal_dmg_: buffAsc4Hold_normal_dmg_,
      charged_dmg_: buffAsc4Hold_charged_dmg_,
      plunging_dmg_: buffAsc4Hold_plunging_dmg_,
    },
  },
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "anemo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
        sections: [{
          text: tr("auto.fields.normal"),
          fields: datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${characterKey}_gen:auto.skillParams.${i}` }),
            textSuffix: i === 3 ? <span>(<Translate ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : ""
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.dmg, { key: `char_${characterKey}_gen:auto.skillParams.5` }),
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
            node: infoMut(dmgFormulas.skill.press, { key: `char_${characterKey}_gen:skill.skillParams.0` }),
          }, {
            node: infoMut(dmgFormulas.skill.hold, { key: `char_${characterKey}_gen:skill.skillParams.1` }),
          }, {
            text: tr("skill.skillParams.3"),
            value: `${datamine.skill.duration}s / ${datamine.skill.durationHold}s`,
          }, {
            text: tr("skill.skillParams.4"),
            value: `${datamine.skill.trigger}s / ${datamine.skill.triggerHold}s`,
          }, {
            text: tr("skill.skillParams.5"),
            value: datamine.skill.cd
          }, {
            text: tr("skill.skillParams.6"),
            value: datamine.skill.cd
          }],
          conditional: {
            teamBuff: true,
            value: condQuill,
            path: condQuillPath,
            name: tran("quill"),
            states: {
              quill: {
                fields: [{
                  node: quillDmg
                }]
              }
            }
          }
        }, {
          conditional: { // ASC4
            canShow: threshold_add(input.asc, 4, 1),
            value: condAsc4,
            path: condAsc4Path,
            teamBuff: true,
            header: conditionalHeader("passive2", tr, passive2),
            description: tr("passive2.description"),
            name: <span>After Shenhe uses <strong>Spring Spirit Summoning</strong></span>,
            states: {
              press: {
                name: "Press",
                fields: [{
                  node: buffAsc4Press_skill_dmg_
                }, {
                  node: buffAsc4Press_burst_dmg_
                }]
              },
              hold: {
                name: "Hold",
                fields: [{
                  node: buffAsc4Hold_normal_dmg_
                }, {
                  node: buffAsc4Hold_charged_dmg_
                }, {
                  node: buffAsc4Hold_plunging_dmg_
                }]
              }
            }
          }
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            node: infoMut(dmgFormulas.burst.dmg, { key: `char_${characterKey}_gen:burst.skillParams.0` }),
          }, {
            node: infoMut(dmgFormulas.burst.dot, { key: `char_${characterKey}_gen:burst.skillParams.2` }),
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
          conditional: {
            teamBuff: true,
            value: condBurst,
            path: condBurstPath,
            name: tr("burst.name"),
            states: {
              burst: {
                fields: [{
                  node: cryo_enemyRes_
                }, {
                  node: physical_enemyRes_
                }]
              }
            }
          }
        }, {
          conditional: { // ASC1 Party + cond 2
            canShow: threshold_add(input.asc, 1, match(input.activeCharKey, input.charKey, 1)),
            value: condAsc1,
            path: condAsc1Path,
            teamBuff: true,
            header: conditionalHeader("passive1", tr, passive1),
            description: tr("passive1.description"),
            name: "Active Character in field",
            states: {
              field: {
                fields: [{
                  node: asc1Buff
                }, {
                  node: con2Buff
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
          // conditional: { // Skill Absorption
          //   value: condSkillAbsorption,
          //   path: condSkillAbsorptionPath,
          //   name: st("eleAbsor"),
          //   states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          //     name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          //     fields: [{
          //       node: infoMut(dmgFormulas.passive1[eleKey], { key: `sheet_gen:addEleDMG` }),
          //     }]
          //   }]))
          // },
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
        },
          // ...absorbableEle.map(eleKey => ({
          //   conditional: { // Poetics of Fuubutsu
          //     value: condSwirls[eleKey],
          //     path: condSwirlPaths[eleKey],
          //     teamBuff: true,
          //     header: conditionalHeader("passive2", tr, passive2),
          //     description: tr("passive2.description"),
          //     name: <Translate ns="char_KaedeharaKazuha" key18={`a4.name_${eleKey}`} />,
          //     states: {
          //       swirl: {
          //         fields: [{
          //           node: asc4[`${eleKey}_dmg_`]
          //         }, {
          //           text: sgt("duration"),
          //           value: datamine.passive2.duration,
          //           unit: "s"
          //         }]
          //       }
          //     }
          //   },
          // }))
        ],
      },
      passive3: {
        name: tr("passive3.name"),
        img: passive3,
        sections: [{
          text: tr("passive3.description"),
          // fields: [{ //TODO: put into subsection since this is teambuff
          //   //   header: conditionalHeader("passive3", tr, passive3),
          //   //   description: tr("passive3.description"),
          //   node: passive
          // }]
        }],
      },
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          // conditional: {//Crimson Momiji
          //   value: condC6,
          //   path: condC6Path,
          //   name: <Translate ns="char_KaedeharaKazuha" key18="c6.after" />,
          //   states: {
          //     c6: {
          //       fields: [
          //         // { // TODO:
          //         //   node: c6infusion
          //         // },
          //         {
          //           canShow: data => data.get(c6infusion).value === "anemo",
          //           text: <ColorText color="anemo">Anemo Infusion</ColorText>
          //         },
          //         {
          //           node: c6NormDmg_
          //         }, {
          //           node: c6ChargedDmg_
          //         }, {
          //           node: c6PlungingDmg_
          //         }, {
          //           text: sgt("duration"),
          //           value: datamine.constellation6.duration,
          //           unit: "s",
          //         }]
          //     }
          //   }
          // }
        }]
      }
    }
  },
};
export default new CharacterSheet(sheet, data);
