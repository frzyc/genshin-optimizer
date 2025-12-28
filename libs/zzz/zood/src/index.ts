// Legacy interface exports
export * from './ICharacter'
export * from './IDisc'
export * from './IWengine'

// Schema exports (excluding duplicated interfaces)
export {
  // Wengine schemas
  wengineKeySchema,
  phaseKeySchema,
  milestoneKeySchema,
  locationKeySchema,
  wengineSchema,
  wengineRecoverySchema,
  parseWengineRecovery,
  validateWengine,
  parseWengineImport,
  safeParseWengineImport,
  // Character schemas
  characterKeySchema,
  promotionSchema,
  characterSchema,
  characterRecoverySchema,
  skillKeys,
  parseCharacterRecovery,
  parseCharacterImport,
  safeParseCharacterImport,
  type SkillKey,
  type CharacterRecoveryData,
  // Disc schemas
  substatSchema,
  discSchema,
  discRecoverySchema,
  parseSubstats,
  applyDiscRules,
  validateDisc,
  parseDiscImport,
  safeParseDiscImport,
  validateDiscWithErrors,
  // ZOD format
  zodFormatSchema,
  validateZODImport,
  type ZODFormat,
  // Relationships
  createEntityRefSchema,
  relationships,
  type RelationshipType,
} from './schemas'
