import Artifact from "../Artifact/Artifact";
import ArtifactDatabase from "../Artifact/ArtifactDatabase";
import { CharacterData, CharacterDataImport, characterStatBase, LevelsData } from "../Data/CharacterData";
import ElementalData from "../Data/ElementalData";
import { AttachLazyFormulas } from "../StatData";
import ConditionalsUtil from "../Util/ConditionalsUtil";
import { clamp, deepClone } from "../Util/Util";
import Weapon from "../Weapon/Weapon";
import CharacterDatabase from "./CharacterDatabase";

export default class Character {
  //do not instantiate.
  constructor() { if (this instanceof Character) throw Error('A static class cannot be instantiated.'); }
  static getCharacterDataImport = () => CharacterDataImport
  static getBaseStatValue = (character, statKey, defVal = 0) => {
    let { characterKey, levelKey } = character
    if (statKey === "specializedStatKey") return this.getSpecializedStatKey(characterKey);
    if (statKey === "specializedStatVal") return this.getSpeicalizedStatVal(characterKey, levelKey)
    if (statKey === "atk_weapon") return Weapon.getWeaponMainStatValWithOverride(character?.weapon)
    if (statKey === "char_level" || statKey === "enemy_level") return this.getLevel(levelKey)
    if (statKey === "enemy_phy_res" || statKey.includes("enemy_ele_res")) return 10
    if (statKey in characterStatBase) return characterStatBase[statKey]
    let characterObj = this.getCDataObj(characterKey)
    if (characterObj && statKey in characterObj.baseStat) return characterObj.baseStat[statKey][this.getIndexFromlevelkey(levelKey)]
    return defVal
  }

  static getCDataObj = (charKey) => CharacterData[charKey];
  static getElementalName = (elementalKey, defVal = "") => elementalKey === "physical" ? "Physical" : (ElementalData?.[elementalKey]?.name || defVal)
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
  static getLevel = (levelKey, defVal = 1) => (LevelsData?.[levelKey]?.level || defVal)
  static getAscension = (levelKey, defVal = 0) => (LevelsData?.[levelKey]?.asend || defVal)

  //SPECIALIZED STAT
  static getSpecializedStat = (charKey) => this.getCDataObj(charKey)?.specializeStat;
  static getSpecializedStatKey = (charKey) => this.getSpecializedStat(charKey)?.key;
  static getSpeicalizedStatVal = (charKey, levelKey) => this.getSpecializedStat(charKey)?.value?.[this.getIndexFromlevelkey(levelKey)]
  //ASSETS
  static getThumb = (charKey, defVal = null) => this.getCDataObj(charKey)?.thumbImg || defVal
  static getCard = (charKey, defVal = null) => this.getCDataObj(charKey)?.cardImg || defVal
  static getTalentImg = (charKey, talentKey, defVal = null) => this.getCDataObj(charKey)?.talent?.[talentKey]?.img || defVal
  static getConstellationImg = (charKey, constIndex, defVal = null) => this.getCDataObj(charKey)?.talent?.[`constellation${constIndex + 1}`]?.img || defVal

  //talents
  static getTalentName = (charKey, talentKey, defVal = "") => this.getCDataObj(charKey)?.talent?.[talentKey]?.name || defVal

