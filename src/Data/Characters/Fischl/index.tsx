import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, greaterEq, infoMut, lessThan, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, customHealNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const key: CharacterKey = "Fischl"
const elementKey: ElementKey = "electro"
const region: Region = "mondstadt"
const [tr] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    ozDmg: skillParam_gen.skill[s++],
    summonDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[p1++][0]
  },
  passive2: {
    dmg: skillParam_gen.passive2[p2++][0]
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0]
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0]
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    regen: skillParam_gen.constellation4[1]
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1]
  }
} as const

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('electro') } }),
    aimedChargedOz: greaterEq(input.asc, 1, prod(percent(datamine.passive1.dmg), dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('electro') } })))
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    ozDmg: dmgNode("atk", datamine.skill.ozDmg, "skill"),
    summonDmg: lessThan(input.constellation, 2, dmgNode("atk", datamine.skill.summonDmg, "skill")),
    summonDmgC2: greaterEq(input.constellation, 2, customDmgNode(prod(sum(subscript(input.total.skillIndex,
      datamine.skill.summonDmg, { key: "_" }), percent(datamine.constellation2.dmg)), input.total.atk), "skill",
      { hit: { ele: constant('electro') } })),
    ozActiveCharDmg: greaterEq(input.constellation, 6, customDmgNode(prod(input.total.atk, percent(datamine.constellation6.dmg)), "skill", { hit: { ele: constant('electro') } }))
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    additionalDmg: greaterEq(input.constellation, 4, customDmgNode(prod(input.total.atk, percent(datamine.constellation4.dmg)), "burst", { hit: { ele: constant('electro') } })),
    regen: greaterEq(input.constellation, 4, customHealNode(prod(input.total.hp, percent(datamine.constellation4.regen))))
  },
  passive2: {
    dmg: greaterEq(input.asc, 4, customDmgNode(prod(input.total.atk, percent(datamine.passive2.dmg)), "skill", { hit: { ele: constant('electro') } }))
  },
  constellation1: {
    dmg: greaterEq(input.constellation, 1, customDmgNode(prod(input.total.atk, percent(datamine.constellation1.dmg)), "normal", { hit: { ele: constant('physical') } }))
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
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
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.6` }),
        }, {
          canShow: (data) => data.get(input.asc).value >= 1,
          node: infoMut(dmgFormulas.charged.aimedChargedOz, { key: `char_${key}:a1Name` }),
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
          node: infoMut(dmgFormulas.skill.ozDmg, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          canShow: (data) => data.get(input.constellation).value < 2,
          node: infoMut(dmgFormulas.skill.summonDmg, { key: `char_${key}_gen:skill.skillParams.1` }),
        }, {
          canShow: (data) => data.get(input.constellation).value >= 2,
          node: infoMut(dmgFormulas.skill.summonDmgC2, { key: `char_${key}_gen:skill.skillParams.1` }),
        }, {
          canShow: (data) => data.get(input.constellation).value >= 6,
          node: infoMut(dmgFormulas.skill.ozActiveCharDmg, { key: `char_${key}:c6OzDmg` })
        }, {
          text: tr("skill.skillParams.2"),
          value: (data) => data.get(input.constellation).value >= 6 ? datamine.skill.duration + datamine.constellation6.duration : datamine.skill.duration,
          unit: "s"
        }, {
          text: tr("skill.skillParams.3"),
          value: `${datamine.skill.cd}`,
          unit: "s"
        }, {
          canShow: (data) => data.get(input.constellation).value >= 2,
          text: st("aoeInc"),
          value: 50,
          unit: "%"
        }]
      }]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          canShow: (data) => data.get(input.constellation).value >= 4,
          node: infoMut(dmgFormulas.burst.additionalDmg, { key: `char_${key}:c4AoeDmg` }),
        }, {
          canShow: (data) => data.get(input.constellation).value >= 4,
          node: infoMut(dmgFormulas.burst.regen, { key: `sheet_gen:healing` }),
        }, {
          text: tr("burst.skillParams.1"),
          value: `${datamine.burst.cd}`,
          unit: "s"
        }, {
          text: tr("burst.skillParams.2"),
          value: `${datamine.burst.enerCost}`,
        }]
      }]),

      passive1: ct.talentTemplate("passive1"),
      passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
        fields: [{
          node: infoMut(dmgFormulas.passive2.dmg, { key: `char_${key}:a2Name` })
        }]
      })]),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1", [ct.fieldsTemplate("constellation1", {
        fields: [{
          node: infoMut(dmgFormulas.constellation1.dmg, { key: `char_${key}:c1Name` })
        }]
      })]),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data, assets)
