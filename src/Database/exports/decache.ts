import { IArtifact, ICachedArtifact } from "../../Types/artifact";
import { ICachedCharacter, ICharacter } from "../../Types/character";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";

/// Return a new flex artifact from given artifact. All extra keys are removed
export function removeArtifactCache(artifact: ICachedArtifact): IArtifact {
  const { setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock } = artifact
  return { setKey, rarity, level, slotKey, mainStatKey, substats: substats.map(substat => ({ key: substat.key, value: substat.value })), location, exclude, lock }
}
/// Return a new flex character from given character. All extra keys are removed
export function removeCharacterCache(char: ICachedCharacter): ICharacter {
  const {
    key: characterKey, level, ascension, hitMode, elementKey, reactionMode, conditional,
    bonusStats, enemyOverride, talent, infusionAura, constellation, buildSettings, team,
    compareData, favorite
  } = char
  const result: ICharacter = {
    key: characterKey, level, ascension, hitMode, reactionMode, conditional,
    bonusStats, enemyOverride, talent, infusionAura, constellation, buildSettings, team,
    compareData, favorite
  }
  if (elementKey) result.elementKey = elementKey
  return result
}
/// Return a new flex character from given character. All extra keys are removed
export function removeWeaponCache(weapon: ICachedWeapon): IWeapon {
  const { key, level, ascension, refinement, location, lock } = weapon
  return { key, level, ascension, refinement, location, lock }
}
