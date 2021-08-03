import Artifact from "../Artifact/Artifact";
import { ArtifactSheet } from "../Artifact/ArtifactSheet";
import Conditional from "../Conditional/Conditional";
import { ascensionMaxLevel, characterStatBase } from "../Data/CharacterData";
import ElementalData from "../Data/ElementalData";
import { database } from "../Database/Database";
import { ElementToReactionKeys, PreprocessFormulas } from "../StatData";
import { GetDependencies } from "../StatDependency";
import { IArtifact } from "../Types/artifact";
import { ICharacter } from "../Types/character";
import { allElements, ArtifactSetKey, ElementKey, SlotKey } from "../Types/consts";
import { ICalculatedStats } from "../Types/stats";
import { IFieldDisplay } from "../Types/IFieldDisplay";
import { deepClone, evalIfFunc } from "../Util/Util";
import WeaponSheet from "../Weapon/WeaponSheet";
import CharacterSheet from "./CharacterSheet";
import { mergeStats } from "../Util/StatUtil";

export default class Character {
  //do not instantiate.
  constructor() { if (this instanceof Character) throw Error('A static class cannot be instantiated.'); }

  static getElementalName = (elementalKey: ElementKey | "physical"): string =>
    ElementalData[elementalKey].name
  static getLevelString = (character: ICharacter): string =>
    `${character.level}/${ascensionMaxLevel[character.ascension]}`

  static getTalentFieldValue = (field: IFieldDisplay, key: keyof IFieldDisplay, stats = {}, defVal = ""): any => {
    if (!field[key]) return defVal
    return evalIfFunc(field[key] as any, stats!)
  }

  static hasOverride = (character: ICharacter, statKey): boolean => {
    if (statKey === "finalHP")
      return Character.hasOverride(character, "hp") || Character.hasOverride(character, "hp_") || Character.hasOverride(character, "characterHP")
    if (statKey === "finalDEF")
      return Character.hasOverride(character, "def") || Character.hasOverride(character, "def_") || Character.hasOverride(character, "characterDEF")
    if (statKey === "finalATK")
      return Character.hasOverride(character, "atk") || Character.hasOverride(character, "atk_") || Character.hasOverride(character, "characterATK")
    return character?.baseStatOverrides ? (statKey in character.baseStatOverrides) : false;
  }

