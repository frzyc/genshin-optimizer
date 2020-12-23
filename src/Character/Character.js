import Artifact from "../Artifact/Artifact";
import ArtifactDatabase from "../Artifact/ArtifactDatabase";
import Assets from "../Assets/Assets";
import { LevelsData, CharacterData, characterStatBase, ElementalData } from "../Data/CharacterData";
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

  static getCDataObj = (charKey) => charKey ? CharacterData[charKey] : null;
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
  static getThumb = (charKey) => Assets.characters[charKey] ? Assets.characters[charKey].thumb : null
  static getCard = (charKey) => Assets.characters[charKey] ? Assets.characters[charKey].card : null

  //CHARCTER OBJ
  static hasOverride = (character, statKey) => character && character.baseStatOverrides ? (statKey in character.baseStatOverrides) : false;

  static getStatValueWithOverride = (character, statKey, defVal = 0) => {
    if (this.hasOverride(character, statKey)) return character?.baseStatOverrides?.[statKey]
    else return this.getBaseStatValue(character.characterKey, character.levelKey, statKey, defVal)
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

  //GENERAL
  static calculateCharacterFinalStat = (totalBonusStats, character, weapon) => {
    //add weapon substats
    if (weapon.subKey) totalBonusStats[weapon.subKey] = (totalBonusStats[weapon.subKey] || 0) + weapon.subVal
    //Add any weapon bonus Stats
    if (weapon.bonusStats) Object.entries(weapon.bonusStats).forEach(([key, val]) =>
      totalBonusStats[key] = (totalBonusStats[key] || 0) + val)
    //Add weapon conditional
    if (weapon.conditionalStats) Object.entries(weapon.conditionalStats).forEach(([key, val]) =>
      totalBonusStats[key] = (totalBonusStats[key] || 0) + val)
    const flatAndPercentStat = (flatStatKey, percentStatkey) => {
      let base = this.getStatValueWithOverride(character, flatStatKey)
      if (flatStatKey === "atk") base += weapon.mainAtkValue
      let percent = (totalBonusStats?.[percentStatkey] || 0)
      let flat = (totalBonusStats?.[flatStatKey] || 0)
      return base * (1 + percent / 100) + flat
    }
    const flatStat = (statKey) => {
      let base = this.getStatValueWithOverride(character, statKey)
      let flat = (totalBonusStats?.[statKey] || 0)
      return base + flat
    }
    let finalStat = Object.fromEntries(Object.entries(totalBonusStats).map(([key, val]) => {
      if (key === "hp_" || key === "def_" || key === "atk_") return null;
      if (key === "hp" || key === "def" || key === "atk")
        return [key, flatAndPercentStat(key, key + "_")]
      return [key, flatStat(key)]
    }).filter(v => v))
    let eleKey = this.getElementalKey(character.characterKey)
    let crit_multi = (1 + (finalStat.crit_rate / 100) * (1 + finalStat.crit_dmg / 100))
    finalStat.crit_multi = crit_multi
    finalStat.phy_atk = finalStat.atk * (1 + finalStat.phy_dmg / 100) * crit_multi
    finalStat[`${eleKey}_ele_atk`] = finalStat.atk * (1 + finalStat[`${eleKey}_ele_dmg`] / 100) * crit_multi
    return finalStat
  }
  //buildworker doesn't have access to the database, so we need to feed in the objs
  static calculateBuildWithObjs = (character, artifacts, weaponStats) => {
    if (!character) return
    let setToSlots = Artifact.setToSlots(artifacts)
    let artifactSetEffect = Artifact.getArtifactSetEffects(setToSlots)
    let totalBonusStats = Artifact.calculateArtifactStats(artifacts, artifactSetEffect)

    //add specialized stat
    let specialStatKey = Character.getStatValueWithOverride(character, "specializedStatKey")
    if (specialStatKey) {
      let specializedStatVal = Character.getStatValueWithOverride(character, "specializedStatVal")
      totalBonusStats[specialStatKey] = (totalBonusStats[specialStatKey] || 0) + specializedStatVal
    }
    let artifactIds = Object.fromEntries(Object.entries(artifacts).map(([key, val]) => [key, val?.id]))
    return {
      artifactIds,
      totalArtifactStats: totalBonusStats,
      artifactSetEffect,
      setToSlots,
      finalStats: Character.calculateCharacterFinalStat(totalBonusStats, character, weaponStats)
    }
  }
}