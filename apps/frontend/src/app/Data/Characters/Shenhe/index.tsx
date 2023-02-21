import { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import { equal, greaterEq, infoMut, lookup, percent, prod, subscript } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Shenhe"
const elementKey: ElementKey = "cryo"
const ct = charTemplates(key, data_gen.weaponTypeKey)

let s = 0, b = 0, p1 = 0, p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3
      skillParam_gen.auto[3], // 4x2
      skillParam_gen.auto[5], // 5
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[6],
    stamina: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    dmgAtk_: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    durationHold: skillParam_gen.skill[s++][0],
    trigger: skillParam_gen.skill[s++][0],
    triggerHold: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    res_: skillParam_gen.burst[b++],
    dot: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cryo_dmg_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    press_dmg_: skillParam_gen.passive2[p2++][0],
    durationPress: skillParam_gen.passive2[p2++][0],
    hold_dmg_: skillParam_gen.passive2[p2++][0],
    durationHold: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    dmg_: skillParam_gen.constellation4[0],
    maxStacks: skillParam_gen.constellation4[1],
  },
  constellation6: {
    auto_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  }
} as const

const [condQuillPath, condQuill] = cond(key, "quill")
const nodeSkill = equal("quill", condQuill,
  prod(input.total.atk, subscript(input.total.skillIndex, dm.skill.dmgAtk_, { unit: "%" })))


const [condBurstPath, condBurst] = cond(key, "burst")
const enemyRes_ = equal("burst", condBurst,
  subscript(input.total.burstIndex, dm.burst.res_.map(x => -x), { unit: "%" }))

const nodeBurstCryo_enemyRes_ = { ...enemyRes_ }
const nodeBurstPhysical_enemyRes_ = { ...enemyRes_ }

const [condAsc1Path, condAsc1] = cond(key, "asc1")
const nodeAsc1Disp = greaterEq(input.asc, 1,
  equal(condAsc1, "field",
    dm.passive1.cryo_dmg_
  )
)
const nodeAsc1 = equal(input.activeCharKey, target.charKey, nodeAsc1Disp)

const [condAsc4Path, condAsc4] = cond(key, "asc4")
const nodeAsc4 = greaterEq(input.asc, 1,
  equal(condAsc4, "press",
    dm.passive2.press_dmg_
  )
)
const nodeAsc4Press_skill_dmg_ = { ...nodeAsc4 }
const nodeAsc4Press_burst_dmg_ = { ...nodeAsc4 }
const nodeAsc4Hold = greaterEq(input.asc, 1,
  equal(condAsc4, "hold",
    dm.passive2.hold_dmg_
  )
)
const nodeAsc4Hold_normal_dmg_ = { ...nodeAsc4Hold }
const nodeAsc4Hold_charged_dmg_ = { ...nodeAsc4Hold }
const nodeAsc4Hold_plunging_dmg_ = { ...nodeAsc4Hold }

const nodeC2Disp = greaterEq(input.constellation, 2,
  equal(condAsc1, "field",
    dm.passive1.cryo_dmg_
  )
)
const nodeC2 = equal(input.activeCharKey, target.charKey, nodeC2Disp)

const [condC4Path, condC4] = cond(key, "c4")
const c4Inc = greaterEq(input.constellation, 4,
  lookup(condC4,
    objectKeyMap(range(1, dm.constellation4.maxStacks), i => percent(i * dm.constellation4.dmg_)),
    0),
  { name: ct.ch("c4Bonus_") })
