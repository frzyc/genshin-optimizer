import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, matchFull, percent, prod, subscript, sum, unequal, one } from "../../../Formula/utils"
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { INodeFieldDisplay } from '../../../Types/IFieldDisplay'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, card, talentAssets, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const characterKey: CharacterKey = "Yoimiya"
const elementKey: ElementKey = "pyro"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", characterKey)
const ct = charTemplates(characterKey, data_gen.weaponTypeKey, talentAssets)

const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], //x2
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3], //x2
      skillParam_gen.auto[4],
    ]
  },
  charged: {
    hit: skillParam_gen.auto[5],
    full: skillParam_gen.auto[6],
    kindling: skillParam_gen.auto[7],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg_: skillParam_gen.skill[3],
    duration: skillParam_gen.skill[1][0],
    cd: skillParam_gen.skill[2][0]
  },
  burst: {
    dmg: skillParam_gen.burst[0],
    exp: skillParam_gen.burst[1],
    duration: skillParam_gen.burst[3][0],
    cd: skillParam_gen.burst[4][0],
    cost: skillParam_gen.burst[5][0]
  },
  passive1: {
    pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: 10,
  },
  passive2: {
    fixed_atk_: skillParam_gen.passive2[0][0],
    var_atk_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    burst_durationInc: skillParam_gen.constellation1[0],
    atk_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2]
  },
  constellation2: {
    pyro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation3: {},
  constellation4: {
    cdRed: skillParam_gen.constellation4[0]
  },
  constellation5: {},
  constellation6: {
    chance: skillParam_gen.constellation6[0],
    dmg_: skillParam_gen.constellation6[1],
  },
}

const [condSkillPath, condSkill] = cond(characterKey, "skill")
const [condBurstPath, condBurst] = cond(characterKey, "burst")
const [condA1Path, condA1] = cond(characterKey, "a1")
const [condC1Path, condC1] = cond(characterKey, "c1")
const [condC2Path, condC2] = cond(characterKey, "c2")
const const3TalentInc = greaterEq(input.constellation, 3, 3)
const const5TalentInc = greaterEq(input.constellation, 5, 3)
const normal_dmgMult = matchFull(condSkill, "skill", subscript(input.total.skillIndex, datamine.skill.dmg_, { key: "_" }), one)
const a1Stacks = lookup(condA1, Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i => [i, constant(i)])), 0)
const pyro_dmg_ = greaterEq(input.asc, 1, equal(condSkill, "skill", infoMut(prod(percent(datamine.passive1.pyro_dmg_), a1Stacks), { key: 'pyro_dmg_', variant: elementKey })))
const atk_ = greaterEq(input.asc, 4, equal(condBurst, "on", unequal(input.activeCharKey, characterKey,
  sum(percent(datamine.passive2.fixed_atk_), prod(percent(datamine.passive2.var_atk_), a1Stacks)))))
const c1atk_ = equal(condC1, 'c1', percent(datamine.constellation1.atk_))
const c2pyro_dmg_ = equal(condC2, 'c2', percent(datamine.constellation2.pyro_dmg_), { key: 'pyro_dmg_', variant: elementKey })

const normalEntries = datamine.normal.hitArr.map((arr, i) => [
  i,
  customDmgNode(
    prod(subscript(input.total.autoIndex, arr, { key: "_" }), input.total.atk, normal_dmgMult),
    "normal", {
    hit: {
      ele: matchFull(condSkill, "skill", constant(elementKey), constant("physical"))
    }
  }
  )
])

// This might just need to be a single dmgNode of her kindling arrow, with proper scaling applied.
const kindlingEntries = normalEntries.map(([_, node], i) => [i, greaterEq(input.constellation, 6, equal(condSkill, "skill", prod(percent(datamine.constellation6.dmg_), node)))])

export const dmgFormulas = {
  normal: Object.fromEntries(normalEntries),
  charged: {
    hit: dmgNode("atk", datamine.charged.hit, "charged"),
    full: dmgNode("atk", datamine.charged.full, "charged", { hit: { ele: constant(elementKey) } }),
    kindling: unequal(condSkill, "skill", dmgNode("atk", datamine.charged.kindling, "charged", { hit: { ele: constant(elementKey) } }))
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {},
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
    exp: dmgNode("atk", datamine.burst.exp, "burst", { hit: { ele: constant(elementKey) } }),
  },
  constellation6: Object.fromEntries(kindlingEntries)
}

