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
export const allWeaponTypeKeys = ['sword', 'claymore', 'polearm', 'bow', 'catalyst'] as const
export const allArtifactSets = [
  "Adventurer", "ArchaicPetra", "Berserker", "BlizzardStrayer", "BloodstainedChivalry",
  "BraveHeart", "CrimsonWitchOfFlames", "DefendersWill", "Gambler", "GladiatorsFinale",
  "HeartOfDepth", "Instructor", "Lavawalker", "LuckyDog", "MaidenBeloved",
  "MartialArtist", "NoblesseOblige", "PrayersForDestiny", "PrayersForIllumination", "PrayersForWisdom",
  "PrayersToSpringtime", "ResolutionOfSojourner", "RetracingBolide", "Scholar", "TheExile",
  "ThunderingFury", "Thundersoother", "TinyMiracle", "TravelingDoctor", "ViridescentVenerer",
  "WanderersTroupe", "TenacityOfTheMillelith", "PaleFlame",
] as const
export const allCharacterKeys = [
  "albedo", "amber", "barbara", "beidou", "bennett", "chongyun", "diluc", "diona", "fischl", "ganyu",
  "hutao", "jean", "kaeya", "keqing", "klee", "lisa", "mona", "ningguang", "noelle", "qiqi",
  "razor", "sucrose", "tartaglia", "traveler_anemo", "traveler_geo", "venti", "xiao", "xiangling", "xingqiu", "xinyan",
  "zhongli", "rosaria", "yanfei", "eula"
] as const
export const allWeaponKeys = [
  "DullBlade", "SilverSword", "CoolSteel", "DarkIronSword", "FilletBlade", "HarbingerOfDawn", "SkyriderSword",
  "TravelersHandySword", "BlackcliffLongsword", "FavoniusSword", "IronSting", "LionsRoar", "PrimordialJadeCutter",
  "PrototypeRancour", "RoyalLongsword", "SacrificialSword", "TheAlleyFlash", "TheBlackSword", "TheFlute",
  "SwordOfDescension", "FesteringDesire", "AquilaFavonia", "SkywardBlade", "SummitShaper", "WasterGreatsword",
  "OldMercsPal", "BloodtaintedGreatsword", "DebateClub", "FerrousShadow", "Quartz", "SkyriderGreatsword",
  "WhiteIronGreatsword", "BlackcliffSlasher", "FavoniusGreatsword", "LithicBlade", "PrototypeAminus", "Rainslasher",
  "RoyalGreatsword", "SerpentSpine", "TheBell", "Whiteblind", "SacrificialGreatsword", "SnowTombedStarsilver",
  "SkywardPride", "WolfsGravestone", "TheUnforged", "BeginnersProtector", "IronPoint", "BlackTassel", "Halberd",
  "WhiteTassel", "BlackcliffPole", "CrescentPike", "Deathmatch", "DragonsBane", "LithicSpear", "PrototypeGrudge",
  "FavoniusLance", "RoyalSpear", "DragonspineSpear", "VortexVanquisher", "PrimordialJadeWingedSpear", "StaffOfHoma",
  "SkywardSpine", "HuntersBow", "SeasonedHuntersBow", "EbonyBow", "Messenger", "RavenBow", "RecurveBow",
  "SharpshootersOath", "Slingshot", "TheStringless", "AlleyHunter", "BlackcliffWarbow", "CompoundBow",
  "FavoniusWarbow", "PrototypeCrescent", "RoyalBow", "Rust", "SacrificialBow", "TheViridescentHunt", "SkywardHarp",
  "AmosBow", "ElegyForTheEnd", "WindblumeOde", "ApprenticesNotes", "PocketGrimoire", "AmberCatalyst", "EmeraldOrb",
  "MagicGuide", "OtherworldlyStory", "ThrillingTalesOfDragonSlayers", "TwinNephrite", "BlackcliffAgate",
  "FavoniusCodex", "MappaMare", "PrototypeMalice", "RoyalGrimoire", "SacrificialFragments", "SolarPearl", "TheWidsith",
  "WineAndSong", "EyeOfPerception", "Frostbearer", "LostPrayerToTheSacredWinds", "SkywardAtlas", "MemoryOfDust",
  "SongOfBrokenPines"
] as const
export type HitModeKey = typeof allHitModes[number]
export type ReactionModeKey = typeof allReactionModes[number]
export type SetNum = typeof allArtifactSetCount[number]
export type Rarity = typeof allRarities[number]
export type SlotKey = typeof allSlotKeys[number]
export type ElementKey = typeof allElements[number]
export type ArtifactSetKey = typeof allArtifactSets[number]
export type CharacterKey = typeof allCharacterKeys[number]
export type WeaponKey = typeof allWeaponKeys[number]
export type WeaponTypeKey = typeof allWeaponTypeKeys[number]