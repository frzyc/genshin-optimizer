import { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import { equal, greaterEq, infoMut, lookup, naught, one, percent, prod, sum } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode, shieldElement, shieldNodeTalent } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Layla"
const elementKey: ElementKey = "cryo"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
    ]
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    starDmg: skillParam_gen.skill[s++],
    shieldHp_: skillParam_gen.skill[s++],
    shieldBase: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    slugDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    shield_: skillParam_gen.passive1[0][0],
    maxStacks: 4,
  },
  passive2: {
    starHpDmgInc: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    shield_: skillParam_gen.constellation1[0],
    partyShield_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation4: {
    normalChargedDmgInc: skillParam_gen.constellation4[0],
    effectDuration: skillParam_gen.constellation4[1],
    removeAfter: skillParam_gen.constellation4[2],
  },
  constellation6: {
    starIntervalDec_: skillParam_gen.constellation6[0],
    starSlugDmg_: skillParam_gen.constellation6[1],
  },
} as const

const [condA1StacksPath, condA1Stacks] = cond(key, "a1Stacks")
const a1StacksArr = range(1, dm.passive1.maxStacks)
const a1Shield_disp = greaterEq(input.asc, 1, lookup(condA1Stacks, Object.fromEntries(
  a1StacksArr.map(stack => [
    stack,
    prod(stack, dm.passive1.shield_)
  ])
), naught), { ...KeyMap.info("shield_"), isTeamBuff: true })
const a1Shield_ = equal(input.activeCharKey, target.charKey, a1Shield_disp)

const a4_starDmgInc = greaterEq(input.asc, 4, prod(
  percent(dm.passive2.starHpDmgInc),
  input.total.hp
), { name: ct.ch(`starDmgInc`) })

const [condC4ActivePath, condC4Active] = cond(key, "c4Active")
const c4_normal_dmgInc = greaterEq(input.constellation, 4, equal(condC4Active, "on",
  prod(
    percent(dm.constellation4.normalChargedDmgInc),
    input.total.hp
  )
))
const c4_charged_dmgInc = {...c4_normal_dmgInc}

const c6_starDmg_ = greaterEq(input.constellation, 6, percent(dm.constellation6.starSlugDmg_))
const c6_slugDmg_ = {...c6_starDmg_}

