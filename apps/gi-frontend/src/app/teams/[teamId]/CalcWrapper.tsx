import { notEmpty } from '@genshin-optimizer/common/util'
import type { TagMapNodeEntries } from '@genshin-optimizer/gi/formula'
import {
  artifactsData,
  charData,
  genshinCalculatorWithEntries,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { IWeapon } from '@genshin-optimizer/gi/good'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import type { ReactNode } from 'react'
import { useContext, useMemo } from 'react'
import { CalcContext } from './CalcContext'
import { TeamContext } from './TeamContext'
import { TeamLoadoutCharacterToICharacter } from './teamUtil'

export function CalcWrapper({ children }: { children: ReactNode }) {
  const team = useContext(TeamContext)

  const calc = useMemo(() => {
    if (!team) return null
    const data: TagMapNodeEntries = [
      ...teamData(
        team.team_loadouts.map(
          (team_loadout) =>
            team_loadout.index.toString() as '1' | '2' | '3' | '0'
        )
      ),
      ...team.team_loadouts
        .flatMap((team_loadout) => {
          return withMember(
            team_loadout.index.toString() as '1' | '2' | '3' | '0',
            ...charData(
              TeamLoadoutCharacterToICharacter(team_loadout.loadout!.character!)
            ),
            ...(team_loadout.loadout?.character?.weapon
              ? weaponData(
                  team_loadout.loadout.character.weapon as unknown as IWeapon
                )
              : []),
            ...(team_loadout.loadout?.character?.artifacts
              ? artifactsData(
                  team_loadout.loadout.character.artifacts.map((art) => ({
                    set: art.setKey,
                    stats: [
                      {
                        key: art.mainStatKey,
                        value: getMainStatValue(
                          art.mainStatKey,
                          art.rarity as any,
                          art.level
                        ),
                      },
                      ...art.substats.map(({ value, key }) => ({
                        key,
                        value,
                      })),
                    ],
                  }))
                )
              : [])
          )
        })
        .filter(notEmpty),
      // TODO: conditonals
      // TODO: enemyDebuff
    ]
    const calc = genshinCalculatorWithEntries(data)
    return calc
  }, [team])
  return <CalcContext.Provider value={calc}>{children}</CalcContext.Provider>
}
