import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Qiqi"
const elementKey: ElementKey = "cryo"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
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
    hitRegenPercent: skillParam_gen.skill[s++],
    hitRegenFlat: skillParam_gen.skill[s++],
    contRegenPercent: skillParam_gen.skill[s++],
    contRegenFlat: skillParam_gen.skill[s++],
    tickDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    castDmg: skillParam_gen.skill[s++],
  },
  burst: {
    healPercent: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  }
} as const

const [condA1Path, condA1] = cond(key, "QiqiA1")
const [condC2Path, condC2] = cond(key, "QiqiC2")

// Values here doesn't exist in skillParam_gen
const nodeA1HealingBonus = equal(condA1, "on", greaterEq(input.asc, 1, 0.2))
const nodeC2ChargedDmgInc = equal(condC2, "on", greaterEq(input.constellation, 2, 0.15))
const nodeC2NormalDmgInc = equal(condC2, "on", greaterEq(input.constellation, 2, 0.15))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    castDmg: dmgNode("atk", datamine.skill.castDmg, "skill"),
    tickDmg: dmgNode("atk", datamine.skill.tickDmg, "skill"),
    hitRegen: healNodeTalent("atk", datamine.skill.hitRegenPercent, datamine.skill.hitRegenFlat, "skill"),
    contRegen: healNodeTalent("atk", datamine.skill.contRegenPercent, datamine.skill.contRegenFlat, "skill")
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    heal: healNodeTalent("atk", datamine.burst.healPercent, datamine.burst.healFlat, "burst")
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    burst: nodeC3,
    skill: nodeC5,
  },
  premod: {
    normal_dmg_: nodeC2NormalDmgInc,
    charged_dmg_: nodeC2ChargedDmgInc,
    incHeal_: nodeA1HealingBonus
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
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          textSuffix: (i === 2 || i === 3) ? st("brHits", { count: 2 }) : undefined
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
          textSuffix: st("brHits", { count: 2 })
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
          node: infoMut(dmgFormulas.skill.castDmg, { key: `char_${key}_gen:skill.skillParams.0` })
        }, {
          node: infoMut(dmgFormulas.skill.hitRegen, { key: `char_${key}_gen:skill.skillParams.1` })
        }, {
          node: infoMut(dmgFormulas.skill.contRegen, { key: `char_${key}_gen:skill.skillParams.2` })
        }, {
          node: infoMut(dmgFormulas.skill.tickDmg, { key: `char_${key}_gen:skill.skillParams.3` })
        }, {
          text: tr("skill.skillParams.4"),
          value: datamine.skill.duration,
          unit: 's'
        }, {
          text: tr("skill.skillParams.5"),
          value: datamine.skill.cd,
          unit: 's'
        }]
      }]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        },
        {
          node: infoMut(dmgFormulas.burst.heal, { key: `char_${key}_gen:burst.skillParams.1` }),
        }, {
          text: tr("burst.skillParams.2"),
          value: datamine.skill.duration,
          unit: 's'
        }, {
          text: tr("burst.skillParams.3"),
          value: datamine.skill.cd,
          unit: 's'
        }, {
          text: tr("burst.skillParams.4"),
          value: datamine.burst.cost,
        }]
      }]),

      passive1: ct.talentTemplate("passive1", [ct.conditionalTemplate("passive1", {
        name: trm("a1C"),
        value: condA1,
        path: condA1Path,
        states: {
          on: {
            fields: [{
              node: nodeA1HealingBonus
            }, {
              text: sgt("duration"),
              value: 8,
              unit: 's'
            }]
          }
        }
      })]),
      passive2: ct.talentTemplate("passive2"),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
        value: condC2,
        path: condC2Path,
        name: trm("c2C"),
        states: {
          on: {
            fields: [{
              node: nodeC2NormalDmgInc
            }, {
              node: nodeC2ChargedDmgInc
            }]
          }
        }
      })]),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data, assets)
