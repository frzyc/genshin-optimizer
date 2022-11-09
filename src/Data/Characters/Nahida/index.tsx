import { CharacterData } from 'pipeline'
import { input, tally, target } from '../../../Formula'
import { compareEq, constant, equal, greaterEq, infoMut, lookup, max, min, naught, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Nahida"
const elementKey: ElementKey = "dendro"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
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
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    karmaAtkDmg: skillParam_gen.skill[s++],
    karmaEleMasDmg: skillParam_gen.skill[s++],
    triggerInterval: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg_1: skillParam_gen.burst[b++],
    dmg_2: skillParam_gen.burst[b++],
    intervalDec_1: skillParam_gen.burst[b++],
    intervalDec_2: skillParam_gen.burst[b++],
    durationInc1: skillParam_gen.burst[b++],
    durationInc2: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas_: skillParam_gen.passive1[0][0],
    maxEleMas: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas_min: skillParam_gen.passive2[0][0],
    eleMas_maxCounted: skillParam_gen.passive2[1][0],
    eleMas_dmg_: skillParam_gen.passive2[2][0],
    eleMas_critRate_: skillParam_gen.passive2[3][0],
  },
  constellation2: {
    critRate_: skillParam_gen.constellation2[0],
    critDMG_: 1,
    defDec_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: [...skillParam_gen.constellation4]
  },
  constellation6: {
    atkDmg: skillParam_gen.constellation6[0],
    eleMasDmg: skillParam_gen.constellation6[1],
    cd: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
    triggers: skillParam_gen.constellation6[4],
  }
} as const

const [condPartyInBurstPath, condPartyInBurst] = cond(key, "partyInBurst")

const pyroLevel = sum(tally.pyro, greaterEq(input.constellation, 1, 1))
const burst_karma_dmg_ = equal(condPartyInBurst, "on", greaterEq(pyroLevel, 1,
  compareEq(pyroLevel, 1,
    subscript(input.total.burstIndex, dm.burst.dmg_1),
    subscript(input.total.burstIndex, dm.burst.dmg_2)
  )
), { unit: "%" })

const electroLevel = sum(tally.electro, greaterEq(input.constellation, 1, 1))
const burst_skillIntervalDec = equal(condPartyInBurst, "on", greaterEq(electroLevel, 1,
  compareEq(electroLevel, 1,
    subscript(input.total.burstIndex, dm.burst.intervalDec_1),
    subscript(input.total.burstIndex, dm.burst.intervalDec_2)
  )
), { unit: "%" })

const hydroLevel = sum(tally.hydro, greaterEq(input.constellation, 1, 1))
const burst_durationInc = equal(condPartyInBurst, "on", greaterEq(hydroLevel, 1,
  compareEq(hydroLevel, 1,
    subscript(input.total.burstIndex, dm.burst.durationInc1),
    subscript(input.total.burstIndex, dm.burst.durationInc2)
  )
), { unit: "%" })

const [condA1ActiveInBurstPath, condA1ActiveInBurst] = cond(key, "condA1ActiveInBurst")
const a1InBurst_eleMasDisp = greaterEq(input.asc, 1,
  equal(condA1ActiveInBurst, "on",
    min(
      prod(percent(dm.passive1.eleMas_), tally.maxEleMas),
      dm.passive1.maxEleMas
    )
  ),
  { ...KeyMap.info("eleMas"), isTeamBuff: true }
)
const a1InBurst_eleMas = equal(input.activeCharKey, target.charKey, a1InBurst_eleMasDisp)

const a4Karma_dmg_ = greaterEq(input.asc, 4,
  min(
    prod(
      percent(dm.passive2.eleMas_dmg_),
      max(
        sum(input.total.eleMas, -dm.passive2.eleMas_min),
        0
      )
    ),
    percent(dm.passive2.eleMas_dmg_ * dm.passive2.eleMas_maxCounted)
  ),
  { unit: "%" }
)
const a4Karma_critRate_ = greaterEq(input.asc, 4,
  min(
    prod(
      percent(dm.passive2.eleMas_critRate_),
      max(
        sum(input.total.eleMas, -dm.passive2.eleMas_min),
        0
      )
    ),
    percent(dm.passive2.eleMas_critRate_ * dm.passive2.eleMas_maxCounted)
  ),
  { unit: "%" }
)

const triKarmaAddl = {
  premod: {
    skill_dmg_: sum(a4Karma_dmg_, burst_karma_dmg_),
    skill_critRate_: a4Karma_critRate_
  }
}

