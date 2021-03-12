import card from './Character_Razor_Card.jpg'
import thumb from './Character_Razor_Thumb.png'
import c1 from './Constellation_Wolf\'s_Instinct.png'
import c2 from './Constellation_Suppression.png'
import c3 from './Constellation_Soul_Companion.png'
import c4 from './Constellation_Bite.png'
import c5 from './Constellation_Sharpened_Claws.png'
import c6 from './Constellation_Lupus_Fulguris.png'
import normal from './Talent_Steel_Fang.png'
import skill from './Talent_Claw_and_Thunder.png'
import burst from './Talent_Lightning_Fang.png'
import passive1 from './Talent_Awakening.png'
import passive2 from './Talent_Hunger.png'
import passive3 from './Talent_Wolvensprint.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import {
  getTalentStatKey,
  getTalentStatKeyVariant,
} from "../../../Build/Build"

const char = {
  name: "Razor",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "claymore",
  gender: "M",
  constellationName: "Lupus Minor",
  titles: ["Legend of Wolvendom", "Wolf Boy"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Steel Fang",
      img: normal,
      infusable: true,
      document: [
        {
          text: (
            <span>
              <strong>Normal Attack</strong> Perform up to 4 consecutive
              strikes.
            </span>
          ),
          fields: data.normal.hitArr.map((percentArr, i) => ({
            text: `${i + 1}-Hit DMG`,
            formulaText: (tlvl, stats) => (
              <span>
                {percentArr[tlvl]}%{" "}
                {Stat.printStat(getTalentStatKey("normal", stats), stats)}
              </span>
            ),
            formula: formula.normal[i],
            variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
          })),
        },
        {
          text: (
            <span>
              <strong>Charged Attack</strong> Drains Stamina over time to
              perform continuous spinning attacks against all nearby opponents.
              At end of the sequence, perform a more powerful slash.{" "}
            </span>
          ),
          fields: [
            {
              text: `Spinning DMG`,
              formulaText: (tlvl, stats) => (
                <span>
                  {data.charged.spinning[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("charged", stats), stats)}
                </span>
              ),
              formula: formula.charged.spinning,
              variant: (tlvl, stats) =>
                getTalentStatKeyVariant("charged", stats),
            },
            {
              text: `Spinning Final DMG`,
              formulaText: (tlvl, stats) => (
                <span>
                  {data.charged.final[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("charged", stats), stats)}
                </span>
              ),
              formula: formula.charged.final,
              variant: (tlvl, stats) =>
                getTalentStatKeyVariant("charged", stats),
            },
            (c, a) => ({
              text: `Stamina Cost`,
              value: "40/s",
            }),
            (c, a) => ({
              text: `Max Duration`,
              value: "5s",
            }),
          ],
        },
        {
          text: (
            <span>
              <strong>Plunging Attack</strong> Plunges from mid-air to strike
              the ground, damaging enemies along the path and dealing AoE DMG
              upon impact.
            </span>
          ),
          fields: [
            {
              text: `Plunge DMG`,
              formulaText: (tlvl, stats) => (
                <span>
                  {data.plunging.dmg[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("plunging", stats), stats)}
                </span>
              ),
              formula: formula.plunging.dmg,
              variant: (tlvl, stats) =>
                getTalentStatKeyVariant("plunging", stats),
            },
            {
              text: `Low Plunge DMG`,
              formulaText: (tlvl, stats) => (
                <span>
                  {data.plunging.low[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("plunging", stats), stats)}
                </span>
              ),
              formula: formula.plunging.low,
              variant: (tlvl, stats) =>
                getTalentStatKeyVariant("plunging", stats),
            },
            {
              text: `High Plunge DMG`,
              formulaText: (tlvl, stats) => (
                <span>
                  {data.plunging.high[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("plunging", stats), stats)}
                </span>
              ),
              formula: formula.plunging.high,
              variant: (tlvl, stats) =>
                getTalentStatKeyVariant("plunging", stats),
            },
          ],
        },
      ],
    },
    skill: {
      name: "Claw and Thunder",
      img: skill,
      document: [
        {
          text: (
            <span>
              <p className="mb-2">
                Hunts his prey using the techniques taught to him by his master
                and his Lupical.
              </p>
              <p className="mb-2">
                <strong>Press:</strong> Swings the Thunder Wolf Claw, dealing
                Electro DMG to opponents in front of Razor. Upon striking an
                opponent, Razor will gain an Electro Sigil, which increases his
                Energy Recharge rate. Razor can have up to 3 Electro Sigils
                simultaneously, and gaining a new Electro Sigil refreshes their
                duration.
              </p>
              <p className="mb-2">
                <strong>Hold:</strong> Gathers Electro energy to unleash a
                lightning storm over a small AoE, causing massive Electro DMG,
                and clears all of Razor's Electro Sigils. Each Electro Sigil
                cleared in this manner will be converted into Energy for Razor.
              </p>
            </span>
          ),
          fields: [
            {
              text: "Press DMG",
              formulaText: (tlvl, stats) => (
                <span>
                  {data.skill.press[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("skill", stats), stats)}
                </span>
              ),
              formula: formula.skill.press,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            },
            {
              text: "Press CD (sec)",
              formula: formula.skill.cd.press,
            },
            {
              text: "Hold DMG",
              formulaText: (tlvl, stats) => (
                <span>
                  {data.skill.hold[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("skill", stats), stats)}
                </span>
              ),
              formula: formula.skill.hold,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            },
            {
              text: "Hold CD (sec)",
              formula: formula.skill.cd.hold,
            },
            {
              text: "Energy Recharge Bonus",
              value: "20% per Electro Sigil",
            },
            {
              text: "Hold Energy Generated",
              value: "5 per Electro Sigil Absorbed",
            },
            {
              text: "Electro Sigil Duration",
              value: "18s",
            },
          ],
        },
      ],
    },
    burst: {
      name: "Lightning Fang",
      img: burst,
      document: [
        {
          text: (
            <span>
              Summons the Wolf Within which deals Electro DMG to all nearby
              opponents. This clears all of Razor's Electro Sigils, which will
              be converted into elemental energy for him. The Wolf Within will
              fight alongside Razor for the skill's duration.
              <h6>The Wolf Within</h6>
              <ul className="mb-2">
                <li>Strikes alongside Razor's normal attacks, dealing Electro DMG.</li>
                <li>Raises Razor's ATK SPD and Electro RES.</li>
                <li>Causes Razor to be immune to DMG inflicted by the Electro-Charged status.</li>
                <li>Disables Razor's Charged Attacks.</li>
                <li>Increases Razor's resistance to interruption.</li>
              </ul>
              These effects end when Razor leaves the battlefield. When Razor leaves the field, a maximum of 10 Energy will be returned to him based off the duration remaining on this skill.
            </span>
          ),
          fields: [
            {
              text: "Elemental Burst DMG",
              formulaText: (tlvl, stats) => (
                <span>
                  {data.burst.summon[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("burst", stats), stats)}
                </span>
              ),
              formula: formula.burst.summon,
              variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
            },
            {
              text: "Wolf Within Electro DMG",
              formulaText: (tlvl, stats) => (
                <span>
                  {data.burst.dmg[tlvl]}%{" "}
                  {Stat.printStat(getTalentStatKey("burst", stats), stats)}
                </span>
              ),
              formula: formula.burst.dmg,
              variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
            },
            {
              text: "ATK Speed Bonus",
              formula: formula.burst.atkspd,
            },
            {
              text: "Electro RES Bonus",
              value: "80%",
            },
            {
              text: "Duration",
              value: "15s",
            },
            {
              text: "CD",
              value: "20s",
            },
            {
              text: "Energy Cost",
              value: 80,
            },
          ],
        },
      ],
    },
    passive1: {
      name: "Awakening",
      img: passive1,
      document: [
        {
          text: (
            <span>
              Decreases Claw and Thunder's CD by 18%. Using Lightning Fang
              resets the CD of Claw and Thunder.
            </span>
          ),
        },
      ],
    },
    passive2: {
      name: "Hunger",
      img: passive2,
      document: [
        {
          text: (
            <span>
              When Razor's Energy is below 50%, increases Energy Recharge by
              30%.
            </span>
          ),
        },
        {
          conditional: (tlvl, c, a) =>
            a >= 4 && {
              type: "character",
              conditionalKey: "Hunger",
              condition: "Energy < 30%",
              sourceKey: "razor",
              maxStack: 1,
              stats: {
                enerRech_: 15,
              },
            },
        },
      ],
    },
    passive3: {
      name: "Wolvensprint",
      img: passive3,
      document: [
        {
          text: (
            <span>
              Decreases sprinting Stamina consumption for your own party members
              by 20%. Not stackable with Passive Talents that provide the exact
              same effects.
            </span>
          ),
        },
      ],
    },
    constellation1: {
      name: "Wolf's Instinct",
      img: c1,
      document: [
        {
          text: (
            <span>
              Picking up an Elemental Orb or Particle increases Razor's DMG by
              10% for 8s.
            </span>
          ),
        },
        {
          conditional: (tlvl, c, a) =>
            c >= 1 && {
              type: "character",
              conditionalKey: "WolfsInstinct",
              condition: "Wolf's Instinct",
              sourceKey: "razor",
              maxStack: 1,
              stats: {
                dmg_: 10,
              },
              fields: [
                {
                  text: "Duration",
                  value: "8s",
                },
              ],
            },
        },
      ],
    },
    constellation2: {
      name: "Suppression",
      img: c2,
      document: [
        {
          text: (
            <span>
              Increases CRIT Rate against opponents with less than 30% HP by
              10%.
            </span>
          ),
        },
        {
          conditional: (tlvl, c, a) =>
            c >= 1 && {
              type: "character",
              conditionalKey: "Enemy30",
              condition: "Enemy with <30% HP",
              sourceKey: "razor",
              maxStack: 1,
              stats: {
                critRate_: 10,
              },
            },
        },
      ],
    },
    constellation3: {
      name: "Soul Companion",
      img: c3,
      document: [
        {
          text: (
            <span>
              Increases <b>Lightning Fang</b>'s skill level by 3. Maximum
              upgrade level is 15.
            </span>
          ),
        },
      ],
      talentBoost: { burst: 3 },
    },
    constellation4: {
      name: "Bite",
      img: c4,
      document: [
        {
          text: (
            <span>
              When casting Claw and Thunder (Press), opponents hit will have
              their DEF decreased by 15% for 7s.
            </span>
          ),
        },
        {
          conditional: (tlvl, c, a) =>
            c >= 1 && {
              type: "character",
              conditionalKey: "Bite",
              condition: "Bite",
              sourceKey: "razor",
              maxStack: 1,
              stats: {
                enemyDEFRed_: 15,
              },
              fields: [
                {
                  text: "Duration",
                  value: "7s",
                },
              ],
            },
        },
      ],
    },
    constellation5: {
      name: "Sharpened Claws",
      img: c5,
      document: [
        {
          text: (
            <span>
              Increases <b>Claw and Thunder</b>'s skill level by 3. Maximum
              upgrade level is 15.
            </span>
          ),
        },
      ],
      talentBoost: { skill: 3 },
    },
    constellation6: {
      name: "Lupus Fulguris",
      img: c6,
      document: [
        {
          text: (
            <span>
              Every 10s, Razor's sword charges up, causing the next Normal
              Attack to release lightning that deals 100% of Razor's ATK as
              Electro DMG. When Razor is not using Lightning Fang, a lightning
              strike on an opponent will grant Razor an Electro Sigil for Claw
              and Thunder.
            </span>
          ),
        },
        {
          conditional: (tlvl, c, a) =>
            c >= 6 && {
              type: "character",
              conditionalKey: "LupusFulguris",
              condition: "Lupus Fulguris",
              sourceKey: "razor",
              maxStack: 1,
              fields: [
                {
                  text: "Lupus Fulguris DMG",
                  formulaText: (<span>{data.c6.dmg}% of Razor's ATK</span>),
                  formula: formula.c6.dmg,
                },
                {
                  text: "Cooldown",
                  value: `${data.c6.cd}s`,
                },
                {
                  text: "Electro Sigils Granted",
                  value: data.c6.sigils,
                },
              ],
            },
        },
      ],
    },
  },
};
export default char;
