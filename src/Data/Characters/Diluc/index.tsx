import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Diluc"
const elementKey: ElementKey = "pyro"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0, c2i = 0, c6i = 0
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
    firstHit: skillParam_gen.skill[s++],
    secondHit: skillParam_gen.skill[s++],
    thridHit: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    slashDmg: skillParam_gen.burst[b++],
    dotDmg: skillParam_gen.burst[b++],
    explosionDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    stamReduction: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0]
  },
  passive2: {
    durationInc: skillParam_gen.passive2[p2++][0],
    pyroInc: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    dmgInc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    atkInc: skillParam_gen.constellation2[c2i++],
    atkSpdInc: skillParam_gen.constellation2[c2i++],
    duration: skillParam_gen.constellation2[c2i++],
    maxStack: skillParam_gen.constellation2[c2i++],
    cd: skillParam_gen.constellation2[c2i++],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[c6i++],
    dmgInc: skillParam_gen.constellation6[c6i++],
    atkSpdInc: skillParam_gen.constellation6[c6i++],
  },
} as const

const [condBurstPath, condBurst] = cond(key, "Burst")
const [condC1Path, condC1] = cond(key, "DilucC1")
const [condC2Path, condC2] = cond(key, "DilucC2")
const [condC6Path, condC6] = cond(key, "DilucC6")

const nodeBurstInfusion = equalStr(condBurst, "on", "pyro")
const nodeA4Bonus = greaterEq(input.asc, 4, datamine.passive2.pyroInc)

const nodeC1Bonus = equal(condC1, "on", greaterEq(input.constellation, 1, datamine.constellation1.dmgInc))
const nodeC2AtkBonus = greaterEq(input.constellation, 2,
  lookup(condC2, Object.fromEntries(range(1, datamine.constellation2.maxStack).map(i => [i, constant(datamine.constellation2.atkInc * i)])), 0, { key: "atk_" }))
const nodeC2SpdBonus = greaterEq(input.constellation, 2,
  lookup(condC2, Object.fromEntries(range(1, datamine.constellation2.maxStack).map(i => [i, constant(datamine.constellation2.atkSpdInc * i)])), 0, { key: "atkSPD_" }))
const nodeC6DmgBonus = equal(condC6, "on", greaterEq(input.constellation, 6, datamine.constellation6.dmgInc))
const nodeC6SpdBonus = equal(condC6, "on", greaterEq(input.constellation, 6, datamine.constellation6.atkSpdInc), { key: "atkSPD_" })

const skillAdditional: Data = {
  premod: { skill_dmg_: constant(datamine.constellation4.dmgInc) },
  hit: { ele: constant("pyro") }
}

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", datamine.charged.spinningDmg, "charged"),
    finalDmg: dmgNode("atk", datamine.charged.finalDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    firstHit: dmgNode("atk", datamine.skill.firstHit, "skill"),
    secondHit: dmgNode("atk", datamine.skill.secondHit, "skill"),
    thirdHit: dmgNode("atk", datamine.skill.thridHit, "skill"),
  },
  burst: {
    slashDmg: dmgNode("atk", datamine.burst.slashDmg, "burst"),
    dotDmg: dmgNode("atk", datamine.burst.dotDmg, "burst"),
    explosionDmg: dmgNode("atk", datamine.burst.explosionDmg, "burst"),
  },
  constellation4: {
    secondHitBoost: greaterEq(input.constellation, 4, dmgNode("atk", datamine.skill.secondHit, "skill", skillAdditional)),
    thirdHitBoost: greaterEq(input.constellation, 4, dmgNode("atk", datamine.skill.thridHit, "skill", skillAdditional)),
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  premod: {
    pyro_dmg_: nodeA4Bonus,
    atk_: nodeC2AtkBonus,
    atkSPD_: sum(nodeC6SpdBonus, nodeC2SpdBonus),
    all_dmg_: nodeC1Bonus,
    normal_dmg_: nodeC6DmgBonus,
  },
  infusion: nodeBurstInfusion
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: elementKey,
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
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.4` }),
          }, {
            node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.5` }),
          }, {
            text: tr("auto.skillParams.6"),
            value: data => data.get(input.asc).value >= 1 ? `${datamine.charged.stamina}/s - ${datamine.passive1.stamReduction * 100}%` : `${datamine.charged.stamina}/s`,
          }, {
            text: tr("auto.skillParams.7"),
            value: data => data.get(input.asc).value >= 1 ? `${datamine.charged.duration}s + ${datamine.passive1.duration}` : datamine.charged.duration,
            unit: 's'
          }]
        }, {
          text: tr("auto.fields.plunging"),
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
            node: infoMut(dmgFormulas.skill.firstHit, { key: `char_${key}_gen:skill.skillParams.0` }),
          },
          {
            node: infoMut(dmgFormulas.skill.secondHit, { key: `char_${key}_gen:skill.skillParams.1` }),
          },
          {
            node: infoMut(dmgFormulas.skill.thirdHit, { key: `char_${key}_gen:skill.skillParams.2` }),
          },
          {
            node: infoMut(dmgFormulas.constellation4.secondHitBoost, { key: `char_${key}:skillB.0` }),
          },
          {
            node: infoMut(dmgFormulas.constellation4.thirdHitBoost, { key: `char_${key}:skillB.1` }),
          },
          {
            text: tr("burst.skillParams.3"),
            value: datamine.skill.cd,
          },],
          conditional: {
            value: condC6,
            path: condC6Path,
            name: trm("c6C.name"),
            canShow: greaterEq(input.constellation, 6, 1),
            states: {
              on: {
                fields: [{
                  node: nodeC6DmgBonus,
                }, {
                  node: nodeC6SpdBonus
                }]
              }
            }
          }
        }],
      },
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.slashDmg, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.burst.dotDmg, { key: `char_${key}_gen:burst.skillParams.1` })
      }, {
        node: infoMut(dmgFormulas.burst.explosionDmg, { key: `char_${key}_gen:burst.skillParams.2` })
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.5"),
        value: datamine.burst.cost,
      }], {
        name: tr("burst.name"),
        value: condBurst,
        path: condBurstPath,
        states: {
          on: {
            fields: [{
              text: st("infusion.pyro"),
              variant: "pyro",
            }, {
              node: nodeA4Bonus
            }, {
              text: tr("burst.skillParams.4"),
              value: data => data.get(input.asc).value >= 4 ? `${datamine.burst.duration} + ${datamine.passive2.durationInc}` : datamine.burst.duration,
              unit: "s"
            }]
          }
        }
      }),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1, undefined, {
        value: condC1,
        path: condC1Path,
        name: trm("c1C.name"),
        header: conditionalHeader("constellation1", tr, c1),
        canShow: greaterEq(input.constellation, 1, 1),
        states: {
          on: {
            fields: [{
              node: nodeC1Bonus,
            }]
          }
        }
      }),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        value: condC2,
        path: condC2Path,
        name: trm("c2C.name"),
        header: conditionalHeader("constellation2", tr, c2),
        canShow: greaterEq(input.constellation, 2, 1),
        states: Object.fromEntries(range(1, datamine.constellation2.maxStack).map(i =>
          [i, {
            name: st("stack_one", { count: i }),
            fields: [{
              node: nodeC2AtkBonus
            }, {
              node: nodeC2SpdBonus
            }]
          }
          ]))
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
