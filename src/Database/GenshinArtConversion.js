import ArtifactDatabase from '../Database/ArtifactDatabase';
import Artifact from '../Artifact/Artifact';

const ArtifactSlotKeyMap = {
  "flower": "flower",
  "feather": "plume",
  "sand": "sands",
  "cup": "goblet",
  "head": "circlet"
};

const ArtifactSetKeyMap = {
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
};

const ArtifactStatKeyMap = {
  "cureEffect": "heal_",
  "lifeStatic": "hp",
  "lifePercentage": "hp_",
  "attackStatic": "atk",
  "attackPercentage": "atk_",
  "defendStatic": "def",
  "defendPercentage": "def_",
  "critical": "critRate_",
  // "eCritical": "",
  "criticalDamage": "critDMG_",
  "elementalMastery": "eleMas",
  "recharge": "enerRech_",
  "thunderBonus": "physical_dmg_",
  "fireBonus": "pyro_dmg_",
  "waterBonus": "hydro_dmg_",
  "iceBonus": "cryo_dmg_",
  "windBonus": "anemo_dmg_",
  "rockBonus": "geo_dmg_",
  "physicalBonus": "physical_dmg_",
  // "bonus": "",
  // "aBonus": "",
  // "bBonus": "",
  // "eBonus": "",
  // "qBonus": "",
};

const DefaultVersion = "1";

const GetConvertedArtifactsOfVersion = {
  "1": GetConvertedArtifactsVersion1
};

function GetConvertedArtifactsVersion1(dataObj) {
  let convertedArtifacts = [];

  for (const property in dataObj) {
    if (!(property in ArtifactSlotKeyMap)) {
      continue;
    }
    for (const genshinArtArtifact of dataObj[property]) {
      let artifact = {
        id: `artifact_${genshinArtArtifact.id}`,
        setKey: ArtifactSetKeyMap[genshinArtArtifact.setName],
        numStars: genshinArtArtifact.star,
        level: genshinArtArtifact.level,
        slotKey: ArtifactSlotKeyMap[genshinArtArtifact.position],
        mainStatKey: ArtifactStatKeyMap[genshinArtArtifact.mainTag.name],
        substats: []
      }
      for (const genshinArtSubstat of genshinArtArtifact.normalTags) {
        let substat = {
          key: ArtifactStatKeyMap[genshinArtSubstat.name],
          value: genshinArtSubstat.value,
        };
        if (substat.key.slice(-1) === "_") {
          // decimal to percentage
          substat.value *= 100;
        }
        artifact.substats.push(substat);
      }

      let errMsgs = Artifact.substatsValidation(artifact);
      if (errMsgs.length) {
        let error = `${artifact.id}: ${errMsgs}`;
        throw error;
      }

      convertedArtifacts.push(artifact);
    }
  }

  return convertedArtifacts;
}

function GenshinArtImport(dataObj, deleteExisting, ignoreDupe) {
  if (deleteExisting) {
    ignoreDupe = false;  // ignoreDupe should be disabled when deleteExisting is turned on
  }

  let importedArtifacts = GetConvertedArtifactsOfVersion["version" in dataObj ? dataObj.version : DefaultVersion](dataObj);

  // TODO    
}

const GenshinArtCheckForErrorVersion = {
  "1": GenshinArtDataCheckForErrorVersion1
};

function GenshinArtDataCheckForErrorVersion1(dataObj) {
  for (const property in dataObj) {
    if (property in ArtifactSlotKeyMap && !Array.isArray(dataObj[property])) {
      return `Invalid type for "${property}", expected array`;
    }
  }
  return "";
}

function GenshinArtDataCheckForError(dataObj) {
  let checkingVersion;
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

function GenshinArtGetCount(dataObj) {
  let count = 0;
  for (const property in dataObj) {
    if (property in ArtifactSlotKeyMap) {
      count += dataObj[property].length;
    }
  }
  return count;
}

export { GenshinArtDataCheckForError, GenshinArtGetCount, GenshinArtImport };
