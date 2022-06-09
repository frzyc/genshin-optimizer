import { faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BusinessCenter, Favorite } from "@mui/icons-material";
import { Autocomplete, AutocompleteProps, Box, Skeleton, Typography, useTheme } from "@mui/material";
import { Suspense, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import usePromise from "../../ReactHooks/usePromise";
import { allCharacterKeys, CharacterKey } from "../../Types/consts";
import { CharacterFilterConfigs, characterFilterConfigs } from "../../Util/CharacterSort";
import { filterFunction } from "../../Util/SortByFilters";
import MenuItemWithImage from "../MenuItemWithImage";
import SolidColoredTextField from "../SolidColoredTextfield";
import ThumbSide from "./ThumbSide";

type CharacterAutocompleteValue = CharacterKey | "" | "Inventory" | "Equipped"
type CharacterAutocompleteOption = {
  value: CharacterAutocompleteValue
  label: string
}
type CharacterAutocompleteProps = Omit<AutocompleteProps<CharacterAutocompleteOption, false, true, false>, "onChange" | "options" | "renderInput" | "value" | "disableClearable"> & {
  value: CharacterAutocompleteValue
  onChange: (v: any) => void
  filter?: (cs: CharacterSheet, ck: CharacterKey) => boolean
  disable?: (v: any) => boolean
  showDefault?: boolean
  showInventory?: boolean
  showEquipped?: boolean
  defaultText?: string
  defaultIcon?: Displayable
  placeholderText?: string
  labelText?: string
}

export default function CharacterAutocomplete({ value, onChange, defaultText = "", defaultIcon = "", placeholderText = "", labelText = "", showDefault = false, showInventory = false, showEquipped = false, filter = () => true, disable = () => false, ...props }: CharacterAutocompleteProps) {
  // TODO: #412 We shouldn't be loading all the character translation files. Should have a separate lookup file for character name.
  const { t } = useTranslation(["ui", "artifact", ...allCharacterKeys.map(k => `char_${k}_gen`)])
  const theme = useTheme()
  const { database } = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll, [])
  const filterConfigs = useMemo(() => characterSheets && characterFilterConfigs(database, characterSheets), [database, characterSheets])
  const characterKeys = database._getCharKeys().filter(ck => characterSheets?.[ck] && filter(characterSheets[ck], ck)).sort()

  const textForValue = useCallback((value: CharacterAutocompleteValue): string => {
    switch (value) {
      case "Equipped":
        return t("artifact:filterLocation.currentlyEquipped")
      case "Inventory":
        return t("artifact:filterLocation.inventory")
      case "":
        return defaultText
      default:
        return t(`char_${value}_gen:name`)
    }
  }, [defaultText, t])

  const imageForValue = useCallback((value: CharacterAutocompleteValue): Displayable => {
    switch (value) {
      case "Equipped":
        return <FontAwesomeIcon icon={faUserShield} />
      case "Inventory":
        return <BusinessCenter />
      case "":
        return defaultIcon
      default:
        return <ThumbSide src={characterSheets![value]?.thumbImgSide} sx={{ pr: 1 }} />
    }
  }, [defaultIcon, characterSheets])

  const characterOptions = useMemo(() => filterConfigs && charOptions(characterKeys, filterConfigs, textForValue, showDefault, showInventory, showEquipped),
    [filterConfigs, characterKeys, showDefault, showInventory, showEquipped, textForValue])



  if (!characterSheets || !characterOptions) return null

  return <Autocomplete
    autoHighlight
    options={characterOptions}
    getOptionLabel={(option) => option.label}
    onChange={(_, newValue) => onChange(newValue ? newValue.value : "")}
    isOptionEqualToValue={(option, value) => option.value === value.value}
    getOptionDisabled={option => option.value ? disable(option.value) : false}
    value={{ value, label: textForValue(value) }}
    renderInput={(props) => <SolidColoredTextField
      {...props}
      label={labelText}
      placeholder={placeholderText}
      startAdornment={imageForValue(value)}
      hasValue={value ? true : false}
    />}
    renderOption={(props, option) => {
      const favorite = option.value !== "Equipped" && option.value !== "Inventory"
        && option.value !== "" && database._getChar(option.value)?.favorite
      return <MenuItemWithImage
        key={option.value ? option.value : "default"}
        value={option.value ? option.value : "default"}
        image={imageForValue(option.value)}
        text={
          <Suspense fallback={<Skeleton variant="text" width={100} />}>
            <Typography variant="inherit" noWrap>
              {textForValue(option.value)}
            </Typography>
          </Suspense>
        }
        theme={theme}
        isSelected={value === option.value}
        addlElement={<>
          {favorite && <Box display="flex" flexGrow={1} />}
          {favorite && <Favorite sx={{ ml: 1, mr: -0.5 }} />}
        </>}
        props={props}
      />
    }}
    {...props}
  />
}


function charOptions(characterKeys: CharacterKey[], filterConfigs: CharacterFilterConfigs | undefined, textForValue: (v: CharacterAutocompleteValue) => string, showDefault: boolean, showInventory, showEquipped): CharacterAutocompleteOption[] {
  if (!filterConfigs) return []
  const base: CharacterAutocompleteOption[] = []
  if (showDefault) {
    base.push({ value: "", label: textForValue("") })
  }
  if (showInventory) {
    base.push({ value: "Inventory", label: textForValue("Inventory") })
  }
  if (showEquipped) {
    base.push({ value: "Equipped", label: textForValue("Equipped") })
  }
  const faves = characterKeys
    .filter(filterFunction({ element: "", weaponType: "", favorite: "yes", name: "" }, filterConfigs))
    .map(characterKey => ({ value: characterKey, label: textForValue(characterKey) }))
  const nonFaves = characterKeys
    .filter(filterFunction({ element: "", weaponType: "", favorite: "no", name: "" }, filterConfigs))
    .map(characterKey => ({ value: characterKey, label: textForValue(characterKey) }))

  return base.concat(faves).concat(nonFaves)
}
