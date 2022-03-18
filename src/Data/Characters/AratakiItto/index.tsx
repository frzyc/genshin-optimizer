import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, percent, prod, subscript, sum } from '../../../Formula/utils'
import { allElementsWithPhy, CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'


const key: CharacterKey = "AratakiItto"
const elementKey: ElementKey = "geo"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)

const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0],
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3],
    ]
  },
  charged: {
    sSlash: skillParam_gen.auto[4],
    akSlash: skillParam_gen.auto[5],
    akFinal: skillParam_gen.auto[6],
    stam: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  ss: { //Superlative Superstrength
    duration: skillParam_gen.auto[11][0],
  },
  skill: {
    dmg: skillParam_gen.skill[0],
    hp: skillParam_gen.skill[1],
    duration: skillParam_gen.skill[2][0],
    ss_cd: skillParam_gen.skill[3][0],
    cd: skillParam_gen.skill[4][0],
  },
  burst: {
    atkSpd: skillParam_gen.burst[0][0],
    defConv: skillParam_gen.burst[1],
    resDec: skillParam_gen.burst[2][0],
    duration: skillParam_gen.burst[3][0],
    cd: skillParam_gen.burst[4][0],
    cost: skillParam_gen.burst[5][0],
  },
  passive1: {
    maxStacks: 3,
    atkSPD_: 0.10
  },
  passive2: {
    def_: skillParam_gen.passive2[0][0],
  },
  constellation4: {
    def_: skillParam_gen.constellation4[0],
    atk_: skillParam_gen.constellation4[1],
    duration: skillParam_gen.constellation4[2],
  },
  constellation6: {
    charged_critDMG_: skillParam_gen.constellation6[0],
  }
}

const [condBurstPath, condBurst] = cond(key, "burst")
const [condP1Path, condP1] = cond(key, "passive1")
const [condC4Path, condC4] = cond(key, "constellation4")

const nodeSkillHP = prod(subscript(input.total.skillIndex, datamine.skill.hp, { key: 'hp_' }), input.total.hp)
const nodeBurstAtk = equal(condBurst, "on", prod(subscript(input.total.burstIndex, datamine.burst.defConv, { key: 'def_' }), input.total.def))
const nodeBurstAtkSpd = equal(condBurst, "on", datamine.burst.atkSpd, { key: 'atkSPD_' })
const allNodeBurstRes = Object.fromEntries(allElementsWithPhy.map(ele => [`${ele}_res_`, equal(condBurst, "on", -datamine.burst.resDec)]))
const nodeBurstInfusion = equalStr(condBurst, "on", "geo")
const nodeA4Bonus = greaterEq(input.asc, 4, prod(percent(datamine.passive2.def_), input.premod.def))
const nodeP1AtkSpd = greaterEq(input.asc, 4, lookup(condP1, Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i => [i, constant(datamine.passive1.atkSPD_ * i)])), 0, { key: 'atkSPD_' }))
const nodeC4Atk = equal(condC4, "on", greaterEq(input.constellation, 4, datamine.constellation4.atk_))
const nodeC4Def = equal(condC4, "on", greaterEq(input.constellation, 4, datamine.constellation4.def_))
const nodeC6CritDMG = greaterEq(input.constellation, 6, datamine.constellation6.charged_critDMG_)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    sSlash: dmgNode("atk", datamine.charged.sSlash, "charged"),
    akSlash: dmgNode("atk", datamine.charged.akSlash, "charged", { total: { charged_dmgInc: nodeA4Bonus } }),
    akFinal: dmgNode("atk", datamine.charged.akFinal, "charged", { total: { charged_dmgInc: nodeA4Bonus } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    hp: nodeSkillHP
  },
  burst: {
    defConv: nodeBurstAtk,
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  teamBuff: {
    premod: {
      atk_: nodeC4Atk,
      def_: nodeC4Def,
    }
  },
  premod: {
    charged_critDMG_: nodeC6CritDMG,
    atk: nodeBurstAtk,
    atkSPD_: sum(nodeBurstAtkSpd, nodeP1AtkSpd),
    ...allNodeBurstRes
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
  elementKey: "geo",
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
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          }))
        },
        {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.akSlash, { key: `char_${key}_gen:auto.skillParams.4` }),
          }, {
            node: infoMut(dmgFormulas.charged.akFinal, { key: `char_${key}_gen:auto.skillParams.5` }),
          }, {
            text: tr("auto.skillParams.6"),
            value: datamine.ss.duration,
            unit: "s"
          }, {
            node: infoMut(dmgFormulas.charged.sSlash, { key: `char_${key}_gen:auto.skillParams.7` }),
          }, {
            text: tr("auto.skillParams.8"),
            value: datamine.charged.stam,
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
        }
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [
            {
              node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
            }, {
              node: infoMut(dmgFormulas.skill.hp, { key: `char_${key}_gen:skill.skillParams.1`, variant: "success" }),
            }, {
              text: tr("skill.skillParams.2"),
              value: datamine.skill.duration,
              unit: "s"
            }, {
              text: tr("skill.skillParams.3"),
              value: datamine.skill.cd,
              unit: "s"
            }
          ],
        }],
      },
      burst: talentTemplate("burst", tr, burst, [{
        text: tr("burst.skillParams.3"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.cost,
      }], {
        name: tr("burst.name"),
        value: condBurst,
        path: condBurstPath,
        states: {
          on: {
            fields: [{
              text: st("infusion.geo"),
              variant: "geo",
            }, {
              node: nodeBurstAtkSpd,
            },
            ...Object.values(allNodeBurstRes).map(node => ({ node })),
            {
              node: infoMut(nodeBurstAtk, { key: `char_${key}_gen:burst.skillParams.0` })
            }, {
              text: tr("burst.skillParams.2"),
              value: datamine.burst.duration,
              unit: "s"
            }]
          }
        }
      }),
      passive1: talentTemplate("passive1", tr, passive1, undefined, {
        name: trm("a1.name"),
        canShow: greaterEq(input.asc, 1, 1),
        value: condP1,
        path: condP1Path,
        states: Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i =>
          [i, {
            name: st("stack_one", { count: i }),
            fields: [
              {
                node: nodeP1AtkSpd
              },
            ]
          }]))
      }),
      passive2: talentTemplate("passive2", tr, passive2, [{ node: infoMut(nodeA4Bonus, { key: `char_${key}:a4:dmgInc` }) }]),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, undefined, {
        canShow: greaterEq(input.constellation, 4, 1),
        header: conditionalHeader("constellation4", tr, c4),
        description: tr("constellation4.description"),
        name: trm("c4.name"),
        teamBuff: true,
        value: condC4,
        path: condC4Path,
        states: {
          on: {
            fields: [
              {
                node: nodeC4Atk
              }, {
                node: nodeC4Def
              },
              {
                text: sgt("duration"),
                value: datamine.constellation4.duration,
                unit: "s"
              }]
          }
        }
      }),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, [{ node: nodeC6CritDMG }])
    },
  },
};

export default new CharacterSheet(sheet, data);
