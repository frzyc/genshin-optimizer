import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { equal, greaterEq, infoMut } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Barbara"
const elementKey: ElementKey = "hydro"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
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
    cregen_hp_: skillParam_gen.skill[s++],
    cregen_hp: skillParam_gen.skill[s++],
    regen_hp_: skillParam_gen.skill[s++],
    regen_hp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    hp_: skillParam_gen.burst[b++],
    hp: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stam: -skillParam_gen.passive1[0][0],
  },
  passive2: {
    ext: skillParam_gen.passive2[0][0],
    maxExt: skillParam_gen.passive2[0][1],
  },
  constellation2: {
    cdDec: 0.15,
    hydro_dmg_: 0.15
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

const [condSkillPath, condSkill] = cond(key, "skill")
const nodeA1 = greaterEq(input.asc, 1, equal(condSkill, "on", equal(input.activeCharKey, target.charKey, datamine.passive1.stam)))
const nodeA1Display = greaterEq(input.asc, 1, equal(condSkill, "on", datamine.passive1.stam))

const [condC2Path, condC2] = cond(key, "c2")
const nodeC2 = greaterEq(input.constellation, 2, equal(condC2, "on", equal(input.activeCharKey, target.charKey, datamine.constellation2.hydro_dmg_)))
const nodeC2Display = greaterEq(input.constellation, 2, equal(condC2, "on", datamine.constellation2.hydro_dmg_))
const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    regen: healNodeTalent("hp", datamine.skill.regen_hp_, datamine.skill.regen_hp, "skill"),
    cregen: healNodeTalent("hp", datamine.skill.cregen_hp_, datamine.skill.cregen_hp, "skill"),
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    regen: healNodeTalent("hp", datamine.burst.hp_, datamine.burst.hp, "burst"),
  }
}


export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  }, teamBuff: {
    premod: {
      staminaDec_: nodeA1,
      hydro_dmg_: nodeC2,
    },
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
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
        node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.4` }),
      }, {
        text: tr("auto.skillParams.5"),
        value: datamine.charged.stamina,
      }],
    }, {
      text: tr("auto.fields.plunging"),
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
        node: infoMut(dmgFormulas.skill.regen, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.skill.cregen, { key: `char_${key}_gen:skill.skillParams.1` })
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.2` })
      }, {
        text: tr(`skill.skillParams.3`),
        value: datamine.skill.duration,
        unit: "s",
      }, {
        text: tr(`skill.skillParams.4`),
        value: data => data.get(input.constellation).value >= 2 ? `${datamine.skill.cd}s - ${datamine.constellation2.cdDec * 100}%` : `${datamine.skill.cd}s`,
      }]
    }]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.regen, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        text: tr("burst.skillParams.1"),
        value: datamine.burst.cd,
      }, {
        text: tr("burst.skillParams.2"),
        value: datamine.burst.enerCost,
      }]
    }]),

    passive1: ct.talentTemplate("passive1", [ct.conditionalTemplate("passive1", {
      teamBuff: true,
      value: condSkill,
      path: condSkillPath,
      name: trm("passive1.cond"),
      states: {
        on: {
          fields: [{
            node: infoMut(nodeA1Display, { key: "staminaDec_" }),
          }]
        }
      }
    })]),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
      teamBuff: true,
      value: condC2,
      path: condC2Path,
      name: trm("constellation2.cond"),
      states: {
        on: {
          fields: [{
            node: infoMut(nodeC2Display, { key: "hydro_dmg_" }),
          }]
        }
      }
    })]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}

export default new CharacterSheet(sheet, data, assets);
