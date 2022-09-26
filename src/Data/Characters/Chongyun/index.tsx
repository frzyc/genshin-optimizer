import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey, WeaponTypeKey } from '../../../Types/consts'
import { cond, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Chongyun"
const elementKey: ElementKey = "cryo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3
      skillParam_gen.auto[3], // 4
    ]
  },
  charged: {
    spin_dmg: skillParam_gen.auto[4],
    final_dmg: skillParam_gen.auto[5],
    stamina: skillParam_gen.auto[6][0],
    duration: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    infusionDuration: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    fieldDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atk_spd: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    dmg: skillParam_gen.passive2[p2++][0],
    res: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    cdr: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energy_regen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    burst_dmg_: skillParam_gen.constellation6[0],
  }
} as const

const [condAsc4Path, condAsc4] = cond(key, "asc4")
const [condSkillPath, condSkill] = cond(key, "skill")
const [condC6Path, condC6] = cond(key, "c6")

const skillDmg = dmgNode("atk", datamine.skill.dmg, "skill")

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", datamine.charged.spin_dmg, "charged"),
    finalDmg: dmgNode("atk", datamine.charged.final_dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: skillDmg,
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
  passive2: {
    dmg: greaterEq(input.asc, 4, skillDmg),
  },
  constellation1: {
    dmg: greaterEq(input.constellation, 1, customDmgNode(prod(percent(datamine.constellation1.dmg), input.total.atk), "elemental", { hit: { ele: constant(elementKey) } }))
  }
}

const nodeAsc4 = greaterEq(input.asc, 4,
  equal(condAsc4, "hit",
    -0.10
  )
)
const activeInArea = equal("activeInArea", condSkill, equal(input.activeCharKey, target.charKey, 1))

const nodeAsc1Disp = greaterEq(input.asc, 1, percent(0.08))
const nodeAsc1 = equal(activeInArea, 1, nodeAsc1Disp)

const correctWep =
  lookup(target.weaponType,
    { "sword": constant(1), "claymore": constant(1), "polearm": constant(1) }, constant(0));

const activeInAreaInfusion = equalStr(correctWep, 1, equalStr(activeInArea, 1, elementKey))

const nodeC6 = greaterEq(input.constellation, 6, equal(condC6, "on", datamine.constellation6.burst_dmg_))

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    burst_dmg_: nodeC6,
  },
  teamBuff: {
    premod: {
      cryo_enemyRes_: nodeAsc4,
      atkSPD_: nodeAsc1
    },
    infusion: {
      team: activeInAreaInfusion,
    },
  },
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: "cryo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.4` }),
      }, {
        node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.5` }),
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
        unit: '/s'
      }, {
        text: tr("auto.skillParams.7"),
        value: datamine.charged.duration,
        unit: 's'
      }]
    }, {
      text: tr(`auto.fields.plunging`),
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
        text: tr("skill.skillParams.2"),
        value: datamine.skill.fieldDuration,
        unit: "s"
      }, {
        text: tr("skill.skillParams.3"),
        value: datamine.skill.cd,
        unit: "s"
      }]
    }, ct.conditionalTemplate("skill", {
      teamBuff: true,
      value: condSkill,
      path: condSkillPath,
      name: st("activeCharField"),
      states: {
        activeInArea: {
          fields: [{
            text: trm("infusion"),
            variant: elementKey
          }, {
            text: tr("skill.skillParams.1"),
            value: (data) => data.get(subscript(input.total.skillIndex, datamine.skill.infusionDuration)).value,
            unit: "s",
            fixed: 1
          }, {
            node: infoMut(nodeAsc1Disp, { key: "atkSPD_" })
          }]
        },
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.1"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.2"),
        value: datamine.burst.enerCost,
      }, {
        text: trm("blades"),
        value: data => data.get(input.constellation).value < 6 ? 3 : 4
      }]
    }]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
      fields: [{
        node: infoMut(dmgFormulas.passive2.dmg, { key: `char_${key}:passive2` }),
      }]
    }), ct.conditionalTemplate("passive2", {
      teamBuff: true,
      value: condAsc4,
      path: condAsc4Path,
      name: trm("asc4Cond"),
      states: {
        hit: {
          fields: [{
            node: nodeAsc4
          }]
        },
      }
    })]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1", [ct.fieldsTemplate("constellation1", {
      fields: [{
        node: infoMut(dmgFormulas.constellation1.dmg, { key: `char_${key}:constellation1` })
      }]
    })]),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
      value: condC6,
      path: condC6Path,
      name: trm("constellation6"),
      states: {
        on: {
          fields: [{
            node: nodeC6
          }]
        }
      }
    })]),
  },
}

export default new CharacterSheet(sheet, data, assets);