export const dataObj = dataObjForCharacterSheet(characterKey, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: const3TalentInc,
    burst: const5TalentInc,
  },
  teamBuff: {
    premod: {
      atk_,
    }
  },
  premod: {
    atk_: c1atk_,
    pyro_dmg_: sum(pyro_dmg_, c2pyro_dmg_),
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
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${characterKey}_gen:auto.skillParams.${i}` }),
          textSuffix: ([0, 3].includes(i)) ? st("brHits", { count: 2 }) : ""
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.hit, { key: `char_${characterKey}_gen:auto.skillParams.5` }),
        }, {
          node: infoMut(dmgFormulas.charged.full, { key: `char_${characterKey}_gen:auto.skillParams.6` }),
        }, {
          node: infoMut(dmgFormulas.charged.kindling, { key: `char_${characterKey}_gen:auto.skillParams.7` }),
        }],
      }, {
        text: tr(`auto.fields.plunging`),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }],
      }]),

      skill: ct.talentTemplate("skill", [{
        fields: [{
          text: tr("skill.skillParams.2"),
          value: datamine.skill.cd,
          unit: 's'
        }]
      }, ct.conditionalTemplate("skill", {
        name: st("afterUse.skill"),
        path: condSkillPath,
        value: condSkill,
        states: {
          skill: {
            fields: [{
              text: trm("normMult"),
              value: data => data.get(normal_dmgMult).value * 100,
              fixed: 1,
              unit: "%",
            }, {
              text: trm("normPyroInfus"),
            }, {
              text: tr("skill.skillParams.1"),
              value: datamine.skill.duration,
              unit: 's'
            }]
          }
        }
      }), ct.conditionalTemplate("passive1", {
        // Conditional for self display
        canShow: equal(condSkill, "skill", 1),
        value: condA1,
        path: condA1Path,
        name: tr("passive1.name"),
        states: Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i =>
          [i, {
            name: `${i} stack`,
            fields: [{
              node: pyro_dmg_
            }, {
              text: sgt("duration"),
              value: datamine.passive1.duration,
              unit: "s"
            }]
          }]
        ))
      }), ct.headerTemplate("constellation6", {
        canShow: equal(condSkill, "skill", 1),
        fields: datamine.normal.hitArr.map((_, i): INodeFieldDisplay => ({
          node: infoMut(dmgFormulas.constellation6[i], { key: `char_${characterKey}_gen:auto.skillParams.${i}` }),
          textSuffix: ([0, 3].includes(i)) ? st("brHits", { count: 2 }) : ""
        }))
      })]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { key: `char_${characterKey}_gen:burst.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.burst.exp, { key: `char_${characterKey}_gen:burst.skillParams.1` }),
        }, {
          text: tr("burst.skillParams.2"),
          value: uiData => datamine.burst.duration + (uiData.get(input.constellation).value >= 1 ? datamine.constellation1.burst_durationInc : 0),
          unit: "s"
        }, {
          text: tr("burst.skillParams.3"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: tr("burst.skillParams.4"),
          value: 60,
        }]
      }, ct.headerTemplate("constellation1", {
        fields: [{
          text: st("durationInc"),
          value: datamine.constellation1.burst_durationInc,
          unit: "s"
        }]
      }), ct.conditionalTemplate("constellation1", {
        name: trm("c1"),
        value: condC1,
        path: condC1Path,
        states: {
          c1: {
            fields: [{
              node: constant(datamine.constellation1.atk_, { key: "atk_" })
            }, {
              text: sgt("duration"),
              value: datamine.constellation1.duration,
              unit: 's'
            }]
          }
        }
      })]),

      passive1: ct.talentTemplate("passive1"),
      passive2: ct.talentTemplate("passive2", [ct.conditionalTemplate("passive2", {
        teamBuff: true,
        // Hide for Yoimiya
        canShow: unequal(input.activeCharKey, characterKey, 1),
        path: condBurstPath,
        value: condBurst,
        name: tr("burst.name"),
        states: {
          on: {
            fields: [{
              node: atk_
            }, {
              text: sgt("duration"),
              value: datamine.passive2.duration,
              unit: "s"
            }]
          }
        }
      }), ct.conditionalTemplate("passive1", {
        // Conditional from P1 for team buff display when P2 is activated
        canShow: unequal(input.activeCharKey, characterKey,
          equal(condBurst, "on", greaterEq(input.asc, 4, 1))
        ),
        teamBuff: true,
        value: condA1,
        path: condA1Path,
        name: tr("passive1.name"),
        states: Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i =>
          [i, {
            name: `${i} stack`,
            fields: [{
              node: pyro_dmg_
            }, {
              text: sgt("duration"),
              value: datamine.passive1.duration,
              unit: "s"
            }]
          }]
        ))
      })]),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
        name: trm("c2"),
        value: condC2,
        path: condC2Path,
        states: {
          c2: {
            fields: [{
              node: c2pyro_dmg_
            }, {
              text: sgt("duration"),
              value: datamine.constellation2.duration,
              unit: "s"
            }]
          }
        }
      })]),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: const3TalentInc }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: const5TalentInc }] }]),
      constellation6: ct.talentTemplate("constellation6")
    },
  },
}

export default new CharacterSheet(sheet, dataObj)
