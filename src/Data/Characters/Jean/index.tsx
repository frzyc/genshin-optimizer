import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customHealNode, dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Jean"
const elementKey: ElementKey = "anemo"
const regionKey: Region = "mondstadt"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
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
    dmg: skillParam_gen.skill[s++],
    stamina: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    enterExitDmg: skillParam_gen.burst[b++],
    burstActivationAtkModifier: skillParam_gen.burst[b++],
    burstActionFlatModifier: skillParam_gen.burst[b++],
    burstRegenAtkModifier: skillParam_gen.burst[b++],
    burstRegenFlatModifier: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chance: skillParam_gen.passive1[p1++][0],
    atkPercentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    energyRegen: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    increaseDmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    moveSpd: skillParam_gen.constellation2[0],
    atkSpd: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    anemoRes: skillParam_gen.constellation4[0],
  },
  constellation6: {
    dmgReduction: skillParam_gen.constellation6[0],
  },
} as const

const regen = healNodeTalent("atk", datamine.burst.burstActivationAtkModifier, datamine.burst.burstActionFlatModifier, "burst")
const contRegen = healNodeTalent("atk", datamine.burst.burstRegenAtkModifier, datamine.burst.burstRegenFlatModifier, "burst")
const a1Regen = greaterEq(input.asc, 1, customHealNode(prod(percent(datamine.passive1.atkPercentage), input.total.atk)))

const [condC1Path, condC1] = cond(key, "c1")
const skill_dmg_ = equal(condC1, "on", greaterEq(input.constellation, 1, datamine.constellation1.increaseDmg))

const [condC2Path, condC2] = cond(key, "c2")
const atkSPD_ = equal(condC2, "on", greaterEq(input.constellation, 2, percent(datamine.constellation2.atkSpd)))
const moveSPD_ = equal(condC2, "on", greaterEq(input.constellation, 2, percent(datamine.constellation2.moveSpd)))

const [condC4Path, condC4] = cond(key, "c4")
const anemo_enemyRes_ = equal(condC4, "on", greaterEq(input.constellation, 4, percent(-Math.abs(datamine.constellation4.anemoRes))))

const [condC6Path, condC6] = cond(key, "c6")
const dmgRed_disp = equal(condC6, "on", greaterEq(input.constellation, 6, percent(datamine.constellation6.dmgReduction)))
const dmgRed_ = equal(input.activeCharKey, target.charKey, dmgRed_disp)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    enterExitDmg: dmgNode("atk", datamine.burst.enterExitDmg, "burst"),
    regen,
    contRegen
  },
  passive1: {
    a1Regen
  },
  constellation2: {
    atkSPD_,
    moveSPD_
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, regionKey, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    skill_dmg_
  },
  teamBuff: {
    premod: {
      atkSPD_,
      moveSPD_,
      anemo_enemyRes_,
      dmgRed_
    }
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
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          text: tr("auto.skillParams.6"),
          value: datamine.charged.stamina,
        }],
      }, {
        text: tr("auto.fields.plunging"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }],
      }]),

      skill: ct.talentTemplate("skill", [{
        fields: [{
          node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          text: tr("skill.skillParams.1"),
          value: `${datamine.skill.stamina}`,
          unit: "/s"
        }, {
          text: tr("skill.skillParams.2"),
          value: `${datamine.skill.duration}`,
          unit: "s"
        }, {
          text: tr("skill.skillParams.3"),
          value: `${datamine.skill.cd}`,
          unit: "s"
        }],
      }, ct.conditionalTemplate("constellation1", {
        value: condC1,
        path: condC1Path,
        name: trm("c1CondName"),
        states: {
          on: {
            fields: [{
              text: trm("c1PullSpeed")
            }, {
              node: skill_dmg_
            }]
          }
        }
      })]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.burst.enterExitDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
        }, {
          node: infoMut(dmgFormulas.burst.regen, { key: `char_${key}_gen:burst.skillParams.2` }),
        }, {
          node: infoMut(dmgFormulas.burst.contRegen, { key: `char_${key}_gen:burst.skillParams.3` }),
        }, {
          text: sgt("duration"),
          value: 11,
          unit: "s"
        }, {
          text: tr("burst.skillParams.4"),
          value: `${datamine.burst.cd}`,
          unit: "s"
        }, {
          text: tr("burst.skillParams.5"),
          value: `${datamine.burst.enerCost}`,
        }]
      }, ct.conditionalTemplate("constellation4", {
        value: condC4,
        path: condC4Path,
        teamBuff: true,
        name: st("opponentsField"),
        states: {
          on: {
            fields: [{
              node: anemo_enemyRes_
            }]
          }
        }
      }), ct.conditionalTemplate("constellation6", {
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        name: st("activeCharField"),
        states: {
          on: {
            fields: [{
              node: infoMut(dmgRed_disp, { key: "dmgRed_" })
            }]
          }
        }
      })]),

      passive1: ct.talentTemplate("passive1", [ct.fieldsTemplate("passive1", {
        fields: [{
          node: infoMut(dmgFormulas.passive1.a1Regen, { key: `sheet_gen:healing` }),
        }]
      })]),
      passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
        fields: [{
          text: st("energyRegen"),
          value: datamine.passive2.energyRegen
        }]
      })]),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
        value: condC2,
        path: condC2Path,
        teamBuff: true,
        name: trm("c2CondName"),
        states: {
          on: {
            fields: [{
              node: atkSPD_
            }, {
              node: moveSPD_
            }, {
              text: sgt("duration"),
              value: datamine.constellation2.duration,
              unit: "s"
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
