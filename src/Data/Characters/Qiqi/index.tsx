import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, prod, min, constant } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNode, healNodeTalent } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Qiqi"
const elementKey: ElementKey = "cryo"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
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
const nodeA1HealingBonus = equal(condA1, "on", greaterEq(input.asc, 1, constant(0.2)))
const nodeC2ChargedDmgInc = equal(condC2, "on", greaterEq(input.constellation, 2, constant(0.15)))
const nodeC2NormalDmgInc = equal(condC2, "on", greaterEq(input.constellation, 2, constant(0.15)))

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
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) =>
            ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
              textSuffix: st("brHits", { count: 2 })
            }, {
              text: tr("auto.skillParams.6"),
              value: datamine.charged.stamina,
            }]
          }, {
            text: tr("auto.fields.plunging"),
            fields: [{
              node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
            }, {
              node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
            }, {
              node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
            }]
          }
        ],
      },
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.castDmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.skill.hitRegen, { key: `char_${key}_gen:skill.skillParams.1`, variant: "success" })
      }, {
        node: infoMut(dmgFormulas.skill.contRegen, { key: `char_${key}_gen:skill.skillParams.2`, variant: "success" })
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
      }]),
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
          },
          {
            node: infoMut(dmgFormulas.burst.heal, { key: `char_${key}_gen:burst.skillParams.1`, variant: "success" }),
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
        }]
      },
      passive1: talentTemplate("passive1", tr, passive1, undefined, {
        name: trm("a1C"),
        value: condA1,
        path: condA1Path,
        header: conditionalHeader("passive1", tr, passive1),
        canShow: greaterEq(input.asc, 1, 1),
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
      }),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        value: condC2,
        path: condC2Path,
        name: trm("c2C"),
        header: conditionalHeader("constellation2", tr, c2),
        canShow: greaterEq(input.constellation, 2, 1),
        states: {
          on: {
            fields: [{
              node: nodeC2NormalDmgInc
            }, {
              node: nodeC2ChargedDmgInc
            }]
          }
        }
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
