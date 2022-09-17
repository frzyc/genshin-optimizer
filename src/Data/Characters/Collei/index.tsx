import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Collei"
const elementKey: ElementKey = "dendro"
const region: Region = "sumeru"
const [tr] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
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
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++]
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++]
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    explosionDmg: skillParam_gen.burst[b++],
    leapDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    unknown: skillParam_gen.passive1[p1++][0],
    sproutDmg: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    durationInc: skillParam_gen.passive2[p2++][0],
    maxExtension: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    enerRech_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    sproutDmg: skillParam_gen.constellation2[0],
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    anbarDmg: skillParam_gen.constellation6[0],
  }
} as const

const c1_enerRech_ = greaterEq(input.constellation, 1, datamine.constellation1.enerRech_)

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const c4AfterBurst_eleMasDisp = greaterEq(input.constellation, 4,
  equal(condAfterBurst, "on", datamine.constellation4.eleMas)
)
const c4AfterBurst_eleMas = unequal(target.charKey, key, c4AfterBurst_eleMasDisp)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant(elementKey) } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    explosionDmg: dmgNode("atk", datamine.burst.explosionDmg, "burst"),
    leapDmg: dmgNode("atk", datamine.burst.leapDmg, "burst"),
  },
  passive1: {
    dmg: greaterEq(input.asc, 1, customDmgNode(prod(percent(datamine.passive1.sproutDmg), input.total.atk), "skill", { hit: { ele: constant(elementKey) } }))
  },
  constellation6: {
    dmg: greaterEq(input.constellation, 6, customDmgNode(prod(percent(datamine.constellation6.anbarDmg), input.total.atk), "elemental", { hit: { ele: constant(elementKey) } })) // This is possibly burst damage
  }
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    burst: burstC5,
    skill: skillC3,
  },
  premod: {
    enerRech_: c1_enerRech_
  },
  teamBuff: {
    premod: {
      eleMas: c4AfterBurst_eleMas
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
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal")
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
        })),
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.4` }),
        }, {
          node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.5` }),
        },],
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
          node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          text: tr("skill.skillParams.1"),
          value: datamine.skill.cd,
          unit: "s"
        }]
      }]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.explosionDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.burst.leapDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
        }, {
          text: sgt("duration"),
          value: datamine.burst.duration,
          unit: "s"
        }, {
          text: sgt("cd"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: sgt("energyCost"),
          value: datamine.burst.enerCost,
        }]
      }, ct.conditionalTemplate("constellation4", {
        path: condAfterBurstPath,
        value: condAfterBurst,
        teamBuff: true,
        name: st("afterUse.burst"),
        canShow: unequal(target.charKey, input.activeCharKey, 1),
        states: {
          on: {
            fields: [{
              node: infoMut(c4AfterBurst_eleMasDisp, { key: "eleMas" })
            }, {
              text: sgt("duration"),
              value: datamine.constellation4.duration,
              unit: "s"
            }]
          }
        }
      })]),

      passive1: ct.talentTemplate("passive1", [ct.fieldsTemplate("passive1", {
        fields: [{
          node: infoMut(dmgFormulas.passive1.dmg, { key: `char_${key}:sproutDmg` })
        }, {
          text: sgt("duration"),
          value: datamine.passive1.duration,
          unit: "s",
        }]
      })]),
      passive2: ct.talentTemplate("passive2"),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: skillC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: burstC5 }] }]),
      constellation6: ct.talentTemplate("constellation6", [ct.fieldsTemplate("constellation6", {
        fields: [{
          node: infoMut(dmgFormulas.constellation6.dmg, { key: `char_${key}:miniAnbarDmg` })
        }]
      })]),
    },
  }
export default new CharacterSheet(sheet, data, assets);
