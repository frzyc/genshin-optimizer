import card from './Character_Albedo_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Flower_of_Eden.png'
import c2 from './Constellation_Opening_of_Phanerozoic.png'
import c3 from './Constellation_Grace_of_Helios.png'
import c4 from './Constellation_Descent_of_Divinity.png'
import c5 from './Constellation_Tide_of_Hadaen.png'
import c6 from './Constellation_Dust_of_Purification.png'
import normal from './Talent_Favonius_Bladework_-_Weiss.png'
import skill from './Talent_Abiogenesis_-_Solar_Isotoma.png'
import burst from './Talent_Rite_of_Progeniture_-_Tectonic_Tide.png'
import passive1 from './Talent_Calcite_Might.png'
import passive2 from './Talent_Homuncular_Nature.png'
import passive3 from './Talent_Flash_of_Genius_(Albedo).png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant, } from "../../../Build/Build"
import { ICharacterSheet } from '../../../Types/character'
import { IConditionals } from '../../../Types/IConditional'
import { Translate } from '../../../Components/Translate'
import { plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Albedo_gen" key18={strKey} />
const conditionals: IConditionals = {
  a4: { // Homuncular Nature
    canShow: stats => stats.ascension >= 4,
    name: "Using Tectonic Tide",
    stats: {//TODO: team buff
      eleMas: 125,
    }
  },
  c4: { // Descent Of Divinity
    canShow: stats => stats.constellation >= 4,
    name: "Within the Solar Isotoma",
    stats: {//TODO: team buff
      plunging_dmg_: 30,
    }
  },
  c6: { // Dust Of Purification
    canShow: stats => stats.constellation >= 6,
    name: "Protected by a shield created by Crystallize",
    stats: {//TODO: team buff
      dmg_: 17,
    }
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "geo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  baseStat: data_gen.base,
  baseStatCurve: data_gen.curves,
  ascensions: data_gen.ascensions,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normal,
        sections: [{
          text: tr(`auto.fields.normal`),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + 1}-Hit DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats)
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            text: `Charged 1-Hit DMG`,
            formulaText: stats => <span>{data.charged.atk1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.atk1,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: `Charged 2-Hit DMG`,
            formulaText: stats => <span>{data.charged.atk2[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.atk2,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: `Stamina Cost`,
            value: 20,
          }]
        }, plungeDocSection(tr, formula, data)]
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Place DMG",
            formulaText: stats => <span>{data.skill.press[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.press,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Transient Blossom DMG",
            formulaText: stats => <span>{data.skill.blossom[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
            formula: formula.skill.blossom,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.ascension >= 1,
            text: "Transient Blossom DMG < 50% HP",
            formulaText: stats => {
              const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
              return <span>{data.skill.blossom[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} * {(hitModeMultiKey ? <span>{Stat.printStat(hitModeMultiKey, stats)} * </span> : "")}( {Stat.printStat("geo_skill_hit_base_multi", stats)} + 25%) * {Stat.printStat("enemyLevel_multi", stats)} * {Stat.printStat("geo_enemyRes_multi", stats)}</span>
            },
            formula: formula.skill.blossom50,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Burst DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          },
          ...[...Array(4).keys()].map(i => i + 1).map(i => ({
            canShow: stats => stats.constellation >= 2,
            text: `Burst DMG C2 ${i} Stack`,
            formulaText: stats => <span>( {data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {30 * i}% {Stat.printStat("finalDEF", stats)}) * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
            formula: formula.burst[`dmg${i}c2`],
            variant: stats => getTalentStatKeyVariant("burst", stats),
          })),
          {
            text: "Fatal Blossom DMG",
            formulaText: stats => <span>{data.burst.blossom[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.blossom,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          },
          ...[...Array(4).keys()].map(i => i + 1).map(i => ({
            canShow: stats => stats.constellation >= 2,
            text: `Fatal Blossom DMG C2 ${i} Stack`,
            formulaText: stats => <span>( {data.burst.blossom[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {30 * i}% {Stat.printStat("finalDEF", stats)}) * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
            formula: formula.burst[`blossom${i}c2`],
            variant: stats => getTalentStatKeyVariant("burst", stats),
          })), {
            text: "CD",
            value: "12s"
          }, {
            text: "Energy Cost",
            value: 40
          }]
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a4
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: conditionals.c4
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: conditionals.c6
        }],
      }
    },
  },
};
export default char;
