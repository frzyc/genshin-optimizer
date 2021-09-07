import { ArtCharDatabase } from '../Database';
import { IArtifact, MainStatKey, SubstatKey } from '../../Types/artifact';
import { parseArtifact, validateArtifact } from '../../Database/validation';
import { ArtifactSetKey, SlotKey } from "../../Types/consts";
import { DBStorage, SandboxStorage } from '../DBStorage';

const DefaultVersion = "1";
const GetConvertedArtifactsOfVersion: Dict<string, (data: any) => { artifacts: IArtifact[], invalidCount: number }> = {
  "1": importMona1
};

export function importMona(dataObj: any, oldDatabase: ArtCharDatabase): IImportResult | undefined {
  const version = dataObj.version ?? DefaultVersion
  const converted = GetConvertedArtifactsOfVersion[version]?.(dataObj)

  if (!converted)
    return // TODO: Maybe add failure reason, or throws here

  const { artifacts, invalidCount } = converted
  const result: IImportResult = {
    storage: new SandboxStorage(oldDatabase.storage),
    totalCount: artifacts.length + invalidCount,
    newCount: 0,
    upgradeCount: 0,
    dupCount: 0,
    oldIds: new Set(oldDatabase.arts.keys),
    invalidCount,
  }
  const newDatabase = new ArtCharDatabase(result.storage) // validate storage entries

  const artifactIdsToRemove = result.oldIds
  for (const artifact of artifacts) {
    let { duplicated, upgraded } = oldDatabase.findDuplicates(artifact)

    // Don't reuse dups/upgrades
    duplicated = duplicated.filter(id => artifactIdsToRemove.has(id))
    upgraded = upgraded.filter(id => artifactIdsToRemove.has(id))

    // Prefer dups over upgrades
    const id = duplicated[0] ?? upgraded[0] ?? ""
    artifactIdsToRemove.delete(id)

    if (!duplicated.length)
      newDatabase.updateArt(validateArtifact(artifact, id).artifact)

    if (duplicated.length) result.dupCount++
    else if (upgraded.length) result.upgradeCount++
    else result.newCount++
  }

  return result
}

// backup 0: https://github.com/wormtql/genshin_artifact/blob/main/src/assets/artifacts/data/*/index.js
// backup 1: https://github.com/YuehaiTeam/cocogoat/blob/main/src/App/export/Mona.ts

function importMona1(dataObj: any): { artifacts: IArtifact[], invalidCount: number } {
  let invalidCount = 0
  const artifacts: IArtifact[] = []

  for (const property in dataObj) {
    if (!(property in ArtifactSlotKeyMap))
      continue

    for (const genshinArtArtifact of dataObj[property]) {
      const { setName, star, level, position, mainTag } = genshinArtArtifact
      if (star < 3) {
        // invalidCount++//do not increment since its technically not an invalid artifact, just not part of our system.
        continue
      }
      const flex = parseArtifact({
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
      })

      if (!flex) {
        invalidCount++
        continue
      }

      artifacts.push(flex)
    }
  }

  return { artifacts, invalidCount }
}

interface IImportResult {
  storage: DBStorage
  totalCount: number,
  newCount: number,
  upgradeCount: number,
  dupCount: number,
  oldIds: Set<string>,
  invalidCount: number,
}

// Referencing https://wormtql.gitbook.io/mona-uranai/ (they don't seem to update this anymore...)

const ArtifactSlotKeyMap: Dict<string, SlotKey> = {
  "flower": "flower",
  "feather": "plume",
  "sand": "sands",
  "cup": "goblet",
  "head": "circlet",
}
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
  // "grassBonus": "dendro_dmg_",  // the day will come...
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
