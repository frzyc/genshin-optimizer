import ArtifactDatabase from './ArtifactDatabase';
import Artifact from '../Artifact/Artifact';
import { checkDuplicate } from '../Artifact/ArtifactEditor';
import { IArtifact, Substat, MainStatKey, SubstatKey } from '../Types/artifact';
import { ArtifactSetKey, SlotKey } from "../Types/consts";

type GenshinArtVersion = "1";

const DefaultVersion: GenshinArtVersion = "1";

// map is referencing https://wormtql.gitbook.io/mona-uranai/

const ArtifactSlotKeyMap = new Map<string, SlotKey>([
  ["flower", "flower"],
  ["feather", "plume"],
  ["sand", "sands"],
  ["cup", "goblet"],
  ["head", "circlet"],
]);

const ArtifactSetKeyMap = new Map<string, ArtifactSetKey>([
  ["adventurer", "Adventurer"],
  ["archaicPetra", "ArchaicPetra"],
  ["berserker", "Berserker"],
  ["blizzardStrayer", "BlizzardStrayer"],
  ["bloodstainedChivalry", "BloodstainedChivalry"],
  ["braveHeart", "BraveHeart"],
  ["crimsonWitch", "CrimsonWitchOfFlames"],
  ["defenderWill", "DefendersWill"],
  ["gambler", "Gambler"],
  ["gladiatorFinale", "GladiatorsFinale"],
  ["heartOfDepth", "HeartOfDepth"],
  ["instructor", "Instructor"],
  ["lavaWalker", "Lavawalker"],
  ["luckyDog", "LuckyDog"],
  ["maidenBeloved", "MaidenBeloved"],
  ["martialArtist", "MartialArtist"],
  ["noblesseOblige", "NoblesseOblige"],
  ["prayersForDestiny", "PrayersForDestiny"],
  ["prayersForIllumination", "PrayersForIllumination"],
  ["prayersForWisdom", "PrayersForWisdom"],
  ["prayersToSpringtime", "PrayersToSpringtime"],
  ["resolutionOfSojourner", "ResolutionOfSojourner"],
  ["retracingBolide", "RetracingBolide"],
  ["scholar", "Scholar"],
  ["exile", "TheExile"],
  ["thunderingFury", "ThunderingFury"],
  ["thunderSmoother", "Thundersoother"],
  ["tinyMiracle", "TinyMiracle"],
  ["travelingDoctor", "TravelingDoctor"],
  ["viridescentVenerer", "ViridescentVenerer"],
  ["wandererTroupe", "WanderersTroupe"],
  ["tenacityOfTheMillelith", "TenacityOfTheMillelith"],
  ["paleFlame", "PaleFlame"],
]);

const ArtifactMainStatKeyMap = new Map<string, MainStatKey>([
  ["cureEffect", "heal_"],
  ["lifeStatic", "hp"],
  ["lifePercentage", "hp_"],
  ["attackStatic", "atk"],
  ["attackPercentage", "atk_"],
  // ["defendStatic", "def"],
  ["defendPercentage", "def_"],
  ["critical", "critRate_"],
  // // ["eCritical", ""],
  ["criticalDamage", "critDMG_"],
  ["elementalMastery", "eleMas"],
  ["recharge", "enerRech_"],
  ["thunderBonus", "electro_dmg_"],
  ["fireBonus", "pyro_dmg_"],
  ["waterBonus", "hydro_dmg_"],
  ["iceBonus", "cryo_dmg_"],
  ["windBonus", "anemo_dmg_"],
  ["rockBonus", "geo_dmg_"],
  // ["grassBonus", "dendro_dmg_"],  // the day will come...
  ["physicalBonus", "physical_dmg_"],
  // ["bonus", ""],
  // ["aBonus", ""],
  // ["bBonus", ""],
  // ["eBonus", ""],
  // ["qBonus", ""],
]);

const ArtifactSubStatKeyMap = new Map<string, SubstatKey>([
  ["lifeStatic", "hp"],
  ["lifePercentage", "hp_"],
  ["attackStatic", "atk"],
  ["attackPercentage", "atk_"],
  ["defendStatic", "def"],
  ["defendPercentage", "def_"],
  ["critical", "critRate_"],
  ["criticalDamage", "critDMG_"],
  ["elementalMastery", "eleMas"],
  ["recharge", "enerRech_"],
]);

const GetConvertedArtifactsOfVersion = {
  "1": GetConvertedArtifactsVersion1
};

function tryGetFromMap<ValueType>(map: Map<string, ValueType>, key: string): ValueType {
  const result = map.get(key);
  if (result === undefined) throw new Error(`$unknown key: ${key} in ${typeof map}`);
  return result;
}

