export const allHitModes = ["hit", "avgHit", "critHit"] as const
export const allRegions = ["mondstadt", "liyue", "inazuma", "sumeru", "fontaine", "natlan", "snezhnaya", "khaenriah"] as const
export const allAmpReactions = ["vaporize", "melt",] as const
export const allAdditiveReactions = ["spread", "aggravate"] as const
export const allArtifactSetCount = [1, 2, 3, 4, 5] as const
export const allRarities = [5, 4, 3, 2, 1] as const
export const allArtifactRarities = [5, 4, 3] as const
export const allSlotKeys = ["flower", "plume", "sands", "goblet", "circlet"] as const
export const allElements = ['anemo', 'geo', 'electro', 'hydro', 'pyro', 'cryo', 'dendro'] as const
export const allElementsWithPhy = ["physical", ...allElements] as const
export const allInfusionAuraElements = ["pyro", 'cryo'] as const
export const allWeaponTypeKeys = ['sword', 'claymore', 'polearm', 'bow', 'catalyst'] as const
export const allRollColorKeys = ['roll1', 'roll2', 'roll3', 'roll4', 'roll5', 'roll6'] as const
export const allAscension = [0, 1, 2, 3, 4, 5, 6] as const
export const allRefinement = [1, 2, 3, 4, 5] as const
export const substatType = ["max", "mid", "min"] as const
export const genderKeys = ["F", "M"] as const
export type Gender = typeof genderKeys[number]


export const allArtifactSets = [
  "Adventurer",
  "ArchaicPetra",
  "Berserker",
  "BlizzardStrayer",
  "BloodstainedChivalry",
  "BraveHeart",
  "CrimsonWitchOfFlames",
  "DeepwoodMemories",
  "DefendersWill",
  "EchoesOfAnOffering",
  "EmblemOfSeveredFate",
  "Gambler",
  "GildedDreams",
  "GladiatorsFinale",
  "HeartOfDepth",
  "HuskOfOpulentDreams",
  "Instructor",
  "Lavawalker",
  "LuckyDog",
  "MaidenBeloved",
  "MartialArtist",
  "NoblesseOblige",
  "OceanHuedClam",
  "PaleFlame",
  "PrayersForDestiny",
  "PrayersForIllumination",
  "PrayersForWisdom",
  "PrayersToSpringtime",
  "ResolutionOfSojourner",
  "RetracingBolide",
  "Scholar",
  "ShimenawasReminiscence",
  "TenacityOfTheMillelith",
  "TheExile",
  "ThunderingFury",
  "Thundersoother",
  "TinyMiracle",
  "TravelingDoctor",
  "VermillionHereafter",
  "ViridescentVenerer",
  "WanderersTroupe",
] as const
export const nonTravelerCharacterKeys = [
  "Albedo",
  "Amber",
  "Barbara",
  "Beidou",
  "Bennett",
  "Chongyun",
  "Diluc",
  "Diona",
  "Fischl",
  "Ganyu",
  "HuTao",
  "Jean",
  "Kaeya",
  "Keqing",
  "Klee",
  "KujouSara",
  "KukiShinobu",
  "Lisa",
  "Mona",
  "Ningguang",
  "Noelle",
  "Qiqi",
  "Razor",
  "Sucrose",
  "Tartaglia",
  "RaidenShogun",
  "Venti",
  "Xiangling",
  "Xiao",
  "Xingqiu",
  "Xinyan",
  "Rosaria",
  "Yanfei",
  "Eula",
  "KaedeharaKazuha",
  "KamisatoAyaka",
  "Sayu",
  "Shenhe",
  "Yoimiya",
  "Aloy",
  "SangonomiyaKokomi",
  "Thoma",
  "Gorou",
  "AratakiItto",
  "YaeMiko",
  "YunJin",
  "Zhongli",
  "KamisatoAyato",
  "Yelan",
  "ShikanoinHeizou",
  "Collei",
  "Dori",
  "Tighnari",
] as const
export const locationCharacterKeys = [
  ...nonTravelerCharacterKeys,
  "Traveler",
] as const
export const travelerElements = [
  "anemo",
  "geo",
  "electro",
  "dendro"
] as const
export const travelerFKeys = [
  "TravelerAnemoF",
  "TravelerGeoF",
  "TravelerElectroF",
  "TravelerDendroF",
] as const
export const travelerMKeys = [
  "TravelerAnemoM",
  "TravelerGeoM",
  "TravelerElectroM",
  "TravelerDendroM",
] as const
export const travelerKeys = [
  "TravelerAnemo",
  "TravelerGeo",
  "TravelerElectro",
  "TravelerDendro",
] as const
export const allCharacterKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerKeys
] as const

