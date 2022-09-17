import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { CharacterKey } from '../../../Types/consts'
import { objectKeyMap } from '../../../Util/Util'
import { cond, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "RaidenShogun"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

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

const [condSkillEyePath, condSkillEye] = cond(key, "skillEye")
const skillEye_ = equal("skillEye", condSkillEye,
  prod(constant(datamine.burst.enerCost, { key: "sheet:energy" }), subscript(input.total.skillIndex, datamine.skill.burstDmg_bonus, { fixed: 2, key: '_' })))

function skillDmg(atkType: number[]) {
  // if Raiden is above or equal to C2, then account for DEF Ignore else not
  return dmgNode('atk', atkType, 'skill', {
    enemy: { defIgn: greaterEq(input.constellation, 2, datamine.constellation2.def_ignore) }
  })
}

const energyCosts = [40, 50, 60, 70, 80, 90]
const [condSkillEyeTeamPath, condSkillEyeTeam] = cond(key, "skillEyeTeam")
const skillEyeTeamBurstDmgInc = unequal(input.activeCharKey, input.charKey,
  prod(lookup(condSkillEyeTeam, objectKeyMap(energyCosts, i => constant(i, { key: "sheet:energy" })), 0),
    subscript(input.total.skillIndex, datamine.skill.burstDmg_bonus, { fixed: 2, key: '_' })))

const resolveStacks = [10, 20, 30, 40, 50, 60]
const [condResolveStackPath, condResolveStack] = cond(key, "burstResolve")

const resolveStackNode = lookup(condResolveStack, objectKeyMap(resolveStacks, i => constant(i)), 0, { key: `char_${key}:burst.resolves` })
const resolveInitialBonus_ = prod(
  subscript(input.total.burstIndex, datamine.burst.resolveBonus1, { key: `char_${key}:burst.resolveInitial_` }),
  resolveStackNode
)
const resolveInfusedBonus_ = prod(
  subscript(input.total.burstIndex, datamine.burst.resolveBonus2, { key: `char_${key}:burst.resolveInfused_` }),
  resolveStackNode
)
function burstResolve(mvArr: number[], initial = false) {
  const resolveBonus = initial ? resolveInitialBonus_ : resolveInfusedBonus_

  return customDmgNode(
    prod(
      sum(
        subscript(input.total.burstIndex, mvArr, { key: '_' }),
        resolveBonus
      ),
      input.total.atk
    ),
    'burst',
    {
      hit: {
        ele: constant('electro')
      }, enemy: {
        // if Raiden is above or equal to C2, then account for DEF Ignore else not
        defIgn: greaterEq(input.constellation, 2, datamine.constellation2.def_ignore)
      }
    }
  )
}

const passive2ElecDmgBonus = greaterEq(input.asc, 4, prod(sum(input.premod.enerRech_, percent(-1)), (datamine.passive2.electroDmg_bonus * 100)))

const [condC4Path, condC4] = cond(key, "c4")
const c4AtkBonus_ = greaterEq(input.constellation, 4,
  equal("c4", condC4, unequal(input.activeCharKey, input.charKey, datamine.constellation4.atk_bonus))
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
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, "electro", "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
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
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: "electro",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i < 4 ? 0 : -1)}` }),
        textSuffix: i === 3 ? "(1)" : i === 4 ? "(2)" : ""
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
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
    }, ct.conditionalTemplate("skill", {
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
    ), ct.conditionalTemplate("skill", {
      value: condSkillEyeTeam,
      path: condSkillEyeTeamPath,
      teamBuff: true,
      canShow: unequal(input.activeCharKey, input.charKey, 1),
      name: trm("skill.partyCost"),
      states: Object.fromEntries(energyCosts.map(c => [c, {
        name: `${c}`,
        fields: [{
          node: skillEyeTeamBurstDmgInc,
        }]
      }]))
    })]),

    burst: ct.talentTemplate("burst", [{
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
    }, ct.conditionalTemplate("burst", {
      value: condResolveStack,
      path: condResolveStackPath,
      name: trm("burst.resolves"),
      states: Object.fromEntries(resolveStacks.map(c => [c, {
        name: st("stack", { count: c }),
        fields: [{
          node: infoMut(resolveInitialBonus_, { key: `char_${key}:burst.resolveInitial_` }),
        }, {
          node: infoMut(resolveInfusedBonus_, { key: `char_${key}:burst.resolveInfused_` })
        }]
      }]))
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
      fields: [{
        text: trm("a4.enerRest"),
        value: (data) => (data.get(input.total.enerRech_).value * 100 - 100) * (datamine.passive2.energyGen * 100),
        unit: "%"
      }, {
        node: passive2ElecDmgBonus,
      }]
    })]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.conditionalTemplate("constellation4", {
      value: condC4,
      path: condC4Path,
      teamBuff: true,
      canShow: unequal(input.activeCharKey, input.charKey, 1),
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
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}

export default new CharacterSheet(sheet, data, assets);
