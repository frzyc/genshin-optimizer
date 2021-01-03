import Artifact from "../Artifact/Artifact";
import ArtifactDatabase from "../Artifact/ArtifactDatabase";
import { CharacterData, characterStatBase, LevelsData } from "../Data/CharacterData";
import ElementalData from "../Data/ElementalData";
import { AttachLazyFormulas } from "../Stat";
import ConditionalsUtil from "../Util/ConditionalsUtil";
import { clamp, deepClone } from "../Util/Util";
import Weapon from "../Weapon/Weapon";
import CharacterDatabase from "./CharacterDatabase";

export default class Character {
  //do not instantiate.
  constructor() {
    if (this instanceof Character)
      throw Error('A static class cannot be instantiated.');
  }

  static getBaseStatValue = (charKey, levelKey, statKey, defVal = 0) => {
    if (statKey === "specializedStatKey") return this.getSpecializedStatKey(charKey);
    if (statKey === "specializedStatVal") return this.getSpeicalizedStatVal(charKey, levelKey)
    if (statKey in characterStatBase) return characterStatBase[statKey]
    let characterObj = this.getCDataObj(charKey)
    if (characterObj && statKey in characterObj.baseStat) return characterObj.baseStat[statKey][this.getIndexFromlevelkey(levelKey)]
    return defVal
  }

  static getCDataObj = (charKey) => CharacterData[charKey];
  static getElementalName = (elementalKey, defVal = "") => (ElementalData?.[elementalKey]?.name || defVal)
  static getAllCharacterKeys = () => Object.keys(CharacterData)

  static getName = (charKey, defVal = "") => (this.getCDataObj(charKey)?.name || defVal)
  static getStar = (charKey, defVal = 0) => (this.getCDataObj(charKey)?.star || defVal)
  static getElementalKey = (charKey, defVal = "") => (this.getCDataObj(charKey)?.elementKey || defVal)
  static getElementalKeys = () => Object.keys(ElementalData)
  static getWeaponTypeKey = (charKey, defVal = "") => (this.getCDataObj(charKey)?.weaponTypeKey || defVal)
  static getConstellationName = (charKey, defVal = "") => (this.getCDataObj(charKey)?.constellationName || defVal)
  static getTitles = (charKey, defVal = []) => (this.getCDataObj(charKey)?.titles || defVal)

  //LEVEL
  static getlevelKeys = () => Object.keys(LevelsData)
  static getlevelNames = (levelKey, defVal = "") => (LevelsData?.[levelKey]?.name || defVal)
  static getIndexFromlevelkey = (levelKey) => this.getlevelKeys().indexOf(levelKey);
  static getLevel = (levelKey, defVal = 0) => (LevelsData?.[levelKey]?.level || defVal)
  static getAscension = (levelKey, defVal = 0) => (LevelsData?.[levelKey]?.asend || defVal)

  //SPECIALIZED STAT
  static getSpecializedStat = (charKey) => this.getCDataObj(charKey)?.specializeStat;
  static getSpecializedStatKey = (charKey) => this.getSpecializedStat(charKey)?.key;
  static getSpeicalizedStatVal = (charKey, levelKey) => this.getSpecializedStat(charKey)?.value?.[this.getIndexFromlevelkey(levelKey)]
  //ASSETS
  static getThumb = (charKey, defVal = null) => this.getCDataObj(charKey).thumbImg || defVal
  static getCard = (charKey, defVal = null) => this.getCDataObj(charKey).cardImg || defVal
  static getTalentImg = (charKey, talentKey, defVal = null) => this.getCDataObj(charKey)?.talent?.[talentKey]?.img || defVal
  static getConstellationImg = (charKey, constIndex, defVal = null) => this.getCDataObj(charKey)?.talent?.[`constellation${constIndex + 1}`]?.img || defVal

