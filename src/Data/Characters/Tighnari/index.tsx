import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { constant, equal, greaterEq, infoMut, lookup, min, naught, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Tighnari"
const elementKey: ElementKey = "dendro"
const region: Region = "sumeru"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    wreathArrow: skillParam_gen.auto[a++],
    clusterArrow: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++]
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    fieldDuration: skillParam_gen.skill[s++][0],
    penetratorDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    primaryDmg: skillParam_gen.burst[b++],
    secondaryDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    eleMas: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    charged_burst_dmg_: skillParam_gen.passive2[p2++][0],
    maxDmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    charged_critRate_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    dendro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    unknown: skillParam_gen.constellation6[0],
    dmg: skillParam_gen.constellation6[1],
    chargeTimeRed: 0.9
  }
} as const

const [condA1AfterWreathPath, condA1AfterWreath] = cond(key, "p1AfterWreath")
const a1AfterWreath_eleMas = greaterEq(input.asc, 1, equal(condA1AfterWreath, "on", datamine.passive1.eleMas))

const a4_charged_dmg_ = greaterEq(input.asc, 4, min(
  prod(percent(datamine.passive2.charged_burst_dmg_, { fixed: 2 }), input.total.eleMas),
  percent(datamine.passive2.maxDmg_)
))
const a4_burst_dmg_ = { ...a4_charged_dmg_ }
const chargedShaftAddl: Data = {
  hit: { ele: constant(elementKey) },
}

const c1_charged_critRate_ = greaterEq(input.constellation, 1, datamine.constellation1.charged_critRate_)

const [condC2EnemyFieldPath, condC2EnemyField] = cond(key, "c2EnemyField")
const c2EnemyField_dendro_dmg_ = greaterEq(input.constellation, 2, equal(condC2EnemyField, "on", datamine.constellation2.dendro_dmg_))

const [condC4Path, condC4] = cond(key, "c4")
const c4_eleMas = greaterEq(input.constellation, 4, lookup(condC4, {
  after: constant(datamine.constellation4.eleMas),
  react: constant(datamine.constellation4.eleMas * 2)
}, naught))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", chargedShaftAddl),
    wreath: dmgNode("atk", datamine.charged.wreathArrow, "charged", chargedShaftAddl),
    cluster: dmgNode("atk", datamine.charged.clusterArrow, "charged", chargedShaftAddl),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    primaryDmg: dmgNode("atk", datamine.burst.primaryDmg, "burst"),
    secondaryDmg: dmgNode("atk", datamine.burst.secondaryDmg, "burst"),
  },
  passive2: {
    charged_dmg_: a4_charged_dmg_,
    burst_dmg_: a4_burst_dmg_,
  },
  constellation6: {
    cluster: greaterEq(input.constellation, 6, customDmgNode(
      prod(percent(datamine.constellation6.dmg), input.total.atk),
      "elemental",
      { hit: { ele: constant(elementKey) } }
    ))
  }
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    skill: skillC5,
    burst: burstC3,
  },
  premod: {
    eleMas: a1AfterWreath_eleMas,
    charged_dmg_: a4_charged_dmg_,
    burst_dmg_: a4_burst_dmg_,
    charged_critRate_: c1_charged_critRate_,
    dendro_dmg_: c2EnemyField_dendro_dmg_,
  },
  teamBuff: {
    premod: {
      eleMas: c4_eleMas,
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal")
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          textSuffix: i === 2 ? st("brHits", { count: 2 }) : undefined,
        })),
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.4` }),
        }, {
          node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          node: infoMut(dmgFormulas.charged.wreath, { key: `char_${key}_gen:auto.skillParams.6` }),
        }, {
          node: infoMut(dmgFormulas.charged.cluster, { key: `char_${key}_gen:auto.skillParams.7` }),
        }],
      }, ct.conditionalTemplate("passive1", {
        path: condA1AfterWreathPath,
        value: condA1AfterWreath,
        name: trm("p1Cond"),
        states: {
          on: {
            fields: [{
              node: a1AfterWreath_eleMas
            }]
          }
        }
      }), ct.headerTemplate("constellation1", {
        fields: [{
          node: c1_charged_critRate_,
        }]
      }), ct.headerTemplate("constellation6", {
        fields: [{
          text: trm("c6WreathRed"),
          value: datamine.constellation6.chargeTimeRed,
          unit: "s",
          fixed: 1
        }, {
          node: infoMut(dmgFormulas.constellation6.cluster, { key: `char_${key}:c6DmgKey` })
        }]
      }), {
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
          node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          text: tr("skill.skillParams.1"),
          value: datamine.skill.fieldDuration,
          unit: "s"
        }, {
          text: tr("skill.skillParams.2"),
          value: datamine.skill.penetratorDuration,
          unit: "s"
        }, {
          text: sgt("cd"),
          value: datamine.skill.cd,
          unit: "s"
        }]
      }, ct.conditionalTemplate("constellation2", {
        path: condC2EnemyFieldPath,
        value: condC2EnemyField,
        name: st("opponentsField"),
        states: {
          on: {
            fields: [{
              node: c2EnemyField_dendro_dmg_
            }]
          }
        }
      })]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.primaryDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.burst.secondaryDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
        }, {
          text: sgt("cd"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: sgt("energyCost"),
          value: datamine.burst.energyCost,
        }]
      }, ct.conditionalTemplate("constellation4", {
        path: condC4Path,
        value: condC4,
        teamBuff: true,
        name: "",
        states: {
          after: {
            name: st("afterUse.burst"),
            fields: [{
              node: c4_eleMas,
            }, {
              text: sgt("duration"),
              value: datamine.constellation4.duration,
              unit: "s"
            }]
          },
          react: {
            name: trm("c4ReactCond"),
            fields: [{
              node: c4_eleMas
            }, {
              text: sgt("duration"),
              value: datamine.constellation4.duration,
              unit: "s"
            }]
          }
        }
      })]),

      passive1: ct.talentTemplate("passive1"),
      passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
        fields: [{
          node: a4_charged_dmg_,
        }, {
          node: a4_burst_dmg_,
        }]
      })]),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: burstC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: skillC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data, assets);
