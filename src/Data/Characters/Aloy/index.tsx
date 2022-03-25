import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, naught, percent, subscript, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Aloy"
const elementKey: ElementKey = "cryo"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1.1
      skillParam_gen.auto[a++], // 1.2
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
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
    freezeBombDmg: skillParam_gen.skill[s++],
    chillWaterBomblets: skillParam_gen.skill[s++],
    atkDecrease: skillParam_gen.skill[s++],
    atkDecreaseDuration: skillParam_gen.skill[s++][0],
    coilNormalDmgBonus1: skillParam_gen.skill[s++],
    coilNormalDmgBonus2: skillParam_gen.skill[s++],
    coilNormalDmgBonus3: skillParam_gen.skill[s++],
    rushingNormalDmgBonus: skillParam_gen.skill[s++],
    rushingDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atkInc: 0.16,
    teamAtkInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    cryoDmgBonus: skillParam_gen.passive2[p2++][0]
  }
} as const

const [condCoilPath, condCoil] = cond(key, "coil")
const normal_dmg_ = lookup(condCoil, {
  "coil1": subscript(input.total.skillIndex, datamine.skill.coilNormalDmgBonus1, { key: "_" }),
  "coil2": subscript(input.total.skillIndex, datamine.skill.coilNormalDmgBonus2, { key: "_" }),
  "coil3": subscript(input.total.skillIndex, datamine.skill.coilNormalDmgBonus3, { key: "_" }),
  "rush": subscript(input.total.skillIndex, datamine.skill.rushingNormalDmgBonus, { key: "_" })
}, naught)
const atk_ = unequal(condCoil, undefined, percent(datamine.passive1.atkInc))
const afterRushingIce = equalStr("rush", condCoil, elementKey)

const [condA1Path, condA1] = cond(key, "A1")
const teamAtk_ = greaterEq(input.asc, 1, equal(condA1, "on",
  unequal(input.activeCharKey, key, percent(datamine.passive1.teamAtkInc))))

const [condA4Path, condA4] = cond(key, "A4")
const cryo_dmg_ = greaterEq(input.asc, 4,
  lookup(condA4, Object.fromEntries(range(1, 10).map(i => [i, percent(datamine.passive2.cryoDmgBonus * i)])), naught))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('cryo') } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    freezeBombDmg: dmgNode("atk", datamine.skill.freezeBombDmg, "skill"),
    chillWaterBomblets: dmgNode("atk", datamine.skill.chillWaterBomblets, "skill"),
    atkDecrease: subscript(input.total.skillIndex, datamine.skill.atkDecrease, { key: "_" })
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
}

export const data = dataObjForCharacterSheet(key, elementKey, undefined, data_gen, dmgFormulas, {
  premod: {
    normal_dmg_,
    atk_,
    cryo_dmg_
  },
  teamBuff: {
    premod: {
      atk_: teamAtk_
    }
  },
  infusion: afterRushingIce,
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: talentTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), undefined, undefined, [{
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey),
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i === 0 ? 0 : -1)}` }),
            textSuffix: i === 0 ? "(1)" : i === 1 ? "(2)" : ""
          }))
        ),
        text: tr("auto.fields.normal")
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
          node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.4` }),
        }, {
          node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.5` }),
        }]),
        text: tr("auto.fields.charged"),
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }]),
        text: tr("auto.fields.plunging"),
      }]),
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.freezeBombDmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.chillWaterBomblets, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        text: tr("skill.skillParams.2"),
        value: (data) => (datamine.skill.atkDecrease[data.get(input.total.skillIndex).value] * 100).toFixed(1),
        unit: "%"
      }, {
        text: tr("skill.skillParams.3"),
        value: `${datamine.skill.atkDecreaseDuration}`,
        unit: "s"
      }, {
        text: tr("skill.skillParams.7"),
        value: `${datamine.skill.cd}`,
        unit: "s"
      }], {
        value: condCoil,
        path: condCoilPath,
        name: trm("skill.coil"),
        states: {
          "coil1": {
            name: trm("skill.coil1"),
            fields: [{
              node: normal_dmg_
            }]
          },
          "coil2": {
            name: trm("skill.coil2"),
            fields: [{
              node: normal_dmg_
            }]
          },
          "coil3": {
            name: trm("skill.coil3"),
            fields: [{
              node: normal_dmg_
            }]
          },
          "rush": {
            name: trm("skill.rush"),
            fields: [{
              node: normal_dmg_
            }, {
              text: <ColorText color="cryo">{st("infusion.cryo")}</ColorText>
            }, {
              text: tr("skill.skillParams.6"),
              value: datamine.skill.rushingDuration,
              unit: "s"
            }]
          },
        }
      }),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.1"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.2"),
        value: datamine.burst.enerCost,
      }]),
      passive1: talentTemplate("passive1", tr, passive1, [{
        node: atk_
      }, {
        canShow: (data) => data.get(condCoil).value !== undefined,
        text: sgt("duration"),
        value: datamine.passive1.duration,
        unit: "s"
      }], {
        value: condA1,
        path: condA1Path,
        canShow: greaterEq(input.asc, 1, unequal(input.activeCharKey, key, 1)),
        teamBuff: true,
        name: trm("a1CondName"),
        states: {
          "on": {
            fields: [{
              node: infoMut(teamAtk_, { key: "atk_" })
            }, {
              text: sgt("duration"),
              value: datamine.passive1.duration,
              unit: "s"
            }]
          }
        }
      }),
      passive2: talentTemplate("passive2", tr, passive2, undefined, {
        value: condA4,
        path: condA4Path,
        canShow: greaterEq(input.asc, 4, equal("rush", condCoil, 1)),
        name: trm("skill.rushState"),
        states: Object.fromEntries(range(1, 10).map(i => [i, {
          name: st("stack", { count: i }),
          fields: [{ node: cryo_dmg_ }]
        }]))
      }),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
