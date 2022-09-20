import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const key: CharacterKey = "Klee"
const elementKey: ElementKey = "pyro"
const regionKey: Region = "mondstadt"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
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
    jumptyDumptyDmg1: skillParam_gen.skill[s++],
    jumptyDumptyDmg2: skillParam_gen.skill[s++],
    jumptyDumptyDmg3: skillParam_gen.skill[s++],
    mineDmg: skillParam_gen.skill[s++],
    mineDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++], // what is this??
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    charged_dmg_: 0.5
  },
  constellation1: {
    dmg_: 1.2
  },
  constellation2: {
    enemyDefRed_: 0.23
  },
  constellation4: {
    dmg: 5.55
  },
  constellation6: {
    pyro_dmg_: 0.1
  }
} as const

const [condA1Path, condA1] = cond(key, "PoundingSurprise")
const charged_dmg_ = equal("on", condA1, greaterEq(input.asc, 1, percent(datamine.passive1.charged_dmg_)))

const [condC2Path, condC2] = cond(key, "ExplosiveFrags")
const enemyDefRed_ = equal("on", condC2, greaterEq(input.constellation, 2, percent(datamine.constellation2.enemyDefRed_)))

const [condC6Path, condC6] = cond(key, "BlazingDelight")
const pyro_dmg_ = equal("on", condC6, greaterEq(input.constellation, 6, percent(datamine.constellation6.pyro_dmg_)))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    jumptyDumptyDmg: dmgNode("atk", datamine.skill.jumptyDumptyDmg1, "skill"),
    mineDmg: dmgNode("atk", datamine.skill.mineDmg, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
  constellation1: {
    chainedReactionsDmg: greaterEq(input.constellation, 1, prod(percent(datamine.constellation1.dmg_), dmgNode("atk", datamine.burst.dmg, "burst")))
  },
  constellation4: {
    sparklyExplosionDmg: greaterEq(input.constellation, 4, customDmgNode(prod(percent(datamine.constellation4.dmg), input.total.atk), "elemental", { hit: { ele: constant('pyro') } }))
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, regionKey, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  premod: {
    charged_dmg_
  },
  teamBuff: {
    premod: {
      pyro_dmg_,
      enemyDefRed_
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.3` })
      }, {
        text: tr("auto.skillParams.4"),
        value: datamine.charged.stamina
      }]
    }, {
      text: tr("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" })
      }, {
        node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" })
      }, {
        node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" })
      }]
    }]),

    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.jumptyDumptyDmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.skill.mineDmg, { key: `char_${key}_gen:skill.skillParams.1` })
      }, {
        text: tr("skill.skillParams.2"),
        value: `${datamine.skill.mineDuration}`,
        unit: "s"
      }, {
        text: tr("skill.skillParams.3"),
        value: `${datamine.skill.cd}`,
        unit: "s"
      }]
    }]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        text: tr("burst.skillParams.1"),
        value: `${datamine.burst.duration}`,
        unit: "s"
      }, {
        text: tr("burst.skillParams.2"),
        value: `${datamine.burst.cd}`,
        unit: "s"
      }, {
        text: tr("burst.skillParams.3"),
        value: `${datamine.burst.enerCost}`
      }]
    }]),

    passive1: ct.talentTemplate("passive1", [ct.conditionalTemplate("passive1", {
      value: condA1,
      path: condA1Path,
      name: trm("a1CondName"),
      states: {
        on: {
          fields: [{
            node: charged_dmg_
          }, {
            text: trm("a1CondName2")
          }]
        }
      }
    })]),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1", [ct.fieldsTemplate("constellation1", {
      fields: [{
        node: infoMut(dmgFormulas.constellation1.chainedReactionsDmg, { key: `sheet:dmg` }),
      }]
    })]),
    constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
      value: condC2,
      path: condC2Path,
      teamBuff: true,
      name: trm("c2CondName"),
      states: {
        on: {
          fields: [{
            node: enemyDefRed_
          }, {
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        }
      }
    })]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.fieldsTemplate("constellation4", {
      fields: [{
        node: infoMut(dmgFormulas.constellation4.sparklyExplosionDmg, { key: `sheet:dmg` })
      }]
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
      value: condC6,
      path: condC6Path,
      teamBuff: true,
      name: trm("c6CondName"),
      states: {
        on: {
          fields: [{
            node: pyro_dmg_
          }, {
            text: sgt("duration"),
            value: 25,
            unit: "s"
          }]
        }
      }
    })])
  }
}

export default new CharacterSheet(sheet, data, assets)
