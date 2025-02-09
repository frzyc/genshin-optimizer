import { notEmpty } from '@genshin-optimizer/common/util'
import type { Calculator } from '@genshin-optimizer/game-opt/engine'
import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { TagMapNodeEntries } from '@genshin-optimizer/gi/formula'
import {
  artifactsData,
  charData,
  enemyDebuff,
  genshinCalculatorWithEntries,
  members,
  ownBuff,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { IWeapon } from '@genshin-optimizer/gi/good'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import type { ReactNode } from 'react'
import { useContext, useMemo } from 'react'
import { TeamContext } from './TeamContext'
import { TeamLoadoutCharacterToICharacter } from './teamUtil'

export function CalcWrapper({
  children,
  src,
}: {
  children: ReactNode
  src: '1' | '2' | '3' | '0'
}) {
  const team = useContext(TeamContext)
  const calc = useMemo(() => {
    if (!team) return null
    const data: TagMapNodeEntries = [
      ...teamData(
        team.team_loadouts.map((team_loadout) => members[team_loadout.index])
      ),
      ...team.team_loadouts
        .flatMap((team_loadout) => {
          return withMember(
            members[team_loadout.index],
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
      enemyDebuff.reaction.cata.add('spread'),
      enemyDebuff.reaction.amp.add(''),
      enemyDebuff.common.lvl.add(12),
      enemyDebuff.common.preRes.add(0.1),
      ownBuff.common.critMode.add('avg'),
    ]
    return genshinCalculatorWithEntries(data)
  }, [team])
  const calcWithTag = useMemo(() => calc?.withTag({ src }) ?? null, [calc, src])
  return (
    // TODO: Remove this type cast, not sure why it is needed for here, but not for SR usage of calccontext.provider
    <CalcContext.Provider
      value={
        calcWithTag as Calculator<string | null, string | null, string, string>
      }
    >
      {children}
    </CalcContext.Provider>
  )
}
