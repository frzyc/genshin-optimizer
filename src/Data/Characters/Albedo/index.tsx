import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { infoMut, lookup, equal, percent, prod, subscript, greaterEq, naught } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Albedo"
const elementKey: ElementKey = "geo"
const [tr, trm] = trans("char", key)
const auto = normalSrc(data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    blossomDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    blossomCd: 2,
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    blossomDmg: skillParam_gen.burst[b++],
    blossomAmt: 7,
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    blossomDmgInc: 0.25,
    hpThresh: 50,
  },
  passive2: {
    eleMasInc: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0]
  },
  constellation1: {
    blossomEner: skillParam_gen.constellation1[0],
  },
  constellation2: {
    blossomDmgInc: 0.30,
    maxStacks: 4,
    stackDuration: 30
  },
  constellation4: {
    plunging_dmg_: 0.3,
  },
  constellation6: {
    bonus_dmg_: 0.17
  }
} as const

const [condBurstBlossomPath, condBurstBlossom] = cond(key, "burstBlossom")
const [condBurstUsedPath, condBurstUsed] = cond(key, "burstUsed")
const p2Burst_eleMas = equal(condBurstUsed, "burstUsed", greaterEq(input.asc, 4, datamine.passive2.eleMasInc))

const [condP1EnemyHpPath, condP1EnemyHp] = cond(key, "p1EnemyHp")
const p1_blossom_dmg_ = equal(condP1EnemyHp, "belowHp", greaterEq(input.asc, 1, datamine.passive1.blossomDmgInc))

const [condC2StacksPath, condC2Stacks] = cond(key, "c2Stacks")
const c2_burst_dmgInc = greaterEq(input.constellation, 2,
  prod(
    lookup(
      condC2Stacks,
      Object.fromEntries(range(1, datamine.constellation2.maxStacks).map(i => 
        [i,
        prod(i, datamine.constellation2.blossomDmgInc)]
        )
      ),
      naught
    ),
    input.total.def
  )
)

const [condSkillInFieldPath, condSkillInField] = cond(key, "skillInField")
const c4_plunging_dmg_ = greaterEq(input.constellation, 4,
  equal(condSkillInField, "skillInField",
    equal(input.activeCharKey, target.charKey, datamine.constellation4.plunging_dmg_)
  )
)