  static getTalentLevelBoost = (characterKey, talentKey, constellation, defVal = 0) => {
    //so far we only get level boost from constellations, so only burst and skills.
    if (talentKey !== "burst" && talentKey !== "skill") return defVal
    let talents = this.getCDataObj(characterKey)?.talent || {}
    for (let i = 1; i <= constellation; i++) {
      let talentBoost = talents[`constellation${i}`]?.talentBoost || {};
      let boostEntry = Object.entries(talentBoost).find(([key, val]) => key === talentKey)
      if (boostEntry) return boostEntry[1]
    }
    return defVal
  }
  static getTalentLevelKey = (character, talentKey, constellation, withBoost = false) => {
    if (talentKey === "auto" || talentKey === "skill" || talentKey === "burst") {
      let talentLvlKey = character?.talentLevelKeys?.[talentKey] || 0;
      let levelBoost = this.getTalentLevelBoost(character?.characterKey, talentKey, constellation)
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
    let talents = this.getCDataObj(charKey)?.talent || {}
    let statsArr = []
    Object.keys(talents).forEach(talentKey => {
      let stats = this.getTalentStats(charKey, talentKey, constellation, ascension)
      if (stats) statsArr.push(stats)
    })
    return statsArr
  }
  static getTalentConditional = (charKey, talentKey, conditionalKey, talentLvlKey, constellation, ascension, defVal = null) => {
    let doc = this.getTalentDocument(charKey, talentKey)
    let cond = null
    for (const section of doc) {
      let tempCond = section.conditional
      if (typeof tempCond === "function")
        tempCond = tempCond(talentLvlKey, constellation, ascension)
      if (tempCond?.conditionalKey === conditionalKey) {
        cond = tempCond
        break;
      }
    }
    return cond || defVal
  }
  static getTalentConditionalStats = (conditional, conditionalNum, defVal = null) => {
    if (!conditionalNum || !conditional) return defVal
    let [stats = {}, stacks] = ConditionalsUtil.getConditionalProp(conditional, "stats", conditionalNum)
    if (!stacks) return defVal
    return Object.fromEntries(Object.entries(stats).map(([key, val]) => key === "formulaOverrides" ? [key, val] : [key, val * stacks]))
  }
  static getTalentConditionalFields = (conditional, conditionalNum, defVal = []) => {
    if (!conditionalNum || !conditional) return defVal
    let fields = ConditionalsUtil.getConditionalProp(conditional, "fields", conditionalNum)[0]
    return fields || defVal
  }
  static isAutoElemental = (charKey, defVal = false) => this.getWeaponTypeKey(charKey) === "catalyst" || defVal
  static isAutoInfusable = (charKey, defVal = false) => this.getCDataObj(charKey)?.talent?.auto?.infusable || defVal
  static getTalentStatKey = (skillKey, character, elemental = false) => {
    let { dmgMode = "", autoInfused = false, characterKey } = character
    if (!elemental) elemental = this.isAutoElemental(characterKey)
    if (!elemental) elemental = autoInfused && (Character.getCDataObj(characterKey)?.talent?.auto?.infusable || false)
    let eleKey = ""
    if (skillKey === "ele" || skillKey === "burst" || skillKey === "skill" || elemental)
      eleKey = this.getElementalKey(characterKey)
    if (eleKey) eleKey = eleKey + "_"
    //{pyro_}{burst}_{avg_dmg}
    return `${eleKey}${skillKey}_${dmgMode}`
  }

  //CHARCTER OBJ
  static hasOverride = (character, statKey) => character && character.baseStatOverrides ? (statKey in character.baseStatOverrides) : false;

  static getStatValueWithOverride = (character, statKey, defVal = 0) => {
    if (this.hasOverride(character, statKey)) return character?.baseStatOverrides?.[statKey]
    else return this.getBaseStatValue(character, statKey, defVal)
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
    let statKeys = ["hp_base", "atk_base", "def_base", "atk_weapon", "char_level", "enemy_level", "enemy_phy_res", "enemy_phy_immunity", ...Object.keys(characterStatBase)]
    let initialStats = Object.fromEntries(statKeys.map(key => [key, this.getStatValueWithOverride(character, key)]))
    //add element
    initialStats.char_ele_key = this.getElementalKey(character.characterKey);

    //enemy stuff
    Character.getElementalKeys().forEach(eleKey => {
      let statKey = `${eleKey}_enemy_ele_res`
      initialStats[statKey] = this.getStatValueWithOverride(character, statKey);
      statKey = `${eleKey}_enemy_ele_immunity`
      initialStats[statKey] = this.getStatValueWithOverride(character, statKey);
    })

    //all the rest of the overrides
    let overrides = character?.baseStatOverrides || {}
    Object.entries(overrides).forEach(([statKey, val]) => !initialStats.hasOwnProperty(statKey) && (initialStats[statKey] = val))

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
      initialStats[key] = (initialStats[key] || 0) + val
    })

    let { characterKey, levelKey, constellation, talentConditionals = [] } = character
    let ascension = Character.getAscension(levelKey)
    //add stats from talentconditionals
    talentConditionals.forEach(cond => {
      let { srcKey: talentKey, srcKey2: conditionalKey, conditionalNum } = cond
      let talentLvlKey = Character.getTalentLevelKey(character, talentKey)
      let conditional = Character.getTalentConditional(characterKey, talentKey, conditionalKey, talentLvlKey, constellation, ascension)
      addStatsObj(Character.getTalentConditionalStats(conditional, conditionalNum, {}))
    })

    //add stats from all talents
    let allTalentStats = Character.getTalentStatsAll(characterKey, constellation, ascension)
    allTalentStats.forEach(addStatsObj)

    //add weapon stats
    let weaponStats = {
      subKey: Weapon.getWeaponSubStatKey(character?.weapon?.key),
      subVal: Weapon.getWeaponSubStatValWithOverride(character?.weapon),
      bonusStats: Weapon.getWeaponBonusStat(character?.weapon?.key, character?.weapon?.refineIndex),
      conditionalStats: Weapon.getWeaponConditionalStat(character?.weapon?.key, character?.weapon?.refineIndex, character?.weapon?.conditionalNum)
    }
    if (weaponStats.subKey)
      initialStats[weaponStats.subKey] = (initialStats[weaponStats.subKey] || 0) + weaponStats.subVal
    if (weaponStats.bonusStats) addStatsObj(weaponStats.bonusStats)
    if (weaponStats.conditionalStats) addStatsObj(weaponStats.conditionalStats);

    return initialStats
  }

}