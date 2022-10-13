import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KujouSara"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p2 = 0
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
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    atkBonus: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    titanBreakerDmg: skillParam_gen.burst[b++],
    stormClusterDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    energyGen: skillParam_gen.passive2[p2++][0],
    er: skillParam_gen.passive2[p2++][0]
  },
  constellation2: {
    crowfeatherDmg: skillParam_gen.constellation2[0],
  },
  constellation6: {
    atkInc: skillParam_gen.constellation6[0],
  },
} as const

const [condSkillTenguAmbushPath, condSkillTenguAmbush] = cond(key, "TenguJuuraiAmbush")
const atkIncRatio = subscript(input.total.skillIndex, datamine.skill.atkBonus.map(x => x), { unit: "%" })
const skillTenguAmbush_disp = equal("TenguJuuraiAmbush", condSkillTenguAmbush,
  prod(input.base.atk, atkIncRatio)
)
const skillTenguAmbush_ = equal(input.activeCharKey, target.charKey, skillTenguAmbush_disp)

const [condC6Path, condC6] = cond(key, "c6")
const c6ElectroCritDmg_ = greaterEq(input.constellation, 6, equal("c6", condC6, percent(datamine.constellation6.atkInc)))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    fullyAimed: dmgNode("atk", datamine.charged.fullyAimed, "charged", { hit: { ele: constant('electro') } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    skillTenguAmbush_
  },
  burst: {
    titanbreaker: dmgNode("atk", datamine.burst.titanBreakerDmg, "burst"),
    stormcluster: dmgNode("atk", datamine.burst.stormClusterDmg, "burst"),
  },
  constellation2: {
    dmg: greaterEq(input.constellation, 2, prod(dmgNode("atk", datamine.skill.dmg, "skill"), percent(datamine.constellation2.crowfeatherDmg))),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, "electro", "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      electro_critDMG_: c6ElectroCritDmg_
    },
    total: {
      atk: skillTenguAmbush_
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey: "electro",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {  auto: ct.talentTem("auto", [{
        text: ct.chg("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) })
        }))
      }, {
        text: ct.chg("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.aimed, { name: ct.chg(`auto.skillParams.5`) }),
        }, {
          node: infoMut(dmgFormulas.charged.fullyAimed, { name: ct.chg(`auto.skillParams.6`) }),
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
          node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.0`) }),
        }, {
          text: ct.chg("skill.skillParams.2"),
          value: `${datamine.skill.duration}s`,
        }, {
          text: ct.chg("skill.skillParams.3"),
          value: `${datamine.skill.cd}s`,
        }]
      }, ct.condTem("skill", {
        value: condSkillTenguAmbush,
        path: condSkillTenguAmbushPath,
        name: ct.ch("skill.ambush"),
        teamBuff: true,
        states: {
          TenguJuuraiAmbush: {
            fields: [{
              text: ct.chg("skill.skillParams.1"),
              value: data => data.get(atkIncRatio).value * 100,
              unit: "%",
            }, {
              node: infoMut(skillTenguAmbush_disp, { name: st(`increase.atk`) })
            }]
          }
        }
      })]),

      burst: ct.talentTem("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.titanbreaker, { name: ct.chg(`burst.skillParams.0`) }),
        }, {
          node: infoMut(dmgFormulas.burst.stormcluster, { name: ct.chg(`burst.skillParams.1`) }),
        }, {
          text: ct.chg("burst.skillParams.2"),
          value: `${datamine.burst.cd}s`,
        }, {
          text: ct.chg("burst.skillParams.3"),
          value: `${datamine.burst.enerCost}`,
        }]
      }]),

      passive1: ct.talentTem("passive1"),
      passive2: ct.talentTem("passive2", [ct.fieldsTem("passive2", {
        fields: [{
          text: ct.ch("a4.enerRest"),
          value: data => data.get(input.total.enerRech_).value * datamine.passive2.energyGen,
          fixed: 2
        }]
      })]),
      passive3: ct.talentTem("passive3"),
      constellation1: ct.talentTem("constellation1"),
      constellation2: ct.talentTem("constellation2", [ct.fieldsTem("constellation2", {
        fields: [{
          node: infoMut(dmgFormulas.constellation2.dmg, { name: ct.chg(`skill.skillParams.0`) }),
        }]
      })]),
      constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTem("constellation4"),
      constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTem("constellation6", [ct.condTem("constellation6", {
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        name: ct.ch("c6.electroCritDmg"),
        states: {
          c6: {
            fields: [{
              node: c6ElectroCritDmg_,
            }]
          }
        }
      })]),
    },
  }
export default new CharacterSheet(sheet, data, assets)
