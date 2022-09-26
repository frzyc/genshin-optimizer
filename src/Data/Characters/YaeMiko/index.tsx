import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, lessThan, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "YaeMiko"
const elementKey: ElementKey = "electro"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
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
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    dmg3: skillParam_gen.skill[s++],
    dmg4: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    tenkoDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    eleMas_dmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation4: {
    ele_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    defIgn_: skillParam_gen.constellation6[0],
  }

} as const

const nodeAsc4 = greaterEq(input.asc, 4, prod(input.total.eleMas, percent(datamine.passive2.eleMas_dmg_, { fixed: 2 })))

const [condC4Path, condC4] = cond(key, "c4")
const nodeC4 = greaterEq(input.constellation, 4, equal("hit", condC4, datamine.constellation4.ele_dmg_))

const nodeC6 = greaterEq(input.constellation, 6, datamine.constellation6.defIgn_)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg1: lessThan(input.constellation, 2, dmgNode("atk", datamine.skill.dmg1, "skill")),
    dmg2: dmgNode("atk", datamine.skill.dmg2, "skill", { enemy: { defIgn: nodeC6 } }),
    dmg3: dmgNode("atk", datamine.skill.dmg3, "skill", { enemy: { defIgn: nodeC6 } }),
    dmg4: greaterEq(input.constellation, 2, dmgNode("atk", datamine.skill.dmg4, "skill", { enemy: { defIgn: nodeC6 } })),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    tenkoDmg: dmgNode("atk", datamine.burst.tenkoDmg, "burst"),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5
  },
  total: {
    skill_dmg_: nodeAsc4,
  },
  teamBuff: {
    premod: {
      electro_dmg_: nodeC4
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
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.3` }),
        }, {
          text: tr("auto.skillParams.4"),
          value: datamine.charged.stamina,
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
          node: infoMut(dmgFormulas.skill.dmg1, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.skill.dmg2, { key: `char_${key}_gen:skill.skillParams.1` }),
        }, {
          node: infoMut(dmgFormulas.skill.dmg3, { key: `char_${key}_gen:skill.skillParams.2` }),
        }, {
          node: infoMut(dmgFormulas.skill.dmg4, { key: `char_${key}_gen:skill.skillParams.3` }),
        }, {
          text: tr("skill.skillParams.4"),
          value: datamine.skill.duration,
          unit: "s"
        }, {
          text: tr("skill.skillParams.5"),
          value: datamine.skill.cd,
        }],
      }]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.burst.tenkoDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
        }, {
          text: tr("burst.skillParams.2"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: tr("burst.skillParams.3"),
          value: datamine.burst.enerCost,
        }]
      }]),
      passive1: ct.talentTemplate("passive1"),
      passive2: ct.talentTemplate("passive2", [{ fields: [{ node: nodeAsc4 }] }]),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTemplate("constellation4", [ct.conditionalTemplate("constellation4", {
        value: condC4,
        path: condC4Path,
        teamBuff: true,
        name: trm("c4"),
        states: {
          hit: {
            fields: [{
              node: nodeC4,
            }]
          }
        }
      })]),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    }
  }
export default new CharacterSheet(sheet, data, assets)
