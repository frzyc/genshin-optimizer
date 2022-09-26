import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { constant, equal, greaterEq, infoMut, lookup, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey } from '../../../Types/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Eula"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0
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
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    icewhirl: skillParam_gen.skill[s++],
    physResDec: skillParam_gen.skill[s++],
    cryoResDec: skillParam_gen.skill[s++],
    resDecDuration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
    defBonus: skillParam_gen.skill[s++][0],
    unknown: skillParam_gen.skill[s++][0], // combined cooldown?
    physResDecNegative: skillParam_gen.skill[s++],
    cryoResDecNegative: skillParam_gen.skill[s++],
    grimheartDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    lightfallDmg: skillParam_gen.burst[b++],
    dmgPerStack: skillParam_gen.burst[b++],
    maxStack: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    percentage: skillParam_gen.passive1[p1++][0],
  },
  constellation1: {
    physInc: skillParam_gen.constellation1[0],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
  },
} as const

const [condGrimheartPath, condGrimheart] = cond(key, "Grimheart")
const [condLightfallSwordPath, condLightfallSword] = cond(key, "LightfallSword")
const [condC4Path, condC4] = cond(key, "LightfallSwordC4")
const [condTidalIllusionPath, condTidalIllusion] = cond(key, "TidalIllusion")

const def_ = sum(equal("stack1", condGrimheart, percent(datamine.skill.defBonus)), equal("stack2", condGrimheart, percent(2 * datamine.skill.defBonus)))
const cryo_enemyRes_ = equal("consumed", condGrimheart, subscript(input.total.skillIndex, datamine.skill.cryoResDecNegative))
const physical_enemyRes_ = equal("consumed", condGrimheart, subscript(input.total.skillIndex, datamine.skill.physResDecNegative))
const physical_dmg_ = equal("on", condTidalIllusion, percent(datamine.constellation1.physInc))

const lightSwordAdditional: Data = {
  premod: { burst_dmg_: equal(condC4, "on", constant(datamine.constellation4.dmgInc)) },
  hit: { ele: constant("physical") }
}

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", datamine.charged.spinningDmg, "charged"),
    finalDmg: dmgNode("atk", datamine.charged.finalDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
    hold: dmgNode("atk", datamine.skill.hold, "skill"),
    icewhirl: dmgNode("atk", datamine.skill.icewhirl, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    lightFallSwordNew: customDmgNode(
      prod(
        sum(
          subscript(input.total.burstIndex, datamine.burst.lightfallDmg, { key: '_' }),
          prod(
            lookup(condLightfallSword, objectKeyMap(range(1, 30), i => constant(i)), constant(0)),
            subscript(input.total.burstIndex, datamine.burst.dmgPerStack, { key: '_' })
          ),
        ),
        input.total.atk
      ), "burst", lightSwordAdditional),
  },
  passive1: {
    shatteredLightfallSword: prod(
      percent(datamine.passive1.percentage),
      dmgNode("atk", datamine.burst.lightfallDmg, "burst", lightSwordAdditional))
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, "cryo", "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    def_,
    cryo_enemyRes_,
    physical_enemyRes_,
    physical_dmg_
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: "cryo",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          textSuffix: (i === 2 || i === 4) ? st("brHits", { count: 2 }) : ""
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.6` }),
        }, {
          text: tr("auto.skillParams.7"),
          value: datamine.charged.stamina,
          unit: '/s'
        }, {
          text: tr("auto.skillParams.8"),
          value: datamine.charged.duration,
          unit: 's'
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
          node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          text: tr("skill.skillParams.8"),
          value: `${datamine.skill.pressCd}`,
          unit: 's'
        }, {
          node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.1` }),
        }, {
          text: st("holdCD"),
          value: `${datamine.skill.holdCd}`,
          unit: 's'
        }, {
          text: tr("burst.skillParams.3"),
          value: 2,
        }, {
          node: infoMut(dmgFormulas.skill.icewhirl, { key: `char_${key}_gen:skill.skillParams.2` }),
        }]
      }, ct.conditionalTemplate("skill", {
        value: condGrimheart,
        path: condGrimheartPath,
        name: trm("skillC.name"),
        states: {
          "stack1": {
            name: st("stack", { count: 1 }),
            fields: [{
              node: def_,
            }, {
              text: trm("skillC.grimheart.int")
            }, {
              text: tr("skill.skillParams.4"),
              value: datamine.skill.grimheartDuration,
              unit: 's'
            }]
          },
          "stack2": {
            name: st("stack", { count: 2 }),
            fields: [{
              node: def_,
            }, {
              text: trm("skillC.grimheart.int")
            }, {
              text: tr("skill.skillParams.4"),
              value: datamine.skill.grimheartDuration,
              unit: 's'
            }]
          },
          "consumed": {
            name: trm("skillC.consumed"),
            fields: [{
              node: cryo_enemyRes_,
            }, {
              node: physical_enemyRes_,
            }, {
              text: sgt('duration'),
              value: 7,
              unit: 's'
            }]
          }
        }
      })]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.burst.lightFallSwordNew, { key: `char_${key}:burstC.dmg` }),
        }, {
          text: tr("burst.skillParams.4"),
          value: `${datamine.burst.cd}`,
          unit: 's'
        }, {
          text: tr("burst.skillParams.5"),
          value: `${datamine.burst.enerCost}`,
        }, {
          text: sgt("duration"),
          value: 7,
          unit: 's'
        }]
      }, ct.conditionalTemplate("burst", {
        value: condLightfallSword,
        path: condLightfallSwordPath,
        name: trm("burstC.name"),
        states: {
          ...objectKeyMap(range(1, 30), i => ({
            name: st("stack", { count: i }),
            fields: [{
              canShow: data => data.get(input.constellation).value >= 6,
              text: trm("burstC.start5"),
            }, {
              canShow: data => data.get(input.constellation).value >= 6,
              text: trm("burstC.addStacks"),
            }]
          })),
        }
      }), ct.conditionalTemplate("constellation4", {
        value: condC4,
        path: condC4Path,
        name: trm("c4C.name"),
        states: {
          on: {
            fields: [{
              text: trm("c4C.desc")
            }]
          }
        }
      })]),

      passive1: ct.talentTemplate("passive1", [ct.fieldsTemplate("passive1", {
        fields: [{
          node: infoMut(dmgFormulas.passive1.shatteredLightfallSword, { key: `char_${key}:passive1` }),
        }]
      })]),
      passive2: ct.talentTemplate("passive2"),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1", [ct.conditionalTemplate("constellation1", {
        value: condTidalIllusion,
        path: condTidalIllusionPath,
        name: trm("c1C.name"),
        states: {
          on: {
            fields: [{
              node: physical_dmg_,
            }, {
              text: sgt('duration'),
              value: trm('c1C.durationStack')
            }]
          }
        }
      })]),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data, assets)