  static getBaseStatValue = (character: ICharacter, characetSheet: CharacterSheet, weaponSheet: WeaponSheet, statKey: string): number => {
    if (statKey === "enemyLevel") return character.level
    if (statKey.includes("enemyRes_")) return 10
    if (statKey in characterStatBase) return characterStatBase[statKey]
    return 0
  }
  static getStatValueWithOverride = (character: ICharacter, characterSheet: CharacterSheet, weaponSheet: WeaponSheet, statKey: string) => {
    if (Character.hasOverride(character, statKey)) return character.baseStatOverrides?.[statKey] ?? 0
    else return Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)
  }

  static calculateBuild = (character: ICharacter, characterSheet: CharacterSheet, weaponSheet: WeaponSheet, artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>, mainStatAssumptionLevel = 0): ICalculatedStats => {
    let artifacts
    if (character.artifacts) // from flex
      artifacts = Object.fromEntries(character.artifacts.map((art, i) => [i, art]))
    else if (character.equippedArtifacts)
      artifacts = Object.fromEntries(Object.entries(character.equippedArtifacts).map(([key, artid]) => [key, database._getArt(artid)]))
    const initialStats = Character.createInitialStats(character, characterSheet, weaponSheet)
    initialStats.mainStatAssumptionLevel = mainStatAssumptionLevel
    return Character.calculateBuildwithArtifact(initialStats, artifacts, artifactSheets)
  }

  static calculateBuildwithArtifact = (initialStats: ICalculatedStats, artifacts: Dict<SlotKey, IArtifact>, artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>): ICalculatedStats => {
    const setToSlots = Artifact.setToSlots(artifacts)
    const artifactSetEffectsStats = ArtifactSheet.setEffectsStats(artifactSheets, initialStats, setToSlots)

    let stats = deepClone(initialStats)
    //add artifact and artifactsets
    Object.values(artifacts).forEach(art => {
      if (!art) return
      //main stats
      stats[art.mainStatKey] = (stats[art.mainStatKey] || 0) + Artifact.mainStatValue(art.mainStatKey, art.numStars, Math.max(Math.min(stats.mainStatAssumptionLevel, art.numStars * 4), art.level))
      //substats
      art.substats.forEach((substat) =>
        substat && substat.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))
    })
    //setEffects
    mergeStats(stats, artifactSetEffectsStats)
    //setEffects conditionals
    Conditional.parseConditionalValues({ artifact: stats?.conditionalValues?.artifact }, (conditional, conditionalValue, [, setKey, setNumKey]) => {
      if (parseInt(setNumKey) > (setToSlots?.[setKey]?.length ?? 0)) return
      const { stats: condStats } = Conditional.resolve(conditional, stats, conditionalValue)
      mergeStats(stats, condStats)
    })

    stats.equippedArtifacts = Object.fromEntries(Object.entries(artifacts).map(([key, val]: any) => [key, val?.id]))
    stats.setToSlots = setToSlots
    let dependencies = GetDependencies(stats, stats?.modifiers)
    const { initialStats: preprocessedStats, formula } = PreprocessFormulas(dependencies, stats)
    formula(preprocessedStats)
    return { ...stats, ...preprocessedStats }
  }

  static createInitialStats = (character: ICharacter, characterSheet: CharacterSheet, weaponSheet: WeaponSheet): ICalculatedStats => {
    character = deepClone(character)
    const { characterKey, elementKey, level, ascension, hitMode, infusionAura, reactionMode, talentLevelKeys, constellation, equippedArtifacts, conditionalValues = {}, weapon } = character

    //generate the initalStats obj with data from Character & overrides
    const statKeys = ["enemyLevel", ...Object.keys(characterStatBase)]
    const initialStats = Object.fromEntries(statKeys.map(key => [key, Character.getStatValueWithOverride(character, characterSheet, weaponSheet, key)])) as ICalculatedStats
    initialStats.characterHP = characterSheet.getBase("hp", level, ascension)
    initialStats.characterDEF = characterSheet.getBase("def", level, ascension)
    initialStats.characterATK = characterSheet.getBase("atk", level, ascension)
    initialStats.characterLevel = level
    initialStats.characterEle = characterSheet.elementKey ?? elementKey ?? "anemo";
    initialStats.characterKey = characterKey
    initialStats.hitMode = hitMode;
    initialStats.infusionAura = infusionAura
    initialStats.reactionMode = reactionMode;
    initialStats.conditionalValues = conditionalValues
    initialStats.weaponType = characterSheet.weaponTypeKey
    initialStats.tlvl = talentLevelKeys;
    initialStats.constellation = constellation
    initialStats.ascension = ascension
    initialStats.weapon = deepClone(weapon)
    initialStats.equippedArtifacts = equippedArtifacts;

    //enemy stuff
    ["physical", ...allElements].forEach(eleKey => {
      let statKey = `${eleKey}_enemyRes_`
      initialStats[statKey] = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey);
      statKey = `${eleKey}_enemyImmunity`
      initialStats[statKey] = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey);
    })

    //all the rest of the overrides
    let overrides = character?.baseStatOverrides || {}
    Object.entries(overrides).forEach(([statKey, val]: any) => {
      if (!initialStats.hasOwnProperty(statKey)) initialStats[statKey] = val
    })

    //add specialized stat
    const specialStatKey = characterSheet.getSpecializedStat(ascension)
    if (specialStatKey) {
      const specializedStatVal = characterSheet.getSpecializedStatVal(ascension)
      mergeStats(initialStats, { [specialStatKey]: specializedStatVal })
    }

    //add stats from all talents
    characterSheet.getTalentStatsAll(initialStats as ICalculatedStats, initialStats.characterEle).forEach(s => mergeStats(initialStats, s))

    //add levelBoosts, from Talent stats.
    for (const key in initialStats.tlvl)
      initialStats.tlvl[key] += initialStats[`${key}Boost`] ?? 0

    //add stats from weapons
    const weaponATK = weaponSheet.getMainStatValue(weapon.level, weapon.ascension)
    initialStats.weaponATK = weaponATK
    const weaponSubKey = weaponSheet.getSubStatKey()
    if (weaponSubKey) mergeStats(initialStats, { [weaponSubKey]: weaponSheet.getSubStatValue(weapon.level, weapon.ascension) })
    mergeStats(initialStats, weaponSheet.stats(initialStats as ICalculatedStats))


    //Handle conditionals, without artifact, since the pipeline for that comes later.
    const { artifact: artifactCond, weapon: weaponCond, ...otherCond } = conditionalValues

    //handle conditionals. only the conditional applicable to the equipped weapon is parsed.
    Conditional.parseConditionalValues({ ...weapon.key && { weapon: { [weapon.key]: weaponCond?.[weapon.key] } }, ...otherCond }, (conditional, conditionalValue, keys) => {
      if (keys[0] === "character" && keys[3] === "talents" && keys[4] !== elementKey) return //fix for traveler, make sure conditionals match element.
      if (!Conditional.canShow(conditional, initialStats)) return
      const { stats: condStats } = Conditional.resolve(conditional, initialStats, conditionalValue)
      mergeStats(initialStats, condStats)
    })
    return initialStats as ICalculatedStats
  }
  //TODO: this needs weaponSheet/artifactsheets as a parameter.
  static getDisplayStatKeys = (stats: ICalculatedStats, { characterSheet, weaponSheet, artifactSheets }: { characterSheet: CharacterSheet, weaponSheet: WeaponSheet, artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet> }) => {
    const eleKey = stats.characterEle
    const basicKeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_", `${eleKey}_dmg_`]
    const isAutoElemental = characterSheet.isAutoElemental
    if (!isAutoElemental) basicKeys.push("physical_dmg_")

    //show elemental interactions
    const transReactions = deepClone(ElementToReactionKeys[eleKey])
    const weaponTypeKey = characterSheet.weaponTypeKey
    if (!transReactions.includes("shattered_hit") && weaponTypeKey === "claymore") transReactions.push("shattered_hit")
    const charFormulas = {}
    const talentSheet = characterSheet.getTalent(eleKey)
    const addFormula = (fields, key) => fields.forEach(field => {
      if (!field.formula || !field?.canShow?.(stats)) return
      if (!charFormulas[key]) charFormulas[key] = []
      charFormulas[key].push((field.formula as any).keys)
    })
    const parseSection = (section, key) => {
      //conditional
      if (section.conditional && Conditional.canShow(section.conditional, stats)) {
        const { fields }: { fields?: Array<IFieldDisplay> } = Conditional.resolve(section.conditional, stats, null)
        fields && addFormula(fields, key)
      }
      //fields
      if (section.fields) addFormula(section.fields, key)
    }
    talentSheet && Object.entries(talentSheet.sheets).forEach(([talentKey, { sections }]) => {
      if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") talentKey = "auto"
      sections.forEach(section => parseSection(section, `talentKey_${talentKey}`))
    })

    const formKey = `weapon_${stats.weapon.key}`
    weaponSheet.document && weaponSheet.document.map(section => parseSection(section, formKey))

    stats.setToSlots && Object.entries(stats.setToSlots).map(([setKey, slots]) => [setKey, slots.length]).forEach(([setKey, num]) => {
      const artifactSheet = artifactSheets[setKey] as ArtifactSheet
      if (!artifactSheet) return
      Object.entries(artifactSheet.setEffects).forEach(([setNum, { document }]) => {
        if (num < parseInt(setNum)) return
        document && document.map(section => parseSection(section, `artifact_${setKey}_${setNum}`))
      })
    })

    return { basicKeys, ...charFormulas, transReactions }
  }
}