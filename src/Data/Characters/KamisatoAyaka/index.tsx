import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KamisatoAyaka"
const elementKey: ElementKey = "cryo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

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
    cutDmg: skillParam_gen.burst[b++],
    bloomDmg: skillParam_gen.burst[b++],
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
const afterSprintInfusion = equalStr("afterSprint", condAfterSprint, elementKey)

const [condAfterSkillA1Path, condAfterSkillA1] = cond(key, "afterSkillA1")
const a1NormDmg_ = equal("afterSkill", condAfterSkillA1, percent(datamine.passive1.dmg_bonus))
const a1ChargedDmg_ = equal("afterSkill", condAfterSkillA1, percent(datamine.passive1.dmg_bonus), { key: "charged_dmg_" })

const [condAfterApplySprintPath, condAfterApplySprint] = cond(key, "afterApplySprint")
const afterApplySprintCryo = equal("afterApplySprint", condAfterApplySprint, percent(datamine.passive2.cryo))

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurst = greaterEq(input.constellation, 4,
  equal("c4", condAfterBurst, datamine.constellation4.def_red))

const [condC6Path, condC6] = cond(key, "C6")
const c6ChargedDmg_ = greaterEq(input.constellation, 6,
  equal("c6", condC6, datamine.constellation6.charged_bonus), { key: `charged_dmg_` })

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
    cutting: dmgNode("atk", datamine.burst.cutDmg, "burst"),
    bloom: dmgNode("atk", datamine.burst.bloomDmg, "burst"),
  },
  constellation2: {
    dmg: greaterEq(input.constellation, 2, customDmgNode(prod(
      subscript(input.total.burstIndex, datamine.burst.cutDmg, { key: "_" }),
      percent(datamine.constellation2.snowflake),
      input.total.atk,
    ), "burst", { hit: { ele: constant(elementKey) } })),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      enemyDefRed_: afterBurst
    }
  },
  infusion: {
    overridableSelf: afterSprintInfusion,
  },
  premod: {
    normal_dmg_: a1NormDmg_,
    charged_dmg_: sum(a1ChargedDmg_, c6ChargedDmg_),
    cryo_dmg_: afterApplySprintCryo,
  },
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
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
        textSuffix: i === 3 ? st("brHits", { count: 3 }) : ""
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
        textSuffix: st("brHits", { count: 3 })
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
        node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: tr("skill.skillParams.1"),
        value: datamine.skill.cd,
        unit: "s",
      }]
    }, ct.conditionalTemplate("passive1", {
      value: condAfterSkillA1,
      path: condAfterSkillA1Path,
      name: trm("afterSkill"),
      states: {
        afterSkill: {
          fields: [{
            node: a1NormDmg_,
          }, {
            node: a1ChargedDmg_,
          }, {
            text: sgt("duration"),
            value: datamine.passive1.duration,
            unit: "s",
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.cutting, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.bloom, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        text: sgt("duration"),
        value: datamine.burst.duration,
        unit: "s",
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("constellation4", {
      teamBuff: true,
      value: condAfterBurst,
      path: condAfterBurstPath,
      name: trm("dmgBySnowflake"),
      states: {
        c4: {
          fields: [{
            node: afterBurst
          }, {
            text: sgt("duration"),
            value: "6s"
          }]
        }
      }
    })]),

    sprint: ct.talentTemplate("sprint", [{
      fields: [{
        text: st("activationStam"),
        value: datamine.sprint.active_stam,
      }, {
        text: st("stamDrain"),
        value: datamine.sprint.drain_stam,
        unit: "/s",
      }]
    }, ct.conditionalTemplate("sprint", {
      value: condAfterSprint,
      path: condAfterSprintPath,
      name: trm("afterSprint"),
      states: {
        afterSprint: {
          fields: [{
            canShow: data => data.get(afterSprintInfusion).value === elementKey,
            text: <ColorText color="cryo">{st("infusion.cryo")}</ColorText>
          }, {
            text: sgt("duration"),
            value: datamine.sprint.duration,
            unit: "s",
          }]
        }
      }
    }), ct.conditionalTemplate("passive2", {
      value: condAfterApplySprint,
      path: condAfterApplySprintPath,
      name: trm("afterSprintCryo"),
      states: {
        afterApplySprint: {
          fields: [{
            text: trm("staminaRestore"),
            value: datamine.passive2.stamina,
          }, {
            node: afterApplySprintCryo
          }, {
            text: sgt("duration"),
            value: datamine.passive2.duration,
            unit: "s",
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [ct.fieldsTemplate("constellation2", {
      fields: [{
        node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${key}:snowflakeDMG` }),
      }]
    })]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
      value: condC6,
      path: condC6Path,
      name: trm("c6Active"),
      states: {
        c6: {
          fields: [{
            node: c6ChargedDmg_,
          }, {
            text: sgt("cd"),
            value: datamine.constellation6.cd,
            unit: "s"
          },]
        }
      }
    })])
  },
}

export default new CharacterSheet(sheet, data, assets)
