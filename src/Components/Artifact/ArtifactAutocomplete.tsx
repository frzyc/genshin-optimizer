import { Autocomplete, AutocompleteProps, Chip, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import KeyMap from '../../KeyMap';
import usePromise from '../../ReactHooks/usePromise';
import { allMainStatKeys, allSubstatKeys, MainStatKey, SubstatKey } from '../../Types/artifact';
import { allArtifactSets, allElementsWithPhy, ArtifactSetKey } from '../../Types/consts';
import MenuItemWithImage from '../MenuItemWithImage';
import StatIcon from '../StatIcon';

type ArtifactAutocompleteKey = ArtifactSetKey | MainStatKey | SubstatKey
type ArtifactAutocompleteOption<T extends ArtifactAutocompleteKey> = {
  key: T
  label: string
}
type ArtifactAutocompleteProps<T extends ArtifactAutocompleteKey> = Omit<AutocompleteProps<ArtifactAutocompleteOption<T>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  allArtifactKeys: readonly T[]
  selectedArtifactKeys: T[]
  setArtifactKeys: (keys: T[]) => void
  getName: (key: T) => string
  getImage: (key: T) => JSX.Element
  label: string
}
function ArtifactAutocomplete<T extends ArtifactAutocompleteKey>({ allArtifactKeys, selectedArtifactKeys, setArtifactKeys, getName, getImage, label, ...props }:
  ArtifactAutocompleteProps<T>) {
  const theme = useTheme();

  const handleChange = (_, value: ArtifactAutocompleteOption<T>[]) => {
    setArtifactKeys(value.map(v => v.key))
  };
  const options = useMemo(() => allArtifactKeys.map(key => ({ key: key, label: getName(key) })), [allArtifactKeys, getName])
  return <Autocomplete
    autoHighlight
    multiple
    options={options}
    value={selectedArtifactKeys.map(key => ({ key: key, label: getName(key) }))}
    onChange={handleChange}
    getOptionLabel={(option) => option.label}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    renderInput={(params) => <TextField
      {...params}
      label={label}
      variant="filled"
      InputLabelProps={{ style: { color: theme.palette.text.primary } }}
      color={selectedArtifactKeys.length ? "success" : "primary"}
      type="search"
    />}
    renderOption={(props, option) => (
      <MenuItemWithImage
        key={option.key}
        image={getImage(option.key)}
        text={option.label}
        theme={theme}
        isSelected={selectedArtifactKeys.includes(option.key)}
        props={props}
      />
    )}
    renderTags={(selected, getTagProps) => selected.map((value, index) => {
      const element = allElementsWithPhy.find(ele => value.key === `${ele}_dmg_`)
      const color = element ? element : undefined
      return <Chip {...getTagProps({ index })} key={value.key} icon={getImage(value.key)} label={value.label} color={color} />
    })
    }
    {...props}
  />
}

type ArtifactSetAutocompleteProps = Omit<AutocompleteProps<ArtifactAutocompleteOption<ArtifactSetKey>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  artSetKeys: ArtifactSetKey[]
  setArtSetKeys: (keys: ArtifactSetKey[]) => void
}
export function ArtifactSetAutocomplete({ artSetKeys, setArtSetKeys, ...props }: ArtifactSetAutocompleteProps) {
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const { t } = useTranslation("artifact")
  if (!artifactSheets) return null
  return <ArtifactAutocomplete<ArtifactSetKey>
    allArtifactKeys={allArtifactSets}
    selectedArtifactKeys={artSetKeys}
    setArtifactKeys={setArtSetKeys}
    getName={(key: ArtifactSetKey) => artifactSheets[key].nameRaw}
    getImage={(key: ArtifactSetKey) => artifactSheets[key].defIcon}
    label={t("autocompleteLabels.set")}
    {...props}
  />
}

type ArtifactMainStatAutocompleteProps = Omit<AutocompleteProps<ArtifactAutocompleteOption<MainStatKey>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  mainStatKeys: MainStatKey[]
  setMainStatKeys: (keys: MainStatKey[]) => void
}
export function ArtifactMainStatAutocomplete({ mainStatKeys, setMainStatKeys, ...props }: ArtifactMainStatAutocompleteProps) {
  const { t } = useTranslation("artifact")
  return <ArtifactAutocomplete<MainStatKey>
    allArtifactKeys={allMainStatKeys}
    selectedArtifactKeys={mainStatKeys}
    setArtifactKeys={setMainStatKeys}
    getName={(key: MainStatKey) => KeyMap.getArtStr(key)}
    getImage={(key: MainStatKey) => StatIcon[key]}
    label={t("autocompleteLabels.mainStat")}
    {...props}
  />
}

type ArtifactSubstatAutocompleteProps = Omit<AutocompleteProps<ArtifactAutocompleteOption<SubstatKey>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  substatKeys: SubstatKey[]
  setSubstatKeys: (keys: SubstatKey[]) => void
}
export function ArtifactSubstatAutocomplete({ substatKeys, setSubstatKeys, ...props }: ArtifactSubstatAutocompleteProps) {
  const { t } = useTranslation("artifact")
  return <ArtifactAutocomplete<SubstatKey>
    allArtifactKeys={allSubstatKeys}
    selectedArtifactKeys={substatKeys}
    setArtifactKeys={setSubstatKeys}
    getName={(key: SubstatKey) => KeyMap.getArtStr(key)}
    getImage={(key: SubstatKey) => StatIcon[key]}
    label={t("autocompleteLabels.substat")}
    {...props}
  />
}
