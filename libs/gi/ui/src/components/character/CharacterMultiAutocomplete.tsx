'use client'
import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import type {
  GeneralAutocompleteMultiProps,
  GeneralAutocompleteOption,
} from '@genshin-optimizer/common/ui'
import { GeneralAutocompleteMulti } from '@genshin-optimizer/common/ui'
import { bulkCatTotal, notEmpty } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { charKeyToLocGenderedCharKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { Chip, Skeleton } from '@mui/material'
import { Suspense, useCallback, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SillyContext } from '../../context'
import { CharIconSide } from './CharIconSideElement'

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
  const { t } = useTranslation([
    'page_team',
    'sillyWisher_charNames',
    'charNames_gen',
  ])

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

  const toVariant = getCharEle

  const [dbDirty, setDirty] = useForceUpdate()
  useEffect(
    () =>
      database.chars.followAny(
        (_, r) => ['new', 'remove'].includes(r) && setDirty()
      ),
    [database.chars, setDirty]
  )

  const allCharKeys = useMemo(
    () => dbDirty && database.chars.keys,
    [database, dbDirty]
  )

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
            alternateNames: silly ? [toLabel(ck, !silly)] : undefined,
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
        label={t('searchLabel.char')}
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
