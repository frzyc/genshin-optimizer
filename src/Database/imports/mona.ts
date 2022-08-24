import { MainStatKey, SubstatKey } from '../../Types/artifact';
import { ArtifactSetKey, SlotKey } from "../../Types/consts";
import { ArtCharDatabase } from '../Database';
import { importGOOD } from './good';

const DefaultVersion = "1";
const GetConvertedArtifactsOfVersion: Dict<string, (data: any) => { artifacts: any[] }> = {
  "1": importMona1
};

export function importMona(dataObj: any, oldDatabase: ArtCharDatabase): ReturnType<typeof importGOOD> {
  const version = dataObj.version ?? DefaultVersion
  const converted = GetConvertedArtifactsOfVersion[version]?.(dataObj)

  if (!converted)
    return // TODO: Maybe add failure reason, or throws here

  return importGOOD({
    format: "GOOD",
    source: "mona-uranai",
    version: 1,
    artifacts: converted.artifacts
  }, oldDatabase)
}

// backup 0: https://github.com/wormtql/genshin_artifact/blob/main/src/assets/artifacts/data/*/index.js
// backup 1: https://github.com/YuehaiTeam/cocogoat/blob/main/src/App/export/Mona.ts

function importMona1(dataObj: any): { artifacts: any[] } {
  const artifacts: any[] = []

  for (const property in dataObj) {
    if (!(property in ArtifactSlotKeyMap))
      continue

    for (const genshinArtArtifact of dataObj[property]) {
      const { setName, star, level, position, mainTag } = genshinArtArtifact
      const raw = {
        setKey: ArtifactSetKeyMap[setName],
        rarity: star,
        level,
        slotKey: ArtifactSlotKeyMap[position],
        mainStatKey: ArtifactMainStatKeyMap[mainTag.name],
        substats: genshinArtArtifact.normalTags.map(({ name, value }) => {
          const key = ArtifactSubStatKeyMap[name]
          return {
            key,
            value: key?.endsWith("_") ?
              Math.round(value * 1000) / 10 : // decimal to percentage
              value,
          }
        }),
      }
      artifacts.push(raw)
    }
  }

  return { artifacts }
}

// Referencing https://wormtql.gitbook.io/mona-uranai/ (they don't seem to update this anymore...)

const ArtifactSlotKeyMap: Dict<string, SlotKey> = {
  "flower": "flower",
  "feather": "plume",
  "sand": "sands",
  "cup": "goblet",
  "head": "circlet",
}

// Referencing https://github.com/daydreaming666/Amenoma/blob/main/ArtScanner/ArtsInfo.py SetNamesGenshinArt

const ArtifactSetKeyMap: Dict<string, ArtifactSetKey> = {
  "adventurer": "Adventurer",
  "archaicPetra": "ArchaicPetra",
  "berserker": "Berserker",
  "blizzardStrayer": "BlizzardStrayer",
  "bloodstainedChivalry": "BloodstainedChivalry",
  "braveHeart": "BraveHeart",
  "crimsonWitch": "CrimsonWitchOfFlames",
  "defenderWill": "DefendersWill",
  "gambler": "Gambler",
  "gladiatorFinale": "GladiatorsFinale",
  "heartOfDepth": "HeartOfDepth",
  "instructor": "Instructor",
  "lavaWalker": "Lavawalker",
  "luckyDog": "LuckyDog",
  "maidenBeloved": "MaidenBeloved",
  "martialArtist": "MartialArtist",
  "noblesseOblige": "NoblesseOblige",
  "prayersForDestiny": "PrayersForDestiny",
  "prayersForIllumination": "PrayersForIllumination",
  "prayersForWisdom": "PrayersForWisdom",
  "prayersToSpringtime": "PrayersToSpringtime",
  "resolutionOfSojourner": "ResolutionOfSojourner",
  "retracingBolide": "RetracingBolide",
  "scholar": "Scholar",
  "exile": "TheExile",
  "thunderingFury": "ThunderingFury",
  "thunderSmoother": "Thundersoother",
  "tinyMiracle": "TinyMiracle",
  "travelingDoctor": "TravelingDoctor",
  "viridescentVenerer": "ViridescentVenerer",
  "wandererTroupe": "WanderersTroupe",
  "tenacityOfTheMillelith": "TenacityOfTheMillelith",
  "paleFlame": "PaleFlame",
  "emblemOfSeveredFate": "EmblemOfSeveredFate",
  "shimenawaReminiscence": "ShimenawasReminiscence",
  "huskOfOpulentDreams": "HuskOfOpulentDreams",
  "oceanHuedClam": "OceanHuedClam",
  "EchoesOfAnOffering": "EchoesOfAnOffering",
  "VermillionHereafter": "VermillionHereafter",
}
const ArtifactMainStatKeyMap: Dict<string, MainStatKey> = {
  "cureEffect": "heal_",
  "lifeStatic": "hp",
  "lifePercentage": "hp_",
  "attackStatic": "atk",
  "attackPercentage": "atk_",
  // "defendStatic": "def",
  "defendPercentage": "def_",
  "critical": "critRate_",
  // // "eCritical": "",
  "criticalDamage": "critDMG_",
  "elementalMastery": "eleMas",
  "recharge": "enerRech_",
  "thunderBonus": "electro_dmg_",
  "fireBonus": "pyro_dmg_",
  "waterBonus": "hydro_dmg_",
  "iceBonus": "cryo_dmg_",
  "windBonus": "anemo_dmg_",
  "rockBonus": "geo_dmg_",
  "grassBonus": "dendro_dmg_",
  "physicalBonus": "physical_dmg_",
  // "bonus": "",
  // "aBonus": "",
  // "bBonus": "",
  // "eBonus": "",
  // "qBonus": "",
}
const ArtifactSubStatKeyMap: Dict<string, SubstatKey> = {
  "lifeStatic": "hp",
  "lifePercentage": "hp_",
  "attackStatic": "atk",
  "attackPercentage": "atk_",
  "defendStatic": "def",
  "defendPercentage": "def_",
  "critical": "critRate_",
  "criticalDamage": "critDMG_",
  "elementalMastery": "eleMas",
  "recharge": "enerRech_",
}
