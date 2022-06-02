export const allHitModes = ["hit", "avgHit", "critHit"] as const
export const allRegions = ["mondstadt", "liyue", "inazuma", "sumeru", "fontaine", "natlan", "snezhnaya", "khaenriah"] as const
export const allReactionModes = ["hydro_vaporize", "pyro_vaporize", "pyro_melt", "cryo_melt",] as const
export const allArtifactSetCount = [1, 2, 3, 4, 5] as const
export const allRarities = [5, 4, 3, 2, 1] as const
export const allArtifactRarities = [5, 4, 3] as const
export const allSlotKeys = ["flower", "plume", "sands", "goblet", "circlet"] as const
export const allElements = ['anemo', 'geo', 'electro', 'hydro', 'pyro', 'cryo'] as const
export const allElementsWithPhy = ["physical", ...allElements] as const
export const allWeaponTypeKeys = ['sword', 'claymore', 'polearm', 'bow', 'catalyst'] as const
export const allArtifactSets = [
  "Adventurer",
  "ArchaicPetra",
  "Berserker",
  "BlizzardStrayer",
  "BloodstainedChivalry",
  "BraveHeart",
  "CrimsonWitchOfFlames",
  "DefendersWill",
  "EchoesOfAnOffering",
  "EmblemOfSeveredFate",
  "Gambler",
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
export const allCharacterKeys = [
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
  "Lisa",
  "Mona",
  "Ningguang",
  "Noelle",
  "Qiqi",
  "Razor",
  "Sucrose",
  "Tartaglia",
  "Traveler",
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
  // "KukiShinobu"
] as const

export const allWeaponSwordKeys = [
  "AmenomaKageuchi",
  "AquilaFavonia",
  "BlackcliffLongsword",
  "CinnabarSpindle",
  "CoolSteel",
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

export const characterSpecializedStatKeys = ["hp_", "atk_", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_"] as const

export type HitModeKey = typeof allHitModes[number]
export type Region = typeof allRegions[number]
export type ReactionModeKey = typeof allReactionModes[number]
export type SetNum = typeof allArtifactSetCount[number]
export type Rarity = typeof allRarities[number]
export type ArtifactRarity = typeof allArtifactRarities[number]
export type SlotKey = typeof allSlotKeys[number]
export type ElementKey = typeof allElements[number]
export type ElementKeyWithPhy = typeof allElementsWithPhy[number]
export type ArtifactSetKey = typeof allArtifactSets[number]
export type CharacterKey = typeof allCharacterKeys[number]
export type WeaponTypeKey = typeof allWeaponTypeKeys[number]
export type CharacterSpecializedStatKey = typeof characterSpecializedStatKeys[number]
export const absorbableEle = ["hydro", "pyro", "cryo", "electro"] as ElementKey[]
