import { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import { compareEq, constant, equal, equalStr, greaterEq, infoMut, lookup, min, naught, percent, prod, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode, splitScaleDmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Alhaitham"
const elementKey: ElementKey = "dendro"
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = -1, s = -1, b = -1
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3x2
      skillParam_gen.auto[a += 2], // 4
      skillParam_gen.auto[++a], // 5
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stamina: skillParam_gen.auto[a += 2][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    rushDmgAtk: skillParam_gen.skill[++s],
    rushDmgEm: skillParam_gen.skill[++s],
    atkInterval: skillParam_gen.skill[++s][0],
    mirrorDmgAtk: skillParam_gen.skill[++s],
    mirrorDmgEm: skillParam_gen.skill[++s],
    // mirrorDmgAtk2: skillParam_gen.skill[++s], // extras
    // mirrorDmgEm2: skillParam_gen.skill[++s],
    // mirrorDmgAtk3: skillParam_gen.skill[++s],
    // mirrorDmgEm3: skillParam_gen.skill[++s],
    mirrorRemovalInterval: skillParam_gen.skill[s += 5][0],
    cd: skillParam_gen.skill[++s][0],
  },
  burst: {
    instanceDmgAtk: skillParam_gen.burst[++b],
    instanceDmgEm: skillParam_gen.burst[++b],
    attackInstances: [
      skillParam_gen.burst[++b][0],
      skillParam_gen.burst[++b][0],
      skillParam_gen.burst[++b][0],
      skillParam_gen.burst[++b][0],
    ],
    cd: skillParam_gen.burst[++b][0],
    enerCost: skillParam_gen.burst[++b][0],
  },
  passive1: {
    cd: skillParam_gen.passive1[0][0],
  },
  passive2: {
    dmgInc: skillParam_gen.passive2[0][0],
    maxDmgInc: skillParam_gen.passive2[1][0]
  },
  constellation1: {
    cdReduction: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    eleMas: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    numStacks: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    eleMasDuration: skillParam_gen.constellation4[1],
    dendro_dmg_: skillParam_gen.constellation4[2],
    dendroDuration: skillParam_gen.constellation4[3],
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  }
} as const

const a4_skill_dmg_ = greaterEq(input.asc, 4, min(
  prod(percent(dm.passive2.dmgInc), input.total.eleMas), // TODO: is this total or premod; test with nahida
  percent(dm.passive2.maxDmgInc)
))
const a4_burst_dmg_ = { ...a4_skill_dmg_ }

const [condWithMirrorsPath, condWithMirrors] = cond(key, "withMirrors")
const withMirrorsInfusion = equalStr(condWithMirrors, "on", constant(elementKey))

const debateStacksArr = range(1, dm.constellation2.numStacks)
const [condDebateStacksPath, condDebateStacks] = cond(key, "debateStacks")
const c2DebateStacks_eleMas = greaterEq(input.constellation, 2,
  lookup(
    condDebateStacks,
    objectKeyMap(debateStacksArr, stack => prod(stack, dm.constellation2.eleMas)),
    naught
  )
)

const mirrorsConsumedArr = range(0, 3)
const [condMirrorsConsumedPath, condMirrorsConsumed] = cond(key, "mirrorsConsumed")
const c4MirrorsConsumed_eleMasDisp = infoMut(greaterEq(input.constellation, 4,
  lookup(
    condMirrorsConsumed,
    objectKeyMap(mirrorsConsumedArr, count => prod(count, dm.constellation4.eleMas)),
    naught
  )
), { ...KeyMap.info("eleMas"), isTeamBuff: true })
const c4MirrorsConsumed_eleMas = unequal(input.activeCharKey, key, c4MirrorsConsumed_eleMasDisp)
const c4MirrorsGenerated_dendro_dmg_ = greaterEq(input.constellation, 4,
  compareEq(input.constellation, 6,
    prod(3, percent(dm.constellation4.dendro_dmg_)),
    lookup(
      condMirrorsConsumed,
      objectKeyMap(mirrorsConsumedArr, count =>
        prod(3 - count, percent(dm.constellation4.dendro_dmg_))
      ),
      naught
    )
  )
)

const [condExcessMirrorPath, condExcessMirror] = cond(key, "excessMirror")
const c6ExcessMirror_critRate_ = greaterEq(input.constellation, 6,
  equal(condExcessMirror, "on", dm.constellation6.critRate_)
)
const c6ExcessMirror_critDMG_ = greaterEq(input.constellation, 6,
  equal(condExcessMirror, "on", dm.constellation6.critDMG_)
)

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", dm.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    rushDmg: splitScaleDmgNode(["atk", "eleMas"], [dm.skill.rushDmgAtk, dm.skill.rushDmgEm], "skill"),
    mirrorDmg1: splitScaleDmgNode(["atk", "eleMas"], [dm.skill.mirrorDmgAtk, dm.skill.mirrorDmgEm], "skill", { premod: { skill_dmg_: a4_skill_dmg_ } }),
  },
  burst: {
    instanceDmg: splitScaleDmgNode(["atk", "eleMas"], [dm.burst.instanceDmgAtk, dm.burst.instanceDmgEm], "burst", { premod: { burst_dmg_: a4_burst_dmg_ } }),
  },
  passive2: {
    a4SkillDmgBonus: a4_skill_dmg_,
    a4BurstDmgBonus: a4_burst_dmg_,
  }
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "sumeru", data_gen, dmgFormulas, {
  teamBuff: {
    premod: {
      eleMas: c4MirrorsConsumed_eleMas
    }
  },
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    dendro_dmg_: c4MirrorsGenerated_dendro_dmg_,
    eleMas: c2DebateStacks_eleMas,
    critRate_: c6ExcessMirror_critRate_,
    critDMG_: c6ExcessMirror_critDMG_
  },
  infusion: {
    nonOverridableSelf: withMirrorsInfusion
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal")
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`), multi: i === 2 ? 2 : undefined }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.5`), multi: 2 }),
      }, {
        text: ct.chg("auto.skillParams.6"),
        value: dm.charged.stamina,
      }],
    }, {
      text: ct.chg("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }],
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.rushDmg, { name: ct.chg(`skill.skillParams.0`) })
      }, {
        text: ct.chg("skill.skillParams.1"),
        value: dm.skill.atkInterval,
        unit: "s",
        fixed: 1
      }, {
        node: infoMut(dmgFormulas.skill.mirrorDmg1, { name: ct.ch(`projectionDmg`) })
      }, {
        text: ct.chg("skill.skillParams.5"),
        value: dm.skill.mirrorRemovalInterval,
        unit: "s"
      }, {
        text: stg("cd"),
        value: dm.skill.cd,
        unit: "s"
      }]
    }, ct.condTem("skill", {
      path: condWithMirrorsPath,
      value: condWithMirrors,
      name: ct.ch("withMirrors"),
      states: {
        on: {
          fields: [{
            text: st("infusion.dendro"),
            variant: elementKey
          }]
        }
      }
    }), ct.headerTem("passive2", {
      fields: [{
        node: infoMut(a4_skill_dmg_, { name: ct.ch("projectionAttack_dmg_"), unit: "%" })
      }]
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.instanceDmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, ...dm.burst.attackInstances.map((instances, i) => ({
        text: ct.chg(`burst.skillParams.${i + 1}`),
        value: instances
      })), {
        text: stg("cd"),
        value: dm.burst.cd,
        unit: "s",
      }, {
        text: stg("energyCost"),
        value: dm.burst.enerCost,
      }]
    }, ct.headerTem("passive2", {
      fields: [{
        node: infoMut(a4_burst_dmg_, KeyMap.info("burst_dmg_"))
      }]
    }), ct.condTem("constellation4", {
      path: condMirrorsConsumedPath,
      value: condMirrorsConsumed,
      teamBuff: true,
      name: ct.ch("mirrorsConsumed"),
      states: objectKeyMap(mirrorsConsumedArr, count => ({
        name: `${count}`,
        fields: [{
          node: c4MirrorsConsumed_eleMasDisp
        }, {
          node: c4MirrorsGenerated_dendro_dmg_
        }, {
          text: stg("duration"),
          value: dm.constellation4.eleMasDuration,
          unit: "s"
        }]
      }))
    })]),

    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2", [ct.condTem("constellation2", {
      path: condDebateStacksPath,
      value: condDebateStacks,
      name: ct.ch("debateStacks"),
      teamBuff: true, // For Nahida A1
      states: objectKeyMap(debateStacksArr, stack => ({
        name: st("stack", { count: stack }),
        fields: [{ node: c2DebateStacks_eleMas }]
      }))
    })]),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTem("constellation6", [ct.condTem("constellation6", {
      path: condExcessMirrorPath,
      value: condExcessMirror,
      name: ct.ch("excessMirror"),
      states: {
        on: {
          fields: [{
            node: c6ExcessMirror_critRate_
          }, {
            node: c6ExcessMirror_critDMG_
          }, {
            text: stg("duration"),
            value: dm.constellation6.duration,
            unit: "s"
          }]
        }
      }
    })]),
  }
}

export default new CharacterSheet(sheet, data)
