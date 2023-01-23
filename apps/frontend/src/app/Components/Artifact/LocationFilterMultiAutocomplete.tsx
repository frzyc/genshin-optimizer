import { characterAsset } from "@genshin-optimizer/g-assets"
import { Box, Chip, Skeleton } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { getCharSheet } from "../../Data/Characters"
import { DatabaseContext } from "../../Database/Database"
import useDBMeta from "../../ReactHooks/useDBMeta"
import { charKeyToCharName, LocationCharacterKey, locationCharacterKeys, travelerKeys } from "../../Types/consts"
import { GeneralAutocompleteMulti, GeneralAutocompleteOption } from "../GeneralAutocomplete"

export default function LocationFilterMultiAutocomplete({ locations, setLocations, totals, disabled }: {
  locations: LocationCharacterKey[],
  setLocations: (v: LocationCharacterKey[]) => void,
  totals: Record<LocationCharacterKey, string>
  disabled?: boolean
}) {
  const { t } = useTranslation(["ui", "artifact", "charNames_gen"])
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const toText = useCallback((key: LocationCharacterKey): string => t(`charNames_gen:${charKeyToCharName(database.chars.LocationToCharacterKey(key), gender)}`), [database, gender, t])
  const toImg = useCallback((key: LocationCharacterKey) => <Box><Box component="img" src={characterAsset(database.chars.LocationToCharacterKey(key), "iconSide", gender)} sx={{
    display: "inline-block",
    width: "auto",
    height: `3em`,
    lineHeight: 1,
    verticalAlign: "text-bottom",
    mt: -2,
    mb: -0.5,
    mr: -0.5,
    ml: -1,
  }} /></Box>, [database, gender])

  const toExLabel = useCallback((key: LocationCharacterKey) => <strong>{totals[key]}</strong>, [totals],)
  const toExItemLabel = useCallback((key: LocationCharacterKey) => <Chip size="small" label={totals[key]} />, [totals],)

  const isFavorite = useCallback((key: LocationCharacterKey) => key === "Traveler" ?
    travelerKeys.some(key => database.charMeta.get(key).favorite) :
    key ? database.charMeta.get(key).favorite : false, [database])

  const toVariant = useCallback((key: LocationCharacterKey) => getCharSheet(database.chars.LocationToCharacterKey(key), gender).elementKey ?? undefined, [database, gender])

  const values: GeneralAutocompleteOption<LocationCharacterKey>[] = useMemo(() =>
    locationCharacterKeys.filter(lck => database.chars.get(database.chars.LocationToCharacterKey(lck)))
      .map(v => ({ key: v, label: toText(v), favorite: isFavorite(v), variant: toVariant(v) }))
      .sort((a, b) => {
        if (a.favorite && !b.favorite) return -1
        if (!a.favorite && b.favorite) return 1
        return a.label.localeCompare(b.label)
      })
    , [toText, isFavorite, toVariant, database])

  return <Suspense fallback={<Skeleton variant="text" width={100} />}>
    <GeneralAutocompleteMulti
      disabled={disabled}
      options={values}
      valueKeys={locations}
      onChange={k => setLocations(k)}
      toImg={toImg}
      toExLabel={toExLabel}
      toExItemLabel={toExItemLabel}
      label={t`artifact:filterLocation.location`}
      chipProps={{ variant: "outlined" }} />
  </Suspense>
}