const [condC2BloomPath, condC2Bloom] = cond(key, "c2Bloom")
const c2Burning_critRate_ = greaterEq(input.constellation, 2,
  equal(condC2Bloom, "on", percent(dm.constellation2.critRate_))
)
const c2Bloom_critRate_ = {...c2Burning_critRate_}
const c2Hyperbloom_critRate_ = {...c2Burning_critRate_}
const c2Burgeon_critRate_ = {...c2Burning_critRate_}
const c2Burning_critDMG_ = greaterEq(input.constellation, 2,
  equal(condC2Bloom, "on", percent(dm.constellation2.critDMG_))
)
const c2Bloom_critDMG_ = {...c2Burning_critDMG_}
const c2Hyperbloom_critDMG_ = {...c2Burning_critDMG_}
const c2Burgeon_critDMG_ = {...c2Burning_critDMG_}

const [condC2QSAPath, condC2QSA] = cond(key, "c2QSA")
const c2qsa_DefRed_ = greaterEq(input.constellation, 2,
  equal(condC2QSA, "on", percent(dm.constellation2.defDec_))
)

const [condC4CountPath, condC4Count] = cond(key, "c4Count")
const c4CountArr = range(1, 4)
const c4_eleMas = greaterEq(input.constellation, 4,
  lookup(condC4Count, Object.fromEntries(c4CountArr.map(count => [
    count,
    subscript(constant(count - 1), [...dm.constellation4.eleMas])
  ])), naught)
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
    pressDmg: dmgNode("atk", dm.skill.pressDmg, "skill"),
    holdDmg: dmgNode("atk", dm.skill.holdDmg, "skill"),
    karmaDmg: customDmgNode(
      sum(
        prod(
          subscript(input.total.skillIndex, dm.skill.karmaAtkDmg, { unit: "%" }),
          input.total.atk
        ),
        prod(
          subscript(input.total.skillIndex, dm.skill.karmaEleMasDmg, { unit: "%" }),
          input.total.eleMas
        ),
      ),
      "skill",
      triKarmaAddl
    )
  },
  passive2: {
    a4Karma_dmg_,
    a4Karma_critRate_
  },
  constellation6: {
    dmg: greaterEq(input.constellation, 6, customDmgNode(
      sum(
        prod(
          percent(dm.constellation6.atkDmg),
          input.total.atk
        ),
        prod(
          percent(dm.constellation6.eleMasDmg),
          input.total.eleMas
        ),
      ),
      "skill",
      triKarmaAddl
    ))
  }
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
const data = dataObjForCharacterSheet(key, elementKey, "sumeru", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC3,
    burst: burstC5
  },
  premod: {
    eleMas: c4_eleMas
  },
  teamBuff: {
    premod: {
      burning_critRate_: c2Burning_critRate_,
      bloom_critRate_: c2Bloom_critRate_,
      hyperbloom_critRate_: c2Hyperbloom_critRate_,
      burgeon_critRate_: c2Burgeon_critRate_,
      burning_critDMG_: c2Burning_critDMG_,
      bloom_critDMG_: c2Bloom_critDMG_,
      hyperbloom_critDMG_: c2Hyperbloom_critDMG_,
      burgeon_critDMG_: c2Burgeon_critDMG_,
      enemyDefRed_: c2qsa_DefRed_
    },
    total: {
      eleMas: a1InBurst_eleMas
    },
  }
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
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.4`) }),
      }, {
        text: ct.chg("auto.skillParams.5"),
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
        node: infoMut(dmgFormulas.skill.pressDmg, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.skill.holdDmg, { name: ct.chg(`skill.skillParams.1`) }),
      }, {
        node: infoMut(dmgFormulas.skill.karmaDmg, { name: ct.chg(`skill.skillParams.2`) }),
      }, {
        text: ct.chg("skill.skillParams.3"),
        value: (data) => {
          const intervalDec = +data.get(burst_skillIntervalDec).value.toFixed(2)
          return intervalDec !== 0
            ? `${dm.skill.triggerInterval}s - ${intervalDec}s = ${dm.skill.triggerInterval - intervalDec}`
            : dm.skill.triggerInterval
        },
        unit: "s",
        fixed: 1
      }, {
        text: ct.chg("skill.skillParams.4"),
        value: dm.skill.duration,
        unit: "s"
      }, {
        text: st("pressCD"),
        value: dm.skill.pressCd,
        unit: "s"
      }, {
        text: st("holdCD"),
        value: dm.skill.holdCd,
        unit: "s"
      }],
    }, ct.headerTem("burst", {
      canShow: equal(condPartyInBurst, "on", sum(pyroLevel, electroLevel)),
      fields: [{
        node: infoMut(burst_karma_dmg_, { name: ct.ch(`karmaDmg_`) })
      }, {
        text: ct.ch("karmaIntervalDec"),
        canShow: (data) => data.get(burst_skillIntervalDec).value > 0,
        value: (data) => data.get(burst_skillIntervalDec).value,
        unit: "s",
        fixed: 2
      }]
    }), ct.headerTem("passive2", {
      fields: [{
        node: infoMut(dmgFormulas.passive2.a4Karma_dmg_, { name: ct.ch(`karmaDmg_`) })
      }, {
        node: infoMut(dmgFormulas.passive2.a4Karma_critRate_, { name: ct.ch(`karmaCritRate_`) })
      }]
    }), ct.condTem("constellation2", {
      teamBuff: true,
      path: condC2BloomPath,
      value: condC2Bloom,
      name: ct.ch("c2.bloomCondName"),
      states: {
        on: {
          fields: [{
            node: c2Burning_critRate_
          }, {
            node: c2Burning_critDMG_
          }, {
            node: c2Bloom_critRate_
          }, {
            node: c2Bloom_critDMG_
          }, {
            node: c2Hyperbloom_critRate_
          }, {
            node: c2Hyperbloom_critDMG_
          }, {
            node: c2Burgeon_critRate_
          }, {
            node: c2Burgeon_critDMG_
          }]
        },
      }
    }), ct.condTem("constellation2", {
      teamBuff: true,
      path: condC2QSAPath,
      value: condC2QSA,
      name: ct.ch("c2.qasCondName"),
      states: {
        on: {
          fields: [{
            node: c2qsa_DefRed_
          }]
        }
      }
    }), ct.condTem("constellation4", {
      path: condC4CountPath,
      value: condC4Count,
      name: ct.ch("c4CondName"),
      states: Object.fromEntries(c4CountArr.map(count => [
        count,
        {
          name: st("opponents", { count }),
          fields: [{
            node: c4_eleMas
          }]
        }
      ]))
    }), ct.headerTem("constellation6", {
      fields: [{
        node: infoMut(dmgFormulas.constellation6.dmg, { name: ct.ch("c6KarmicDmg") })
      }]
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        text: stg("duration"),
        value: (data) => {
          const durInc = +data.get(burst_durationInc).value.toFixed(2)
          return durInc !== 0
            ? `${dm.burst.duration}s + ${durInc}s = ${dm.burst.duration + durInc}`
            : dm.burst.duration
        },
        unit: "s",
      }, {
        text: stg("cd"),
        value: dm.burst.cd,
        unit: "s",
        fixed: 1
      }, {
        text: stg("energyCost"),
        value: dm.burst.energyCost,
      }]
    }, ct.condTem("burst", {
      path: condPartyInBurstPath,
      value: condPartyInBurst,
      name: ct.ch("partyInBurst"),
      states: {
        on: {
          fields: [{
            canShow: (data) => data.get(sum(pyroLevel, electroLevel, hydroLevel)).value < 1,
            text: ct.ch("noBurstEffect"),
          }, {
            canShow: (data) => data.get(burst_durationInc).value !== 0,
            text: st("durationInc"),
            value: (data) => data.get(burst_durationInc).value,
            unit: "s",
            fixed: 2
          }]
        }
      }
    }), ct.condTem("passive1", {
      // Show for self only if party is in burst
      // Show for teammates always
      canShow: sum(
        equal(condPartyInBurst, "on", 1),
        unequal(input.activeCharKey, key, 1)
      ),
      teamBuff: true,
      path: condA1ActiveInBurstPath,
      value: condA1ActiveInBurst,
      name: st("activeCharField"),
      states: {
        on: {
          fields: [{
            node: a1InBurst_eleMasDisp
          }]
        }
      }
    }), ct.headerTem("constellation1", {
      fields: [{
        text: ct.ch("c1Key"),
        value: 1
      }]
    }), ct.condTem("constellation4", {
      // C4 conditional that shows in teambuffs when A1 is activated
      // In case Nahida is the one with the most elemental mastery
      canShow: unequal(input.activeCharKey, key, equal(condA1ActiveInBurst, "on", 1)),
      teamBuff: true,
      path: condC4CountPath,
      value: condC4Count,
      name: ct.ch("c4CondName"),
      states: Object.fromEntries(c4CountArr.map(count => [
        count,
        {
          name: st("opponents", { count }),
          fields: [{
            node: c4_eleMas
          }]
        }
      ]))
    })]),

    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  }
}
export default new CharacterSheet(sheet, data, assets)
