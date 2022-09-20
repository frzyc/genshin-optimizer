import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Xiangling"
const elementKey: ElementKey = "pyro"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4x4
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg1: skillParam_gen.burst[b++],
    dmg2: skillParam_gen.burst[b++],
    dmg3: skillParam_gen.burst[b++],
    dmgNado: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    atk_bonus: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    pyroRes: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    duration1: skillParam_gen.constellation2[0],
    duration2: skillParam_gen.constellation2[1],
    dmg: skillParam_gen.constellation2[2],
  },
  constellation6: {
    pyroDmg: skillParam_gen.constellation6[0],
  }
} as const

// A4
const [condAfterChiliPath, condAfterChili] = cond(key, "afterChili")
const afterChili = greaterEq(input.asc, 4,
  equal("afterChili", condAfterChili, percent(datamine.passive2.atk_bonus)))

// C1
const [condAfterGuobaHitPath, condAfterGuobaHit] = cond(key, "afterGuobaHit")
const afterGuobaHit = greaterEq(input.constellation, 1,
  equal("afterGuobaHit", condAfterGuobaHit, percent(-datamine.constellation1.pyroRes)))

// C6
const [condDuringPyronadoPath, condDuringPyronado] = cond(key, "afterPyronado")
const duringPyronado = greaterEq(input.constellation, 6,
  equal("duringPyronado", condDuringPyronado, percent(datamine.constellation6.pyroDmg))
)
const antiC6 = prod(duringPyronado, -1)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
  },
  burst: {
    dmg1: dmgNode("atk", datamine.burst.dmg1, "burst", { premod: { pyro_dmg_: antiC6 } }),
    dmg2: dmgNode("atk", datamine.burst.dmg2, "burst", { premod: { pyro_dmg_: antiC6 } }),
    dmg3: dmgNode("atk", datamine.burst.dmg3, "burst"),
    dmgNado: dmgNode("atk", datamine.burst.dmgNado, "burst", { premod: { pyro_dmg_: antiC6 } }),
  },
  constellation2: {
    dmg: customDmgNode(prod(input.total.atk, percent(datamine.constellation2.dmg)), "elemental",
      { hit: { ele: constant(elementKey) } })
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      atk_: afterChili,
      pyro_dmg_: duringPyronado,
      pyro_enemyRes_: afterGuobaHit,
    }
  },
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
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
        textSuffix: i === 2 ? st("brHits", { count: 2 }) : i === 3 ? st("brHits", { count: 4 }) : ""
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
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
        node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` },)
      }, {
        text: tr("skill.skillParams.1"),
        value: datamine.skill.cd,
        unit: "s",
      }]
    }, ct.conditionalTemplate("constellation1", {
      value: condAfterGuobaHit,
      path: condAfterGuobaHitPath,
      name: trm("afterGuobaHit"),
      teamBuff: true,
      states: {
        afterGuobaHit: {
          fields: [{
            node: afterGuobaHit
          }, {
            text: sgt("duration"),
            value: datamine.constellation1.duration,
            unit: "s",
          }],
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg1, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.burst.dmg2, { key: `char_${key}_gen:burst.skillParams.1` },)
      }, {
        node: infoMut(dmgFormulas.burst.dmg3, { key: `char_${key}_gen:burst.skillParams.2` },)
      }, {
        node: infoMut(dmgFormulas.burst.dmgNado, { key: `char_${key}_gen:burst.skillParams.3` },)
      }, {
        text: sgt("duration"),
        value: datamine.burst.duration,
        unit: "s",
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("constellation6", {
      value: condDuringPyronado,
      path: condDuringPyronadoPath,
      name: trm("duringPyronado"),
      teamBuff: true,
      states: {
        duringPyronado: {
          fields: [{
            text: trm("c6Exception"),
            canShow: data => data.get(input.constellation).value >= 6
              && data.get(condDuringPyronado).value === "duringPyronado"
          }, {
            node: duringPyronado
          }, {
            text: sgt("duration"),
            value: datamine.constellation1.duration,
            unit: "s",
          }],
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.conditionalTemplate("passive2", {
      value: condAfterChili,
      path: condAfterChiliPath,
      name: trm("afterChili"),
      teamBuff: true,
      states: {
        afterChili: {
          fields: [{
            node: afterChili,
          }, {
            text: sgt("duration"),
            value: datamine.passive2.duration,
            unit: "s",
          }]
        }
      }
    })]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [ct.fieldsTemplate("constellation2", {
      fields: [{
        value: datamine.constellation2.dmg,
        node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${key}:explosionDMG` }),
      }]
    })]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets)
