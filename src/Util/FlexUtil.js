import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import { CurrentDatabaseVersion } from "../Database/DatabaseUtil";
import { decode, encode } from "./CodingUtil";
import { artifactSchema, characterSchema } from "./EximUtil";

export const flexSchema = {
  type: "object",
  schemas: {
    artifacts: { type: "array", defaultSchema: artifactSchema },
    character: characterSchema
  }
}

export function createFlexObj(characterKey) {
  const character = CharacterDatabase.get(characterKey)
  if (!character) return null

  const artifacts = Object.values(character.equippedArtifacts)
    .filter(art => art)
    .map(id => ArtifactDatabase.get(id))

  return { v: 1, d: encode({ character, artifacts }, flexSchema) }
}

export function parseFlexObj(character) {
  if (character.v === 1) return parseFlexObj3(character)
  return parseFlexObjOld(character)
}

function parseFlexObj3(data) {
  const { character, artifacts } = decode(data.d, flexSchema)
  artifacts.forEach(artifact => {
    artifact.location = character.characterKey
  })
  return {
    databaseVersion: CurrentDatabaseVersion,
    artifacts, ...character
  }
}
function parseFlexObjOld(character) {
  const { dbv, characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel, tlvl, artifacts } = character
  const characterkey = character.characterKey
  character.artifacts.forEach(art => {
    art.location = characterkey
    art.substats = Object.entries(art.substats).map(([key, value]) => ({ key, value }))
  });
  const [auto, skill, burst] = tlvl
  return {
    databaseVersion: dbv,
    characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel,
    talentLevelKeys: { auto, skill, burst }, artifacts
  }
}
