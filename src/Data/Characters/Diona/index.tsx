import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent, shieldElement, shieldNodeTalent } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Diona"
const elementKey: ElementKey = "cryo"
const [tr, trm] = trans("char", key)

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
    icyPawDmg: skillParam_gen.skill[s++],
    shieldHp_: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    cdPress: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    fieldDmg: skillParam_gen.burst[b++],
    healHp_: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    moveSpeed_: skillParam_gen.passive1[p1++][0], //+10% move speed
    stamRed_: skillParam_gen.passive1[p1++][0], //Stamina consumption reduced by 10%
  },
  passive2: {
    atkRed_: skillParam_gen.passive1[p2++][0], //Opponents inside burst -10% attack
    duration: skillParam_gen.passive1[p2++][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    icyPawDmg_: skillParam_gen.constellation2[0], //Icy Paws +15% dmg
    icyPawShield_: skillParam_gen.constellation2[1], //Icy paws +15% shield
    coopShield_: skillParam_gen.constellation2[2], //Coop shield 50% of total shield
    coopShieldDuration_: skillParam_gen.constellation2[3], //Coop shield lasts for 5s
  },
  constellation6: {
    healingBonus_: skillParam_gen.constellation6[0],
    emBonus: skillParam_gen.constellation6[1],
  },
} as const

const [condC6BelowPath, condC6Below] = cond(key, "Constellation6Low")
const [condC6AbovePath, condC6Above] = cond(key, "Constellation6High")
const [condA1Path, condA1] = cond(key, "Ascension1")

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const nodeC2skillDmg_ = greaterEq(input.constellation, 2, percent(datamine.constellation2.icyPawDmg_))

const holdSkillShieldStr_ = { "customBonus": { "shield_": percent(0.75) } }
//C2 Shield bonus modifies everything at the very end, it's not a shield strength bonus
//100% if not C2, 175% if C2 or higher
const nodeC2shieldStr_ = sum(percent(1), greaterEq(input.constellation, 2, percent(datamine.constellation2.icyPawShield_)))
const nodeSkillShieldPress = prod(nodeC2shieldStr_, shieldNodeTalent("hp", datamine.skill.shieldHp_, datamine.skill.shieldFlat, "skill",))
const nodeSkillShieldHold = prod(nodeC2shieldStr_, shieldNodeTalent("hp", datamine.skill.shieldHp_, datamine.skill.shieldFlat, "skill", holdSkillShieldStr_))

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
    pressCryoShield: shieldElement(elementKey, nodeSkillShieldPress),
    pressShield: nodeSkillShieldPress,
    holdCryoShield: shieldElement(elementKey, nodeSkillShieldHold),
    holdShield: nodeSkillShieldHold,
    skillDmg: dmgNode("atk", datamine.skill.icyPawDmg, "skill", {}),
  },
  burst: {
    skillDmg: dmgNode("atk", datamine.burst.skillDmg, "burst"),
    fieldDmg: dmgNode("atk", datamine.burst.fieldDmg, "burst"),
    healDot: healNodeTalent("hp", datamine.burst.healHp_, datamine.burst.healBase, "burst"),
  },
}

const nodeA1MoveSpeed = equal(condA1, "on", percent(datamine.passive1.moveSpeed_),)
const nodeA1Stamina = equal(condA1, "on", percent(datamine.passive1.stamRed_),)

const nodeC6healing_Disp = equal(condC6Below, "on", percent(datamine.constellation6.healingBonus_),)
const nodeC6healing_ = equal(input.activeCharKey, target.charKey, nodeC6healing_Disp)
const nodeC6emDisp = equal(condC6Above, "on", datamine.constellation6.emBonus,)
const nodeC6em = equal(input.activeCharKey, target.charKey, nodeC6emDisp)

