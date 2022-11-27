import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KamisatoAyaka"
const elementKey: ElementKey = "cryo"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, sp = 0, p1 = 0, p2 = 0
const dm = {
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
const a1NormDmg_ = greaterEq(input.asc, 1, equal("afterSkill", condAfterSkillA1, percent(dm.passive1.dmg_bonus)))
const a1ChargedDmg_ = greaterEq(input.asc, 1, equal("afterSkill", condAfterSkillA1, percent(dm.passive1.dmg_bonus), KeyMap.info("charged_dmg_")))

const [condAfterApplySprintPath, condAfterApplySprint] = cond(key, "afterApplySprint")
const afterApplySprintCryo = greaterEq(input.asc, 4, equal("afterApplySprint", condAfterApplySprint, percent(dm.passive2.cryo)))

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurst = greaterEq(input.constellation, 4,
  equal("c4", condAfterBurst, dm.constellation4.def_red))

const [condC6Path, condC6] = cond(key, "C6")
const c6ChargedDmg_ = greaterEq(input.constellation, 6,
  equal("c6", condC6, dm.constellation6.charged_bonus), KeyMap.info("charged_dmg_"))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", dm.charged.dmg1, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", dm.skill.press, "skill"),
  },
  burst: {
    cutting: dmgNode("atk", dm.burst.cutDmg, "burst"),
    bloom: dmgNode("atk", dm.burst.bloomDmg, "burst"),
  },
  constellation2: {
    dmg: greaterEq(input.constellation, 2, customDmgNode(prod(
      subscript(input.total.burstIndex, dm.burst.cutDmg, { unit: "%" }),
      percent(dm.constellation2.snowflake),
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
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`), multi: i === 3 ? 3 : undefined, }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, {
          name: ct.chg(`auto.skillParams.5`),
          multi: 3,
        }),

      }, {
        text: ct.chg("auto.skillParams.6"),
        value: dm.charged.stamina,
      }]
    }, {
      text: ct.chg("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }]
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.press, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        text: ct.chg("skill.skillParams.1"),
        value: dm.skill.cd,
        unit: "s",
      }]
    }, ct.condTem("passive1", {
      value: condAfterSkillA1,
      path: condAfterSkillA1Path,
      name: ct.ch("afterSkill"),
      states: {
        afterSkill: {
          fields: [{
            node: a1NormDmg_,
          }, {
            node: a1ChargedDmg_,
          }, {
            text: stg("duration"),
            value: dm.passive1.duration,
            unit: "s",
          }]
        }
      }
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.cutting, { name: ct.chg(`burst.skillParams.0`), multi: 19 }),
      }, {
        node: infoMut(dmgFormulas.burst.bloom, { name: ct.chg(`burst.skillParams.1`) }),
      }, {
        text: stg("duration"),
        value: dm.burst.duration,
        unit: "s",
      }, {
        text: stg("cd"),
        value: dm.burst.cd,
        unit: "s",
      }, {
        text: stg("energyCost"),
        value: dm.burst.enerCost,
      }]
    }, ct.condTem("constellation4", {
      teamBuff: true,
      value: condAfterBurst,
      path: condAfterBurstPath,
      name: ct.ch("dmgBySnowflake"),
      states: {
        c4: {
          fields: [{
            node: afterBurst
          }, {
            text: stg("duration"),
            value: "6s"
          }]
        }
      }
    })]),

    sprint: ct.talentTem("sprint", [{
      fields: [{
        text: st("activationStam"),
        value: dm.sprint.active_stam,
      }, {
        text: st("stamDrain"),
        value: dm.sprint.drain_stam,
        unit: "/s",
      }]
    }, ct.condTem("sprint", {
      value: condAfterSprint,
      path: condAfterSprintPath,
      name: ct.ch("afterSprint"),
      states: {
        afterSprint: {
          fields: [{
            canShow: data => data.get(afterSprintInfusion).value === elementKey,
            text: <ColorText color="cryo">{st("infusion.cryo")}</ColorText>
          }, {
            text: stg("duration"),
            value: dm.sprint.duration,
            unit: "s",
          }]
        }
      }
    }), ct.condTem("passive2", {
      value: condAfterApplySprint,
      path: condAfterApplySprintPath,
      name: ct.ch("afterSprintCryo"),
      states: {
        afterApplySprint: {
          fields: [{
            text: ct.ch("staminaRestore"),
            value: dm.passive2.stamina,
          }, {
            node: afterApplySprintCryo
          }, {
            text: stg("duration"),
            value: dm.passive2.duration,
            unit: "s",
          }]
        }
      }
    })]),

    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2", [ct.fieldsTem("constellation2", {
      fields: [{
        node: infoMut(dmgFormulas.constellation2.dmg, { name: ct.ch("snowflakeDMG"), multi: 19 }),
      }]
    })]),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6", [ct.condTem("constellation6", {
      value: condC6,
      path: condC6Path,
      name: ct.ch("c6Active"),
      states: {
        c6: {
          fields: [{
            node: c6ChargedDmg_,
          }, {
            text: stg("cd"),
            value: dm.constellation6.cd,
            unit: "s"
          },]
        }
      }
    })])
  },
}

export default new CharacterSheet(sheet, data, assets)
