import { ListItemIcon, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Theme, useTheme } from '@mui/material/styles';
import KeyMap from '../../KeyMap';
import { allSubstats, SubstatKey } from '../../Types/artifact_WR';
import StatIcon from '../StatIcon';


function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function ArtifactSubStatMultipleSelectChip({ subStatKeys, setSubStatKeys }:
  { subStatKeys: SubstatKey[], setSubStatKeys: (keys: SubstatKey[]) => void }) {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<typeof subStatKeys>) => {
    const { target: { value }, } = event
    setSubStatKeys((typeof value === 'string' ? value.split(',') : value) as SubstatKey[]);// On autofill we get a stringified value.
  };
  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="sub-stat-multiple-chip-label">Sub Stats</InputLabel>
        <Select
          labelId="sub-stat-multiple-chip-label"
          id="sub-stat-multiple-chip"
          multiple
          value={subStatKeys}
          onChange={handleChange}
          input={<OutlinedInput id="sub-stat-select-multiple-chip" label="Sub Stats" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) =>
                <Chip key={value} icon={StatIcon[value]} label={KeyMap.get(value)} />
              )}
            </Box>
          )}
        >
          {allSubstats.map(statKey => <MenuItem key={statKey} value={statKey}>
            <ListItemIcon>{StatIcon[statKey]}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ style: getStyles(statKey, subStatKeys, theme) }}>
              {KeyMap.get(statKey)}
            </ListItemText>
          </MenuItem>)}
        </Select>
      </FormControl>
    </div>
  );
}
