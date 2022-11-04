import { CharacterData } from 'pipeline'
import { input, tally, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, prod, subscript, sum } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Gorou"
const elementKey: ElementKey = "geo"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const dm = {
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
    subscript(input.total.skillIndex, dm.skill.defInc)
  )
)
const skill1_def = equal(input.activeCharKey, target.charKey, skill1_defDisp)
const skill3_geo_dmg_Disp = equal(condInField, "inField",
  greaterEq(tally["geo"], 3, dm.skill.geo_dmg_)
)
const skill3_geo_dmg_ = equal(input.activeCharKey, target.charKey, skill3_geo_dmg_Disp)

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurst_def_ = greaterEq(input.asc, 1, equal(condAfterBurst, "afterBurst", dm.passive1.def_))

const p2_skill_dmgInc = greaterEq(input.asc, 4, prod(input.total.def, dm.passive2.skill_dmgInc))
const p2_burst_dmgInc = greaterEq(input.asc, 4, prod(input.total.def, dm.passive2.burst_dmgInc))

const [condAfterSkillBurstPath, condAfterSkillBurst] = cond(key, "afterSkillBurst")
const c6_geo_critDMG_ = greaterEq(input.constellation, 6,
  equal(condAfterSkillBurst, "afterSkillBurst",
    subscript(sum(tally["geo"], -1), dm.constellation6.geo_critDMG_)
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", dm.charged.aimed, "charged"),
    fully: dmgNode("atk", dm.charged.fully, "charged", { hit: { ele: constant(elementKey) } }),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", dm.skill.dmg, "skill"),
  },
  burst: {
    dmg: dmgNode("def", dm.burst.dmg_def, "burst"),
    crystalCollapse: dmgNode("def", dm.burst.crystalDmg_def, "burst")
  },
  constellation4: {
    heal: greaterEq(input.constellation, 4, greaterEq(tally["geo"], 2, healNode("def", dm.constellation4.heal_def_, 0)))
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
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal")
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.aimed, { name: ct.chg(`auto.skillParams.4`) }),
      }, {
        node: infoMut(dmgFormulas.charged.fully, { name: ct.chg(`auto.skillParams.5`) }),
      }]
    }, {
      text: ct.chg("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }]
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.0`) })
      }, {
        text: stg("duration"),
        value: dm.skill.duration,
        unit: "s"
      }, {
        text: stg("cd"),
        value: dm.skill.cd,
        unit: "s"
      }],
    }, ct.condTem("skill", {
      value: condInField,
      path: condInFieldPath,
      name: st("activeCharField"),
      teamBuff: true,
      states: {
        inField: {
          fields: [{
            node: infoMut(skill1_defDisp, KeyMap.info("def")),
          }, {
            canShow: data => data.get(tally["geo"]).value >= 2,
            text: st("incInterRes")
          }, {
            node: infoMut(skill3_geo_dmg_Disp, KeyMap.info("geo_dmg_")),
          }]
        }
      }
    }), ct.headerTem("passive2", {
      fields: [{
        node: p2_skill_dmgInc
      }]
    }), ct.headerTem("constellation4", {
      teamBuff: true,
      canShow: greaterEq(tally.geo, 2, 1),
      fields: [{
        node: infoMut(dmgFormulas.constellation4.heal, { name: stg("healing") }),
      }]
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) })
      }, {
        node: infoMut(dmgFormulas.burst.crystalCollapse, {
          name: ct.chg(`burst.skillParams.1`),
          multi: dm.burst.crystalHits,
        }),
      }, {
        text: stg("duration"),
        value: dm.burst.duration,
        unit: "s"
      }, {
        text: stg("cd"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: stg("energyCost"),
        value: dm.burst.enerCost
      }]
    }, ct.condTem("passive1", {
      value: condAfterBurst,
      path: condAfterBurstPath,
      name: st("afterUse.burst"),
      teamBuff: true,
      states: {
        afterBurst: {
          fields: [{
            node: afterBurst_def_
          }, {
            text: stg("duration"),
            value: dm.passive1.duration,
            unit: "s"
          }]
        }
      }
    }), ct.headerTem("passive2", {
      fields: [{
        node: p2_burst_dmgInc
      }]
    })]),

    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTem("constellation6", [ct.condTem("constellation6", {
      value: condAfterSkillBurst,
      path: condAfterSkillBurstPath,
      name: st("afterUse.skillOrBurst"),
      teamBuff: true,
      states: {
        afterSkillBurst: {
          fields: [{
            node: c6_geo_critDMG_
          }, {
            text: stg("duration"),
            value: dm.constellation6.duration,
            unit: "s"
          }]
        }
      }
    })])
  }
}

export default new CharacterSheet(sheet, data, assets)
