import { CharacterData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { TalentSheet } from '../../../../Types/character_WR'
import { CharacterKey, ElementKey } from '../../../../Types/consts'
import { dataObjForCharacterSheet, dmgNode } from '../../dataUtil'
import { burst, c1, c2, c3, c4, c5, c6, passive1, passive2, skill } from './assets'
import data_gen_src from '../data_gen.json'
import skillParam_gen from './skillParam_gen.json'
import { equal, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../../Formula/utils'
import { input, target } from '../../../../Formula'
import { normalSrc, talentTemplate, sectionTemplate } from '../../CharacterSheet'
import { cond, sgt, st } from '../../../SheetUtil'

const data_gen = data_gen_src as CharacterData
const auto = normalSrc(data_gen.weaponTypeKey)

const key: CharacterKey = "Traveler"
const elementKey: ElementKey = "electro"

const tr = (strKey: string) => <Translate ns="char_Traveler_gen" key18={`${elementKey}.${strKey}`} />
const trm = (strKey: string) => <Translate ns="char_Traveler" key18={`${elementKey}.${strKey}`} />

let a = 0, s = 0, b = 0
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
    hit1: skillParam_gen.auto[a++],
    hit2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    energyRestore: skillParam_gen.skill[s++],
    amulets: 2,
    amuletDuration: skillParam_gen.skill[s++][0],
    enerRech_: skillParam_gen.skill[s++][0],
    enerRech_duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    thunderDmg: skillParam_gen.burst[b++],
    thunderCd: 0.5,
    energyRestore: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    cdRed: skillParam_gen.passive1[0][0],
  },
  passive2: {
    enerRech_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    addlAmulets: 1
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    electro_enemyRes: skillParam_gen.constellation2[1],
  },
  constellation6: {
    numAttacks: skillParam_gen.constellation6[0],
    thunder_dmg_: skillParam_gen.constellation6[0],
    energyRestore: skillParam_gen.constellation6[1]
  }
} as const

const [condSkillAmuletPath, condSkillAmulet] = cond(key, `${elementKey}SkillAmulet`)
const p2_enerRech_ = greaterEq(input.asc, 4,
  prod(input.premod.enerRech_, percent(datamine.passive2.enerRech_))
)
const skillAmulet_enerRech_Disp = equal(condSkillAmulet, "on",
  sum(
    percent(datamine.skill.enerRech_),
    p2_enerRech_
  )
)
const skillAmulet_enerRech_ = equal(input.activeCharKey, target.charKey, skillAmulet_enerRech_Disp)

const burstEnergyRestore = subscript(input.total.burstIndex, datamine.burst.energyRestore,
  { key: `char_${key}_gen:${elementKey}.burst.skillParmas.2` }
)

const [condC2ThunderPath, condC2Thunder] = cond(key, `${elementKey}C2Thunder`)
const c2Thunder_electro_enemyRes_ = greaterEq(input.constellation, 2, 
  equal(condC2Thunder, "on", datamine.constellation2.electro_enemyRes)
)

const [condC6After2ThunderPath, condC6After2Thunder] = cond(key, `${elementKey}C6After2Thunder`)
const c6_thunder_dmg_ = greaterEq(input.constellation, 6, equal(condC6After2Thunder, "on", datamine.constellation6.thunder_dmg_))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.hit1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.hit2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    pressDmg: dmgNode("atk", datamine.burst.pressDmg, "burst"),
    thunderDmg: dmgNode("atk", datamine.burst.thunderDmg, "burst",
      { premod: { burst_dmg_: c6_thunder_dmg_ } })
  }
} as const

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, undefined, data_gen, dmgFormulas, {
  bonus: {
    skill: skillC5,
    burst: burstC3,
  },
  teamBuff: {
    premod: {
      electro_enemyRes_: c2Thunder_electro_enemyRes_,
    },
    total: {
      enerRech_: skillAmulet_enerRech_ // In total to avoid loops
    }
  }
})