  //talents
  static getTalentName = (charKey, talentKey, defVal = "") => this.getCDataObj(charKey)?.talent?.[talentKey]?.name || defVal
  static getTalentLevelBoost = (character, talentKey) => {
    let { constellation } = character
    return talentKey === "skill" ? (constellation >= 3 ? 3 : 0) :
      talentKey === "burst" && constellation >= 5 ? 3 : 0
  }
  static getTalentLevelKey = (character, talentKey, withBoost = false) => {
    if (talentKey === "auto" || talentKey === "skill" || talentKey === "burst") {
      let talentLvlKey = character?.talentLevelKeys?.[talentKey] || 0;
      let levelBoost = this.getTalentLevelBoost(character, talentKey)
      talentLvlKey = clamp(talentLvlKey + levelBoost, 0, 14)
      return withBoost ? { talentLvlKey, levelBoost } : talentLvlKey
    } else return withBoost ? {} : null
  }
  static getTalentDocument = (charKey, talentKey, defVal = []) => this.getCDataObj(charKey)?.talent?.[talentKey]?.document || defVal
  static getTalentFields = (charKey, talentKey, defVal = []) => this.getCDataObj(charKey)?.talent?.[talentKey]?.fields || defVal
  static getTalentStats = (charKey, talentKey, constellation, ascension, defVal = null) => {
    let stats = this.getCDataObj(charKey)?.talent?.[talentKey]?.stats
    if (typeof stats === "function")
      return stats(constellation, ascension)
    return stats || defVal
  }
  static getTalentStatsAll = (charKey, constellation, ascension) => {
    let talents = this.getCDataObj(charKey)?.talent
    let statsArr = []
    Object.keys(talents).forEach(talentKey => {
      let stats = this.getTalentStats(charKey, talentKey, constellation, ascension)
      if (stats) statsArr.push(stats)
    })
    return statsArr
  }
  static getTalentConditional = (charKey, talentKey, talentLvlKey, constellation, ascension, defVal = null) => {
    let cond = this.getCDataObj(charKey)?.talent?.[talentKey]?.conditional
    if (typeof cond === "function")
      return cond(talentLvlKey, constellation, ascension)
    return cond || defVal
  }
  static getTalentConditionalStats = (charKey, talentKey, talentLvlKey, constellation, ascension, conditionalNum, defVal = null) => {
    if (!conditionalNum) return defVal
    let conditional = this.getTalentConditional(charKey, talentKey, talentLvlKey, constellation, ascension)
    if (!conditional || !conditional.stats) return defVal
    let [stats, stacks] = ConditionalsUtil.getConditionalStats(conditional, conditionalNum)
    if (!stacks) return defVal
    return Object.fromEntries(Object.entries(stats).map(([key, val]) => key === "formulaOverrides" ? [key, val] : [key, val * stacks]))
  }
  static getTalentConditionalFields = (charKey, talentKey, talentLvlKey, constellation, ascension, conditionalNum, defVal = []) => {
    if (!conditionalNum) return defVal
    return this.getTalentConditional(charKey, talentKey, talentLvlKey, constellation, ascension)?.fields || defVal
  }
  static isAutoInfusable = (charKey, defVal = false) => this.getCDataObj(charKey)?.talent?.auto?.infusable || defVal


  //CHARCTER OBJ
  static hasOverride = (character, statKey) => character && character.baseStatOverrides ? (statKey in character.baseStatOverrides) : false;

  static getStatValueWithOverrideRaw = (character, statKey, defVal = 0) => {
    if (this.hasOverride(character, statKey)) return character?.baseStatOverrides?.[statKey]
    else return this.getBaseStatValue(character.characterKey, character.levelKey, statKey, defVal)
  }
  static getStatValueWithOverride = (character, statKey, defVal = 0) => {
    if (statKey === "atk") {
      //get weapon atk as part of the base atk.
      let weaponatk = Weapon.getWeaponMainStatValWithOverride(character?.weapon)
      return weaponatk + this.getStatValueWithOverrideRaw(character, statKey, defVal)
    }
    return this.getStatValueWithOverrideRaw(character, statKey, defVal)
  }
  static getLevelWithOverride = (character, defVal = 0) => {
    if (character.overrideLevel) return character.overrideLevel;
    else return this.getLevel(character.levelKey, defVal);
  }

  //equipment, with consideration on swapping equipped.
  static equipArtifacts = (characterId, artifactIds) => {
    let character = CharacterDatabase.getCharacter(characterId)
    if (!character) return;
    let artIdsOnCharacter = character.equippedArtifacts;
    let artIdsNotOnCharacter = artifactIds

    //swap, by slot
    Artifact.getArtifactSlotKeys().forEach(slotKey => {
      let artNotOnChar = ArtifactDatabase.getArtifact(artIdsNotOnCharacter?.[slotKey])
      if (artNotOnChar.location === characterId) return; //it is already equipped
      let artOnChar = ArtifactDatabase.getArtifact(artIdsOnCharacter?.[slotKey])
      let notCharLoc = (artNotOnChar?.location || "")
      //move current art to other char
      if (artOnChar) ArtifactDatabase.moveToNewLocation(artOnChar.id, notCharLoc)
      //move current art to other char
      if (notCharLoc) CharacterDatabase.equipArtifact(notCharLoc, artOnChar)
      //move other art to current char
      if (artNotOnChar) ArtifactDatabase.moveToNewLocation(artNotOnChar.id, characterId)
    })
    //move other art to current char 
    character.equippedArtifacts = {}
    Object.entries(artifactIds).forEach(([key, artid]) =>
      character.equippedArtifacts[key] = artid)
    CharacterDatabase.updateCharacter(character);
  }
  static removeCharacter(characterId) {
    let character = CharacterDatabase.getCharacter(characterId)
    if (character.equippedArtifacts)
      Object.values(character.equippedArtifacts).forEach(artid =>
        ArtifactDatabase.moveToNewLocation(artid, ""))
    CharacterDatabase.removeCharacterById(characterId)
  }

