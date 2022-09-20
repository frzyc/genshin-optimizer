import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Ganyu"
const elementKey: ElementKey = "cryo"
const region: Region = "liyue"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    frostflake: skillParam_gen.auto[a++],
    frostflakeBloom: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    inheritedHp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[p1++][0],
    critRateInc: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    cryoDmgBonus: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    opCryoRes: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    enerRegen: skillParam_gen.constellation1[2],
  }
} as const

const [condA1Path, condA1] = cond(key, "A1")
const [condA4Path, condA4] = cond(key, "A4")
const [condC1Path, condC1] = cond(key, "C1")
const [condC4Path, condC4] = cond(key, "C4")
const cryo_enemyRes_ = greaterEq(input.constellation, 1, equal("on", condC1, percent(datamine.constellation1.opCryoRes)))
const cryo_dmg_disp = greaterEq(input.asc, 4, equal("on", condA4, percent(datamine.passive2.cryoDmgBonus)))
const cryo_dmg_ = equal(input.activeCharKey, target.charKey, cryo_dmg_disp)
const all_dmg_ = greaterEq(input.constellation, 4,
  lookup(condC4, Object.fromEntries(range(1, 5).map(i => [i, percent(0.05 * i)])), naught))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('cryo') } }),
    frostflake: dmgNode("atk", datamine.charged.frostflake, "charged",
      { premod: { critRate_: greaterEq(input.asc, 1, equal(condA1, "on", percent(datamine.passive1.critRateInc))) }, hit: { ele: constant('cryo') } }),
    frostflakeBloom: dmgNode("atk", datamine.charged.frostflakeBloom, "charged",
      { premod: { critRate_: greaterEq(input.asc, 1, equal(condA1, "on", percent(datamine.passive1.critRateInc))) }, hit: { ele: constant('cryo') } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    inheritedHp: prod(subscript(input.total.skillIndex, datamine.skill.inheritedHp), input.total.hp),
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      cryo_dmg_,
      all_dmg_,
      cryo_enemyRes_,
    },
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
      text: tr("auto.fields.normal")
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.6` }),
      }, {
        node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.7` }),
      }, {
        node: infoMut(dmgFormulas.charged.frostflake, { key: `char_${key}_gen:auto.skillParams.8` }),
      }, {
        node: infoMut(dmgFormulas.charged.frostflakeBloom, { key: `char_${key}_gen:auto.skillParams.9` }),
      }],
    }, ct.conditionalTemplate("passive1", {
      value: condA1,
      path: condA1Path,
      name: trm("a1.condName"),
      states: {
        on: {
          fields: [{
            text: trm("a1.critRateInc"),
            value: datamine.passive1.critRateInc * 100,
            unit: "%"
          }, {
            text: sgt("duration"),
            value: `${datamine.passive1.duration}s`,
          }]
        }
      }
    }), ct.conditionalTemplate("constellation1", {
      value: condC1,
      path: condC1Path,
      name: trm("c1.condName"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: cryo_enemyRes_
          }, {
            text: sgt("duration"),
            value: `${datamine.constellation1.duration}s`,
          }]
        }
      }
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
        node: infoMut(dmgFormulas.skill.inheritedHp, { key: `char_${key}_gen:skill.skillParams.0`, variant: "heal" }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        text: tr("skill.skillParams.2"),
        value: `${datamine.skill.duration}s`,
      }, {
        text: tr("skill.skillParams.3"),
        value: `${datamine.skill.cd}s`,
      }, {
        canShow: (data) => data.get(input.constellation).value >= 2,
        text: st("charges"),
        value: 2,
      }]
    }]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.1"),
        value: `${datamine.burst.duration}s`,
      }, {
        text: tr("burst.skillParams.2"),
        value: `${datamine.burst.cd}s`,
      }, {
        text: tr("burst.skillParams.3"),
        value: `${datamine.burst.enerCost}`,
      }],
    }, ct.conditionalTemplate("passive2", {
      value: condA4,
      path: condA4Path,
      teamBuff: true,
      name: st("activeCharField"),
      states: {
        on: {
          fields: [{
            node: infoMut(cryo_dmg_disp, { key: "cryo_dmg_", variant: "cryo" })
          }]
        }
      }
    }), ct.conditionalTemplate("constellation4", {
      value: condC4,
      path: condC4Path,
      teamBuff: true,
      name: st("opponentsField"),
      states: Object.fromEntries(range(1, 5).map(i => [i, {
        name: st("seconds", { count: (i - 1) * 3 }),
        fields: [{ node: all_dmg_ }, { text: trm("c4.lingerDuration"), value: 3, unit: "s" }]
      }]))
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}

export default new CharacterSheet(sheet, data, assets);
