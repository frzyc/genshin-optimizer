// Legacy interface exports
export * from './IArtifact'
export * from './ICharacter'
export * from './IWeapon'
export * from './IGOOD'

// Schema exports (excluding duplicated interfaces)
export {
  // Weapon schemas
  weaponKeySchema,
  refinementKeySchema,
  locationCharacterKeySchema,
  weaponSchema,
  weaponRecoverySchema,
  parseWeaponRecovery,
  validateWeapon,
  parseWeaponImport,
  safeParseWeaponImport,
  type WeaponRecoveryData,
  type WeaponStatsLookup,
  // Character schemas
  characterKeySchema,
  talentSchema,
  talentRecoverySchema,
  characterSchema,
  characterRecoverySchema,
  parseCharacterRecovery,
  parseCharacterImport,
  safeParseCharacterImport,
  type CharacterRecoveryData,
  // Artifact schemas
  artifactSetKeySchema,
  artifactSlotKeySchema,
  mainStatKeySchema,
  substatKeySchema,
  artifactRaritySchema,
  substatSchema,
  substatRecoverySchema,
  artifactSchema,
  artifactRecoverySchema,
  parseArtifactRecovery,
  parseArtifactImport,
  safeParseArtifactImport,
  validateArtifactLevel,
  type ArtifactRecoveryData,
  // GOOD format
  goodFormatSchema,
  validateGOODImport,
  parseGOODImport,
} from './schemas'
