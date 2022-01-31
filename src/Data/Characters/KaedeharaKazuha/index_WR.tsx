import card from './Character_Kazuha_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './constellation1.png'
import c2 from './constellation2.png'
import c3 from './constellation3.png'
import c4 from './constellation4.png'
import c5 from './constellation5.png'
import c6 from './constellation6.png'
import skill from './skill.png'
import burst from './burst.png'
import passive1 from './passive1.png'
import passive2 from './passive2.png'
import passive3 from './passive3.png'
import data_gen from './data_gen.json'
import { Translate } from '../../../Components/Translate'
import { normalSrc, talentTemplate } from '../SheetUtil_WR'
import { absorbableEle, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { CharacterKey, WeaponTypeKey } from '../../../Types/consts'
import skillParam_gen_pre from './skillParam_gen.json'
import { ICharacterSheet } from '../../../Types/character_WR'
import { infoMut, threshold_add } from '../../../Formula/utils'
import { input } from '../../../Formula'

const characterKey: CharacterKey = "KaedeharaKazuha"
const tr = (strKey: string) => <Translate ns={`char_${characterKey}_gen`} key18={strKey} />

const skillParam_gen = skillParam_gen_pre as any

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
    addtional: skillParam_gen.burst[b++],
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

export const dmgFormulas = {
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
    // TODO: these plunging should be anemo dmg
    pdmg: dmgNode("atk", datamine.plunging.dmg, "plunging"),
    plow: dmgNode("atk", datamine.plunging.low, "plunging"),
    phigh: dmgNode("atk", datamine.plunging.high, "plunging"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    dot: dmgNode("atk", datamine.burst.dot, "burst"),
    // ...Object.fromEntries(absorbableEle.map(key =>
    //   [key, match(condAbsorption, key, dmgNode("atk", datamine.burst.dmg_, "burst", { hit: { ele: constant(key) } }))]))
  },
}

export const data = dataObjForCharacterSheet(characterKey, "anemo", data_gen, dmgFormulas, {
  // TODO: include
  // Misc: C1, C2, C4
  talent: {
    boost: {
      skill: threshold_add(input.constellation, 3, 3),
      burst: threshold_add(input.constellation, 5, 3),
    }
  },
  // total: { eleMas: sum(asc1, asc4), dmgBonus: c6Bonus },
  // teamBuff: {
  //   total: {
  //     eleMas: sum(asc1, asc4)
  //   }
  // }
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
            node: infoMut(dmgFormulas.normal[i], { key: `char_${characterKey}_gen:auto.skillParams.${i + (i < 3 ? 0 : -1)}` }),
            textSuffix: i === 2 ? "(1)" : i === 3 ? "(2)" : i === 5 ? <span>(<Translate ns="sheet" key18="hits" values={{ count: 3 }} />)</span> : ""
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${characterKey}_gen:auto.skillParams.5` }),
            textSuffix: "(1)"
          }, {
            node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${characterKey}_gen:auto.skillParams.5` }),
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
            node: infoMut(dmgFormulas.skill.press, { key: `char_${characterKey}_gen:skill.skillParams.0` }),
          }, {
            text: tr("skill.skillParams.1"),
            value: data => data.get(input.constellation).value >= 1 ? `${datamine.skill.cd}s - 10%` : `${datamine.skill.cd}s`,
          }, {
            node: infoMut(dmgFormulas.skill.hold, { key: `char_${characterKey}_gen:skill.skillParams.2` }),
          }, {
            text: tr("skill.skillParams.1"),
            value: data => data.get(input.constellation).value >= 1 ? `${datamine.skill.cdHold}s - 10%` : `${datamine.skill.cdHold}s`,
          }, {
            canShow: data => data.get(input.constellation).value >= 1,
            text: <Translate ns="char_KaedeharaKazuha" key18="c1" />,
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
            node: infoMut(dmgFormulas.burst.dmg, { key: `char_${characterKey}_gen:burst.skillParams.0` }),
          }, {
            node: infoMut(dmgFormulas.burst.dot, { key: `char_${characterKey}_gen:burst.skillParams.1` }),
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
          // conditional: { // Absorption
          //   key: "q",
          //   name: st("eleAbsor"),
          //   states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          //     name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          //     fields: [{
          //       canShow: stats => {
          //         const [num, condEleKey] = stats.conditionalValues?.character?.KaedeharaKazuha?.q ?? []
          //         return !!num && condEleKey === eleKey
          //       },
          //       text: st("absorDot"),
          //       formulaText: stats => <span>{data.burst.add[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats, eleKey), stats)}</span>,
          //       formula: formula.burst[eleKey],
          //       variant: eleKey
          //     }],
          //   }]))
          // },
        }, {
          // conditional: {
          //   key: "c2",
          //   canShow: stats => stats.constellation >= 2,
          //   partyBuff: "partyAll",
          //   header: conditionalHeader("constellation2", tr, c2),
          //   description: tr("constellation2.description"),
          //   name: <Translate ns="char_KaedeharaKazuha" key18="c2" />,
          //   stats: { eleMas: 200 }
          // },
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          // conditional: {// Soumon Swordsmanship
          //   key: "a1",
          //   canShow: stats => stats.ascension >= 1,
          //   name: st("eleAbsor"),
          //   states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          //     name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          //     fields: [{
          //       canShow: stats => {
          //         const [num, condEleKey] = stats.conditionalValues?.character?.KaedeharaKazuha?.a1 ?? []
          //         return !!num && condEleKey === eleKey
          //       },
          //       text: sgt("addEleDMG"),
          //       formulaText: stats => <span>200% {Stat.printStat(getTalentStatKey("plunging", stats, eleKey), stats)}</span>,
          //       formula: formula.passive1[eleKey],
          //       variant: eleKey
          //     }],
          //   }]))
          // },
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
        }, ...absorbableEle.map(eleKey => ({
          // conditional: { // Poetics of Fuubutsu
          //   key: `a4${eleKey}`,
          //   canShow: stats => stats.ascension >= 4,
          //   partyBuff: "partyAll",
          //   header: conditionalHeader("passive2", tr, passive2),
          //   description: tr("passive2.description"),
          //   name: <Translate ns="char_KaedeharaKazuha" key18={`a4.name_${eleKey}`} />,
          //   stats: { modifiers: { [`${eleKey}_dmg_`]: [[...path.passive2(), eleKey]] } },
          //   fields: [{
          //     text: Stat.getStatName(`${eleKey}_dmg_`),
          //     formulaText: stats => <span>0.04% {Stat.printStat("eleMas", stats, true)}</span>,
          //     formula: formula.passive2[eleKey],
          //     variant: eleKey,
          //     fixed: 1,
          //     unit: "%"
          //   }, {
          //     text: sgt("duration"),
          //     value: "8s",
          //   }]
          // },
        }))],
      },
      passive3: {
        name: tr("passive3.name"),
        img: passive3,
        sections: [{
          text: tr("passive3.description"),
          // conditional: {
          //   key: "pas",
          //   maxStack: 0,
          //   partyBuff: "partyAll",
          //   header: conditionalHeader("passive3", tr, passive3),
          //   description: tr("passive3.description"),
          //   stats: { staminaSprintDec_: 20 },
          // }
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
          //   key: "c6",
          //   canShow: stats => stats.constellation >= 6,
          //   name: <Translate ns="char_KaedeharaKazuha" key18="c6.after" />,
          //   stats: {
          //     modifiers: {
          //       normal_dmg_: [path.constellation6.bonus()],
          //       charged_dmg_: [path.constellation6.bonus()],
          //       plunging_dmg_: [path.constellation6.bonus()],
          //     },
          //     infusionSelf: "anemo",
          //   },
          //   fields: [{
          //     text: <Translate ns="char_KaedeharaKazuha" key18="c6.bonus" />,
          //     formulaText: stats => <span>0.2% {Stat.printStat("eleMas", stats, true)}</span>,
          //     formula: formula.constellation6.bonus,
          //     fixed: 1,
          //     unit: "%"
          //   }, {
          //     text: sgt("duration"),
          //     value: "5s",
          //   }]
          // }
        }]
      }
    }
  },
};
export default sheet;
