import type {
  GeneralAutocompleteMultiProps,
  GeneralAutocompleteOption,
} from '@genshin-optimizer/common/ui'
import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { charKeyToLocGenderedCharKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { SillyContext } from '@genshin-optimizer/gi/ui'
import { Chip, Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getCharSheet } from '../../Data/Characters'
import { bulkCatTotal } from '../../Util/totalUtils'
import CharIconSide from '../Image/CharIconSide'

export function CharacterMultiAutocomplete({
  teamIds,
  charKeys,
  setCharKey,
  acProps,
}: {
  teamIds: string[]
  charKeys: CharacterKey[]
  setCharKey: (v: CharacterKey[]) => void
  acProps?: Partial<GeneralAutocompleteMultiProps<CharacterKey>>
}) {
  const { t } = useTranslation(['sillyWisher_charNames', 'charNames_gen'])
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const { gender } = useDBMeta()

  const charIsFavorite = useCallback(
    (charKey: CharacterKey) => database.charMeta.get(charKey).favorite,
    [database.charMeta]
  )

  const toImg = useCallback(
    (key: CharacterKey) => <CharIconSide characterKey={key} />,
    []
  )
  const toLabel = useCallback(
    (key: CharacterKey, silly: boolean): string =>
      t(
        `${
          silly ? 'sillyWisher_charNames' : 'charNames_gen'
        }:${charKeyToLocGenderedCharKey(key, gender)}`
      ),
    [gender, t]
  )

  const toVariant = useCallback(
    (key: CharacterKey) => getCharSheet(key, gender).elementKey ?? undefined,
    [gender]
  )

  const allCharKeys = useMemo(() => database.chars.keys, [database])

  const { characterTeamTotal } = useMemo(() => {
    const catKeys = {
      characterTeamTotal: allCharKeys,
    } as const
    return bulkCatTotal(catKeys, (ctMap) => {
      database.teams.values.forEach((team) => {
        const { loadoutData } = team
        loadoutData.filter(notEmpty).forEach(({ teamCharId }) => {
          const teamChar = database.teamChars.get(teamCharId)
          if (!teamChar) return
          const ck = teamChar.key
          ctMap.characterTeamTotal[ck].total++
        })
      })
      teamIds.forEach((teamId) => {
        const team = database.teams.get(teamId)
        if (!team) return
        const { loadoutData } = team
        loadoutData.filter(notEmpty).forEach(({ teamCharId }) => {
          const teamChar = database.teamChars.get(teamCharId)
          if (!teamChar) return
          const ck = teamChar.key
          ctMap.characterTeamTotal[ck].current++
        })
      })
    })
  }, [database, allCharKeys, teamIds])

  const toExLabel = useCallback(
    (key: CharacterKey) => <strong>{characterTeamTotal[key]}</strong>,
    [characterTeamTotal]
  )
  const toExItemLabel = useCallback(
    (key: CharacterKey) => (
      <Chip size="small" label={characterTeamTotal[key]} />
    ),
    [characterTeamTotal]
  )

  const options: GeneralAutocompleteOption<CharacterKey>[] = useMemo(
    () =>
      allCharKeys
        .map(
          (ck): GeneralAutocompleteOption<CharacterKey> => ({
            key: ck,
            label: toLabel(ck, silly),
            favorite: charIsFavorite(ck),
            color: toVariant(ck),
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return a.label.localeCompare(b.label)
        }),
    [silly, toLabel, toVariant, charIsFavorite, allCharKeys]
  )

  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocompleteMulti
        label="Characters"
        options={options}
        toImg={toImg}
        valueKeys={charKeys}
        onChange={(k) => setCharKey(k)}
        toExLabel={toExLabel}
        toExItemLabel={toExItemLabel}
        chipProps={{ variant: 'outlined' }}
        {...acProps}
      />
    </Suspense>
  )
}
