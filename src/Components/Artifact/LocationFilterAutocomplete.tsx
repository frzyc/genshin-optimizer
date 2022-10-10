import { BusinessCenter, PersonSearch } from "@mui/icons-material"
import { Skeleton } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import CharacterSheet from "../../Data/Characters/CharacterSheet"
import { DatabaseContext } from "../../Database/Database"
import { FilterLocationKey } from "../../PageArtifact/ArtifactSort"
import useDBMeta from "../../ReactHooks/useDBMeta"
import usePromise from "../../ReactHooks/usePromise"
import { charKeyToCharName, LocationCharacterKey, locationCharacterKeys, travelerKeys } from "../../Types/consts"
import ThumbSide from "../Character/ThumbSide"
import GeneralAutocomplete, { GeneralAutocompleteOption } from "../GeneralAutocomplete"

export default function LocationFilterAutocomplete({ location, setLocation }: { location: FilterLocationKey, setLocation: (v: FilterLocationKey) => void }) {
  const { t } = useTranslation(["ui", "artifact", "charNames_gen"])
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const characterSheets = usePromise(() => CharacterSheet.getAll, [])
  const toText = useCallback((key: LocationCharacterKey): string => t(`charNames_gen:${charKeyToCharName(database.chars.LocationToCharacterKey(key), gender)}`), [database, gender, t])
  const toImg = useCallback((key: FilterLocationKey) => {
    switch (key) {
      case "":
        return <></>
      case "Inventory":
        return <BusinessCenter />
      case "Equipped":
        return <PersonSearch />
      default:
        return characterSheets ? <ThumbSide src={characterSheets(database.chars.LocationToCharacterKey(key), gender)?.thumbImgSide} sx={{ pr: 1 }} /> : <></>
    }
  }, [database, gender, characterSheets])
  const isFavorite = useCallback((key: LocationCharacterKey) => key === "Traveler" ?
    travelerKeys.some(key => database.charMeta.get(key).favorite) :
    key ? database.charMeta.get(key).favorite : false, [database])
  const values: GeneralAutocompleteOption<FilterLocationKey>[] = useMemo(() => [{
    key: "",
    label: t`artifact:filterLocation.any`,
  }, {
    key: "Equipped",
    label: t`artifact:filterLocation.currentlyEquipped`
  }, {
    key: "Inventory",
    label: t`artifact:filterLocation.inventory`
  },
  ...locationCharacterKeys.map(v => ({ key: v, label: toText(v), favorite: isFavorite(v) }))
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return a.label.localeCompare(b.label)
    })
  ], [t, toText, isFavorite])
  return <Suspense fallback={<Skeleton variant="text" width={100} />}><GeneralAutocomplete size="small" options={values} valueKey={location} onChange={setLocation} toImg={toImg} clearKey="" label={t`artifact:filterLocation.location`} /></Suspense>
}