export const allCharacterSheetKeys = [
  ...nonTravelerCharacterKeys,
  ...travelerFKeys,
  ...travelerMKeys,
]

export const allWeaponSwordKeys = [
  "AmenomaKageuchi",
  "AquilaFavonia",
  "BlackcliffLongsword",
  "CinnabarSpindle",
  "CoolSteel",
  "KagotsurubeIsshin",
  "DarkIronSword",
  "DullBlade",
  "FavoniusSword",
  "FesteringDesire",
  "FilletBlade",
  "FreedomSworn",
  "HaranGeppakuFutsu",
  "HarbingerOfDawn",
  "IronSting",
  "LionsRoar",
  "MistsplitterReforged",
  "PrimordialJadeCutter",
  "PrototypeRancour",
  "RoyalLongsword",
  "SacrificialSword",
  "SapwoodBlade",
  "SilverSword",
  "SkyriderSword",
  "SkywardBlade",
  "SummitShaper",
  "SwordOfDescension",
  "TheAlleyFlash",
  "TheBlackSword",
  "TheFlute",
  "TravelersHandySword",
] as const
export type WeaponSwordKey = typeof allWeaponSwordKeys[number]

export const allWeaponClaymoreKeys = [
  "Akuoumaru",
  "BlackcliffSlasher",
  "BloodtaintedGreatsword",
  "DebateClub",
  "FavoniusGreatsword",
  "FerrousShadow",
  "ForestRegalia",
  "KatsuragikiriNagamasa",
  "LithicBlade",
  "LuxuriousSeaLord",
  "OldMercsPal",
  "PrototypeArchaic",
  "Rainslasher",
  "RedhornStonethresher",
  "RoyalGreatsword",
  "SacrificialGreatsword",
  "SerpentSpine",
  "SkyriderGreatsword",
  "SkywardPride",
  "SnowTombedStarsilver",
  "SongOfBrokenPines",
  "TheBell",
  "TheUnforged",
  "WasterGreatsword",
  "Whiteblind",
  "WhiteIronGreatsword",
  "WolfsGravestone",
] as const
export type WeaponClaymoreKey = typeof allWeaponClaymoreKeys[number]

export const allWeaponPolearmKeys = [
  "BeginnersProtector",
  "BlackcliffPole",
  "BlackTassel",
  "CalamityQueller",
  "CrescentPike",
  "Deathmatch",
  "DragonsBane",
  "DragonspineSpear",
  "EngulfingLightning",
  "FavoniusLance",
  "Halberd",
  "IronPoint",
  "KitainCrossSpear",
  "LithicSpear",
  "Moonpiercer",
  "PrimordialJadeWingedSpear",
  "PrototypeStarglitter",
  "RoyalSpear",
  "SkywardSpine",
  "StaffOfHoma",
  "TheCatch",
  "VortexVanquisher",
  "WavebreakersFin",
  "WhiteTassel",
] as const
export type WeaponPoleArmKey = typeof allWeaponPolearmKeys[number]

export const allWeaponBowKeys = [
  "AlleyHunter",
  "AmosBow",
  "AquaSimulacra",
  "BlackcliffWarbow",
  "CompoundBow",
  "ElegyForTheEnd",
  "FadingTwilight",
  "FavoniusWarbow",
  "Hamayumi",
  "HuntersBow",
  "HuntersPath",
  "KingsSquire",
  "Messenger",
  "MitternachtsWaltz",
  "MouunsMoon",
  "PolarStar",
  "Predator",
  "PrototypeCrescent",
  "RavenBow",
  "RecurveBow",
  "RoyalBow",
  "Rust",
  "SacrificialBow",
  "SeasonedHuntersBow",
  "SharpshootersOath",
  "SkywardHarp",
  "Slingshot",
  "TheStringless",
  "TheViridescentHunt",
  "ThunderingPulse",
  "EndOfTheLine",
  "WindblumeOde",
] as const
export type WeaponBowKey = typeof allWeaponBowKeys[number]

