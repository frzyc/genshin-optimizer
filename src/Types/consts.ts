// DO NOT REMOVE ITEMS FROM THESE LISTS
//        ONLY APPEND NEW ENTRIES
// The index of items in this list is used to
// compress the exported data. Removing an item
// from this list will shift subsequent entries.
export const allHitModes = ["hit", "avgHit", "critHit"] as const
export const allReactionModes = ["hydro_vaporize", "pyro_vaporize", "pyro_melt", "cryo_melt",] as const
export const allArtifactSetCount = [1, 2, 3, 4, 5] as const
export const allRarities = [5, 4, 3, 2, 1] as const
export const allArtifactRarities = [5, 4, 3] as const
export const allSlotKeys = ["flower", "plume", "sands", "goblet", "circlet"] as const
export const allElements = ['anemo', 'geo', 'electro', 'hydro', 'pyro', 'cryo'] as const
export const allElementsWithPhy = ["physical", ...allElements] as const
export const allWeaponTypeKeys = ['sword', 'claymore', 'polearm', 'bow', 'catalyst'] as const
export const allArtifactSets = [
  "Adventurer", "ArchaicPetra", "Berserker", "BlizzardStrayer", "BloodstainedChivalry",
  "BraveHeart", "CrimsonWitchOfFlames", "DefendersWill", "Gambler", "GladiatorsFinale",
  "HeartOfDepth", "Instructor", "Lavawalker", "LuckyDog", "MaidenBeloved",
  "MartialArtist", "NoblesseOblige", "PrayersForDestiny", "PrayersForIllumination", "PrayersForWisdom",
  "PrayersToSpringtime", "ResolutionOfSojourner", "RetracingBolide", "Scholar", "TheExile",
  "ThunderingFury", "Thundersoother", "TinyMiracle", "TravelingDoctor", "ViridescentVenerer",
  "WanderersTroupe", "TenacityOfTheMillelith", "PaleFlame", "EmblemOfSeveredFate", "ShimenawasReminiscence",
  "HuskOfOpulentDreams", "OceanHuedClam"
] as const
export const allCharacterKeys = [
  "Albedo", "Amber", "Barbara", "Beidou", "Bennett", "Chongyun", "Diluc", "Diona", "Fischl", "Ganyu",
  "HuTao", "Jean", "Kaeya", "Keqing", "Klee", "Lisa", "Mona", "Ningguang", "Noelle", "Qiqi",
  "Razor", "Sucrose", "Tartaglia", "Traveler", "RaidenShogun", "Venti", "Xiao", "Xiangling", "Xingqiu", "Xinyan",
  "Zhongli", "Rosaria", "Yanfei", "Eula", "KaedeharaKazuha", "KamisatoAyaka", "Sayu", "Yoimiya", "KujouSara", "Aloy",
  "SangonomiyaKokomi", "Thoma"
] as const
export const allWeaponKeys = [
  "DullBlade", "SilverSword", "CoolSteel", "DarkIronSword", "FilletBlade", "HarbingerOfDawn", "SkyriderSword",
  "TravelersHandySword", "BlackcliffLongsword", "FavoniusSword", "IronSting", "LionsRoar", "PrimordialJadeCutter",
  "PrototypeRancour", "RoyalLongsword", "SacrificialSword", "TheAlleyFlash", "TheBlackSword", "TheFlute",
  "SwordOfDescension", "FesteringDesire", "AquilaFavonia", "SkywardBlade", "SummitShaper", "WasterGreatsword",
  "OldMercsPal", "BloodtaintedGreatsword", "DebateClub", "FerrousShadow", "Akuoumaru", "SkyriderGreatsword",
  "WhiteIronGreatsword", "BlackcliffSlasher", "FavoniusGreatsword", "LithicBlade", "PrototypeArchaic", "Rainslasher",
  "RoyalGreatsword", "SerpentSpine", "TheBell", "Whiteblind", "SacrificialGreatsword", "SnowTombedStarsilver",
  "SkywardPride", "WolfsGravestone", "TheUnforged", "BeginnersProtector", "IronPoint", "BlackTassel", "Halberd",
  "WhiteTassel", "BlackcliffPole", "CrescentPike", "Deathmatch", "DragonsBane", "LithicSpear", "PrototypeStarglitter",
  "FavoniusLance", "RoyalSpear", "DragonspineSpear", "VortexVanquisher", "PrimordialJadeWingedSpear", "StaffOfHoma",
  "SkywardSpine", "HuntersBow", "SeasonedHuntersBow", "PolarStar", "Messenger", "RavenBow", "RecurveBow",
  "SharpshootersOath", "Slingshot", "TheStringless", "AlleyHunter", "BlackcliffWarbow", "CompoundBow",
  "FavoniusWarbow", "PrototypeCrescent", "RoyalBow", "Rust", "SacrificialBow", "TheViridescentHunt", "SkywardHarp",
  "AmosBow", "ElegyForTheEnd", "WindblumeOde", "ApprenticesNotes", "PocketGrimoire", "EngulfingLightning", "EmeraldOrb",
  "MagicGuide", "OtherworldlyStory", "ThrillingTalesOfDragonSlayers", "TwinNephrite", "BlackcliffAgate",
  "FavoniusCodex", "MappaMare", "PrototypeAmber", "RoyalGrimoire", "SacrificialFragments", "SolarPearl", "TheWidsith",
  "WineAndSong", "EyeOfPerception", "Frostbearer", "LostPrayerToTheSacredWinds", "SkywardAtlas", "MemoryOfDust",
  "SongOfBrokenPines", "DodocoTales", "MitternachtsWaltz", "FreedomSworn", "AmenomaKageuchi", "MistsplitterReforged",
  "KatsuragikiriNagamasa", "KitainCrossSpear", "ThunderingPulse", "Hamayumi", "HakushinRing", "TheCatch",
  "EverlastingMoonglow", "LuxuriousSeaLord", "Predator", "MouunsMoon", "WavebreakersFin", "CinnabarSpindle",
] as const
export const characterSpecializedStatKeys = ["hp_", "atk_", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_"] as const

export type HitModeKey = typeof allHitModes[number]
export type ReactionModeKey = typeof allReactionModes[number]
export type SetNum = typeof allArtifactSetCount[number]
export type Rarity = typeof allRarities[number]
export type ArtifactRarity = typeof allArtifactRarities[number]
export type SlotKey = typeof allSlotKeys[number]
export type ElementKey = typeof allElements[number]
export type ElementKeyWithPhy = typeof allElementsWithPhy[number]
export type ArtifactSetKey = typeof allArtifactSets[number]
export type CharacterKey = typeof allCharacterKeys[number]
export type WeaponKey = typeof allWeaponKeys[number]
export type WeaponTypeKey = typeof allWeaponTypeKeys[number]
export type CharacterSpecializedStatKey = typeof characterSpecializedStatKeys[number]