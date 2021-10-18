import card from './Character_Kaeya_Card.jpg'
import thumb from './Character_Kaeya_Thumb.png'
import c1 from './Constellation_Excellent_Blood.png'
import c2 from './Constellation_Never-Ending_Performance.png'
import c3 from './Constellation_Dance_of_Frost.png'
import c4 from './Constellation_Frozen_Kiss.png'
import c5 from './Constellation_Frostbiting_Embrace.png'
import c6 from './Constellation_Glacial_Whirlwind.png'
import normal from './Talent_Ceremonial_Bladework.png'
import skill from './Talent_Frostgnaw.png'
import burst from './Talent_Glacial_Waltz.png'
import passive1 from './Talent_Cold-Blooded_Strike.png'
import passive2 from './Talent_Heart_of_the_Abyss.png'
import passive3 from './Talent_Hidden_Strength.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { chargedHitsDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Kaeya_gen" key18={strKey} />
const conditionals: IConditionals = {
  c1: { // ColdBloodedStrike
    canShow: stats => stats.constellation >= 1,
    name: <span>Opponent affected by <ColorText color="cryo">Cryo</ColorText></span>,
    stats: {
      normal_critRate_: 15,
      charged_critRate_: 15
    }
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  star: data_gen.star,
  elementKey: "cryo",
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
        sections: [
          normalDocSection(tr, formula, data),
          chargedHitsDocSection(tr, formula, data),
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "6s",
          }],
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Icicles DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Duration",
            value: "8s",
          }, {
            text: "CD",
            value: "15s",
          }, {
            text: "Energy Cost",
            value: 60,
          }, {
            canShow: stats => stats.constellation >= 2,
            text: "Increase duration by 2.5s per opponent defeated during, up to 15s"
          }],
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          fields: [{
            text: "Healing",
            formulaText: stats => <span>15% {Stat.printStat("finalATK", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.passive1.dmg,
            variant: "success",
          }],
        }],
      },
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3, { staminaSprintDec_: 20 }),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          conditional: conditionals.c1
        }]
      },
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          fields: [{
            canShow: stats => stats.constellation >= 4,
            text: <ColorText color="cryo">Shield DMG Absorption</ColorText>,
            formulaText: stats => <span>30% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="cryo">Cryo Absorption</ColorText>)</span>,
            formula: formula.constellation4.shieldCryo,
            variant: "cryo"
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Shield DMG Absorption",
            formulaText: stats => <span>30% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.constellation4.shield,
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Duration",
            value: "20s",
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "CD",
            value: "60s",
          }]
        }]
      },
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
