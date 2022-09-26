import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, percent, prod, subscript } from '../../../Formula/utils'
import { allElements, CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Ningguang"
const elementKey: ElementKey = "geo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0
const datamine = {
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
    screenHp: skillParam_gen.skill[s++], //screenHp * 100%
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

const [condA4Path, condA4] = cond(key, "Ascension4") //12% Geo DMG bonus after passing through the Jade Screen
const [condC4Path, condC4] = cond(key, "Constellation4")

const nodeA4GeoDmgBonus_ = equal(condA4, "on", percent(datamine.passive2.geoDmgBonus_), { key: `char_${key}:a4bonus_` })

const nodesC4 = Object.fromEntries(allElements.map(ele => [
  `${ele}_res_`,
  equal(condC4, "on", percent(0.10))
]))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    baseDmg: dmgNode("atk", datamine.charged.dmg, "charged"),
    jadeDmg: dmgNode("atk", datamine.charged.jadeDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    screenHp: prod(subscript(input.total.skillIndex, datamine.skill.screenHp, { key: '_' }), input.total.hp),
    dmg: dmgNode("atk", datamine.skill.skillDmg, "skill"),
  },
  burst: {
    gemDmg: dmgNode("atk", datamine.burst.dmgPerGem, "burst"),
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
      fields: [{
        node: infoMut(dmgFormulas.normal[0], { key: `char_${key}_gen:auto.skillParams.0` })
      }, {
        canShow: data => data.get(input.constellation).value >= 1,
        text: trm("aoeGems"),
      }]
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.baseDmg, { key: `char_${key}_gen:auto.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.charged.jadeDmg, { key: `char_${key}_gen:auto.skillParams.2` }),
      }, {
        canShow: data => data.get(input.asc).value < 1,
        text: tr("auto.skillParams.3"),
        value: datamine.charged.stamina,
      }, {
        canShow: data => data.get(input.asc).value >= 1,
        text: tr("auto.skillParams.3"),
        value: trm("starJadeStaminaCost"),
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
        node: infoMut(dmgFormulas.skill.screenHp, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        text: tr("skill.skillParams.2"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        canShow: data => data.get(input.constellation).value >= 2,
        text: trm("skillReset"),
      }],
    }, ct.conditionalTemplate("passive2", {
      teamBuff: true,
      value: condA4,
      path: condA4Path,
      name: trm("a4toggle"),
      states: {
        on: {
          fields: [{
            node: nodeA4GeoDmgBonus_
          }, {
            text: trm("a4duration"),
            value: datamine.passive2.duration,
            unit: "s"
          }]
        }
      }
    }), ct.conditionalTemplate("constellation4", {
      teamBuff: true,
      value: condC4,
      path: condC4Path,
      name: trm("c4toggle"),
      states: {
        on: {
          fields: Object.values(nodesC4).map(n => ({ node: n }))
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.gemDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.1"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: tr("burst.skillParams.2"),
        value: datamine.burst.enerCost,
      }, {
        canShow: data => data.get(input.constellation).value >= 6,
        text: trm("c6bonus"),
        value: 7,
      }]
    }]),
    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets)
