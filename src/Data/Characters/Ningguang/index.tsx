import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, percent, prod, subscript } from '../../../Formula/utils'
import { allElements, CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, stg } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Ningguang"
const elementKey: ElementKey = "geo"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    jadeDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    screenHpMod: skillParam_gen.skill[s++], // 100% + skillParam_gen.skill[s++] * 100
    skillDmg: skillParam_gen.skill[s++],
    screenHp: skillParam_gen.skill[s++], // screenHp * 100%
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmgPerGem: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    geoDmgBonus_: skillParam_gen.passive2[p1++][0],
    duration: skillParam_gen.passive2[p1++][0],
  },
} as const

const [condA4Path, condA4] = cond(key, "Ascension4") // 12% Geo DMG bonus after passing through the Jade Screen
const [condC4Path, condC4] = cond(key, "Constellation4")

const nodeA4GeoDmgBonus_ = greaterEq(input.asc, 4, equal(condA4, "on", percent(dm.passive2.geoDmgBonus_)))

const nodesC4 = Object.fromEntries(allElements.map(ele => [
  `${ele}_res_`,
  greaterEq(input.constellation, 4, equal(condC4, "on", percent(0.10)))
]))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    baseDmg: dmgNode("atk", dm.charged.dmg, "charged"),
    jadeDmg: dmgNode("atk", dm.charged.jadeDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    screenHp: prod(subscript(input.total.skillIndex, dm.skill.screenHp, { unit: "%" }), input.total.hp),
    dmg: dmgNode("atk", dm.skill.skillDmg, "skill"),
  },
  burst: {
    gemDmg: dmgNode("atk", dm.burst.dmgPerGem, "burst"),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  }, teamBuff: {
    premod: {
      geo_dmg_: nodeA4GeoDmgBonus_,
      ...nodesC4,
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.normal[0], { name: ct.chg(`auto.skillParams.0`) })
      }, {
        canShow: data => data.get(input.constellation).value >= 1,
        text: ct.ch("aoeGems"),
      }]
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.baseDmg, { name: ct.chg(`auto.skillParams.1`) }),
      }, {
        node: infoMut(dmgFormulas.charged.jadeDmg, { name: ct.chg(`auto.skillParams.2`) }),
      }, {
        canShow: data => data.get(input.asc).value < 1,
        text: ct.chg("auto.skillParams.3"),
        value: dm.charged.stamina,
      }, {
        canShow: data => data.get(input.asc).value >= 1,
        text: ct.chg("auto.skillParams.3"),
        value: ct.ch("starJadeStaminaCost"),
      }]
    }, {
      text: ct.chg(`auto.fields.plunging`),
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
        node: infoMut(dmgFormulas.skill.screenHp, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.1`) }),
      }, {
        text: ct.chg("skill.skillParams.2"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        canShow: data => data.get(input.constellation).value >= 2,
        text: ct.ch("skillReset"),
      }],
    }, ct.condTem("passive2", {
      teamBuff: true,
      value: condA4,
      path: condA4Path,
      name: ct.ch("a4toggle"),
      states: {
        on: {
          fields: [{
            node: nodeA4GeoDmgBonus_
          }, {
            text: stg("duration"),
            value: dm.passive2.duration,
            unit: "s"
          }]
        }
      }
    }), ct.condTem("constellation4", {
      teamBuff: true,
      value: condC4,
      path: condC4Path,
      name: ct.ch("c4toggle"),
      states: {
        on: {
          fields: Object.values(nodesC4).map(n => ({ node: n }))
        }
      }
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.gemDmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        text: ct.chg("burst.skillParams.1"),
        value: dm.burst.cd,
        unit: "s",
      }, {
        text: ct.chg("burst.skillParams.2"),
        value: dm.burst.enerCost,
      }, {
        canShow: data => data.get(input.constellation).value >= 6,
        text: ct.ch("c6bonus"),
        value: 7,
      }]
    }]),
    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets)
