import card from './Character_Tartaglia_Card.png'
import thumb from './Character_Tartaglia_Thumb.png'
import c1 from './Constellation_Foul_Legacy_Tide_Withholder.png'
import c2 from './Constellation_Foul_Legacy_Understream.png'
import c3 from './Constellation_Abyssal_Mayhem_Vortex_of_Turmoil.png'
import c4 from './Constellation_Abyssal_Mayhem_Hydrosprout.png'
import c5 from './Constellation_Havoc_Formless_Blade.png'
import c6 from './Constellation_Havoc_Annihilation.png'
import normal from './Talent_Cutting_Torrent.png'
import skill from './Talent_Foul_Legacy_Raging_Tide.png'
import burst from './Talent_Havoc_Obliteration.png'
import passive1 from './Talent_Never_Ending.png'
import passive2 from './Talent_Sword_of_Torrents.png'
import passive3 from './Talent_Master_of_Weaponry.png'
import Stat from '../../../Stat'
import formula, {data} from './data'
import {getTalentStatKey, getTalentStatKeyVariant} from '../../../Build/Build'

const char = {
        name: "Tartaglia",
        cardImg: card,
        thumbImg: thumb,
        star: 5,
        elementKey: "hydro",
        weaponTypeKey: "bow",
        gender: "M",
        constellationName: "Monoceros Caeli",
        titles: ["Childe", "11th of the Eleven Fatui Harbingers"],
        baseStat: data.baseStat,
        specializedStat: data.specializeStat,
        formula,
        talent: {
            auto: {
                name: "Cutting Torrent",
                img: normal,
                document: [{
                    text: <span><strong>Normal Attack</strong> Perform up to 6 consecutive shots with a bow.</span>,
                    fields: data.normal.hitArr.map((percentArr, i) =>
                        ({
                            text: `${i + 1}-Hit DMG`,
                            formulaText: stats =>
                                <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
                            formula: formula.normal[i],
                            variant: stats => getTalentStatKeyVariant("normal", stats),
                        }))
                }, {
                    text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, the power of Hydro will accumulate on the arrowhead. A arrow fully charged with the torrent will deal <span
                        className="text-hydro">Hydro DMG</span> and apply the Riptide status.</span>,
                    fields: [{
                        text: `Aimed Shot DMG`,
                        formulaText: stats =>
                            <span>{data.charged.aimedShot[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
                        formula: formula.charged.aimShot,
                        variant: stats => getTalentStatKeyVariant("charged", stats),
                    }, {
                        text: `Fully-Charged Aimed Shot DMG`,
                        formulaText: stats =>
                            <span>{data.charged.fullAimedShot[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>,
                        formula: formula.charged.fullAimedShot,
                        variant: stats => getTalentStatKeyVariant("charged", stats, true),
                    }]
                }, {
                    text: <span>
                    <p className="mb-2"><strong>Riptide</strong> Opponents affected by Riptide will suffer from <span
                        className="text-hydro">AoE Hydro DMG</span> effects when attacked by Tartaglia in various ways. DMG dealt in this way is considered Normal Attack dmg.</p>
                    <ul className="mb-2">
                        <li><strong>Riptide Flash:</strong> A fully-charged Aimed Shot that hits an opponent affected by Riptide deals consecutive bouts of AoE DMG. Can occur once every 0.7s.</li>
                        <li><strong>Riptide Burst:</strong> Defeating an opponent affected by Riptide creates a Hydro burst that inflicts the Riptide status on nearby opponents hit.</li>
                    </ul>
                </span>,
                    fields: [{
                        text: `Riptide Flash DMG`,
                        formulaText: stats =>
                            <span>{data.riptide.flash[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats, true), stats)} x 3</span>,
                        formula: formula.riptide.flash,
                        variant: stats => getTalentStatKeyVariant("normal", stats, true),
                    }, {
                        text: `Riptide Burst DMG`,
                        formulaText: stats =>
                            <span>{data.riptide.burst[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats, true), stats)}</span>,
                        formula: formula.riptide.burst,
                        variant: stats => getTalentStatKeyVariant("normal", stats, true),
                    }]
                }, {
                    text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
                    fields: [{
                        text: `Plunge DMG`,
                        formulaText: stats =>
                            <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
                        formula: formula.plunging.dmg,
                        variant: stats => getTalentStatKeyVariant("plunging", stats),
                    }, {
                        text: `Low Plunge DMG`,
                        formulaText: stats =>
                            <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
                        formula: formula.plunging.low,
                        variant: stats => getTalentStatKeyVariant("plunging", stats),
                    }, {
                        text: `High Plunge DMG`,
                        formulaText: stats =>
                            <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
                        formula: formula.plunging.high,
                        variant: stats => getTalentStatKeyVariant("plunging", stats),
                    }]
                }],
            },
            skill: {
                name: "Foul Legacy: Raging Tide",
                img: skill,
                document: [{
                    text: <span>
                    <p className="mb-2">Unleashes a set of weaponry made of pure water, dealing <span
                        className="text-hydro">Hydro DMG</span> to surrounding opponents and entering Melee Stance.</p>
                    <p>In this Stance, Tartaglia's Normal and Charged Attacks are converted to <span
                        className="text-hydro">Hydro DMG</span> that cannot be overridden by any other elemental infusion and change as follows:</p>
                    <p><strong>Normal Attack:</strong> Perform up to 6 consecutive <span
                        className="text-hydro">Hydro</span> strikes.</p>
                    <p><strong>Charged Attack:</strong> Consumes a certain amount of Stamina to unleash a cross slash, dealing <span
                        className="text-hydro">Hydro DMG</span>.</p>
                    <p><strong>Riptide Slash:</strong> Hitting an opponent affected by Riptide with a melee attack unleashes a Riptide Slash that deals <span
                        className="text-hydro">AoE Hydro DMG</span>. DMG dealt in this way is considered Elemental Skill DMG, and can only occur once every 1.5s.</p>
                    <p>After 30s, or when the ability is unleashed again, this skill will end. Tartaglia will return to his Ranged Stance and this ability will enter CD. The longer Tartaglia stays in his Melee Stance, the longer the CD. If the return to a ranged stance occurs automatically after 30s, the CD is even longer.</p>
                </span>,
                    fields: [{
                        text: "Stance Change DMG",
                        formulaText: stats =>
                            <span>{data.skill.skillDmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
                        //TODO @frzyc formula should be multiplied by 3
                        formula: formula.skill.skillDmg,
                        variant: stats => getTalentStatKeyVariant("skill", stats),
                        //TODO @frzyc
                    }, data.skill.hitArr.map((percentArr, i) => ({
                        text: `${i + 1}-Hit DMG`,
                        formulaText: stats =>
                            <span>{percentArr[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
                        formula: formula.skill.normal[i],
                        variant: stats => getTalentStatKeyVariant("skill", stats),
                    })), {
                        text: `Charged 1st-Hit DMG`,
                        formulaText: stats =>
                            <span>{data.skill.charged.cross1[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
                        formula: formula.skill.charged.cross1,
                        variant: stats => getTalentStatKeyVariant("skill", stats),
                    }, {
                        text: `Charged 2nd-Hit DMG`,
                        formulaText: stats =>
                            <span>{data.skill.charged.cross2[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
                        formula: formula.skill.charged.cross2,
                        variant: stats => getTalentStatKeyVariant("skill", stats),
                    }, {
                        text: `Charged Attack Stamina Cost`,
                        value: 20,
                    }, {
                        text: `Riptide Slash DMG`,
                        formulaText: stats =>
                            <span>{data.riptide.slash[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
                        formula: formula.riptide.slash,
                        variant: stats => getTalentStatKeyVariant("skill", stats),
                    }, {
                        text: `Duration`,
                        value: `30s`,
                    }, {
                        text: `Preemptive End CD`,
                        value: `6-36s`
                    }, {
                        text: `CD`,
                        value: `45s`,
                    }],
                }],
            },
            burst: {
                name: "Havoc: Obliteration",
                img: burst,
                document: [{
                    text: <span>
                    <p className="mb-2">Performs different attacks based on what stance Tartaglia is in when casting.</p>
                    <p><strong>Ranged Stance: Flash of Havoc:</strong> Swiftly fires a Hydro-imbued magic arrow, dealing <span
                        className="text-hydro">AoE Hydro DMG</span> and applying the Riptide status. Returns a portion of its Energy Cost after use.</p>
                    <p><strong>Melee Stance: Light of Obliteration:</strong> Performs a slash with a large AoE, dealing massive <span
                        className="text-hydro">Hydro DMG</span> to all surrounding opponents, which triggers Riptide Blast.</p>
                    <p><strong>Riptide Blast:</strong> When the obliterating waters hit an opponent affected by Riptide, it clears their Riptide status and triggers a Hydro Explosion that deals <span
                        className="text-hydro">AoE Hydro DMG</span>. DMG dealt in this way is considered Elemental Burst DMG.</p>
                </span>,
                    fields: [{
                        text: "Skill DMG: Melee",
                        formulaText: stats =>
                            <span>{data.burst.meleeDmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
                        formula: formula.burst.melee,
                        variant: stats => getTalentStatKeyVariant("burst", stats),
                    }, {
                        text: "Skill DMG: Ranged",
                        formulaText: stats =>
                            <span>{data.burst.rangedDmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
                        formula: formula.burst.ranged,
                        variant: stats => getTalentStatKeyVariant("burst", stats),
                    }, {
                        text: `Riptide Blast DMG`,
                        formulaText: stats =>
                            <span>{data.riptide.blast[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
                        formula: formula.riptide.blast,
                        variant: stats => getTalentStatKeyVariant("burst", stats),
                    }, {
                        text: "CD",
                        value: "15s"
                    }, {
                        text: "Energy Cost",
                        value: 60,
                    }, {
                        text: "Energy Return (Ranged)",
                        value: 20,
                    }],
                }],
            },
            passive1: {
                name: "Never Ending",
                img: passive1,
                document: [{ text: <span>Extends Riptide duration by 8s.</span>,}],
            },
            passive2: {
                name: "Sword of Torrents",
                img: passive2,
                document: [{ text: <span>When Tartaglia is in Foul Legacy: Raging Tide's Melee stance, on dealing a CRIT hit, Normal and Charged Attacks apply the Riptide status effects to opponents.</span>,}],
            },
            passive3: {
                name: "Master of Weaponry",
                img: passive3,
                document: [{ text: <span>Increases your own party members' Normal Attack Level by 1.</span>,}], //TODO party buffs
                talentBoost: { auto: 1 }
            },
            constellation1: {},
            constellation2: {},
            constellation3: {},
            constellation4: {},
            constellation5: {},
            constellation6: {},
        },
    }
;
export default char;
