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
import { allMainStatKeys, MainStatKey } from '../../Types/artifact';
import StatIcon from '../StatIcon';


function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function ArtifactMainStatMultipleSelectChip({ mainStatKeys, setMainStatKeys }:
  { mainStatKeys: MainStatKey[], setMainStatKeys: (keys: MainStatKey[]) => void }) {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<typeof mainStatKeys>) => {
    const { target: { value }, } = event
    setMainStatKeys((typeof value === 'string' ? value.split(',') : value) as MainStatKey[]);// On autofill we get a stringified value.
  };
  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="main-stat-multiple-chip-label">Main Stats</InputLabel>
        <Select
          labelId="main-stat-multiple-chip-label"
          id="main-stat-multiple-chip"
          multiple
          value={mainStatKeys}
          onChange={handleChange}
          input={<OutlinedInput id="main-stat-select-multiple-chip" label="Main Stats" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) =>
                <Chip key={value} icon={StatIcon[value]} label={KeyMap.get(value)} />
              )}
            </Box>
          )}
        >
          {allMainStatKeys.map(statKey => <MenuItem key={statKey} value={statKey}>
            <ListItemIcon>{StatIcon[statKey]}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ style: getStyles(statKey, mainStatKeys, theme) }}>
              {KeyMap.get(statKey)}
            </ListItemText>
          </MenuItem>)}
        </Select>
      </FormControl>
    </div>
  );
}
