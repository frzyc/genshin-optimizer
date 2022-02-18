import { CharacterData } from 'pipeline'
import { input } from "../../../Formula/index"
import { constant, data, greaterEq, infoMut, match, min, percent, prod, subscript, sum } from "../../../Formula/utils"
import { CharacterKey, ElementKey, Rarity, WeaponTypeKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, damageTemplate, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import { data as datamine } from './data'
import data_gen_src from './data_gen.json'

const characterKey: CharacterKey = "Xingqiu"
const elementKey: ElementKey = "hydro"
const data_gen = data_gen_src as CharacterData
const char_Xingqiu_gen = `char_${characterKey}_gen`
const sheet_gen = "sheet_gen"
const [tr, trm] = trans("char", characterKey)

const const3TalentInc = greaterEq(input.constellation, 3, 3)
const const5TalentInc = greaterEq(input.constellation, 5, 3)
const hydro_dmg_ = greaterEq(input.asc, 4, datamine.passive2.hydro_dmg_)
const [condC2Path, condC2] = cond(characterKey, "c2")
const [condC4Path, condC4] = cond(characterKey, "c4")
const hydro_enemyRes_ = greaterEq(input.constellation, 2,
  match(condC2, "c2", datamine.constellation2.hydro_enemyRes_))
// NOTE: This does not show the same value as the old one?
const skill_dmg_ = greaterEq(input.constellation, 4,
  match(condC4, "c4", datamine.constellation4.skill_dmg_))
// TODO: Doesn't display well in the UI
const skillDuration = sum(datamine.skill.duration,
  greaterEq(input.constellation, 2, datamine.constellation2.skill_duration))

const dmgRed = sum(
  subscript(input.total.skillIndex, datamine.skill.dmgRed),
  min(0.24, prod(input.total.hydro_dmg_, 0.20))
)

const healing = greaterEq(input.asc, 1, prod(input.total.hp, 0.06))

export const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.hit1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.hit2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press1: dmgNode("atk", datamine.skill.hit1, "skill"),
    press2: dmgNode("atk", datamine.skill.hit2, "skill"),
    // TODO: dmg reduction based on sword count?
    dmgRed,
    healing
  },
  burst: {
    // TODO: burst dmg based on normal attacks?
    dmg: dmgNode("atk", datamine.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
  }
}

export const dataObj = dataObjForCharacterSheet(characterKey, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: const5TalentInc,
    burst: const3TalentInc,
  },
  teamBuff: {
    premod: {
      hydro_enemyRes_,
      dmgRed,
    }
  },
  premod: {
    hydro_dmg_: hydro_dmg_,
    skill_dmg_: skill_dmg_
  }
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
  gender: "M",
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
            fields: [
              damageTemplate(dmgFormulas.normal[0], char_Xingqiu_gen, "auto.skillParams.0"),
              damageTemplate(dmgFormulas.normal[1], char_Xingqiu_gen, "auto.skillParams.1"),
              damageTemplate(dmgFormulas.normal[2], char_Xingqiu_gen, "auto.skillParams.2", {comboMultiplier: 2}),
              damageTemplate(dmgFormulas.normal[4], char_Xingqiu_gen, "auto.skillParams.3"),
              damageTemplate(dmgFormulas.normal[5], char_Xingqiu_gen, "auto.skillParams.4", {comboMultiplier: 2}),
            ]
          },
          {
            text: tr(`auto.fields.charged`),
            fields: [
              damageTemplate(dmgFormulas.charged.dmg1, char_Xingqiu_gen, "auto.skillParams.5", {comboHit: 1}),
              damageTemplate(dmgFormulas.charged.dmg2, char_Xingqiu_gen, "auto.skillParams.5", {comboHit: 2}),          
              {
              text: tr("auto.skillParams.6"),
              value: datamine.charged.stam,
            }]
          }, {
            text: tr(`auto.fields.plunging`),
            fields: [
              damageTemplate(dmgFormulas.plunging.dmg, sheet_gen, "plunging.dmg" ),
              damageTemplate(dmgFormulas.plunging.low, sheet_gen, "plunging.low" ),
              damageTemplate(dmgFormulas.plunging.high, sheet_gen, "sheet_gen:plunging.high"),
            ]
          },
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [
            damageTemplate(dmgFormulas.skill.press1, char_Xingqiu_gen, "skill.skillParams.0", {comboHit: 1}),
            damageTemplate(dmgFormulas.skill.press2, char_Xingqiu_gen, "skill.skillParams.1", {comboHit: 2}),
            {
            // NOTE: We need variant keys for healing and unstyled colors
            node: infoMut(dmgFormulas.skill.dmgRed, { key: `char_${characterKey}_gen:skill.skillParams.1`, variant: "physical" }),
          }, {
            canShow: uiData => uiData.get(input.asc).value >= 1,
            node: infoMut(dmgFormulas.skill.healing, { key: `sheet_gen:healing`, variant: "success" }),
          }, {
            node: infoMut(skillDuration, { key: `char_${characterKey}_gen:skill.skillParams.2` }),
          }, {
            text: tr("skill.skillParams.3"),
            value: datamine.skill.cd,
            unit: "s"
          }]
        }]
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [
            damageTemplate(dmgFormulas.burst.dmg, char_Xingqiu_gen, "burst.skillParams.0"),
{
            text: tr("burst.skillParams.1"),
            value: datamine.burst.duration,
            unit: "s"
          }, {
            text: tr("burst.skillParams.2"),
            value: datamine.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.3"),
            value: datamine.burst.cost,
          }],
        }]
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2, [{
        node: hydro_dmg_
      }]),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          conditional: {
            canShow: greaterEq(input.constellation, 2, 1),
            value: condC2,
            path: condC2Path,
            teamBuff: true,
            name: "Opponent hit by sword rain",
            header: conditionalHeader("constellation2", tr, c2),
            description: tr("constellation2.description"),
            states: {
              c2: {
                fields: [
                  {
                    node: hydro_enemyRes_
                  }
                ]
              }
            }
          },
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: const3TalentInc }]),
      constellation4:  {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: {
            canShow: greaterEq(input.constellation, 4, 1),
            value: condC4,
            path: condC4Path,
            name: "Elemental Skill DMG Increase",
            header: conditionalHeader("constellation4", tr, c4),
            description: tr("constellation4.description"),
            states: {
              c4: {
                fields: [
                  {
                    node: skill_dmg_
                  }
                ]
              }
            }
          },
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: const5TalentInc }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, dataObj);