// Maybe we should just have a single conditional for "in field AND crystallize shield"?
// This is technically a nested conditional
const [condC6CrystallizePath, condC6Crystallize] = cond(key, "c6Crystallize")
const c6_Crystal_all_dmg_ = greaterEq(input.constellation, 6,
  equal(condSkillInField, "skillInField",
    equal(condC6Crystallize, "c6Crystallize",
      equal(input.activeCharKey, target.charKey, datamine.constellation6.bonus_dmg_)
    )
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.dmg2, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.skillDmg, "skill"),
    blossom: dmgNode("def", datamine.skill.blossomDmg, "skill", { total: { skill_dmg_: p1_blossom_dmg_ } }),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.burstDmg, "burst"),
    blossom: equal("isoOnField", condBurstBlossom, dmgNode("atk", datamine.burst.blossomDmg, "burst")),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC3,
    burst: burstC5,
  },
  teamBuff: {
    premod: {
      eleMas: p2Burst_eleMas,
      plunging_dmg_: c4_plunging_dmg_,
      all_dmg_: c6_Crystal_all_dmg_,
    }
  },
  premod: {
    burst_dmgInc: c2_burst_dmgInc,
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
      auto: talentTemplate("auto", tr, auto, undefined, undefined, [{
        ...sectionTemplate("auto", tr, auto, 
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          }))
        ),
        text: tr("auto.fields.normal")
      }, {
        ...sectionTemplate("auto", tr, auto, [{
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
        ...sectionTemplate("auto", tr, auto, [{
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
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.skill.blossom, { key: `char_${key}_gen:skill.skillParams.1` })
      }, {
        text: trm("blossomCD"),
        value: datamine.skill.blossomCd,
        unit: "s"
      }, {
        text: tr("skill.skillParams.2"),
        value: datamine.skill.duration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s"
      }], undefined, [
        sectionTemplate("passive1", tr, passive1, undefined, {
          value: condP1EnemyHp,
          path: condP1EnemyHpPath,
          name: st("enemyLessPercentHP", { percent: datamine.passive1.hpThresh }),
          canShow: greaterEq(input.asc, 1, 1),
          states: {
            belowHp: {
              fields: [{
                node: infoMut(p1_blossom_dmg_, { key: `char_${key}:blossomDmg_` })
              }]
            }
          }
        }),
        sectionTemplate("constellation1", tr, c1, [{
          text: trm("enerPerBlossom"),
          value: datamine.constellation1.blossomEner,
          fixed: 1,
        }], undefined, data => data.get(input.constellation).value >= 1, false, true),
        sectionTemplate("constellation4", tr, c4, undefined, {
          value: condSkillInField,
          path: condSkillInFieldPath,
          name: st("activeCharField"),
          canShow: greaterEq(input.constellation, 4, 1),
          teamBuff: true,
          states: {
            skillInField: {
              fields: [{
                node: c4_plunging_dmg_
              }]
            }
          }
        }),
        sectionTemplate("constellation6", tr, c6, undefined, {
          value: condC6Crystallize,
          path: condC6CrystallizePath,
          name: st("protectedByShieldCrystal"),
          canShow: greaterEq(input.constellation, 6, equal(condSkillInField, "skillInField", 1)),
          teamBuff: true,
          states: {
            c6Crystallize: {
              fields: [{
                node: c6_Crystal_all_dmg_,
              }]
            }
          }
        }),
      ]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }], {
        value: condBurstBlossom,
        path: condBurstBlossomPath,
        name: trm("isotomaOnField"),
        states: {
          isoOnField: {
            fields: [{
              node: infoMut(dmgFormulas.burst.blossom, { key: `char_${key}_gen:burst.skillParams.1` }),
              textSuffix: st("brHits", { count: datamine.burst.blossomAmt })
            }]
          }
        }
      }, [
        sectionTemplate("passive2", tr, passive2, undefined, {
          value: condBurstUsed,
          path: condBurstUsedPath,
          name: st("afterUse.burst"),
          canShow: greaterEq(input.asc, 4, 1),
          teamBuff: true,
          states: {
            burstUsed: {
              fields: [{
                node: p2Burst_eleMas
              }, {
                text: sgt("duration"),
                value: datamine.passive2.duration,
                unit: "s"
              }]
            }
          }
        }),
        sectionTemplate("constellation2", tr, c2, undefined, {
          value: condC2Stacks,
          path: condC2StacksPath,
          name: trm("c2Stacks"),
          canShow: greaterEq(input.constellation, 2, 1),
          states: Object.fromEntries(range(1, datamine.constellation2.maxStacks).map(i => 
            [i, {
              name: st("stack", { count: i }),
              fields: [{
                node: c2_burst_dmgInc
              }]
            }]
          ))
        }),
      ]),
      passive1: talentTemplate("passive1", tr, passive1, undefined),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: skillC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: burstC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    }
  }
}
export default new CharacterSheet(sheet, data)
// import card from './Character_Albedo_Card.png'
// import thumb from './Icon.png'
// import thumbSide from './IconSide.png'
// import banner from './Banner.png'
// import c1 from './constellation1.png'
// import c2 from './constellation2.png'
// import c3 from './constellation3.png'
// import c4 from './constellation4.png'
// import c5 from './constellation5.png'
// import c6 from './constellation6.png'
// import skill from './skill.png'
// import burst from './burst.png'
// import passive1 from './passive1.png'
// import passive2 from './passive2.png'
// import passive3 from './passive3.png'
// import Stat from '../../../Stat'
// import formula, { data } from './data'
// import data_gen from './data_gen.json'
// import { getTalentStatKey, getTalentStatKeyVariant, } from "../../../PageBuild/Build"
// import { ICharacterSheet } from '../../../Types/character'
// import { Translate } from '../../../Components/Translate'
// import { conditionalHeader, normalSrc, plungeDocSection, talentTemplate } from '../SheetUtil'
// import { WeaponTypeKey } from '../../../Types/consts'
// const tr = (strKey: string) => <Translate ns="char_Albedo_gen" key18={strKey} />
// const char: ICharacterSheet = {
//   name: tr("name"),
//   cardImg: card,
//   thumbImg: thumb,
//   thumbImgSide: thumbSide,
//   bannerImg: banner,
//   rarity: data_gen.star,
//   elementKey: "geo",
//   weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
//   gender: "M",
//   constellationName: tr("constellationName"),
//   title: tr("title"),
//   baseStat: data_gen.base,
//   baseStatCurve: data_gen.curves,
//   ascensions: data_gen.ascensions,
//   talent: {
//     formula,
//     sheets: {
//       auto: {
//         name: tr("auto.name"),
//         img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
//         sections: [{
//           text: tr(`auto.fields.normal`),
//           fields: data.normal.hitArr.map((percentArr, i) =>
//           ({
//             text: `${i + 1}-Hit DMG`,
//             formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
//             formula: formula.normal[i],
//             variant: stats => getTalentStatKeyVariant("normal", stats)
//           }))
//         }, {
//           text: tr("auto.fields.charged"),
//           fields: [{
//             text: `Charged 1-Hit DMG`,
//             formulaText: stats => <span>{data.charged.atk1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
//             formula: formula.charged.atk1,
//             variant: stats => getTalentStatKeyVariant("charged", stats),
//           }, {
//             text: `Charged 2-Hit DMG`,
//             formulaText: stats => <span>{data.charged.atk2[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
//             formula: formula.charged.atk2,
//             variant: stats => getTalentStatKeyVariant("charged", stats),
//           }, {
//             text: `Stamina Cost`,
//             value: 20,
//           }]
//         }, plungeDocSection(tr, formula, data)]
//       },
//       skill: {
//         name: tr("skill.name"),
//         img: skill,
//         sections: [{
//           text: tr("skill.description"),
//           fields: [{
//             text: "Place DMG",
//             formulaText: stats => <span>{data.skill.press[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
//             formula: formula.skill.press,
//             variant: stats => getTalentStatKeyVariant("skill", stats),
//           }, {
//             text: "Transient Blossom DMG",
//             formulaText: stats => <span>{data.skill.blossom[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
//             formula: formula.skill.blossom,
//             variant: stats => getTalentStatKeyVariant("skill", stats),
//           }, {
//             canShow: stats => stats.ascension >= 1,
//             text: "Transient Blossom DMG < 50% HP",
//             formulaText: stats => {
//               const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
//               return <span>{data.skill.blossom[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} * {(hitModeMultiKey ? <span>{Stat.printStat(hitModeMultiKey, stats)} * </span> : "")}( {Stat.printStat("geo_skill_hit_base_multi", stats)} + 25%) * {Stat.printStat("enemyLevel_multi", stats)} * {Stat.printStat("geo_enemyRes_multi", stats)}</span>
//             },
//             formula: formula.skill.blossom50,
//             variant: stats => getTalentStatKeyVariant("skill", stats),
//           }]
//         }],
//       },
//       burst: {
//         name: tr("burst.name"),
//         img: burst,
//         sections: [{
//           text: tr("burst.description"),
//           fields: [{
//             text: "Burst DMG",
//             formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
//             formula: formula.burst.dmg,
//             variant: stats => getTalentStatKeyVariant("burst", stats),
//           },
//           ...[...Array(4).keys()].map(i => i + 1).map(i => ({
//             canShow: stats => stats.constellation >= 2,
//             text: `Burst DMG C2 ${i} Stack`,
//             formulaText: stats => <span>( {data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {30 * i}% {Stat.printStat("finalDEF", stats)}) * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
//             formula: formula.burst[`dmg${i}c2`],
//             variant: stats => getTalentStatKeyVariant("burst", stats),
//           })),
//           {
//             text: "Fatal Blossom DMG",
//             formulaText: stats => <span>{data.burst.blossom[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
//             formula: formula.burst.blossom,
//             variant: stats => getTalentStatKeyVariant("burst", stats),
//           },
//           ...[...Array(4).keys()].map(i => i + 1).map(i => ({
//             canShow: stats => stats.constellation >= 2,
//             text: `Fatal Blossom DMG C2 ${i} Stack`,
//             formulaText: stats => <span>( {data.burst.blossom[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {30 * i}% {Stat.printStat("finalDEF", stats)}) * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
//             formula: formula.burst[`blossom${i}c2`],
//             variant: stats => getTalentStatKeyVariant("burst", stats),
//           })), {
//             text: "CD",
//             value: "12s"
//           }, {
//             text: "Energy Cost",
//             value: 40
//           }]
//         }],
//       },
//       passive1: talentTemplate("passive1", tr, passive1),
//       passive2: {
//         name: tr("passive2.name"),
//         img: passive2,
//         sections: [{
//           text: tr("passive2.description"),
//           conditional: { // Homuncular Nature
//             key: "a4",
//             canShow: stats => stats.ascension >= 4,
//             name: <span>Using <strong>Rite of Progeniture: Tectonic Tide</strong></span>,
//             partyBuff: "partyAll",
//             header: conditionalHeader("passive2", tr, passive2),
//             description: tr("passive2.description"),
//             stats: { eleMas: 125, }
//           },
//         }],
//       },
//       passive3: talentTemplate("passive3", tr, passive3),
//       constellation1: talentTemplate("constellation1", tr, c1),
//       constellation2: talentTemplate("constellation2", tr, c2),
//       constellation3: talentTemplate("constellation3", tr, c3, "skillBoost"),
//       constellation4: {
//         name: tr("constellation4.name"),
//         img: c4,
//         sections: [{
//           text: tr("constellation4.description"),
//           conditional: { // Descent Of Divinity
//             key: "c4",
//             canShow: stats => stats.constellation >= 4,
//             name: "Active party members within the Solar Isotoma field",
//             partyBuff: "partyActive",
//             header: conditionalHeader("constellation4", tr, c4),
//             description: tr("constellation4.description"),
//             stats: { plunging_dmg_: 30, }
//           },
//         }],
//       },
//       constellation5: talentTemplate("constellation5", tr, c5, "burstBoost"),
//       constellation6: {
//         name: tr("constellation6.name"),
//         img: c6,
//         sections: [{
//           text: tr("constellation6.description"),
//           conditional: { // Dust Of Purification
//             key: "c6",
//             canShow: stats => stats.constellation >= 6,
//             name: "Active party members within the Solar Isotoma field who are protected by a shield created by Crystallize",
//             partyBuff: "partyActive",
//             header: conditionalHeader("constellation6", tr, c6),
//             description: tr("constellation6.description"),
//             stats: {
//               dmg_: 17,
//             }
//           }
//         }],
//       }
//     },
//   },
// };
// export default char;
