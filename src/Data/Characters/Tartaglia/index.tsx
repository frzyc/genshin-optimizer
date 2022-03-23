import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, greaterEq, infoMut } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Tartaglia"
const elementKey: ElementKey = "hydro"
const region: Region = "snezhnaya"
const [tr] = trans("char", key)

let a = 0, s = 0, b = 0, p1 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  riptide: {
    flashDmg: skillParam_gen.auto[a++],
    burstDmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  riptideDuration: skillParam_gen.auto[a++][0],
  skill: {
    stanceDmg: skillParam_gen.skill[s++],
    normal1: skillParam_gen.skill[s++],
    normal2: skillParam_gen.skill[s++],
    normal3: skillParam_gen.skill[s++],
    normal4: skillParam_gen.skill[s++],
    normal5: skillParam_gen.skill[s++],
    normal61: skillParam_gen.skill[s++], // 6.1
    normal62: skillParam_gen.skill[s++], // 6.2
    charged1: skillParam_gen.skill[s++],
    charged2: skillParam_gen.skill[s++],
    riptideSlash: skillParam_gen.skill[s++],
    chargedStamina: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    preemptiveCd1: skillParam_gen.skill[s++][0],
    preemptiveCd2: skillParam_gen.skill[s++][0],
    maxCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    meleeDmg: skillParam_gen.burst[b++],
    riptideBlastDmg: skillParam_gen.burst[b++],
    rangedDmg: skillParam_gen.burst[b++],
    enerReturned: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    durationExt: skillParam_gen.passive1[p1++][0],
  },
  passive: {
    auto_boost: 1,
  },
  constellation1: {
    cdRed: 0.2
  }
} as const

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('hydro') } }),
    flashDmg: dmgNode("atk", datamine.riptide.flashDmg, "normal", { hit: { ele: constant('hydro') } }),
    burstDmg: dmgNode("atk", datamine.riptide.burstDmg, "normal", { hit: { ele: constant('hydro') } })
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    stanceDmg: dmgNode("atk", datamine.skill.stanceDmg, "skill"),
    normal1: dmgNode("atk", datamine.skill.normal1, "normal", { hit: { ele: constant('hydro') } }),
    normal2: dmgNode("atk", datamine.skill.normal2, "normal", { hit: { ele: constant('hydro') } }),
    normal3: dmgNode("atk", datamine.skill.normal3, "normal", { hit: { ele: constant('hydro') } }),
    normal4: dmgNode("atk", datamine.skill.normal4, "normal", { hit: { ele: constant('hydro') } }),
    normal5: dmgNode("atk", datamine.skill.normal5, "normal", { hit: { ele: constant('hydro') } }),
    normal61: dmgNode("atk", datamine.skill.normal61, "normal", { hit: { ele: constant('hydro') } }),
    normal62: dmgNode("atk", datamine.skill.normal62, "normal", { hit: { ele: constant('hydro') } }),
    charged1: dmgNode("atk", datamine.skill.charged1, "normal", { hit: { ele: constant('hydro') } }),
    charged2: dmgNode("atk", datamine.skill.charged2, "normal", { hit: { ele: constant('hydro') } }),
    riptideSlash: dmgNode("atk", datamine.skill.riptideSlash, "skill")
  },
  burst: {
    meleeDmg: dmgNode("atk", datamine.burst.meleeDmg, "burst"),
    rangedDmg: dmgNode("atk", datamine.burst.rangedDmg, "burst"),
    riptideBlastDmg: dmgNode("atk", datamine.burst.riptideBlastDmg, "burst")
  }
}

const nodePassive = constant(1)

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  teamBuff: {
    bonus: {
      auto: nodePassive,
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
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
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
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.6` }),
            }, {
              node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.7` }),
            }]
          }, {
            text: tr("auto.fields.riptide"),
            fields: [{
              node: infoMut(dmgFormulas.charged.flashDmg, { key: `char_${key}_gen:auto.skillParams.8` }),
              textSuffix: st("brHits", { count: 3 })
            }, {
              node: infoMut(dmgFormulas.charged.burstDmg, { key: `char_${key}_gen:auto.skillParams.9` }),
            }, {
              text: tr("auto.skillParams.10"),
              value: (data) => data.get(input.asc).value >= 1 ? datamine.passive1.durationExt + datamine.riptideDuration : datamine.riptideDuration,
              unit: "s"
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
        node: infoMut(dmgFormulas.skill.stanceDmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.normal1, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.skill.normal2, { key: `char_${key}_gen:skill.skillParams.2` }),
      }, {
        node: infoMut(dmgFormulas.skill.normal3, { key: `char_${key}_gen:skill.skillParams.3` }),
      }, {
        node: infoMut(dmgFormulas.skill.normal4, { key: `char_${key}_gen:skill.skillParams.4` }),
      }, {
        node: infoMut(dmgFormulas.skill.normal5, { key: `char_${key}_gen:skill.skillParams.5` }),
      }, {
        node: infoMut(dmgFormulas.skill.normal61, { key: `char_${key}_gen:skill.skillParams.6` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.skill.normal62, { key: `char_${key}_gen:skill.skillParams.6` }),
        textSuffix: "(2)"
      }, {
        node: infoMut(dmgFormulas.skill.charged1, { key: `char_${key}_gen:skill.skillParams.7` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.skill.charged2, { key: `char_${key}_gen:skill.skillParams.7` }),
        textSuffix: "(2)"
      }, {
        node: infoMut(constant(datamine.skill.chargedStamina), { key: `char_${key}_gen:skill.skillParams.8` }),
      }, {
        node: infoMut(dmgFormulas.skill.riptideSlash, { key: `char_${key}_gen:skill.skillParams.9` }),
      }, {
        text: tr("skill.skillParams.10"),
        value: datamine.skill.duration,
        unit: "s"
      }, {
        text: tr("skill.skillParams.11"),
        value: (data) => data.get(input.constellation).value >= 1 ? `${datamine.skill.preemptiveCd1 -
          (datamine.skill.preemptiveCd1 * datamine.constellation1.cdRed)} - ${datamine.skill.preemptiveCd2 -
          (datamine.skill.preemptiveCd2 * datamine.constellation1.cdRed)}` : `${datamine.skill.preemptiveCd1} -
          ${datamine.skill.preemptiveCd2}`,
        unit: "s"
      }, {
        text: tr("skill.skillParams.12"),
        value: (data) => data.get(input.constellation).value >= 1 ? `${datamine.skill.maxCd - (datamine.skill.maxCd *
          datamine.constellation1.cdRed)}` : `${datamine.skill.maxCd}`,
        unit: "s"
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.meleeDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.rangedDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.burst.riptideBlastDmg, { key: `char_${key}_gen:burst.skillParams.2` }),
      }, {
        text: tr("burst.skillParams.4"),
        value: `${datamine.burst.cd}`,
        unit: "s"
      }, {
        text: tr("burst.skillParams.5"),
        value: `${datamine.burst.enerCost}`,
      }, {
        text: tr("burst.skillParams.3"),
        value: `${datamine.burst.enerReturned}`,
      }]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3, [{ node: nodePassive }]),
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
