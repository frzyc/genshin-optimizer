import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey } from '../../../Types/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Eula"
const [tr, trm] = trans("char", key)

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
const [condLightfallSwordC4Path, condLightfallSwordC4] = cond(key, "LightfallSwordC4")
const [condTidalIllusionPath, condTidalIllusion] = cond(key, "TidalIllusion")
const [condRollingRimeC4Path, condRollingRimeC4] = cond(key, "RollingRimeC4")

const def_ = equal("stacks", condGrimheart, percent(datamine.skill.defBonus))
const cryo_enemyRes_ = equal("consumed", condGrimheart, subscript(input.total.skillIndex, datamine.skill.cryoResDecNegative))
const physical_enemyRes_ = equal("consumed", condGrimheart, subscript(input.total.skillIndex, datamine.skill.physResDecNegative))
const physical_dmg_ = equal("on", condTidalIllusion, percent(datamine.constellation1.physInc))

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
    // TODO: Is this correct?
    // Should it be premod or total for C4?
    // 0: Base DMG, >=1: Stacks
    lightfallSword: lookup(condLightfallSword, {
      ...objectKeyMap(range(0, 30), i => customDmgNode(prod(sum(subscript(input.total.burstIndex, datamine.burst.lightfallDmg, { key: '_' }),
        prod(i, subscript(input.total.burstIndex, datamine.burst.dmgPerStack, { key: '_' }))), input.total.atk), "burst",
        { hit: { ele: constant("physical") } }))
    }, naught),
    lightfallSwordC4: greaterEq(input.constellation, 4, lookup(condLightfallSword, {
      ...objectKeyMap(range(0, 30), i => customDmgNode(prod(sum(subscript(input.total.burstIndex, datamine.burst.lightfallDmg, { key: '_' }),
        prod(i, subscript(input.total.burstIndex, datamine.burst.dmgPerStack, { key: '_' }))), input.total.atk), "burst",
        { hit: { ele: constant("physical") }, premod: { burst_dmg_: percent(datamine.constellation4.dmgInc) } })),
    }, naught))
  },
  passive1: {
    // TODO: Is this correct? Is the move supposed to be normal or burst??
    // Should it be premod or total for C4?
    shatteredLightfallSword: customDmgNode(prod(percent(datamine.passive1.percentage),
      subscript(input.total.burstIndex, datamine.burst.lightfallDmg, { key: '_' }), input.total.atk), "burst",
      { hit: { ele: constant("physical") } }),
    shatteredLightfallSwordC4: greaterEq(input.constellation, 4, customDmgNode(prod(percent(datamine.passive1.percentage),
      subscript(input.total.burstIndex, datamine.burst.lightfallDmg, { key: '_' }), input.total.atk), "burst",
      { hit: { ele: constant("physical") }, premod: { burst_dmg_: percent(datamine.constellation4.dmgInc) } }))
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
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "cryo",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) =>
            ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
              textSuffix: i === 2 ? "(2 Hits)" : i === 4 ? "(2 Hits)" : ""
            }))
          }, {
            text: tr("auto.fields.charged"),
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
      skill: { // Cannot use talentTemplate because this has multiple sections.
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
          }, {
            text: tr("skill.skillParams.8"),
            value: `${datamine.skill.pressCd}`,
            unit: 's'
          }, {
            node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.1` }),
          }, {
            text: tr("skill.skillParams.9"),
            value: `${datamine.skill.holdCd}`,
            unit: 's'
          }],
          conditional: { // Grimheart
            value: condGrimheart,
            path: condGrimheartPath,
            name: trm("skillC.name"),
            header: conditionalHeader("skill", tr, skill),
            states: {
              "stacks": {
                name: "Stacks",
                fields: [{
                  node: def_,
                }, {
                  text: trm("skillC.grimheart.int")
                }, {
                  text: tr("skill.skillParams.4"),
                  value: `${datamine.skill.grimheartDuration}`,
                  unit: 's'
                }, {
                  text: tr("burst.skillParams.3"),
                  value: 2,
                },]
              },
              "consumed": {
                name: "Consumed",
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
          },
        }, {
          fields: [{
            node: infoMut(dmgFormulas.skill.icewhirl, { key: `char_${key}_gen:skill.skillParams.2` }),
          }]
        }]
      },
      burst: { // Cannot use talentTemplate because this has multiple sections.
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
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
          }],
          conditional: { // Lightfall Sword
            value: condLightfallSword,
            path: condLightfallSwordPath,
            name: trm("burstC.name"),
            header: conditionalHeader("burst", tr, burst),
            states: {
              ...objectKeyMap(range(0, 30), i => ({
                name: i === 0 ? sgt("baseDMG") : st("stack", { count: i }),
                fields: [{
                  node: infoMut(dmgFormulas.burst.lightfallSword, { key: `char_${key}:burstC.dmg` }),
                }, {
                  canShow: data => data.get(input.constellation).value >= 6,
                  text: trm("burstC.start5"),
                }, {
                  canShow: data => data.get(input.constellation).value >= 6,
                  text: trm("burstC.addStacks"),
                }]
              })),
            }
          }
        }, {
          conditional: { // Lightfall Sword (C4)
            value: condLightfallSwordC4,
            path: condLightfallSwordC4Path,
            name: trm("c4C.name"),
            header: conditionalHeader("constellation4", tr, c4),
            canShow: greaterEq(input.constellation, 4, 1),
            states: {
              on: {
                fields: [{
                  node: infoMut(dmgFormulas.burst.lightfallSwordC4, { key: `char_${key}:burstC.dmg` }),
                }]
              }
            }
          }
        }]
      },
      passive1: { // Cannot use talentTemplate because this has multiple sections.
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          fields: [{
            node: infoMut(dmgFormulas.passive1.shatteredLightfallSword, { key: `char_${key}:passive1` }),
          }],
          conditional: { // Shattered Lightfall Sword (C4)
            value: condRollingRimeC4,
            path: condRollingRimeC4Path,
            name: trm("c4C.name"),
            header: conditionalHeader("constellation4", tr, c4),
            canShow: greaterEq(input.constellation, 4, 1),
            states: {
              on: {
                fields: [{
                  node: infoMut(dmgFormulas.passive1.shatteredLightfallSwordC4, { key: `char_${key}:passive1` }),
                }]
              }
            }
          }
        }]
      },
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1, undefined, {
        value: condTidalIllusion,
        path: condTidalIllusionPath,
        name: trm("c1C.name"),
        header: conditionalHeader("constellation1", tr, c1),
        canShow: greaterEq(input.constellation, 1, 1),
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
      }),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
