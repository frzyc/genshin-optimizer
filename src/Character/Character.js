import Artifact from "../Artifact/Artifact";
import ArtifactDatabase from "../Database/ArtifactDatabase";
import { CharacterData, CharacterDataImport, characterStatBase, LevelsData } from "../Data/CharacterData";
import ElementalData from "../Data/ElementalData";
import { ElementToReactionKeys, PreprocessFormulas } from "../StatData";
import { GetDependencies } from "../StatDependency";
import ConditionalsUtil from "../Util/ConditionalsUtil";
import { deepClone } from "../Util/Util";
import Weapon from "../Weapon/Weapon";
import CharacterDatabase from "../Database/CharacterDatabase";

export default class Character {
  //do not instantiate.
  constructor() { if (this instanceof Character) throw Error('A static class cannot be instantiated.'); }
  static getCharacterDataImport = () => CharacterDataImport
  static getBaseStatValue = (character, statKey, defVal = 0) => {
    let { characterKey, levelKey } = character
    if (statKey === "specializedStatKey") return this.getSpecializedStatKey(characterKey);
    if (statKey === "specializedStatVal") return this.getSpeicalizedStatVal(characterKey, levelKey)
    if (statKey === "weaponATK") return Weapon.getWeaponMainStatValWithOverride(character?.weapon)
    if (statKey === "characterLevel" || statKey === "enemyLevel") return this.getLevel(levelKey)
    if (statKey.includes("enemyRes_")) return 10
    if (statKey in characterStatBase) return characterStatBase[statKey]
    let characterObj = this.getCDataObj(characterKey)
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
  static getElementalKeysWithoutPhysical = () => this.getElementalKeys().filter(e => e !== "physical")
  static getWeaponTypeKey = (charKey, defVal = "") => (this.getCDataObj(charKey)?.weaponTypeKey || defVal)
  static getConstellationName = (charKey, defVal = "") => (this.getCDataObj(charKey)?.constellationName || defVal)
  static getTitles = (charKey, defVal = []) => (this.getCDataObj(charKey)?.titles || defVal)

  //LEVEL
  static getlevelKeys = () => Object.keys(LevelsData)
  static getlevelTemplateName = (levelKey, defVal = "") => (LevelsData?.[levelKey]?.name || defVal)
  static getLevelString = (character) => {
    const levelOverride = Character.getStatValueWithOverride(character, "characterLevel")
    return Character.getLevel(character.levelKey) === levelOverride ? Character.getlevelTemplateName(character.levelKey) : `Lvl. ${levelOverride}`
  }
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
  static getTalentImg = (charKey, talentKey, defVal = null) => this.getTalent(charKey, talentKey)?.img || defVal
  static getConstellationImg = (charKey, constIndex, defVal = null) => this.getCDataObj(charKey)?.talent?.[`constellation${constIndex + 1}`]?.img || defVal

  //talents
  static getTalent = (charKey, talentKey, defVal = {}) => this.getCDataObj(charKey)?.talent?.[talentKey] || defVal
  static getTalentName = (charKey, talentKey, defVal = "") => this.getTalent(charKey, talentKey)?.name || defVal

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

  static getTalentDocument = (charKey, talentKey, defVal = []) => this.getTalent(charKey, talentKey)?.document || defVal
  static getTalentDocumentSections = (stats, talentKey) =>
    this.getTalentDocument(stats.characterKey, talentKey).map(section => typeof section === "function" ? section(stats) : section)

  static getTalentField = (stats, talentKey, sectionIndex, fieldIndex, defVal = {}) => {
    if (!stats) return defVal
    const field = this.getTalentDocumentSections(stats, talentKey)?.[sectionIndex]?.fields?.[fieldIndex]
    if (!field) return defVal
    return typeof field === "function" ? field(stats) : field
  }
  static getTalentFieldValue = (field, key, stats = {}, defVal = "") => {
    if (!field?.[key]) return defVal
    return typeof field?.[key] === "function" ? field[key](stats) : field[key]
  }

  static getTalentStats = (charKey, talentKey, stats, defVal = null) => {
    const talentStats = this.getTalent(charKey, talentKey)?.stats
    if (typeof talentStats === "function")
      return talentStats(stats)
    return talentStats || defVal
  }
  static getTalentStatsAll = (charKey, stats) => {
    const talents = this.getCDataObj(charKey)?.talent || {}
    const statsArr = []
    Object.keys(talents).forEach(talentKey => {
      const talentStats = this.getTalentStats(charKey, talentKey, stats)
      if (talentStats) statsArr.push(talentStats)
    })
    return statsArr
  }
  static getTalentConditional = (stats, talentKey, conditionalKey, defVal = null) => {
    const sections = this.getTalentDocumentSections(stats, talentKey)
    let cond = null
    for (const section of sections) {
      let tempCond = section.conditional
      if (typeof tempCond === "function")
        tempCond = tempCond(stats)
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
    return Object.fromEntries(Object.entries(stats).map(([key, val]) => key === "modifiers" ? [key, val] : [key, val * stacks]))
  }
  static getTalentConditionalFields = (conditional, conditionalNum, defVal = []) => {
    if (!conditionalNum || !conditional) return defVal
    let fields = ConditionalsUtil.getConditionalProp(conditional, "fields", conditionalNum)[0]
    return fields || defVal
  }

  static isAutoElemental = (charKey, defVal = false) => this.getWeaponTypeKey(charKey) === "catalyst" || defVal
  static isAutoInfusable = (charKey, defVal = false) => this.getCDataObj(charKey)?.talent?.auto?.infusable || defVal

  //look up the formula, and generate the formulaPath to send to worker.
  static getFormulaPath(characterKey, talentKey, formula) {
    const formulaDB = this.getCDataObj(characterKey)?.formula
    if (!formulaDB) return
    let formulaKey
    if (talentKey === "auto") {
      for (const tk of ["normal", "charged", "plunging"]) {
        ([formulaKey,] = Object.entries(formulaDB?.[tk] ?? {}).find(([, value]) => value === formula) ?? [])
        if (formulaKey) {
          talentKey = tk
          break;
        }
      }
    } else ([formulaKey,] = Object.entries(formulaDB?.[talentKey] ?? {}).find(([, value]) => value === formula) ?? [])
    if (!formulaKey) return
    return { characterKey, talentKey, formulaKey }
  }


  static hasTalentPage = (characterKey) => Boolean(Character.getCDataObj(characterKey)?.talent)

  static getDisplayStatKeys = (stats, defVal = { basicKeys: [] }) => {
    if (!stats) return defVal
    const { characterKey } = stats
    let eleKey = Character.getElementalKey(characterKey)
    if (!eleKey) return defVal //usually means the character has not been lazy loaded yet
    const basicKeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_", `${eleKey}_dmg_`]
    //we need to figure out if the character has: normal phy auto, elemental auto, infusable auto(both normal and phy)
    const isAutoElemental = Character.isAutoElemental(characterKey)
    const isAutoInfusable = Character.isAutoInfusable(characterKey)
    if (!isAutoElemental)
      basicKeys.push("physical_dmg_")

    //show elemental interactions
    const transReactions = deepClone(ElementToReactionKeys[eleKey])
    const weaponTypeKey = this.getWeaponTypeKey(characterKey)
    if (!transReactions.includes("shattered_hit") && weaponTypeKey === "claymore") transReactions.push("shattered_hit")
    if (this.hasTalentPage(characterKey)) {
      const charFormulas = {}
      Object.keys(Character.getCDataObj(characterKey)?.talent ?? {}).forEach(talentKey =>
        Character.getTalentDocumentSections(stats, talentKey)?.forEach((section, sectionIndex) =>
          section?.fields?.forEach((field, fieldIndex) => {
            const hasFormula = field?.formula || this.getTalentField(stats, talentKey, sectionIndex, fieldIndex)?.formula
            if (!hasFormula) return
            if (!charFormulas[talentKey]) charFormulas[talentKey] = []
            charFormulas[talentKey].push({ talentKey, sectionIndex, fieldIndex })
          })))
      return { basicKeys, ...charFormulas, transReactions }
    } else {
      //generic average hit parameters.
      const genericAvgHit = []
      if (!isAutoElemental) //add phy auto + charged + physical 
        genericAvgHit.push("physical_normal_avgHit", "physical_charged_avgHit")

      if (isAutoElemental || isAutoInfusable) //add elemental auto + charged
        genericAvgHit.push(`${eleKey}_normal_avgHit`, `${eleKey}_charged_avgHit`)
      else if (Character.getWeaponTypeKey(characterKey) === "bow") {//bow charged atk does elemental dmg on charge
        genericAvgHit.push(`${eleKey}_charged_avgHit`)
      }
      //show skill/burst 
      genericAvgHit.push(`${eleKey}_skill_avgHit`, `${eleKey}_burst_avgHit`)

      //add reactions.
      if (eleKey === "pyro") {
        const reactions = []
        reactions.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_vaporize_`)))
        reactions.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_melt_`)))
        genericAvgHit.push(...reactions)
      } else if (eleKey === "cryo")
        genericAvgHit.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_melt_`)))
      else if (eleKey === "hydro")
        genericAvgHit.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_vaporize_`)))

      return { basicKeys, genericAvgHit, transReactions }
    }
  }

  static hasOverride = (character, statKey) => {
    if (statKey === "finalHP")
      return Character.hasOverride(character, "hp") || Character.hasOverride(character, "hp_") || Character.hasOverride(character, "characterHP") || false
    else if (statKey === "finalDEF")
      return Character.hasOverride(character, "def") || Character.hasOverride(character, "def_") || Character.hasOverride(character, "characterDEF") || false
    else if (statKey === "finalATK")
      return Character.hasOverride(character, "atk") || Character.hasOverride(character, "atk_") || Character.hasOverride(character, "characterATK") || false
    return character?.baseStatOverrides ? (statKey in character.baseStatOverrides) : false;
  }

  static getStatValueWithOverride = (character, statKey, defVal = 0) => {
    if (this.hasOverride(character, statKey)) return character?.baseStatOverrides?.[statKey] ?? defVal
    else return this.getBaseStatValue(character, statKey, defVal)
  }

  //equipment, with consideration on swapping equipped.
  static equipArtifacts = (characterKey, artifactIds) => {
    const character = CharacterDatabase.get(characterKey)
    if (!character) return;
    const artIdsOnCharacter = character.equippedArtifacts;
    let artIdsNotOnCharacter = artifactIds

    //swap, by slot
    Artifact.getSlotKeys().forEach(slotKey => {
      const artNotOnChar = ArtifactDatabase.get(artIdsNotOnCharacter?.[slotKey])
      if (artNotOnChar?.location === characterKey) return; //it is already equipped
      const artOnChar = ArtifactDatabase.get(artIdsOnCharacter?.[slotKey])
      const notCharLoc = (artNotOnChar?.location ?? "")
      //move current art to other char
      if (artOnChar) ArtifactDatabase.moveToNewLocation(artOnChar.id, notCharLoc)
      //move current art to other char
      if (notCharLoc) CharacterDatabase.equipArtifact(notCharLoc, artOnChar)
      //move other art to current char
      if (artNotOnChar) ArtifactDatabase.moveToNewLocation(artNotOnChar.id, characterKey)
    })
    //move other art to current char 
    character.equippedArtifacts = Object.fromEntries(Artifact.getSlotKeys().map(sKey => [sKey, ""]))
    Object.entries(artifactIds).forEach(([key, artid]) =>
      character.equippedArtifacts[key] = artid)
    CharacterDatabase.update(character);
  }
  static remove(characterKey) {
    let character = CharacterDatabase.get(characterKey)
    if (character.equippedArtifacts)
      Object.values(character.equippedArtifacts).forEach(artid =>
        ArtifactDatabase.moveToNewLocation(artid, ""))
    CharacterDatabase.remove(characterKey)
  }

  static calculateBuild = (character) => {
    let artifacts
    if (character.artifacts) //from flex
      artifacts = Object.fromEntries(character.artifacts.map((art, i) => [i, art]))
    else if (character.equippedArtifacts)
      artifacts = Object.fromEntries(Object.entries(character.equippedArtifacts).map(([key, artid]) => [key, ArtifactDatabase.get(artid)]))
    else return {}//probably won't happen. just in case.
    const initialStats = Character.calculateCharacterWithWeaponStats(character)
    return this.calculateBuildWithObjs(character.artifactConditionals, initialStats, artifacts)
  }

  static calculateBuildWithObjs = (artifactConditionals = [], initialStats, artifacts) => {
    let setToSlots = Artifact.setToSlots(artifacts)
    let artifactSetEffectsStats = Artifact.getArtifactSetEffectsStats(setToSlots)

    let stats = deepClone(initialStats)
    //add artifact and artifactsets
    Object.values(artifacts).forEach(art => {
      if (!art) return
      //main stats
      stats[art.mainStatKey] = (stats[art.mainStatKey] || 0) + Artifact.getMainStatValue(art.mainStatKey, art.numStars, stats.artifactsAssumeFull ? art.numStars * 4 : art.level)
      //substats
      art.substats.forEach((substat) =>
        substat && substat.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))
    })
    //setEffects
    artifactSetEffectsStats.forEach(stat => stats[stat.key] = (stats[stat.key] || 0) + stat.statVal)
    //setEffects conditionals
    artifactConditionals.forEach(({ srcKey: setKey, srcKey2: setNumKey, conditionalNum }) => {
      if (!setToSlots[setKey] || setToSlots[setKey].length < parseInt(setNumKey)) return
      Object.entries(Artifact.getConditionalStats(setKey, setNumKey, conditionalNum))
        .forEach(([statKey, val]) => stats[statKey] = (stats[statKey] || 0) + val)
    })

    let dependencies = GetDependencies(stats?.modifiers)
    PreprocessFormulas(dependencies, stats).formula(stats)
    return {
      artifactIds: Object.fromEntries(Object.entries(artifacts).map(([key, val]) => [key, val?.id])),
      setToSlots,
      finalStats: stats,
      artifactConditionals
    }
  }
  static mergeStats = (initialStats, stats) => stats && Object.entries(stats).forEach(([key, val]) => {
    if (key === "modifiers") {
      initialStats.modifiers = initialStats.modifiers ?? {}
      for (const [statKey, modifier] of Object.entries(val)) {
        initialStats.modifiers[statKey] = initialStats.modifiers[statKey] ?? {}
        for (const [mkey, multiplier] of Object.entries(modifier))
          initialStats.modifiers[statKey][mkey] = (initialStats.modifiers[statKey][mkey] ?? 0) + multiplier
      }
    } else initialStats[key] = (initialStats[key] ?? 0) + val
  })

  static calculateCharacterWithWeaponStats = (character) => {
    if (!character) return {}
    character = deepClone(character)
    const { characterKey, levelKey, hitMode, autoInfused, reactionMode, talentLevelKeys, constellation, talentConditionals = [] } = character
    const ascension = Character.getAscension(levelKey)

    //generate the initalStats obj with data from Character & overrides
    const statKeys = ["characterHP", "characterATK", "characterDEF", "weaponATK", "characterLevel", "enemyLevel", "physical_enemyRes_", "physical_enemyImmunity", ...Object.keys(characterStatBase)]
    const initialStats = Object.fromEntries(statKeys.map(key => [key, this.getStatValueWithOverride(character, key)]))
    initialStats.characterEle = this.getElementalKey(characterKey);
    initialStats.characterKey = characterKey
    initialStats.hitMode = hitMode;
    initialStats.autoInfused = autoInfused && Character.getCDataObj(characterKey)?.talent?.auto?.infusable
    initialStats.reactionMode = reactionMode;
    initialStats.talentConditionals = talentConditionals
    initialStats.weaponType = this.getWeaponTypeKey(characterKey)
    initialStats.tlvl = talentLevelKeys;
    initialStats.constellation = constellation
    initialStats.ascension = ascension
    for (const key in initialStats.tlvl)
      initialStats.tlvl[key] += this.getTalentLevelBoost(character.characterKey, key, constellation);

    //enemy stuff
    Character.getElementalKeys().forEach(eleKey => {
      let statKey = `${eleKey}_enemyRes_`
      initialStats[statKey] = this.getStatValueWithOverride(character, statKey);
      statKey = `${eleKey}_enemyImmunity`
      initialStats[statKey] = this.getStatValueWithOverride(character, statKey);
    })

    //all the rest of the overrides
    let overrides = character?.baseStatOverrides || {}
    Object.entries(overrides).forEach(([statKey, val]) => {
      if (statKey === "specializedStatKey" || statKey === "specializedStatVal") return
      if (!initialStats.hasOwnProperty(statKey)) initialStats[statKey] = val
    })

    //add specialized stat
    let specializedStatVal = Character.getStatValueWithOverride(character, "specializedStatVal")
    let specialStatKey = Character.getStatValueWithOverride(character, "specializedStatKey")
    this.mergeStats(initialStats, { [specialStatKey]: specializedStatVal })

    //add stats from all talents
    Character.getTalentStatsAll(characterKey, initialStats).forEach(s => this.mergeStats(initialStats, s))

    //add stats from weapons
    const weaponSubKey = Weapon.getWeaponSubStatKey(character?.weapon?.key)
    if (weaponSubKey) this.mergeStats(initialStats, { [weaponSubKey]: Weapon.getWeaponSubStatValWithOverride(character?.weapon) })
    this.mergeStats(initialStats, Weapon.getWeaponBonusStat(character?.weapon?.key, character?.weapon?.refineIndex))
    this.mergeStats(initialStats, Weapon.getWeaponConditionalStat(character?.weapon?.key, character?.weapon?.refineIndex, character?.weapon?.conditionalNum, {}));

    //add stats from talentconditionals
    talentConditionals.forEach(cond => {
      const { srcKey: talentKey, srcKey2: conditionalKey, conditionalNum } = cond
      const conditional = Character.getTalentConditional(initialStats, talentKey, conditionalKey)
      this.mergeStats(initialStats, Character.getTalentConditionalStats(conditional, conditionalNum, {}))
    })

    return initialStats
  }
}