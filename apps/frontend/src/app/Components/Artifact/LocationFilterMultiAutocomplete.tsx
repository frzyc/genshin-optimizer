import { Box, Skeleton } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import CharacterSheet from "../../Data/Characters/CharacterSheet"
import { DatabaseContext } from "../../Database/Database"
import useDBMeta from "../../ReactHooks/useDBMeta"
import usePromise from "../../ReactHooks/usePromise"
import { charKeyToCharName, LocationCharacterKey, locationCharacterKeys, travelerKeys } from "../../Types/consts"
import { GeneralAutocompleteMulti, GeneralAutocompleteOption } from "../GeneralAutocomplete"

export default function LocationFilterMultiAutocomplete({ locations, setLocations, disabled }: { locations: LocationCharacterKey[], setLocations: (v: LocationCharacterKey[]) => void, disabled?: boolean }) {
  const { t } = useTranslation(["ui", "artifact", "charNames_gen"])
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const characterSheets = usePromise(() => CharacterSheet.getAll, [])
  const toText = useCallback((key: LocationCharacterKey): string => t(`charNames_gen:${charKeyToCharName(database.chars.LocationToCharacterKey(key), gender)}`), [database, gender, t])
  const toImg = useCallback((key: LocationCharacterKey) => characterSheets ? <Box><Box component="img" src={characterSheets(database.chars.LocationToCharacterKey(key), gender)?.thumbImgSide} sx={{
    display: "inline-block",
    width: "auto",
    height: `3em`,
    lineHeight: 1,
    verticalAlign: "text-bottom",
    mt: -2,
    mb: -0.5,
    mr: -0.5,
    ml: -1,
  }} /></Box> : undefined, [database, gender, characterSheets])

  const isFavorite = useCallback((key: LocationCharacterKey) => key === "Traveler" ?
    travelerKeys.some(key => database.charMeta.get(key).favorite) :
    key ? database.charMeta.get(key).favorite : false, [database])

  const toVariant = useCallback((key: LocationCharacterKey) => characterSheets?.(database.chars.LocationToCharacterKey(key), gender)?.elementKey ?? undefined, [characterSheets, database, gender])

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
    <GeneralAutocompleteMulti disabled={disabled} options={values} valueKeys={locations} onChange={k => setLocations(k)} toImg={toImg} label={t`artifact:filterLocation.location`} chipProps={{ variant: "outlined" }} /></Suspense>
}
