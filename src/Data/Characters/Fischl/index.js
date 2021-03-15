import card from './Character_Fischl_Card.jpg'
import thumb from './Character_Fischl_Thumb.png'
import c1 from './Constellation_Gaze_of_the_Deep.png'
import c2 from './Constellation_Devourer_of_All_Sins.png'
import c3 from './Constellation_Wings_of_Nightmare.png'
import c4 from './Constellation_Her_Pilgrimage_of_Bleak.png'
import c5 from './Constellation_Against_the_Fleeing_Light.png'
import c6 from './Constellation_Evernight_Raven.png'
import normal from './Talent_Bolts_of_Downfall.png'
import skill from './Talent_Nightrider.png'
import burst from './Talent_Midnight_Phantasmagoria.png'
import passive1 from './Talent_Stellar_Predator.png'
import passive2 from './Talent_Lightning_Smite.png'
import passive3 from './Talent_Mein_Hausgarten.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Fischl",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Corvus",
  titles: ["Prinzessin der Verurteilung", "Sovereign of Immernachtreich", "Ruler of the Ashen Darkness"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Bolts of Downfall",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 consecutive shots with a bow.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, the dark lightning spirits of Immernachtreich shall heed the call of their Prinzessin and indwell the enchanted arrowhead. When fully indwelt, the Rachsüchtig Blitz shall deal immense <span className="text-electro">Electro DMG</span>.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.aimedShot[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.aimShot,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Fully-Charged Aimed Shot DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.fullAimedShot[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>,
          formula: formula.charged.fullAimedShot,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats, true),
        }, (c, a) => a >= 1 && {
          text: <span>Full Aimed Shot on Oz <span className="text-electro">AoE</span></span>,
          formulaText: (tlvl, stats) => <span>152.7% * {data.charged.fullAimedShot[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>,
          formula: formula.charged.fullAimedShot,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats, true),
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `Low Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.low[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `High Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.high[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }]
      }],
    },
    skill: {
      name: "Nightrider",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Summons Oz. The night raven forged of darkness and lightning descends upon the land, dealing <span className="text-electro">Electro DMG</span> in a small AoE.</p>
          <p className="mb-0">For the ability's duration, Oz will continuously attack nearby opponents with <span className="text-electro">Freikugel</span>.</p>
          <p className="mb-0">Hold to adjust the location Oz will be summoned to.</p>
          <p className="mb-0">Press again any time during the ability's duration to once again summon him to Fischl's side.</p>
        </span>,
        fields: [{
          text: "Oz's ATK DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.oz[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.oz,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, (con, a) => ({
          text: "Summoning DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.dmg[tlvl]}%{stats.constellation >= 2 ? " + 200%" : ""} {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }), (con, a) => con >= 6 && {
          text: "Attack with Active Character",
          formulaText: (tlvl, stats) => <span>30% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.activeChar,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, (c, a) => ({
          text: "Duration",
          value: c < 6 ? "10s" : "10s + 2s",
        }), {
          text: "CD",
          value: "25s",
        }, (c, a) => c >= 2 && {
          text: "AoE Increase",
          value: "50%",
        }]
      }],
    },
    burst: {
      name: "Midnight Phantasmagoria",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Summons Oz to spread his twin wings of twilight and defend Fischl. Has the following properties during the ability's duration:</p>
          <ul>
            <li>Fischl takes on Oz's form, greatly increasing her Movement Speed.</li>
            <li>Strikes nearby opponents with lightning, dealing <span className="text-electro">Electro DMG</span> to opponents she comes in contact with. Each opponent can only be struck once.</li>
            <li>Once this ability's effects end, Oz will remain on the battlefield and attack his Prinzessin's foes. If Oz is already on the field, then this will reset the duration of his presence.</li>
          </ul>
        </span>,
        fields: [{
          text: "Falling Thunder DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, (con, a) => con >= 4 && {
          text: "Additional AoE Damage",
          formulaText: (tlvl, stats) => <span>222% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.addDmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, (con, a) => con >= 4 && {
          text: "HP Recovered",
          formulaText: (tlvl, stats) => <span>( 20% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.regen,
          variant: "success"
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        },]
      }],
    },
    passive1: {
      name: "Stellar Predator",
      img: passive1,
      document: [{ text: <span>When Fischl hits <b>Oz</b> with a fully-charged <b>Aimed Shot</b>, Oz brings down Thundering Retribution, dealing <span className="text-electro">AoE Electro DMG</span> equal to 152.7% of the arrow's DMG.</span> }],
    },
    passive2: {
      name: "Undone Be Thy Sinful Hex",
      img: passive2,
      document: [{
        text: <span>If your active character triggers an <span className="text-electro">Electro-related Elemental Reaction</span> when Oz is on the field, the opponent shall be stricken with Thundering Retribution, dealing <span className="text-electro">Electro DMG</span> equal to 80% of Fischl's ATK.</span>,
        fields: [(con, a) => a >= 4 && {
          text: "Thundering Retribution",
          formulaText: (tlvl, stats) => <span>80% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.passive2.thunderRetri,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }]
      }],
    },
    passive3: {
      name: "Mein Hausgarten",
      img: passive3,
      document: [{ text: <span>When dispatched on an expedition in Mondstadt, the time consumed is reduced by 25%.</span> }],
    },
    constellation1: {
      name: "Gaze of the Deep",
      img: c1,
      document: [{
        text: <span>Even when Oz is not present in combat, he can still watch over Fischl through the crow's eyes. When Fischl attacks an opponent, Oz fires a joint attack through the crow's eyes, dealing 22% of <span className="text-physical">ATK DMG</span>.</span>,
        fields: [(con) => con >= 1 && {
          text: "Joint Attack DMG",
          formulaText: (tlvl, stats) => <span>22% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.constellation1.jointAttDmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }]
      }],
    },
    constellation2: {
      name: "Devourer of All Sins",
      img: c2,
      document: [{ text: <span>When <b>Nightrider</b> is used, it deals an additional 200% ATK as DMG, and its AoE is increased by 50%.</span> }],
    },
    constellation3: {
      name: "Wings of Nightmare",
      img: c3,
      document: [{ text: <span>Increases <b>Nightrider</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Her Pilgrimage of Bleak",
      img: c4,
      document: [{ text: <span>When <b>Midnight Phantasmagoria</b> is used, deals 222% of ATK as <span className="text-electro">Electro DMG</span> to surrounding opponents. When the skill duration ends, Fischl recovers 20% of her HP.</span> }],
    },
    constellation5: {
      name: "Against the Fleeing Light",
      img: c5,
      document: [{ text: <span>Increases <b>Midnight Phantasmagoria</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Evernight Raven",
      img: c6,
      document: [{ text: <span>Increases the duration of Oz's summoning by 2s. Additionally, Oz attacks with your active character when present, dealing 30% of Fischl's ATK as <span className="text-electro">Electro DMG</span>.</span> }],
    }
  },
};
export default char;