// TODO: Check if this produces the correct output. Maybe we need to multiply the MV by 120%?
const skillShield = prod(
  sum(
    one,
    greaterEq(input.constellation, 1,
      dm.constellation1.shield_, { name: ct.ch(`c1ShieldBonusKey_`), unit: "%" }
    ),
  ),
  shieldNodeTalent("hp", dm.skill.shieldHp_, dm.skill.shieldBase, "skill")
)
const skillCryoShield = shieldElement("cryo", skillShield)
const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", dm.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", dm.charged.dmg2, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    skillDmg: dmgNode("atk", dm.skill.skillDmg, "skill"),
    starDmg: dmgNode("atk", dm.skill.starDmg, "skill", { premod: {
      skill_dmgInc: a4_starDmgInc,
      skill_dmg_: c6_starDmg_
    } }),
    skillShield,
    skillCryoShield,
  },
  burst: {
    slugDmg: dmgNode("hp", dm.burst.slugDmg, "burst", { premod: { burst_dmg_: c6_slugDmg_ } }),
  },
  constellation1: {
    partyShield: greaterEq(input.constellation, 1,
      prod(percent(dm.constellation1.partyShield_), skillShield)
    ),
    partyCryoShield: greaterEq(input.constellation, 1,
      prod(percent(dm.constellation1.partyShield_), skillCryoShield)
    )
  }
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "sumeru", data_gen, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
  },
  teamBuff: {
    premod: {
      shield_: a1Shield_,
      normal_dmgInc: c4_normal_dmgInc,
      charged_dmgInc: c4_charged_dmgInc
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {  auto: ct.talentTem("auto", [{
        text: ct.chg("auto.fields.normal"),
      }, {
        fields: dm.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
        }))
      }, {
        text: ct.chg("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg1, { name: ct.chg(`auto.skillParams.3`), textSuffix: "(1)" }),
        }, {
          node: infoMut(dmgFormulas.charged.dmg2, { name: ct.chg(`auto.skillParams.3`), textSuffix: "(2)" }),
        }, {
          text: ct.chg("auto.skillParams.4"),
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
          node: infoMut(dmgFormulas.skill.skillDmg, { name: ct.chg(`skill.skillParams.0`) }),
        }, {
          node: infoMut(dmgFormulas.skill.starDmg, { name: ct.chg(`skill.skillParams.1`) }),
        }, {
          node: infoMut(dmgFormulas.skill.skillShield, { name: stg("dmgAbsorption") }),
        }, {
          node: infoMut(dmgFormulas.skill.skillCryoShield, { name: st(`dmgAbsorption.${elementKey}`), variant: elementKey }),
        }, {
          text: stg("duration"),
          value: dm.skill.shieldDuration,
          unit: 's'
        }, {
          text: stg("cd"),
          value: dm.skill.cd,
          unit: 's'
        }]
      }, ct.condTem("passive1", {
        teamBuff: true,
        path: condA1StacksPath,
        value: condA1Stacks,
        name: st("stacks"),
        states: Object.fromEntries(a1StacksArr.map(stack => [
          stack,
          {
            name: st("stack", { count: stack }),
            fields: [{
              node: a1Shield_disp
            }]
          }
        ]))
      }), ct.headerTem("passive2", {
        fields: [{
          node: a4_starDmgInc
        }]
      }), ct.headerTem("constellation1", {
        fields: [{
          node: infoMut(dmgFormulas.constellation1.partyShield, { name: stg("dmgAbsorption") })
        }, {
          node: infoMut(dmgFormulas.constellation1.partyCryoShield, { name: st(`dmgAbsorption.${elementKey}`), variant: elementKey })
        }]
      }), ct.condTem("constellation4", {
        teamBuff: true,
        value: condC4Active,
        path: condC4ActivePath,
        name: ct.ch("c4CondKey"),
        states: {
          on: {
            fields: [{
              node: c4_normal_dmgInc,
            }, {
              node: c4_charged_dmgInc
            }, {
              text: stg("duration"),
              value: dm.constellation4.effectDuration,
              unit: "s"
            }]
          }
        }
      }), ct.headerTem("constellation6", {
        fields: [{
          node: infoMut(c6_starDmg_, { name: ct.ch(`starDmg_`) })
        }, {
          text: ct.ch("starInterval_"),
          value: -dm.constellation6.starIntervalDec_ * 100,
          unit: "%"
        }]
      })]),

      burst: ct.talentTem("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.slugDmg, { name: ct.chg(`burst.skillParams.0`) }),
        }, {
          text: stg("duration"),
          value: dm.burst.duration,
          unit: "s"
        }, {
          text: stg("cd"),
          value: dm.burst.cd,
          unit: "s"
        }, {
          text: stg("energyCost"),
          value: dm.burst.energyCost,
        }]
      }, ct.headerTem("constellation6", {
        fields: [{
          node: infoMut(c6_slugDmg_, { name: ct.ch(`slugDmg_`) })
        }]
      })]),

      passive1: ct.talentTem("passive1"),
      passive2: ct.talentTem("passive2"),
      constellation1: ct.talentTem("constellation1"),
      constellation2: ct.talentTem("constellation2"),
      constellation3: ct.talentTem("constellation3", [{ fields: [{ node: skillC3 }] }]),
      constellation4: ct.talentTem("constellation4"),
      constellation5: ct.talentTem("constellation5", [{ fields: [{ node: burstC5 }] }]),
      constellation6: ct.talentTem("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data)
