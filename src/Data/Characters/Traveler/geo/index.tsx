import { CharacterData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { input, target } from '../../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod } from '../../../../Formula/utils'
import { TalentSheet } from '../../../../Types/character'
import { CharacterKey, ElementKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, sgt, st } from '../../../SheetUtil'
import { charTemplates } from '../../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../../dataUtil'
import data_gen_src from '../data_gen.json'
import talentAssets from './assets'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Traveler"
const elementKey: ElementKey = "geo"
const ct = charTemplates(key, data_gen.weaponTypeKey, talentAssets, elementKey)

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
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal")
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:${elementKey}.auto.skillParams.${i}` }),
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:${elementKey}.auto.skillParams.5` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:${elementKey}.auto.skillParams.5` }),
        textSuffix: "(2)"
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
      }]
    }, ct.headerTemplate("passive1", {
      fields: [{
        text: st("skillCDRed"),
        value: datamine.passive1.skill_cdRed,
        unit: "s"
      }]
    }), ct.headerTemplate("constellation2", {
      fields: [{
        node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${key}:${elementKey}.c2.key` }),
      }]
    }), ct.headerTemplate("constellation6", {
      fields: [{
        text: st("durationInc"),
        value: datamine.constellation6.skillDuration,
        unit: "s"
      }]
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
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
      }]
    }, ct.conditionalTemplate("constellation1", {
      value: condC1BurstArea,
      path: condC1BurstAreaPath,
      name: st("activeCharField"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: infoMut(c1BurstArea_critRate_Disp, { key: "critRate_" }),
          }, {
            text: st("incInterRes"),
          }]
        }
      }
    }), ct.conditionalTemplate("constellation4", {
      value: condC4BurstHit,
      path: condC4BurstHitPath,
      name: st("hitOp.burst"),
      states: Object.fromEntries(range(1, datamine.constellation4.maxTriggers).map(stack => [
        stack,
        {
          name: st("hits", { count: stack }),
          fields: [{
            node: infoMut(c4Burst_energyRestore, { key: "sheet:energyRegen" }),
          }]
        }
      ]))
    }), ct.headerTemplate("constellation6", {
      fields: [{
        text: st("durationInc"),
        value: datamine.constellation6.burstDuration,
        unit: "s"
      }]
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
      fields: [{
        node: infoMut(dmgFormulas.passive2.dmg, { key: `char_${key}:${elementKey}.passive2.key` })
      }]
    })]),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: burstC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: skillC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}
export default talentSheet
