import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Ganyu"
const elementKey: ElementKey = "cryo"
const region: Region = "liyue"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    frostflake: skillParam_gen.auto[a++],
    frostflakeBloom: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    inheritedHp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[p1++][0],
    critRateInc: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    cryoDmgBonus: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    opCryoRes: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    enerRegen: skillParam_gen.constellation1[2],
  }
} as const

const [condA1Path, condA1] = cond(key, "A1")
const [condA4Path, condA4] = cond(key, "A4")
const [condC1Path, condC1] = cond(key, "C1")
const [condC4Path, condC4] = cond(key, "C4")
const cryo_enemyRes_ = greaterEq(input.constellation, 1, equal("on", condC1, percent(datamine.constellation1.opCryoRes)))
const cryo_dmg_disp = greaterEq(input.asc, 4, equal("on", condA4, percent(datamine.passive2.cryoDmgBonus)))
const cryo_dmg_ = equal(input.activeCharKey, target.charKey, cryo_dmg_disp)
const all_dmg_ = greaterEq(input.constellation, 4,
  lookup(condC4, Object.fromEntries(range(1, 5).map(i => [i, percent(0.05 * i)])), naught))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('cryo') } }),
    frostflake: dmgNode("atk", datamine.charged.frostflake, "charged",
      { premod: { critRate_: greaterEq(input.asc, 1, equal(condA1, "on", percent(datamine.passive1.critRateInc))) }, hit: { ele: constant('cryo') } }),
    frostflakeBloom: dmgNode("atk", datamine.charged.frostflakeBloom, "charged",
      { premod: { critRate_: greaterEq(input.asc, 1, equal(condA1, "on", percent(datamine.passive1.critRateInc))) }, hit: { ele: constant('cryo') } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    inheritedHp: prod(subscript(input.total.skillIndex, datamine.skill.inheritedHp), input.total.hp),
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      cryo_dmg_,
      all_dmg_,
      cryo_enemyRes_,
    },
  }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: talentTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), undefined, undefined, [{
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey),
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          }))
        ),
        text: tr("auto.fields.normal")
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
          node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.6` }),
        }, {
          node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.7` }),
        }, {
          node: infoMut(dmgFormulas.charged.frostflake, { key: `char_${key}_gen:auto.skillParams.8` }),
        }, {
          node: infoMut(dmgFormulas.charged.frostflakeBloom, { key: `char_${key}_gen:auto.skillParams.9` }),
        }]),
        text: tr("auto.fields.charged"),
      }, sectionTemplate("passive1", tr, passive1, undefined, {
        value: condA1,
        path: condA1Path,
        canShow: greaterEq(input.asc, 1, 1),
        name: trm("a1.condName"),
        states: {
          on: {
            fields: [{
              text: trm("a1.critRateInc"),
              value: datamine.passive1.critRateInc * 100,
              unit: "%"
            }, {
              text: sgt("duration"),
              value: `${datamine.passive1.duration}s`,
            }]
          }
        }
      }), sectionTemplate("constellation1", tr, c1, undefined, {
        value: condC1,
        path: condC1Path,
        canShow: greaterEq(input.constellation, 1, 1),
        name: trm("c1.condName"),
        teamBuff: true,
        states: {
          on: {
            fields: [{
              node: cryo_enemyRes_
            }, {
              text: sgt("duration"),
              value: `${datamine.constellation1.duration}s`,
            }]
          }
        }
      }), {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }]),
        text: tr("auto.fields.plunging"),
      }]),
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.inheritedHp, { key: `char_${key}_gen:skill.skillParams.0`, variant: "success" }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        text: tr("skill.skillParams.2"),
        value: `${datamine.skill.duration}s`,
      }, {
        text: tr("skill.skillParams.3"),
        value: `${datamine.skill.cd}s`,
      }, {
        canShow: (data) => data.get(input.constellation).value >= 2,
        text: st("charges"),
        value: 2,
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.1"),
        value: `${datamine.burst.duration}s`,
      }, {
        text: tr("burst.skillParams.2"),
        value: `${datamine.burst.cd}s`,
      }, {
        text: tr("burst.skillParams.3"),
        value: `${datamine.burst.enerCost}`,
      }], undefined, [
        sectionTemplate("passive2", tr, passive2, undefined, {
          value: condA4,
          path: condA4Path,
          canShow: greaterEq(input.asc, 4, 1),
          teamBuff: true,
          name: st("activeCharField"),
          states: {
            on: {
              fields: [{
                node: infoMut(cryo_dmg_disp, { key: "cryo_dmg_", variant: "cryo" })
              }]
            }
          }
        }), sectionTemplate("constellation4", tr, c4, undefined, {
          value: condC4,
          path: condC4Path,
          canShow: greaterEq(input.constellation, 4, 1),
          teamBuff: true,
          name: st("opponentsField"),
          states: Object.fromEntries(range(1, 5).map(i => [i, {
          name: st("seconds", { count: (i - 1) * 3 }),
            fields: [{ node: all_dmg_ }, { text: trm("c4.lingerDuration"), value: 3, unit: "s" }]
          }]))
        }),
      ]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
