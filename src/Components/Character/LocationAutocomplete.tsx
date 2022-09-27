import { BusinessCenter } from "@mui/icons-material"
import { AutocompleteProps, Skeleton } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import CharacterSheet from "../../Data/Characters/CharacterSheet"
import { DatabaseContext } from "../../Database/Database"
import useDBMeta from "../../ReactHooks/useDBMeta"
import usePromise from "../../ReactHooks/usePromise"
import { charKeyToCharName, charKeyToLocCharKey, LocationCharacterKey, LocationKey, travelerKeys } from "../../Types/consts"
import GeneralAutocomplete, { GeneralAutocompleteOption } from "../GeneralAutocomplete"
import ThumbSide from "./ThumbSide"

export function LocationAutocomplete({ location, setLocation, filter = () => true, autoCompleteProps = {} }:
  { location: LocationKey, setLocation: (v: LocationKey) => void, filter?: (v: CharacterSheet) => void, autoCompleteProps?: Omit<AutocompleteProps<GeneralAutocompleteOption<LocationKey>, false, true, false>, "renderInput" | "onChange" | "options"> }) {
  const { t } = useTranslation(["ui", "artifact", "charNames_gen"])
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const characterSheets = usePromise(() => CharacterSheet.getAll, [])
  const toText = useCallback((key: LocationCharacterKey): string => t(`charNames_gen:${charKeyToCharName(database.chars.LocationToCharacterKey(key), gender)}`), [database, gender, t])
  const toImg = useCallback((key: LocationKey) => key === "" ? <BusinessCenter /> : characterSheets ? <ThumbSide src={characterSheets(database.chars.LocationToCharacterKey(key), gender)?.thumbImgSide} sx={{ pr: 1 }} /> : <></>, [database, gender, characterSheets])
  const isFavorite = useCallback((key: LocationCharacterKey) => key === "Traveler" ?
    travelerKeys.some(key => database.charMeta.get(key).favorite) :
    key ? database.charMeta.get(key).favorite : false, [database])

  const values: GeneralAutocompleteOption<LocationKey>[] = useMemo(() => [{
    key: "",
    label: t`artifact:filterLocation.inventory`,
  },
  ...Array.from(new Set(database.chars.keys.filter(k => characterSheets?.(k, gender) ? filter(characterSheets(k, gender)!) : true).map(k => charKeyToLocCharKey(k))))
    .map(v => ({ key: v, label: toText(v), favorite: isFavorite(v) }))
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return a.label.localeCompare(b.label)
    })
  ], [t, toText, isFavorite, database, characterSheets, filter, gender])
  return <Suspense fallback={<Skeleton variant="text" width={100} />}><GeneralAutocomplete size="small" options={values} valueKey={location} onChange={setLocation} toImg={toImg} clearKey="" {...autoCompleteProps} /></Suspense>
}