export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  }, premod: {
    skill_dmg_: nodeC2skillDmg_,
  }, teamBuff: {
    premod: {
      staminaDec_: nodeA1Stamina,
      moveSPD_: nodeA1MoveSpeed,
      eleMas: nodeC6em,
      heal_: nodeC6healing_,
    }
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
              node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.5` }),
            }, {
              node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.6` }),
            },
            ]
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
        ]
      },
      skill: talentTemplate("skill", tr, skill, [
        //Shield DMG Absorption
        { node: infoMut(dmgFormulas.skill.pressCryoShield, { key: `char_${key}:pressShield` }), },
        { node: infoMut(dmgFormulas.skill.pressShield, { key: `char_${key}:pressShield` }), },
        { node: infoMut(dmgFormulas.skill.holdCryoShield, { key: `char_${key}:holdShield` }), },
        { node: infoMut(dmgFormulas.skill.holdShield, { key: `char_${key}:holdShield` }), },
        //Icy Paw DMG
        { node: infoMut(dmgFormulas.skill.skillDmg, { key: `char_${key}_gen:skill.skillParams.0` }), },
        {
          text: trm("skillDuration"),
          value: data => datamine.skill.duration[data.get(input.total.skillIndex).value],
          unit: "s",
          fixed: 1,
        },
        //Press CD
        {
          text: tr(`skill.skillParams.3`),
          value: datamine.skill.cdPress,
          unit: "s"
        },
        //Holding CD
        {
          text: tr(`skill.skillParams.4`),
          value: datamine.skill.cdHold,
          unit: "s",
        },
      ],
        //Cat's Tail Secret Menu (A1)
        {
          teamBuff: true,
          value: condA1,
          path: condA1Path,
          name: trm(`a1shielded`),
          canShow: greaterEq(input.asc, 1, 1),
          header: conditionalHeader("passive1", tr, passive1), description: tr(`passive1.description`),
          states: {
            on: {
              fields: [{
                node: nodeA1MoveSpeed,
              }, {
                node: nodeA1Stamina,
              }]
            }
          }
        }
      ),
      burst: talentTemplate("burst", tr, burst, [
        { node: infoMut(dmgFormulas.burst.skillDmg, { key: `char_${key}_gen:burst.skillParams.0` }), },
        { node: infoMut(dmgFormulas.burst.fieldDmg, { key: `char_${key}_gen:burst.skillParams.1` }), },
        { node: infoMut(dmgFormulas.burst.healDot, { key: `char_${key}_gen:burst.skillParams.2`, variant: "success" }), },
        {
          text: tr("burst.skillParams.3"),
          value: datamine.burst.duration,
          unit: "s"
        }, {
          text: tr("burst.skillParams.4"),
          value: datamine.burst.cd,
        }, {
          text: tr("burst.skillParams.5"),
          value: datamine.burst.enerCost,
        }
      ], {
        teamBuff: true,
        value: condC6Below,
        path: condC6BelowPath,
        name: trm(`c6below`),
        canShow: greaterEq(input.constellation, 6, 1),
        header: conditionalHeader("constellation6", tr, c6), description: tr(`constellation6.description`),
        states: {
          on: {
            fields: [{
              node: infoMut(nodeC6healing_Disp, { key: "heal_" }),
            }]
          }
        }
      }, [{
        conditional: {
          teamBuff: true,
          value: condC6Above,
          path: condC6AbovePath,
          name: trm(`c6above`),
          canShow: greaterEq(input.constellation, 6, 1),
          header: conditionalHeader("constellation6", tr, c6), description: tr(`constellation6.description`),
          states: {
            on: {
              fields: [{
                node: infoMut(nodeC6emDisp, { key: "eleMas" }),
              }]
            }
          }
        }
      }]),
      passive1: talentTemplate("passive1", tr, passive1, []),
      passive2: talentTemplate("passive2", tr, passive2, []),
      passive3: talentTemplate("passive3", tr, passive3, []),
      constellation1: talentTemplate("constellation1", tr, c1, []),
      constellation2: talentTemplate("constellation2", tr, c2, [{ node: nodeC2skillDmg_ }]),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, []),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    }
  }
}

export default new CharacterSheet(sheet, data);