const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", dm.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", dm.skill.press, "skill", { hit: { dmgBonus: c4Inc } }),
    hold: dmgNode("atk", dm.skill.hold, "skill", { hit: { dmgBonus: c4Inc } }),
    quillDmg: nodeSkill
  },
  burst: {
    dmg: dmgNode("atk", dm.burst.dmg, "burst"),
    dot: dmgNode("atk", dm.burst.dot, "burst"),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  premod: {
    skillBoost: nodeC3,
    burstBoost: nodeC5
  },
  teamBuff: {
    premod: {
      cryo_dmgInc: nodeSkill,
      cryo_enemyRes_: nodeBurstCryo_enemyRes_,
      physical_enemyRes_: nodeBurstPhysical_enemyRes_,
      cryo_dmg_: nodeAsc1,
      skill_dmg_: nodeAsc4Press_skill_dmg_,
      burst_dmg_: nodeAsc4Press_burst_dmg_,
      normal_dmg_: nodeAsc4Hold_normal_dmg_,
      charged_dmg_: nodeAsc4Hold_charged_dmg_,
      plunging_dmg_: nodeAsc4Hold_plunging_dmg_,
      cryo_critDMG_: nodeC2
    },
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
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`), multi: i === 3 ? 2 : undefined, }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.5`) }),
      }, {
        text: ct.chg("auto.skillParams.6"),
        value: dm.charged.stamina,
      }]
    }, {
      text: ct.chg(`auto.fields.plunging`),
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
        text: ct.ch("pressDuration"),
        value: dm.skill.duration,
        unit: "s"
      }, {
        text: ct.ch("pressQuota"),
        value: dm.skill.trigger,
      }, {
        text: st("pressCD"),
        value: dm.skill.cd,
        unit: "s"
      }, {
        node: infoMut(dmgFormulas.skill.hold, { name: ct.chg(`skill.skillParams.1`) }),
      }, {
        text: ct.ch("holdDuration"),
        value: dm.skill.durationHold,
        unit: "s"
      }, {
        text: ct.ch("holdQuota"),
        value: dm.skill.triggerHold,
      }, {
        text: st("holdCD"),
        value: dm.skill.cdHold,
        unit: "s"
      }, {
        canShow: (data) => data.get(input.constellation).value >= 1,
        text: st("charges"),
        value: 2
      }]
    }, ct.condTem("skill", {
      teamBuff: true,
      value: condQuill,
      path: condQuillPath,
      name: ct.ch("quill"),
      states: {
        quill: {
          fields: [{
            node: nodeSkill
          }]
        }
      }
    }), ct.condTem("passive2", {
      value: condAsc4,
      path: condAsc4Path,
      teamBuff: true,
      name: st("afterUse.skill"),
      states: {
        press: {
          name: st("press"),
          fields: [{
            node: nodeAsc4Press_skill_dmg_
          }, {
            node: nodeAsc4Press_burst_dmg_
          }]
        },
        hold: {
          name: st("hold"),
          fields: [{
            node: nodeAsc4Hold_normal_dmg_
          }, {
            node: nodeAsc4Hold_charged_dmg_
          }, {
            node: nodeAsc4Hold_plunging_dmg_
          }]
        }
      }
    }), ct.headerTem("constellation1", {
      fields: [{
        text: st("addlCharges"),
        value: 1
      }]
    }), ct.condTem("constellation4", {
      value: condC4,
      path: condC4Path,
      name: ct.ch("c4"),
      states: objectKeyMap(range(1, 50).map(i => i.toString()), i => ({
        name: i.toString(),
        fields: [{ node: c4Inc }]
      }))
    }), ct.headerTem("constellation6", {
      fields: [{
        text: ct.chg("constellation6.description")
      }],
      teamBuff: true
    }),
    ]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.burst.dot, { name: ct.chg(`burst.skillParams.2`) }),
      }, {
        text: ct.chg("burst.skillParams.3"),
        value: (data) => data.get(input.constellation).value >= 2
          ? `${dm.burst.duration} + ${dm.constellation2.durationInc} = ${dm.burst.duration + dm.constellation2.durationInc}`
          : dm.burst.duration,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.4"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.5"),
        value: dm.burst.enerCost,
      }]
    }, ct.condTem("burst", {
      teamBuff: true,
      value: condBurst,
      path: condBurstPath,
      name: st("opponentsField"),
      states: {
        burst: {
          fields: [{
            node: nodeBurstCryo_enemyRes_
          }, {
            node: nodeBurstPhysical_enemyRes_
          }]
        }
      }
    }), ct.condTem("passive1", {
      value: condAsc1,
      path: condAsc1Path,
      teamBuff: true,
      name: st("activeCharField"),
      states: {
        field: {
          fields: [{
            node: infoMut(nodeAsc1Disp, KeyMap.info("cryo_dmg_")) // Jank
          }]
        }
      }
    }), ct.headerTem("constellation2", {
      fields: [{
        text: st("durationInc"),
        value: dm.constellation2.durationInc,
        unit: "s"
      }, {
        node: infoMut(nodeC2Disp, KeyMap.info("cryo_critDMG_"))
      }],
      teamBuff: true,
    }),
    ]),

    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  }
}
export default new CharacterSheet(sheet, data)
