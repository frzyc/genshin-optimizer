import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, infoMut, lookup, match, matchFull, percent, prod, subscript, sum, threshold, threshold_add, unmatch } from '../../../Formula/utils'
import { CharacterKey, WeaponTypeKey } from '../../../Types/consts'
import { objectKeyMap } from '../../../Util/Util'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "RaidenShogun"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    coorDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    burstDmg_bonus: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    resolveBonus1: skillParam_gen.burst[b++],
    resolveBonus2: skillParam_gen.burst[b++],
    resolveGained: skillParam_gen.burst[b++],
    hit1: skillParam_gen.burst[b++],
    hit2: skillParam_gen.burst[b++],
    hit3: skillParam_gen.burst[b++],
    hit41: skillParam_gen.burst[b++],
    hit42: skillParam_gen.burst[b++],
    hit5: skillParam_gen.burst[b++],
    charged1: skillParam_gen.burst[b++],
    charged2: skillParam_gen.burst[b++],
    stam: skillParam_gen.burst[b++][0],
    plunge: skillParam_gen.burst[b++],
    plungeLow: skillParam_gen.burst[b++],
    plungeHigh: skillParam_gen.burst[b++],
    enerGen: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    er: skillParam_gen.passive2[p2++][0],
    energyGen: skillParam_gen.passive2[p2++][0],
    electroDmg_bonus: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    def_ignore: skillParam_gen.constellation2[0],
  },
  constellation4: {
    atk_bonus: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
} as const

// Used to bool whether Raiden is C2 and above; 1: yes, 0: no
const c2Above = threshold(input.constellation, 2, 1, 0)

const [condSkillEyePath, condSkillEye] = cond(key, "skillEye")
const skillEye_ = match("skillEye", condSkillEye,
  prod(datamine.burst.enerCost, subscript(input.total.skillIndex, datamine.skill.burstDmg_bonus.map(x => x), { key: '_' })))

function skillDmg(atkType: number[]) {
  // if Raiden is above or equal to C2, then account for DEF Ignore else not
  return matchFull(c2Above, 1,
    customDmgNode(prod(subscript(input.total.skillIndex, atkType, { key: '_' }), input.total.atk), 'skill', { enemy: { defIgn: constant(datamine.constellation2.def_ignore) } }),
    customDmgNode(prod(subscript(input.total.skillIndex, atkType, { key: '_' }), input.total.atk), 'skill', {}),
  )
}

const energyCosts = [40, 50, 60, 70, 80, 90]
const [condSkillEyeTeamPath, condSkillEyeTeam] = cond(key, "skillEyeTeam")
const skillEyeTeamBurstDmgInc = unmatch(input.activeCharKey, input.charKey,
  prod(lookup(condSkillEyeTeam, objectKeyMap(energyCosts, i => constant(i)), 0),
    subscript(input.total.skillIndex, datamine.skill.burstDmg_bonus.map(x => x), { key: '_' })))

const resolveStacks = [10, 20, 30, 40, 50, 60]
const [condResolveStackPath, condResolveStack] = cond(key, "burstResolve")

function burstResolve(atkType: number[], initial = false) {
  let resolveBonus = initial ? datamine.burst.resolveBonus1 : datamine.burst.resolveBonus2

  // if Raiden is above or equal to C2, then account for DEF Ignore else not
  return matchFull(c2Above, 1,
    customDmgNode(prod(sum(subscript(input.total.burstIndex, atkType, { key: '_' }),
      prod(subscript(input.total.burstIndex, resolveBonus.map(x => x), { key: '_' }),
        lookup(condResolveStack, objectKeyMap(resolveStacks, i => constant(i)), 0))), input.total.atk), 'burst', { hit: { ele: constant('electro') }, enemy: { defIgn: constant(datamine.constellation2.def_ignore) } }),
    customDmgNode(prod(sum(subscript(input.total.burstIndex, atkType, { key: '_' }),
      prod(subscript(input.total.burstIndex, resolveBonus.map(x => x), { key: '_' }),
        lookup(condResolveStack, objectKeyMap(resolveStacks, i => constant(i)), 0))), input.total.atk), 'burst', { hit: { ele: constant('electro') } }))
}

const passive2ElecDmgBonus = threshold_add(input.asc, 4, prod(sum(input.total.enerRech_, percent(-1)), (datamine.passive2.electroDmg_bonus * 100)))

const [condC4Path, condC4] = cond(key, "c4")
const c4AtkBonus_ = threshold_add(input.constellation, 4,
  match("c4", condC4, unmatch(input.activeCharKey, input.charKey, datamine.constellation4.atk_bonus))
)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: skillDmg(datamine.skill.skillDmg),
    coorDmg: skillDmg(datamine.skill.coorDmg),
    skillEye_
  },
  burst: {
    dmg: burstResolve(datamine.burst.dmg, true),
    hit1: burstResolve(datamine.burst.hit1),
    hit2: burstResolve(datamine.burst.hit2),
    hit3: burstResolve(datamine.burst.hit3),
    hit41: burstResolve(datamine.burst.hit41),
    hit42: burstResolve(datamine.burst.hit42),
    hit5: burstResolve(datamine.burst.hit5),
    charged1: burstResolve(datamine.burst.charged1),
    charged2: burstResolve(datamine.burst.charged2),
    plunge: burstResolve(datamine.burst.plunge),
    plungeLow: burstResolve(datamine.burst.plungeLow),
    plungeHigh: burstResolve(datamine.burst.plungeHigh),
  },
}

