import { ButtonGroup, CardContent, Divider, MenuItem } from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArtifactSetSingleAutocomplete } from '../../../../../Components/Artifact/ArtifactAutocomplete';
import SetEffectDisplay from '../../../../../Components/Artifact/SetEffectDisplay';
import CardLight from '../../../../../Components/Card/CardLight';
import DropdownButton from '../../../../../Components/DropdownMenu/DropdownButton';
import { ArtifactSheet } from '../../../../../Data/Artifacts/ArtifactSheet';
import usePromise from '../../../../../ReactHooks/usePromise';
import { allArtifactSets, ArtifactSetKey, SetNum } from '../../../../../Types/consts';
import { BuildSetting } from '../BuildSetting';

type PickerProps = {
  index: number
  setFilters: BuildSetting["setFilters"],
  disabled?: boolean,
  onChange: (index: number, key: ArtifactSetKey | "", num: number) => void,
}

export default function ArtifactSetPicker({ index, setFilters, onChange, disabled = false }: PickerProps) {
  const { key: setKey, num: setNum } = setFilters[index]
  const { t } = useTranslation("page_character")
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const artifactSets = useMemo(() => {
    if (!artifactSheets) return undefined
    return allArtifactSets.filter(set => {
      const setsNumArr = set ? Object.keys(artifactSheets[set].setEffects) : []
      const artsAccountedOther = setFilters.reduce((accu, cur, ind) => (cur.key && ind !== index) ? accu + cur.num : accu, 0)
      if (setsNumArr.every((num: any) => parseInt(num) + artsAccountedOther > 5)) return false
      return true
    })
  }, [artifactSheets, setFilters, index])

  if (!artifactSets) return null

  const artsAccounted = setFilters.reduce((accu, cur) => cur.key ? accu + cur.num : accu, 0)

  return <CardLight>
    <ButtonGroup sx={{ width: "100%" }}>
      {/* Artifact set */}
      {artifactSheets && <ArtifactSetSingleAutocomplete
        flattenCorners
        showDefault
        size="small"
        artSetKey={setKey}
        setArtSetKey={setKey => onChange(index, setKey as ArtifactSetKey, parseInt(Object.keys(artifactSheets[setKey]?.setEffects ?? {})[0] as string) ?? 0)}
        allArtSetKeys={artifactSets}
        label={t("forceSet")}
        disabled={disabled}
        sx={{ flexGrow: 1 }}
        disable={(setKey) => setFilters.some(setFilter => setFilter.key === setKey)}
        defaultText={t("none")}
      />}
      {/* set number */}
      <DropdownButton title={`${setNum}-set`}
        disabled={disabled || !setKey || artsAccounted >= 5}
        sx={{ borderRadius: 0 }}
      >
        {Object.keys(artifactSheets?.[setKey]?.setEffects ?? {}).map((num: any) => {
          let artsAccountedOther = setFilters.reduce((accu, cur) => (cur.key && cur.key !== setKey) ? accu + cur.num : accu, 0)
          return (parseInt(num) + artsAccountedOther <= 5) &&
            (<MenuItem key={num} onClick={() => onChange(index, setFilters[index].key, parseInt(num) ?? 0)} >
              {`${num}-set`}
            </MenuItem>)
        })}
      </DropdownButton>
    </ButtonGroup>
    {!!setKey && <Divider />}
    {!!setKey && <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Object.keys(artifactSheets?.[setKey].setEffects ?? {}).map(setNKey => parseInt(setNKey as string) as SetNum).filter(setNkey => setNkey <= setNum).map(setNumKey =>
        <SetEffectDisplay key={setKey + setNumKey} setKey={setKey} setNumKey={setNumKey} />)}
    </CardContent>}
  </CardLight>
}