  static calculateBuild = (character) => {
    let artifacts = Object.fromEntries(Object.entries(character.equippedArtifacts).map(([key, artid]) => [key, ArtifactDatabase.getArtifact(artid)]))
    let initialStats = Character.calculateCharacterWithWeaponStats(character)
    return this.calculateBuildWithObjs(character.artifactConditionals, initialStats, artifacts)
  }

  static calculateBuildWithObjs = (artifactConditionals, charAndWeapon, artifacts) => {
    let setToSlots = Artifact.setToSlots(artifacts)
    let artifactSetEffectsStats = Artifact.getArtifactSetEffectsStats(setToSlots)

    let stats = deepClone(charAndWeapon)
    //add artifact and artifactsets
    Object.values(artifacts).forEach(art => {
      if (!art) return
      //main stats
      stats[art.mainStatKey] = (stats[art.mainStatKey] || 0) + Artifact.getMainStatValue(art.mainStatKey, art.numStars, art.level)
      //substats
      art.substats.forEach((substat) =>
        substat && substat.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))
    })
    //setEffects
    artifactSetEffectsStats.forEach(stat => stats[stat.key] = (stats[stat.key] || 0) + stat.statVal)
    //setEffects conditionals
    artifactConditionals && artifactConditionals.forEach(conditional => {
      let { srcKey: setKey, srcKey2: setNumKey } = conditional
      let condStats = Artifact.getArtifactConditionalStats(setKey, setNumKey, conditional.conditionalNum)
      if (condStats) Object.entries(condStats).forEach(([statKey, val]) => stats[statKey] = (stats[statKey] || 0) + val)
    })
    AttachLazyFormulas(stats)
    return {
      artifactIds: Object.fromEntries(Object.entries(artifacts).map(([key, val]) => [key, val?.id])),
      setToSlots,
      finalStats: stats,
      artifactConditionals
    }
  }
  static calculateCharacterWithWeaponStats = (character) => {
    let statKeys = ["hp", "atk", "def", ...Object.keys(characterStatBase)]
    let initialStats = Object.fromEntries(statKeys.map(key => {
      if (key === "hp" || key === "def" || key === "atk")
        return ["base_" + key, this.getStatValueWithOverride(character, key)]
      else
        return [key, this.getStatValueWithOverride(character, key)]
    }))

    //add element
    initialStats.char_ele_key = this.getElementalKey(character.characterKey)

    //add specialized stat
    let specialStatKey = Character.getStatValueWithOverride(character, "specializedStatKey")
    if (specialStatKey) {
      let specializedStatVal = Character.getStatValueWithOverride(character, "specializedStatVal")
      initialStats[specialStatKey] = (initialStats[specialStatKey] || 0) + specializedStatVal
    }

    let addStatsObj = stats => stats && Object.entries(stats).forEach(([key, val]) => {
      if (key === "formulaOverrides") {
        initialStats.formulaOverrides = [...(initialStats.formulaOverrides || []), ...val]
        return
      }

      if (key === "hp" || key === "def" || key === "atk")
        key = "base_" + key
      initialStats[key] = (initialStats[key] || 0) + val
    })

    let { characterKey, levelKey, constellation, talentConditionals = [] } = character
    let ascension = Character.getAscension(levelKey)
    //add stats from talentconditionals
    talentConditionals.forEach(cond => {
      let talentKey = cond.srcKey
      let talentLvlKey = Character.getTalentLevelKey(character, talentKey)
      addStatsObj(Character.getTalentConditionalStats(characterKey, talentKey, talentLvlKey, constellation, ascension, cond.conditionalNum, {}))
    })

    //add stats from all talents
    let allTalentStats = Character.getTalentStatsAll(characterKey, constellation, ascension)
    allTalentStats.forEach(addStatsObj)

    let weaponStats = Weapon.createWeaponBundle(character)
    //add weapon stats
    if (weaponStats.subKey)
      initialStats[weaponStats.subKey] = (initialStats[weaponStats.subKey] || 0) + weaponStats.subVal
    if (weaponStats.bonusStats) addStatsObj(weaponStats.bonusStats)
    if (weaponStats.conditionalStats) addStatsObj(weaponStats.conditionalStats)
    return initialStats
  }

}