export const allWeaponCatalystKeys = [
  "ApprenticesNotes",
  "BlackcliffAgate",
  "DodocoTales",
  "EmeraldOrb",
  "EverlastingMoonglow",
  "EyeOfPerception",
  "FavoniusCodex",
  "Frostbearer",
  "FruitOfFulfillment",
  "HakushinRing",
  "KagurasVerity",
  "LostPrayerToTheSacredWinds",
  "MagicGuide",
  "MappaMare",
  "MemoryOfDust",
  "OathswornEye",
  "OtherworldlyStory",
  "PocketGrimoire",
  "PrototypeAmber",
  "RoyalGrimoire",
  "SacrificialFragments",
  "SkywardAtlas",
  "SolarPearl",
  "TheWidsith",
  "ThrillingTalesOfDragonSlayers",
  "TwinNephrite",
  "WineAndSong",
] as const
export type WeaponCatalystKey = typeof allWeaponCatalystKeys[number]

export const allWeaponKeys = [
  ...allWeaponSwordKeys,
  ...allWeaponClaymoreKeys,
  ...allWeaponPolearmKeys,
  ...allWeaponBowKeys,
  ...allWeaponCatalystKeys,
] as const
export type WeaponKey = WeaponSwordKey | WeaponClaymoreKey | WeaponPoleArmKey | WeaponBowKey | WeaponCatalystKey

export const characterSpecializedStatKeys = ["hp_", "atk_", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_"] as const

export type HitModeKey = typeof allHitModes[number]
export type Region = typeof allRegions[number]
export type AmpReactionKey = typeof allAmpReactions[number]
export type AdditiveReactionKey = typeof allAdditiveReactions[number]
export type SetNum = typeof allArtifactSetCount[number]
export type Rarity = typeof allRarities[number]
export type ArtifactRarity = typeof allArtifactRarities[number]
export type SlotKey = typeof allSlotKeys[number]
export type ElementKey = typeof allElements[number]
export type ElementKeyWithPhy = typeof allElementsWithPhy[number]
export type InfusionAuraElements = typeof allInfusionAuraElements[number]
export type ArtifactSetKey = typeof allArtifactSets[number]
export type NonTravelerCharacterKey = typeof nonTravelerCharacterKeys[number]
export type CharacterKey = typeof allCharacterKeys[number]
export type CharacterSheetKey = typeof allCharacterSheetKeys[number]
export type LocationCharacterKey = typeof locationCharacterKeys[number]
export type TravelerKey = typeof travelerKeys[number]
export type TravelerElementKey = typeof travelerElements[number]
export type WeaponTypeKey = typeof allWeaponTypeKeys[number]
export type RollColorKey = typeof allRollColorKeys[number]
export type Ascension = typeof allAscension[number]
export type Refinement = typeof allRefinement[number]
export type CharacterSpecializedStatKey = typeof characterSpecializedStatKeys[number]
export const absorbableEle = ["hydro", "pyro", "cryo", "electro"] as ElementKey[]
export const allowedAmpReactions: Dict<ElementKey, AmpReactionKey[]> = {
  pyro: ["vaporize", "melt"],
  hydro: ["vaporize"],
  cryo: ["melt"],
  anemo: ["vaporize", "melt"],
}
export const allowedAdditiveReactions: Dict<ElementKey, AdditiveReactionKey[]> = {
  dendro: ["spread"],
  electro: ["aggravate"],
  anemo: ["aggravate"],
}

export type SubstatType = typeof substatType[number]

export function charKeyToLocCharKey(charKey: CharacterKey): LocationCharacterKey {
  if (travelerKeys.includes(charKey as TravelerKey)) return "Traveler"
  return charKey as LocationCharacterKey
}

export function TravelerToElement(key: TravelerKey, element: TravelerElementKey): TravelerKey {
  return "Traveler" + element.toUpperCase().slice(0, 1) + element.slice(1) as TravelerKey
}

export type LocationKey = LocationCharacterKey | ""

export function charKeyToCharName(ck: CharacterKey, gender: Gender): string {
  return ck.startsWith("Traveler") ? "Traveler" + gender : ck
}
