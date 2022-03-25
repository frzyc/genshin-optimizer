import { CharacterData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { TalentSheet } from '../../../../Types/character_WR'
import { CharacterKey, ElementKey } from '../../../../Types/consts'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../../dataUtil'
import { burst, c1, c2, c3, c4, c5, c6, passive1, passive2, skill } from './assets'
import data_gen_src from '../data_gen.json'
import skillParam_gen from './skillParam_gen.json'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod } from '../../../../Formula/utils'
import { input, target } from '../../../../Formula'
import { normalSrc, talentTemplate, sectionTemplate } from '../../CharacterSheet'
import { cond, sgt, st } from '../../../SheetUtil'
import { range } from '../../../../Util/Util'

const data_gen = data_gen_src as CharacterData
const auto = normalSrc(data_gen.weaponTypeKey)

const key: CharacterKey = "Traveler"
const elementKey: ElementKey = "geo"

const tr = (strKey: string) => <Translate ns="char_Traveler_gen" key18={`${elementKey}.${strKey}`} />

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
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    numShockwaves: 4,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    skill_cdRed: 2
  },
  passive2: {
    geoDmg: percent(0.6),
  },
  constellation1: {
    critRate_: percent(0.1),
  },
  constellation4: {
    energyRestore: 5,
    maxTriggers: 5
  },
  constellation6: {
    burstDuration: 5,
    skillDuration: 10
  }
} as const

const [condC1BurstAreaPath, condC1BurstArea] = cond(key, `${elementKey}C1BurstArea`)
const c1BurstArea_critRate_Disp = greaterEq(input.constellation, 1, 
  equal(condC1BurstArea, "on", datamine.constellation1.critRate_)
)
const c1BurstArea_critRate_ = equal(input.activeCharKey, target.charKey, c1BurstArea_critRate_Disp)

const [condC4BurstHitPath, condC4BurstHit] = cond(key, `${elementKey}C4BurstHit`)
const c4Burst_energyRestore = lookup(condC4BurstHit,
  Object.fromEntries(range(1, datamine.constellation4.maxTriggers).map(stack => [
    stack,
    constant(stack * datamine.constellation4.energyRestore)
  ])),
  naught
)

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
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
  passive2: {
    dmg: customDmgNode(
      prod(input.total.atk, datamine.passive2.geoDmg), "elemental", { hit: { ele: constant("geo") } }
    )
  },
  constellation2: {
    dmg: greaterEq(input.constellation, 2, dmgNode("atk", datamine.skill.dmg, "skill")),
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
      critRate_: c1BurstArea_critRate_
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
      node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:${elementKey}.skill.skillParams.0` }),
    }, {
      text: tr("skill.skillParams.1"),
      value: data => data.get(input.constellation).value >= 6
        ? `${datamine.skill.duration}s + ${datamine.constellation6.skillDuration}s = ${datamine.skill.duration + datamine.constellation6.skillDuration}`
        : datamine.skill.duration,
      unit: "s",
    }, {
      text: sgt("cd"),
      value: data => data.get(input.asc).value >= 1
        ? `${datamine.skill.cd}s - ${datamine.passive1.skill_cdRed}s = ${datamine.skill.cd - datamine.passive1.skill_cdRed}`
        : datamine.skill.cd,
      unit: "s",
    }], undefined, [
      sectionTemplate("passive1", tr, passive1, [{
        text: st("skillCDRed"),
        value: datamine.passive1.skill_cdRed,
        unit: "s"
      }], undefined, data => data.get(input.asc).value >= 1, false, true),
      sectionTemplate("constellation2", tr, c2, [{
        node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${key}:${elementKey}.c2.key` }),
      }], undefined, data => data.get(input.constellation).value >= 2, false, true),
      sectionTemplate("constellation6", tr, c6, [{
        text: st("durationInc"),
        value: datamine.constellation6.skillDuration,
        unit: "s"
      }], undefined, data => data.get(input.constellation).value >= 6, false, true),
    ]),
    burst: talentTemplate("burst", tr, burst, [{
      node: infoMut(dmgFormulas.burst.dmg,
        { key: `sheet_gen:skillDMG` }
      ),
      textSuffix: st("brHits", { count: datamine.burst.numShockwaves })
    }, {
      text: tr("burst.skillParams.1"),
      value: data => data.get(input.constellation).value >= 6
        ? `${datamine.burst.duration}s + ${datamine.constellation6.burstDuration}s = ${datamine.burst.duration + datamine.constellation6.burstDuration}`
        : datamine.burst.duration,
      unit: "s"
    }, {
      text: sgt("cd"),
      value: datamine.burst.cd,
      unit: "s"
    }, {
      text: sgt("energyCost"),
      value: datamine.burst.enerCost,
    }], undefined, [
      sectionTemplate("constellation1", tr, c1, undefined, {
        value: condC1BurstArea,
        path: condC1BurstAreaPath,
        name: st("activeCharField"),
        teamBuff: true,
        canShow: greaterEq(input.constellation, 1, 1),
        states: {
          on: {
            fields: [{
              node: infoMut(c1BurstArea_critRate_Disp, { key: "critRate_" }),
            }, {
              text: st("incInterRes"),
            }]
          }
        }
      }),
      sectionTemplate("constellation4", tr, c4, undefined, {
        value: condC4BurstHit,
        path: condC4BurstHitPath,
        name: st("hitOp.burst"),
        canShow: greaterEq(input.constellation, 4, 1),
        states: Object.fromEntries(range(1, datamine.constellation4.maxTriggers).map(stack => [
          stack,
          {
            name: st("hits", { count: stack }),
            fields: [{
              node: infoMut(c4Burst_energyRestore, { key: "sheet:energyRegen" }),
            }]
          }
        ]))
      }),
      sectionTemplate("constellation6", tr, c6, [{
        text: st("durationInc"),
        value: datamine.constellation6.burstDuration,
        unit: "s"
      }], undefined, data => data.get(input.constellation).value >= 6, false, true),
    ]),
    passive1: talentTemplate("passive1", tr, passive1),
    passive2: talentTemplate("passive2", tr, passive2, [{
      node: infoMut(dmgFormulas.passive2.dmg, { key: `char_${key}:${elementKey}.passive2.key` })
    }]),
    constellation1: talentTemplate("constellation1", tr, c1),
    constellation2: talentTemplate("constellation2", tr, c2),
    constellation3: talentTemplate("constellation3", tr, c3, [{ node: burstC3 }]),
    constellation4: talentTemplate("constellation4", tr, c4),
    constellation5: talentTemplate("constellation5", tr, c5, [{ node: skillC5 }]),
    constellation6: talentTemplate("constellation6", tr, c6),
  }
}
export default talentSheet