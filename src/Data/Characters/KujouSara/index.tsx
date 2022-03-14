import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "KujouSara"
const [tr, trm] = trans("char", key)

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
const skillTenguAmbush_ = equal(target.activeCharKey, target.charKey, equal("TenguJuuraiAmbush", condSkillTenguAmbush,
  prod(input.base.atk, subscript(input.total.skillIndex, datamine.skill.atkBonus.map(x => x), { key: '_' }))))

const [condC6Path, condC6] = cond(key, "c6")
const c6ElectroCritDmg_ = equal("c6", condC6, percent(datamine.constellation6.atkInc))

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
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "electro",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) =>
            ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.5` }),
            }, {
              node: infoMut(dmgFormulas.charged.fullyAimed, { key: `char_${key}_gen:auto.skillParams.6` }),
            }]
          }, {
            text: tr("auto.fields.plunging"),
            fields: [{
              node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
            }, {
              node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
            }, {
              node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
            }]
          }
        ],
      },
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: tr("skill.skillParams.2"),
        value: `${datamine.skill.duration}s`,
      }, {
        text: tr("skill.skillParams.3"),
        value: `${datamine.skill.cd}s`,
      }], {
        value: condSkillTenguAmbush,
        path: condSkillTenguAmbushPath,
        name: trm("skill.ambush"),
        teamBuff: true,
        states: {
          TenguJuuraiAmbush: {
            fields: [{
              node: skillTenguAmbush_
            }]
          }
        }
      }),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.titanbreaker, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.stormcluster, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        text: tr("burst.skillParams.2"),
        value: `${datamine.burst.cd}s`,
      }, {
        text: tr("burst.skillParams.3"),
        value: `${datamine.burst.enerCost}`,
      }]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2, [{
        canShow: data => data.get(input.asc).value >= 4,
        text: trm("a4.enerRest"),
        value: data => data.get(input.total.enerRech_).value * datamine.passive2.energyGen
      }]),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2, [{
        node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }]),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        canShow: greaterEq(input.constellation, 6, 1),
        name: trm("c6.electroCritDmg"),
        states: {
          c6: {
            fields: [{
              node: c6ElectroCritDmg_,
            }]
          }
        }
      }),
    },
  },
};
export default new CharacterSheet(sheet, data);
