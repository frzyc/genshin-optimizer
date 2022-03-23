import { CharacterData } from 'pipeline'
import { input, tally, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const auto = normalSrc(data_gen.weaponTypeKey)

const key: CharacterKey = "Gorou"
const elementKey: ElementKey = "geo"
const [tr] = trans("char", key)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
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
    dmg: skillParam_gen.skill[s++],
    defInc: skillParam_gen.skill[s++],
    geo_dmg_: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    dmg_def: skillParam_gen.burst[b++],
    crystalDmg_def: skillParam_gen.burst[b++],
    crystalHits: 6,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    def_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    skill_dmgInc: skillParam_gen.passive2[0][0],
    burst_dmgInc: skillParam_gen.passive2[1][0],
  },
  constellation4: {
    heal_def_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    geo_critDMG_: [
      skillParam_gen.constellation6[0],
      skillParam_gen.constellation6[1],
      skillParam_gen.constellation6[2],
      skillParam_gen.constellation6[2],
    ] as number[],
    duration: skillParam_gen.constellation6[3]
  }
} as const

const [condInFieldPath, condInField] = cond(key, "inField")
const skill1_defDisp = equal(condInField, "inField", 
  greaterEq(tally["geo"], 1, 
    subscript(input.total.skillIndex, datamine.skill.defInc)
  )
)
const skill1_def = equal(input.activeCharKey, target.charKey, skill1_defDisp)
const skill3_geo_dmg_Disp = equal(condInField, "inField", 
  greaterEq(tally["geo"], 3, datamine.skill.geo_dmg_)
)
const skill3_geo_dmg_ = equal(input.activeCharKey, target.charKey, skill3_geo_dmg_Disp)

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurst_def_ = greaterEq(input.asc, 1, equal(condAfterBurst, "afterBurst", datamine.passive1.def_))

const p2_skill_dmgInc = greaterEq(input.asc, 4, prod(input.total.def, datamine.passive2.skill_dmgInc))
const p2_burst_dmgInc = greaterEq(input.asc, 4, prod(input.total.def, datamine.passive2.burst_dmgInc))

const [condAfterSkillBurstPath, condAfterSkillBurst] = cond(key, "afterSkillBurst")
const c6_geo_critDMG_ = subscript(sum(tally["geo"], -1), datamine.constellation6.geo_critDMG_)

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
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    dmg: dmgNode("def", datamine.burst.dmg_def, "burst"),
    crystalCollapse: dmgNode("def", datamine.burst.crystalDmg_def, "burst")
  },
  constellation4: {
    heal: greaterEq(input.constellation, 4, greaterEq(tally["geo"], 2, healNode("def", datamine.constellation4.heal_def_, 0)))
  }
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    burst: burstC5,
    skill: skillC3,
  },
  teamBuff: {
    premod: {
      def: skill1_def,
      geo_dmg_: skill3_geo_dmg_,
      def_: afterBurst_def_,
      geo_critDMG_: c6_geo_critDMG_,
    }
  },
  premod: {
    skill_dmgInc: p2_skill_dmgInc,
    burst_dmgInc: p2_burst_dmgInc,
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
      auto: talentTemplate("auto", tr, auto, undefined, undefined, [{
        ...sectionTemplate("auto", tr, auto,
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          }))
        ),
        text: tr("auto.fields.normal")
      }, {
        ...sectionTemplate("auto", tr, auto, [{
            node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.4` }),
          }, {
            node: infoMut(dmgFormulas.charged.fully, { key: `char_${key}_gen:auto.skillParams.5` }),
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
        text: sgt("duration"),
        value: datamine.skill.duration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s"
      }], {
        value: condInField,
        path: condInFieldPath,
        name: st("activeCharField"),
        teamBuff: true,
        states: {
          inField: {
            fields: [{
              node: infoMut(skill1_defDisp, { key: "def" }),
            }, {
              canShow: data => data.get(tally["geo"]).value >= 2,
              text: st("incInterRes")
            }, {
              node: infoMut(skill3_geo_dmg_Disp, { key: "geo_dmg_", variant: "geo" }),
            }]
          }
        }
      }, [
        sectionTemplate("passive2", tr, passive2, [{
          node: p2_skill_dmgInc
        }], undefined, data => data.get(input.asc).value >= 4, false, true),
        sectionTemplate("constellation4", tr, c4, [{
          node: infoMut(dmgFormulas.constellation4.heal, { key: "sheet_gen:healing", variant: "success" }),
        }], undefined, data => data.get(input.constellation).value >=4 && data.get(tally["geo"]).value >= 2, true, true)
      ]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.burst.crystalCollapse, { key: `char_${key}_gen:burst.skillParams.1` }),
        textSuffix: st("brHits", { count: datamine.burst.crystalHits })
      }, {
        text: sgt("duration"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost
      }], undefined, [
        sectionTemplate("passive1", tr, passive1, undefined, {
          value: condAfterBurst,
          path: condAfterBurstPath,
          canShow: greaterEq(input.asc, 1, 1),
          name: st("afterUse.burst"),
          teamBuff: true,
          states: {
            afterBurst: {
              fields: [{
                node: afterBurst_def_
              }, {
                text: sgt("duration"),
                value: datamine.passive1.duration,
                unit: "s"
              }]
            }
          }
        }), sectionTemplate("passive2", tr, passive2, [{
          node: p2_burst_dmgInc
        }], undefined, data => data.get(input.asc).value >= 4, false, true),
      ]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: skillC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: burstC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        value: condAfterSkillBurst,
        path: condAfterSkillBurstPath,
        canShow: greaterEq(input.constellation, 6, 1),
        name: st("afterUse.skillOrBurst"),
        teamBuff: true,
        states: {
          afterSkillBurst: {
            fields: [{
              node: c6_geo_critDMG_
            }, {
              text: sgt("duration"),
              value: datamine.constellation6.duration,
              unit: "s"
            }]
          }
        }
      })
    }
  }
}
export default new CharacterSheet(sheet, data)