export const data = dataObjForCharacterSheet(key, "electro", "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: threshold_add(input.constellation, 5, 3),
    burst: threshold_add(input.constellation, 3, 3),
  },
  premod: {
    burst_dmg_: skillEye_,
    electro_dmg_: passive2ElecDmgBonus,
  },
  teamBuff: {
    premod: {
      atk_: c4AtkBonus_,
      burst_dmg_: skillEyeTeamBurstDmgInc
    }
  }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "electro",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) =>
            ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i < 4 ? 0 : -1)}` }),
              textSuffix: i === 3 ? "(1)" : i === 4 ? "(2)" : ""
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
            }, {
              text: tr("auto.skillParams.6"),
              value: datamine.charged.stamina,
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
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
          }, {
            node: infoMut(dmgFormulas.skill.coorDmg, { key: `char_${key}_gen:skill.skillParams.1` }),
          }, {
            text: tr("skill.skillParams.2"),
            value: `${datamine.skill.duration}s`,
          }, {
            text: tr("skill.skillParams.4"),
            value: `${datamine.skill.cd}s`,
          }],
          conditional: {
            value: condSkillEye,
            path: condSkillEyePath,
            name: trm("skill.eye"),
            states: {
              skillEye: {
                fields: [{
                  node: skillEye_
                }]
              }
            }
          },
        }, {
          conditional: {
            value: condSkillEyeTeam,
            path: condSkillEyeTeamPath,
            header: conditionalHeader("skill", tr, skill),
            description: tr("skill.description"),
            teamBuff: true,
            canShow: unmatch(input.activeCharKey, input.charKey, 1),
            name: trm("skill.partyCost"),
            states: Object.fromEntries(energyCosts.map(c => [c, {
              name: `${c}`,
              fields: [{
                node: skillEyeTeamBurstDmgInc,
              }]
            }]))
          }
        }]
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
          }, {
            node: infoMut(dmgFormulas.burst.hit1, { key: `char_${key}_gen:burst.skillParams.3` }),
          }, {
            node: infoMut(dmgFormulas.burst.hit2, { key: `char_${key}_gen:burst.skillParams.4` }),
          }, {
            node: infoMut(dmgFormulas.burst.hit3, { key: `char_${key}_gen:burst.skillParams.5` }),
          }, {
            node: infoMut(dmgFormulas.burst.hit41, { key: `char_${key}_gen:burst.skillParams.6` }),
            textSuffix: "(1)"
          }, {
            node: infoMut(dmgFormulas.burst.hit42, { key: `char_${key}_gen:burst.skillParams.6` }),
            textSuffix: "(2)"
          }, {
            node: infoMut(dmgFormulas.burst.hit5, { key: `char_${key}_gen:burst.skillParams.7` }),
          }, {
            node: infoMut(dmgFormulas.burst.charged1, { key: `char_${key}_gen:burst.skillParams.8` }),
            textSuffix: "(1)"
          }, {
            node: infoMut(dmgFormulas.burst.charged2, { key: `char_${key}_gen:burst.skillParams.8` }),
            textSuffix: "(2)"
          }, {
            text: tr("burst.skillParams.9"),
            value: `${datamine.burst.stam}`,
          }, {
            node: infoMut(dmgFormulas.burst.plunge, { key: `char_${key}_gen:burst.skillParams.10` }),
          }, {
            node: infoMut(dmgFormulas.burst.plungeLow, { key: `char_${key}_gen:burst.skillParams.11` }),
          }, {
            node: infoMut(dmgFormulas.burst.plungeHigh, { key: `char_${key}_gen:burst.skillParams.11` }),
          }, {
            text: tr("burst.skillParams.12"),
            value: (data) => `${datamine.burst.enerGen[data.get(input.total.burstIndex).value]}`,
          }, {
            text: tr("burst.skillParams.13"),
            value: `${datamine.burst.duration}s`,
          }, {
            text: tr("burst.skillParams.14"),
            value: `${datamine.burst.cd}s`,
          }, {
            text: tr("burst.skillParams.15"),
            value: `${datamine.burst.enerCost}`,
          }],
          conditional: {
            value: condResolveStack,
            path: condResolveStackPath,
            name: trm("burst.resolves"),
            states: Object.fromEntries(resolveStacks.map(c => [c, {
              name: `${c}`,
              fields: []
            }]))
          }
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          fields: [{
            canShow: data => data.get(input.asc).value >= 4,
            text: trm("a4.enerRest"),
            value: (data) => {
              return (data.get(input.total.enerRech_).value * 100 - 100) * (datamine.passive2.energyGen * 100)
            },
            unit: "%"
          }, {
            node: passive2ElecDmgBonus,
          }]
        }]
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: {
            value: condC4,
            path: condC4Path,
            teamBuff: true,
            canShow: threshold_add(input.constellation, 4, unmatch(input.activeCharKey, input.charKey, 1)),
            header: conditionalHeader("constellation4", tr, c4),
            description: tr("constellation4.description"),
            name: trm("c4.expires"),
            states: {
              c4: {
                fields: [{
                  node: c4AtkBonus_,
                }, {
                  text: tr("skill.skillParams.2"),
                  value: `${datamine.constellation4.duration}s`
                }]
              }
            }
          }
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);