const talentSheet: TalentSheet = {
  sheets: {
    auto: talentTemplate("auto", tr, auto, undefined, undefined, [{
      ...sectionTemplate("auto", tr, auto,
        datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:${elementKey}.auto.skillParams.${i}` }),
        }))
      ),
      text: tr("auto.fields.normal")
    }, {
      ...sectionTemplate("auto", tr, auto, [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:${elementKey}.auto.skillParams.5` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:${elementKey}.auto.skillParams.5` }),
        textSuffix: "(2)"
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
      }]
      ),
      text: tr("auto.fields.charged"),
    }, {
      ...sectionTemplate("auto", tr, auto, [{
        node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
      }]
      ),
      text: tr("auto.fields.plunging"),
    }]),
    skill: talentTemplate("skill", tr, skill, [{
      node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:${elementKey}.skill.skillParams.0` })
    }, {
      text: trm("skill.amuletGenAmt"),
      value: data => data.get(input.constellation).value >= 1
        ? datamine.skill.amulets + datamine.constellation1.addlAmulets
        : datamine.skill.amulets
    }, {
      text: tr("skill.skillParams.4"),
      value: datamine.skill.amuletDuration,
      unit: "s"
    }, {
      text: sgt("cd"),
      value: datamine.skill.cd,
      unit: "s",
      fixed: 1
    }], {
      value: condSkillAmulet,
      path: condSkillAmuletPath,
      name: trm("skill.absorb"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: subscript(input.total.skillIndex, datamine.skill.energyRestore,
              { key: `char_${key}_gen:${elementKey}.skill.skillParams.1` }
            )
          }, {
            node: infoMut(skillAmulet_enerRech_Disp, { key: "enerRech_" })
          }, {
            text: sgt("duration"),
            value: datamine.skill.enerRech_duration,
            unit: "s"
          }]
        }
      }
    }, [
      sectionTemplate("passive1", tr, passive1, [{
        text: tr("passive1.description")
      }], undefined, data => data.get(input.asc).value >= 1, false, true),
      sectionTemplate("passive2", tr, passive2, [{
        node: infoMut(p2_enerRech_, { key: `char_${key}:${elementKey}.passive2.enerRech_` })
      }], undefined, data => data.get(input.asc).value >= 4, false, true),
    ]),
    burst: talentTemplate("burst", tr, burst, [{
      node: infoMut(dmgFormulas.burst.pressDmg,
        { key: `char_${key}_gen:${elementKey}.burst.skillParams.0` }
      )
    }, {
      node: infoMut(dmgFormulas.burst.thunderDmg,
        { key: `char_${key}_gen:${elementKey}.burst.skillParams.1` }
      )
    }, {
      text: trm("burst.thunderCd"),
      value: datamine.burst.thunderCd,
      unit: "s",
      fixed: 1
    }, {
      node: infoMut(burstEnergyRestore, { key: `char_${key}_gen:${elementKey}.burst.skillParams.2` })
    }, {
      text: sgt("duration"),
      value: datamine.burst.duration,
      unit: "s"
    }, {
      text: sgt("cd"),
      value: datamine.burst.cd,
      unit: "s"
    }, {
      text: sgt("energyCost"),
      value: datamine.burst.enerCost,
    }], undefined, [
      sectionTemplate("constellation2", tr, c2, undefined, {
        value: condC2Thunder,
        path: condC2ThunderPath,
        name: trm("c2.thunderHit"),
        teamBuff: true,
        canShow: greaterEq(input.constellation, 2, 1),
        states: {
          on: {
            fields: [{
              node: c2Thunder_electro_enemyRes_
            }, {
              text: sgt("duration"),
              value: datamine.constellation2.duration,
              unit: "s"
            }]
          }
        }
      }),
      sectionTemplate("constellation6", tr, c6, undefined, {
        value: condC6After2Thunder,
        path: condC6After2ThunderPath,
        name: trm("c6.fallingThunder3"),
        canShow: greaterEq(input.constellation, 6, 1),
        states: {
          on: {
            fields: [{
              node: infoMut(c6_thunder_dmg_,
                { key: `char_${key}:${elementKey}.c6.fallingThunderBonus_`, variant: "electro" }
              )
            }, {
              text: tr("burst.skillParams.2"),
              value: datamine.constellation6.energyRestore
            }]
          }
        }
      })
    ]),
    passive1: talentTemplate("passive1", tr, passive1),
    passive2: talentTemplate("passive2", tr, passive2),
    constellation1: talentTemplate("constellation1", tr, c1),
    constellation2: talentTemplate("constellation2", tr, c2),
    constellation3: talentTemplate("constellation3", tr, c3, [{ node: burstC3 }]),
    constellation4: talentTemplate("constellation4", tr, c4),
    constellation5: talentTemplate("constellation5", tr, c5, [{ node: skillC5 }]),
    constellation6: talentTemplate("constellation6", tr, c6),
  }
}
export default talentSheet