import { CharacterData } from 'pipeline'
import { input, tally, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Gorou"
const elementKey: ElementKey = "geo"
const [tr] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

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
const c6_geo_critDMG_ = greaterEq(input.constellation, 6,
  equal(condAfterSkillBurst, "afterSkillBurst",
    subscript(sum(tally["geo"], -1), datamine.constellation6.geo_critDMG_)
  )
)

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
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.4` }),
      }, {
        node: infoMut(dmgFormulas.charged.fully, { key: `char_${key}_gen:auto.skillParams.5` }),
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
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        text: sgt("duration"),
        value: datamine.skill.duration,
        unit: "s"
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s"
      }],
    }, ct.conditionalTemplate("skill", {
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
    }), ct.headerTemplate("passive2", {
      fields: [{
        node: p2_skill_dmgInc
      }]
    }), ct.headerTemplate("constellation4", {
      teamBuff: true,
      canShow: greaterEq(tally.geo, 2, 1),
      fields: [{
        node: infoMut(dmgFormulas.constellation4.heal, { key: "sheet_gen:healing" }),
      }]
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
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
      }]
    }, ct.conditionalTemplate("passive1", {
      value: condAfterBurst,
      path: condAfterBurstPath,
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
    }), ct.headerTemplate("passive2", {
      fields: [{
        node: p2_burst_dmgInc
      }]
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
      value: condAfterSkillBurst,
      path: condAfterSkillBurstPath,
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
    })])
  }
}

export default new CharacterSheet(sheet, data, assets)
