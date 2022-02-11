import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { Translate } from '../../../Components/Translate'
import { input } from '../../../Formula'
import { constant, infoMut, match, matchFull, percent, sum, threshold_add } from '../../../Formula/utils'
import { CharacterKey, WeaponTypeKey } from '../../../Types/consts'
import { cond, sgt, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, singleDmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide, sprint } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KamisatoAyaka"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, sp = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x3
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1x3
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    dot: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  sprint: {
    active_stam: skillParam_gen.sprint[sp++][0],
    drain_stam: skillParam_gen.sprint[sp++][0],
    duration: skillParam_gen.sprint[sp++][0],
  },
  passive1: {
    dmg_bonus: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    stamina: skillParam_gen.passive2[p2++][0],
    cryo: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    snowflake: skillParam_gen.constellation2[0],
  },
  constellation4: {
    def_red: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[0],
    charged_bonus: skillParam_gen.constellation6[1],
  }
} as const

const [condAfterSprintPath, condAfterSprint] = cond(key, "afterSprint")
const afterSprintInfusion = matchFull("afterSprint", condAfterSprint, "cryo", undefined)

const [condAfterSkillA1Path, condAfterSkillA1] = cond(key, "afterSkillA1")
const a1NormDmg_ = match("afterSkill", condAfterSkillA1, percent(datamine.passive1.dmg_bonus))
const a1ChargedDmg_ = match("afterSkill", condAfterSkillA1, percent(datamine.passive1.dmg_bonus))

const [condAfterApplySprintPath, condAfterApplySprint] = cond(key, "afterApplySprint")
const afterApplySprintCryo = match("afterApplySprint", condAfterApplySprint, percent(datamine.passive2.cryo))

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
// TODO figure out how to do enemy defense reduction
const afterBurst = threshold_add(input.constellation, 4, 
  match("afterBurst", condAfterBurst, datamine.constellation4.def_red), { key: `enemyDefRed_` })

const [condC6Path, condC6] = cond(key, "C6")
const c6ChargedDmg_ = threshold_add(input.constellation, 6, 
  match("c6", condC6, datamine.constellation6.charged_bonus), { key: `charged_dmg_`})

const chargedDmg = sum(a1ChargedDmg_, c6ChargedDmg_)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
  },
  burst: {
    cutting: dmgNode("atk", datamine.burst.dmg, "burst"),
    bloom: dmgNode("atk", datamine.burst.dot, "burst"),
  },
  constellation2: {
    dmg: singleDmgNode("atk", datamine.constellation2.snowflake, "burst", { hit: { ele: constant("cryo") }})
  }
}

export const adata = dataObjForCharacterSheet(key, "cryo", "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: threshold_add(input.constellation, 3, 3),
    burst: threshold_add(input.constellation, 5, 3),
  },
  teamBuff: {
    //TODO C4
  },
  infusion: afterSprintInfusion,
  premod: {
    normal_dmg_: a1NormDmg_,
    charged_dmg_: chargedDmg,
    cryo_dmg_: afterApplySprintCryo,
  },
  total: {
  }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "cryo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
        sections: [{
          text: tr("auto.fields.normal"),
          fields: datamine.normal.hitArr.map((percentArr, i) =>
          ({
            node: infoMut(dmgFormulas.normal[i], {key: `char_${key}_gen:auto.skillParams.${i + (i < 3 ? 0 : -1)}` }),
            textSuffix: i === 3 ? <span>(<Translate ns="sheet" key18="hits" values={{ count: 3 }} />)</span> : ""
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
            textSuffix: <span>(<Translate ns="sheet" key18="hits" values={{ count: 3 }} />)</span>
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
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
          }, {
            text: tr("skill.skillParams.1"),
            value: datamine.skill.cd,
          }],
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.cutting"),
            node: infoMut(dmgFormulas.burst.cutting, { key: `char_${key}_gen:burst.skillParams.0` }),
          }, {
            text: tr("burst.bloom"),
            node: infoMut(dmgFormulas.burst.bloom, { key: `char_${key}_gen:burst.skillParams.1` }),
          }, {
            text: sgt("duration"),
            value: datamine.burst.duration,
          }, {
            text: sgt("cd"),
            value: datamine.burst.cd,
          }, {
            text: sgt("energyCost"),
            value: datamine.burst.enerCost,
          }]
        }]
      },
      sprint: {
        name: tr("sprint.name"),
        img: sprint,
        sections: [{
          text: tr("sprint.description"),
          fields: [{
            text: "Activation Stamina Consumption",
            value: datamine.sprint.active_stam,
          }, {
            text: "Stamina Drain",
            value: datamine.sprint.drain_stam,
            unit: "/s",
          }],
          conditional: { //sprint
            value: condAfterSprint,
            path: condAfterSprintPath,
            name: trm("afterSprint"),
            states: {
              afterSprint: {
                fields: [
                  // { // TODO (copied from Kazuha):
                  //   node: afterSprintInfusion
                  // },
                  {
                    canShow: data => data.get(afterSprintInfusion).value === "cryo",
                    text: <ColorText color="cryo">Cryo Infusion</ColorText>
                  },
                  {
                    text: sgt("duration"),
                    value: datamine.sprint.duration,
                    unit: "s",
                  }]
              }
            }
          },
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: {//After using Kamisato Art: Hyouka
            canShow: threshold_add(input.asc, 1, 1),
            value: condAfterSkillA1,
            path: condAfterSkillA1Path,
            name: trm("afterSkill"),
            states: {
              afterSkill: {
                fields: [
                  {
                    node: a1NormDmg_
                  },
                  {
                    node: a1ChargedDmg_
                  },
                  {
                    text: sgt("duration"),
                    value: datamine.passive1.duration,
                    unit: "s",
                  }
                ]
              }
            }
          },
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: { //sprint
            canShow: threshold_add(input.asc, 4, 1),
            value: condAfterApplySprint,
            path: condAfterApplySprintPath,
            name: trm("afterSprintCryo"),
            states: {
              afterApplySprint: {
                fields: [
                  {
                    text: trm("staminaRestore"), // TODO: should update this label to say "Stamina Restored"
                    value: datamine.passive2.stamina,
                  },
                  {
                    node: afterApplySprintCryo
                  },
                  {
                    text: sgt("duration"),
                    value: datamine.passive2.duration,
                    unit: "s",
                  }
                ]
              }
            }
          },
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          fields: [{
            canShow: data => data.get(input.constellation).value >= 2,
            text: trm("snowflakeDMG"),
            value: datamine.constellation2.snowflake,
            // TODO: Grab the correct label for this, not sure how to get the constellation damage label
            node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
          },]
        }]
      },
      constellation3: talentTemplate("constellation3", tr, c3),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: {
            canShow: threshold_add(input.constellation, 4, 1),
            value: condAfterBurst,
            path: condAfterBurstPath,
            name: trm("afterBurst"),
            states: {
              c4: {
                fields: [
                  {
                    node: afterBurst
                  },
                  {
                  text: sgt("duration"),
                  value: "6s"
                }]
              }
            }
          },
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: {
            canShow: threshold_add(input.constellation, 6, 1),
            value: condC6,
            path: condC6Path,
            name: trm("afterSkill"),
            states: {
              c6: {
                fields: [
                  {
                    text: sgt("cd"),
                    value: datamine.constellation6.cd,
                    unit: "s"
                  },
                  {
                    node: c6ChargedDmg_,
                  },
                ]
              }
            }
          }
        }],
      },
    },
  },
};
export default new CharacterSheet(sheet, adata);