function GetConvertedArtifactsVersion1(dataObj: any) {
  let convertedArtifacts: IArtifact[] = [];

  for (const property in dataObj) {
    if (!ArtifactSlotKeyMap.has(property)) {
      continue;
    }
    for (const genshinArtArtifact of dataObj[property]) {
      const { setName, star, level, position, mainTag } = genshinArtArtifact;
      const mainStatKey = tryGetFromMap(ArtifactMainStatKeyMap, mainTag.name);
      let artifact: IArtifact = {
        setKey: tryGetFromMap(ArtifactSetKeyMap, setName),
        numStars: star,
        level: level,
        slotKey: tryGetFromMap(ArtifactSlotKeyMap, position),
        mainStatKey: mainStatKey,
        substats: [],
        mainStatVal: Artifact.mainStatValues(star, mainStatKey)[level],
        location: "",
        lock: false,
      };
      for (const genshinArtSubstat of genshinArtArtifact.normalTags) {
        let substat: Substat = {
          key: tryGetFromMap(ArtifactSubStatKeyMap, genshinArtSubstat.name),
          value: genshinArtSubstat.value,
        };
        if (substat.key.slice(-1) === "_") {
          substat.value = Math.round(substat.value * 1000) / 10;  // decimal to percentage
        }
        artifact.substats.push(substat);
      }

      let errMsgs = Artifact.substatsValidation(artifact);
      if (errMsgs.length) {
        throw new Error(`id ${genshinArtArtifact.id}: ${errMsgs}`);
      }

      convertedArtifacts.push(artifact);
    }
  }

  return convertedArtifacts;
}

interface IImportResult {
  total: number,
  new: number,
  upgraded: number,
  dupe: number,
  deleted: number,
}

function GenshinArtImport(dataObj: any, deleteExisting: boolean, detectDupe: boolean) {
  if (deleteExisting && !detectDupe) {
    throw new Error("GenshinArtImport: detectDupe should be enabled when deleteExisting is turned on");
  }

  const usingVersion: GenshinArtVersion = "version" in dataObj ? dataObj.version : DefaultVersion;
  let importedArtifacts = GetConvertedArtifactsOfVersion[usingVersion](dataObj);
  let importResult: IImportResult = {
    total: importedArtifacts.length,
    new: 0,
    upgraded: 0,
    dupe: 0,
    deleted: 0,
  }

  if (!detectDupe) {
    throw new Error("feature is disabled (who actually needs this?)");
    // for (const artifact of importedArtifacts) {
    //   ArtifactDatabase.update(artifact);
    // }
    // return importResult;
  }

  let artifactIdsToRemove = new Set(ArtifactDatabase.getIdList());
  for (const artifact of importedArtifacts) {
    const { dupId, isDup } = checkDuplicate(artifact);
    if (!dupId) {
      importResult.new++;
      ArtifactDatabase.update(artifact);
      continue;
    }

    artifactIdsToRemove.delete(dupId);

    if (isDup) {
      importResult.dupe++;
      continue;
    }

    importResult.upgraded++;
    const oldArtifact = ArtifactDatabase.get(dupId)!;
    artifact.id = dupId;
    artifact.location = oldArtifact.location;
    artifact.lock = oldArtifact.lock;
    ArtifactDatabase.update(artifact);
  }

  if (deleteExisting) {
    for (const artifactId of artifactIdsToRemove) {
      ArtifactDatabase.removeArtifactById(artifactId);
    }
    importResult.deleted = artifactIdsToRemove.size;
  }

  return importResult;
}

const GenshinArtCheckForErrorVersion = {
  "1": GenshinArtDataCheckForErrorVersion1
};

function GenshinArtDataCheckForErrorVersion1(dataObj: any) {
  for (const property in dataObj) {
    if (ArtifactSlotKeyMap.has(property) && !Array.isArray(dataObj[property])) {
      return `Invalid type for "${property}", expected array`;
    }
  }
  return "";
}

function GenshinArtDataCheckForError(dataObj: any) {
  let checkingVersion: GenshinArtVersion;
  if ("version" in dataObj) {
    if (!(dataObj.version in GenshinArtCheckForErrorVersion)) {
      return `Unknown version: ${dataObj.version}`;
    }
    checkingVersion = dataObj.version;
  } else {
    checkingVersion = DefaultVersion;
  }

  return GenshinArtCheckForErrorVersion[checkingVersion](dataObj);
}

function GenshinArtGetCount(dataObj: any) {
  let count = 0;
  for (const property in dataObj) {
    if (ArtifactSlotKeyMap.has(property)) {
      count += dataObj[property].length;
    }
  }
  return count;
}

export { GenshinArtDataCheckForError, GenshinArtGetCount, GenshinArtImport };
