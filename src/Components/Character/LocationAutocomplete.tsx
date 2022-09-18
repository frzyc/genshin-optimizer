import { BusinessCenter, Favorite } from "@mui/icons-material"
import { Autocomplete, AutocompleteProps, ListItemIcon, ListItemText, MenuItem, Skeleton } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import CharacterSheet from "../../Data/Characters/CharacterSheet"
import { initCharMeta } from "../../Database/Data/StateData"
import { DatabaseContext } from "../../Database/Database"
import usePromise from "../../ReactHooks/usePromise"
import { charKeyToLocCharKey, LocationCharacterKey, LocationKey, travelerKeys } from "../../Types/consts"
import SolidColoredTextField from "../SolidColoredTextfield"
import ThumbSide from "./ThumbSide"

export function LocationAutocomplete({ location, setLocation, filter = () => true }: { location: LocationKey, setLocation: (v: LocationKey) => void, filter?: (v: CharacterSheet) => void }) {
  const { t } = useTranslation(["ui", "artifact", "charNames_gen"])
  const { database } = useContext(DatabaseContext)
  const characterSheets = usePromise(() => CharacterSheet.getAll, [])
  const toText = useCallback((key: LocationCharacterKey): string => t(`charNames_gen:${key === "Traveler" ? database.chars.LocationToCharacterKey(key).slice(0, 9) : key}`), [database, t])
  const toImg = useCallback((key: LocationCharacterKey) => characterSheets ? <ThumbSide src={characterSheets![database.chars.LocationToCharacterKey(key)]?.thumbImgSide} sx={{ pr: 1 }} /> : <></>, [database, characterSheets])
  const isFavorite = useCallback((key: LocationCharacterKey) => key === "Traveler" ?
    travelerKeys.some(key => database.states.getWithInit(`charMeta_${key}`, initCharMeta).favorite) :
    key ? database.states.getWithInit(`charMeta_${key}`, initCharMeta).favorite : false, [database])
  const values: GeneralAutocompleteOption<LocationKey>[] = useMemo(() => [{
    key: "",
    label: t`artifact:filterLocation.inventory`,
    img: <BusinessCenter />,
  },
  ...Array.from(new Set(database.chars.keys.filter(k => characterSheets?.[k] ? filter(characterSheets[k]) : true).map(k => charKeyToLocCharKey(k))))
    .map(v => ({ key: v, img: toImg(v), label: toText(v), favorite: isFavorite(v) }))
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return a.label.localeCompare(b.label)
    })
  ], [t, toImg, toText, isFavorite, database, characterSheets, filter])
  return <Suspense fallback={<Skeleton variant="text" width={100} />}><GeneralAutocomplete size="small" options={values} valueKey={location} onChange={setLocation} /></Suspense>
}

type GeneralAutocompleteOption<T extends string> = { key: T, img: JSX.Element, label: string, favorite?: boolean }
export default function GeneralAutocomplete<T extends string>({ options, valueKey: key, onChange, disable = () => false }:
  { valueKey: T, onChange: (v: T) => void, disable?: (v: T) => boolean } & Omit<AutocompleteProps<GeneralAutocompleteOption<T>, false, true, false>, "renderInput" | "onChange">) {
  const value = options.find(o => o.key === key)
  return <Autocomplete
    options={options}
    value={value}
    clearIcon={null}
    onChange={(event, newValue, reason) => newValue !== null && onChange(newValue.key)}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    getOptionDisabled={option => disable(option.key)}
    renderInput={props => {
      return <SolidColoredTextField
        {...props}
        startAdornment={value?.img}
        hasValue={!!value}
      />
    }}
    renderOption={(props, option) => <MenuItem value={option.key} {...props}>
      <ListItemIcon>{option.img}</ListItemIcon>
      <ListItemText>
        <Suspense fallback={<Skeleton variant="text" width={100} />}>
          {option.key === value?.key ? <strong>{option.label}</strong> : option.label}
        </Suspense>
      </ListItemText>
      {!!option.favorite && <Favorite />}
    </MenuItem>
    }
  />
}
