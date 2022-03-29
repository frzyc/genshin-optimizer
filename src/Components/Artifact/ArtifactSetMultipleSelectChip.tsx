import { Divider, ListItemIcon, ListItemText, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Theme, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import usePromise from '../../ReactHooks/usePromise';
import { ArtifactSetKey, Rarity } from '../../Types/consts';
import { Stars } from '../StarDisplay';


function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function ArtifactSetMultipleSelectChip({ artSetKeys, setArtSetKeys }:
  { artSetKeys: ArtifactSetKey[], setArtSetKeys: (keys: ArtifactSetKey[]) => void }) {
  const { t } = useTranslation("artifact")
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<typeof artSetKeys>) => {
    const { target: { value }, } = event
    setArtSetKeys((typeof value === 'string' ? value.split(',') : value) as ArtifactSetKey[]);// On autofill we get a stringified value.
  };
  const displaySets = useMemo(() => {
    if (!artifactSheets) return {}
    return ArtifactSheet.setKeysByRarities(artifactSheets)
  }, [artifactSheets])
  if (!artifactSheets) return null
  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="artifact-set-multiple-chip-label">Artifact Sets</InputLabel>
        <Select
          labelId="artifact-set-multiple-chip-label"
          id="artifact-set-multiple-chip"
          multiple
          value={artSetKeys}
          onChange={handleChange}
          input={<OutlinedInput id="artifact-set-select-multiple-chip" label="Artifact Sets" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) =>
                <Chip key={value} icon={artifactSheets[value]?.defIcon} label={artifactSheets[value].name} />
              )}
            </Box>
          )}
        >
          {!!Object.keys(displaySets).length && Object.entries(displaySets).reverse().flatMap(([star, sets], i) => [
            ...((i > 0) && sets.length ? [<Divider key={`${star}divi`} />] : []),
            ...(sets.length ? [<MenuItem key={`${star}header`} style={{ pointerEvents: 'none' }} >
              <Typography>
                <Trans t={t} i18nKey="editor.set.maxRarity">Max Rarity <Stars stars={parseInt(star) as Rarity} /></Trans>
              </Typography>
            </MenuItem>] : []),
            ...sets.map(setKey => <MenuItem key={setKey} value={setKey}>
              <ListItemIcon>{artifactSheets[setKey]?.defIcon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ style: getStyles(setKey, artSetKeys, theme) }}>
                {artifactSheets[setKey]?.name}
              </ListItemText>
            </MenuItem >)
          ])}
        </Select>
      </FormControl>
    </div>
  );
}
