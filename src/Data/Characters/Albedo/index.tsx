import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { infoMut, lookup, equal, prod, greaterEq, naught } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
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