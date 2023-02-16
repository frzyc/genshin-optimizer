import { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import { constant, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey, RegionKey } from '@genshin-optimizer/consts'
import { st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, customHealNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const key: CharacterKey = "Fischl"
const elementKey: ElementKey = "electro"
const region: RegionKey = "mondstadt"
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const dm = {
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
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", dm.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", dm.charged.aimedCharged, "charged", { hit: { ele: constant('electro') } }),
    aimedChargedOz: greaterEq(input.asc, 1, prod(percent(dm.passive1.dmg), dmgNode("atk", dm.charged.aimedCharged, "charged", { hit: { ele: constant('electro') } })))
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    ozDmg: dmgNode("atk", dm.skill.ozDmg, "skill"),
    summonDmg: customDmgNode(
      prod(
        infoMut(sum(
          subscript(input.total.skillIndex, dm.skill.summonDmg, { unit: "%" }),
          greaterEq(input.constellation, 2, percent(dm.constellation2.dmg))
        ), { asConst: true, unit: "%" }),
        input.total.atk
      ),
      "skill",
      { hit: { ele: constant('electro') } }
    ),
  },
  burst: {
    dmg: dmgNode("atk", dm.burst.dmg, "burst"),
    additionalDmg: greaterEq(input.constellation, 4, customDmgNode(prod(input.total.atk, percent(dm.constellation4.dmg)), "burst", { hit: { ele: constant('electro') } })),
    regen: greaterEq(input.constellation, 4, customHealNode(prod(input.total.hp, percent(dm.constellation4.regen))))
  },
  passive2: {
    dmg: greaterEq(input.asc, 4, customDmgNode(prod(input.total.atk, percent(dm.passive2.dmg)), "skill", { hit: { ele: constant('electro') } }))
  },
  constellation1: {
    dmg: greaterEq(input.constellation, 1, customDmgNode(prod(input.total.atk, percent(dm.constellation1.dmg)), "normal", { hit: { ele: constant('physical') } }))
  },
  constellation6: {
    ozActiveCharDmg: greaterEq(input.constellation, 6, customDmgNode(prod(input.total.atk, percent(dm.constellation6.dmg)), "skill", { hit: { ele: constant('electro') } }))
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  premod: {
    skillBoost: nodeC3,
    burstBoost: nodeC5,
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {  auto: ct.talentTem("auto", [{
        text: ct.chg("auto.fields.normal"),
      }, {
        fields: dm.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
        }))
      }, {
        text: ct.chg("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.aimed, { name: ct.chg(`auto.skillParams.5`) }),
        }, {
          node: infoMut(dmgFormulas.charged.aimedCharged, { name: ct.chg(`auto.skillParams.6`) }),
        }, {
          canShow: (data) => data.get(input.asc).value >= 1,
          node: infoMut(dmgFormulas.charged.aimedChargedOz, { name: ct.ch("a1Name") }),
        }]
      }, {
        text: ct.chg("auto.fields.plunging"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
        }]
      }]),

      skill: ct.talentTem("skill", [{
        fields: [{
          node: infoMut(dmgFormulas.skill.ozDmg, { name: ct.chg(`skill.skillParams.0`) }),
        }, {
          node: infoMut(dmgFormulas.skill.summonDmg, { name: ct.chg(`skill.skillParams.1`) }),
        }, {
          text: ct.chg("skill.skillParams.2"),
          value: (data) => data.get(input.constellation).value >= 6 ? dm.skill.duration + dm.constellation6.duration : dm.skill.duration,
          unit: "s"
        }, {
          text: ct.chg("skill.skillParams.3"),
          value: `${dm.skill.cd}`,
          unit: "s"
        }, {
          canShow: (data) => data.get(input.constellation).value >= 2,
          text: st("aoeInc"),
          value: 50,
          unit: "%"
        }]
      }, ct.headerTem("constellation6", {
        fields: [{
          node: infoMut(dmgFormulas.constellation6.ozActiveCharDmg, { name: ct.ch("c6OzDmg") })
        }]
      })]),

      burst: ct.talentTem("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) }),
        }, {
          canShow: (data) => data.get(input.constellation).value >= 4,
          node: infoMut(dmgFormulas.burst.additionalDmg, { name: ct.ch("c4AoeDmg") }),
        }, {
          canShow: (data) => data.get(input.constellation).value >= 4,
          node: infoMut(dmgFormulas.burst.regen, { name: stg(`healing`) }),
        }, {
          text: ct.chg("burst.skillParams.1"),
          value: `${dm.burst.cd}`,
          unit: "s"
        }, {
          text: ct.chg("burst.skillParams.2"),
          value: `${dm.burst.enerCost}`,
        }]
      }]),

      passive1: ct.talentTem("passive1"),
      passive2: ct.talentTem("passive2", [ct.fieldsTem("passive2", {
        fields: [{
          node: infoMut(dmgFormulas.passive2.dmg, { name: ct.ch("a2Name") })
        }]
      })]),
      passive3: ct.talentTem("passive3"),
      constellation1: ct.talentTem("constellation1", [ct.fieldsTem("constellation1", {
        fields: [{
          node: infoMut(dmgFormulas.constellation1.dmg, { name: ct.ch("c1Name") })
        }]
      })]),
      constellation2: ct.talentTem("constellation2"),
      constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTem("constellation4"),
      constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTem("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data)
