export const PROJROOT_PATH = `${process.env['NX_WORKSPACE_ROOT']}/libs/zzz/dm`
export const DM_PATH = `${PROJROOT_PATH}/ZenlessData` as const
export const HAKUSHIN_PATH = `${PROJROOT_PATH}/HakushinData` as const
export const DM2D_PATH = `${PROJROOT_PATH}/assets` as const

export const allCharFileCfgs = [
  'AvatarBaseTemplateTb',
  'AvatarBattleTemplateTb',
  'AvatarPassiveSkillDesTemplateTb',
  'AvatarPassiveSkillTemplateTb',
  'AvatarSkillDesTemplateTb',
  'AvatarSkillTemplateTb',
  'SkillPropertyTemplateTb',
] as const

export const allDiscFileCfgs = [
  'EquipmentTemplateTb',
  'ItemTemplateTb',
] as const

export const allWengineFileCfgs = [
  'WeaponTalentTemplateTb',
  'WeaponTemplateTb',
] as const

export const allFileCfgs = [
  ...allCharFileCfgs,
  ...allDiscFileCfgs,
  ...allWengineFileCfgs,
] as const
