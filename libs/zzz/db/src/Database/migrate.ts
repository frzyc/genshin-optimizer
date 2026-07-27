// MIGRATION STEP
// 0. DO NOT change old `migrateVersion` calls
// 1. Add new `migrateVersion` call within `migrateSr` function
// 2. Add new `migrateVersion` call within `migrateStorage` function
// 3. Update `currentDBVersion`
// 4. Test on import, and also on version update

import type { DBStorage } from '@genshin-optimizer/common/database'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { ICharacter, IWengine } from '@genshin-optimizer/zzz/zood'
import type {
  ICharMeta,
  IZenlessObjectDescription,
  IZZZDatabase,
} from '../Interfaces'

export const currentDBVersion = 3

export function migrateZOOD(
  zood: IZenlessObjectDescription & IZZZDatabase
): IZenlessObjectDescription & IZZZDatabase {
  const version = zood.dbVersion ?? 0
  function migrateVersion(version: number, cb: () => void) {
    const dbver = zood.dbVersion ?? 0
    if (dbver < version) {
      cb()
      // Update version upon each successful migration, so we don't
      // need to migrate that part again if later parts fail.
      zood.dbVersion = version
    }
  }

  // Change code name keys to char name keys
  migrateVersion(2, () => {
    function migrateData(oldKey: string, newKey: CharacterKey) {
      const chars = zood['characters'] as ICharacter[]
      if (chars) {
        const char = chars.find((c) => (c.key as string) === oldKey)
        if (char) {
          char.key = newKey
          ;(char as any).id = newKey
        }
      }

      const charMetas = zood['charMetas'] as ICharMeta[]
      if (charMetas) {
        const charMeta = charMetas.find(
          (c) => ((c as any)['id'] as string) === oldKey
        )
        if (charMeta) {
          ;(charMeta as any)['id'] = newKey
        }
      }

      const discs = zood.discs
      if (discs) {
        discs
          .filter((disc) => (disc.location as string) === oldKey)
          .forEach((disc) => (disc.location = newKey))
      }

      const weng = zood['wengines'] as IWengine[]
      if (weng) {
        weng
          .filter((weng) => (weng.location as string) === oldKey)
          .forEach((weng) => (weng.location = newKey))
      }
    }
    migrateData('Astra', 'AstraYao')
    migrateData('QingYi', 'Qingyi')
  })

  migrateVersion(3, () => {
    function migrateCharOpt() {
      const charOpts = zood['charOpts'] as any[] | undefined

      if (charOpts) {
        zood['teams'] = charOpts.map((charOpt) => {
          const charKey = charOpt.id as string
          const {
            critMode,
            bonusStats,
            conditionals,
            enemyStats,
            optConfigId,
            teammates: oldTeammates,
            target,
            ...rest
          } = charOpt

          return {
            id: charKey,
            teammates: [
              { characterKey: charKey, optConfigId },
              ...(oldTeammates ?? []).map((ck: any) => ({
                characterKey: ck,
              })),
            ],
            frames: [
              {
                multiplier: 1,
                critMode,
                bonusStats,
                conditionals,
                enemyStats,
                tag: target,
              },
            ],
            ...rest,
          }
        })

        delete zood['charOpts']
      }
    }

    migrateCharOpt()
  })

  zood.dbVersion = currentDBVersion
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
  return zood
}

/**
 * Migrate parsed data in `storage` in-place to a parsed data of the latest supported DB version.
 *
 * **CAUTION**
 * Throw an error if `storage` uses unsupported DB version.
 */
export function migrateStorage(storage: DBStorage) {
  const version = storage.getDBVersion()

  function migrateVersion(version: number, cb: () => void) {
    const dbver = storage.getDBVersion()
    if (dbver < version) {
      cb()
      // Update version upon each successful migration, so we don't
      // need to migrate that part again if later parts fail.
      storage.setDBVersion(version)
    }
  }

  migrateVersion(2, () => {
    function migrateData(oldKey: string, newKey: CharacterKey) {
      const keys = storage.keys
      for (const key of keys) {
        if (key === `zzz_character_${oldKey}`) {
          const astra = storage.get(key)
          astra.key = newKey
          storage.set(`zzz_character_${newKey}`, astra)
          storage.remove(`zzz_character_${oldKey}`)
        }
        if (key === `zzz_charOpt_${oldKey}`) {
          const astra = storage.get(key)
          astra.id = newKey

          if (astra.target?.sheet === oldKey) {
            astra.target.sheet = newKey
          }

          if (astra.conditionals) {
            astra.conditionals
              .filter((c: any) => c.src === oldKey)
              .forEach((c: any) => (c.src = newKey))
          }

          storage.set(`zzz_charOpt_${newKey}`, astra)
          storage.remove(`zzz_charOpt_${oldKey}`)
        }
        if (key === `zzz_charMeta_${oldKey}`) {
          const astra = storage.get(key)
          astra.id = newKey
          storage.set(`zzz_charMeta_${newKey}`, astra)
          storage.remove(`zzz_charMeta_${oldKey}`)
        }
        if (key.startsWith('zzz_disc_')) {
          const disc = storage.get(key)
          if (disc.location === oldKey) {
            disc.location = newKey
            storage.set(key, disc)
          }
        }
        if (key.startsWith('zzz_wengine_')) {
          const weng = storage.get(key)
          if (weng.location === oldKey) {
            weng.location = newKey
            storage.set(key, weng)
          }
        }
      }
    }
    migrateData('Astra', 'AstraYao')
    migrateData('QingYi', 'Qingyi')
  })

  migrateVersion(3, () => {
    function migrateCharOpt() {
      const keys = storage.keys
      for (const key of keys) {
        if (key.startsWith('zzz_charOpt_')) {
          const charKey = key.slice('zzz_charOpt_'.length)
          const oldTeam = storage.get(`zzz_team_${charKey}`)
          const charOpt = storage.get(key)
          const charMeta = storage.get(`zzz_charMeta_${charKey}`)

          const {
            critMode,
            bonusStats,
            conditionals,
            enemyStats,
            optConfigId,
            teammates: oldTeammates,
            target,
            ...rest
          } = charOpt
          const frame = {
            multiplier: 1,
            critMode,
            bonusStats,
            conditionals,
            enemyStats,
            tag: target,
          }
          const teammates = [
            { characterKey: charKey, optConfigId },
            ...(oldTeammates ?? []).map((ck: any) => ({
              characterKey: ck,
            })),
          ]

          const team = {
            teammates,
            frames: [frame],
            ...rest,
          }

          storage.set(`zzz_team_${charKey}`, team)
          if (oldTeam) {
            storage.set(`zzz_charMeta_${charKey}`, {
              description: `${charMeta?.description ?? ''}\n\n${JSON.stringify(oldTeam)}`,
            })
          }
          storage.remove(key)
        }
      }
    }

    migrateCharOpt()
  })

  storage.setDBVersion(currentDBVersion)
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
}
