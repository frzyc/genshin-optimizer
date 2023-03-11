import { Box, ToggleButton } from '@mui/material'
import StatIcon from '../../KeyMap/StatIcon'
import { iconInlineProps } from '../../SVGIcons'
import { allSubstatKeys } from '../../Types/artifact'
import { handleMultiSelect } from '../../Util/MultiSelect'
import SolidToggleButtonGroup from '../SolidToggleButtonGroup'
import { ArtifactStatWithUnit } from './ArtifactStatKeyDisplay'

const rvfilterHandler = handleMultiSelect([...allSubstatKeys])
const keys1 = allSubstatKeys.slice(0, 6)
const keys2 = allSubstatKeys.slice(6)
export default function SubstatToggle({ selectedKeys, onChange }) {
  const selKeys1 = selectedKeys.filter((k) => keys1.includes(k))
  const selKeys2 = selectedKeys.filter((k) => keys2.includes(k))
  return (
    <Box display="flex" gap={1} flexWrap="wrap">
      <SolidToggleButtonGroup value={selKeys1} sx={{ flexGrow: 1 }}>
        {keys1.map((key) => (
          <ToggleButton
            sx={{ flexGrow: 1 }}
            size="small"
            key={key}
            value={key}
            onClick={() => onChange(rvfilterHandler(selectedKeys, key))}
          >
            <Box display="flex" gap={1} alignItems="center">
              <StatIcon statKey={key} iconProps={iconInlineProps} />
              <ArtifactStatWithUnit statKey={key} />
            </Box>
          </ToggleButton>
        ))}
      </SolidToggleButtonGroup>
      <SolidToggleButtonGroup value={selKeys2} sx={{ flexGrow: 1 }}>
        {keys2.map((key) => (
          <ToggleButton
            sx={{ flexGrow: 1 }}
            size="small"
            key={key}
            value={key}
            onClick={() => onChange(rvfilterHandler(selectedKeys, key))}
          >
            <Box display="flex" gap={1} alignItems="center">
              <StatIcon statKey={key} iconProps={iconInlineProps} />
              <ArtifactStatWithUnit statKey={key} />
            </Box>
          </ToggleButton>
        ))}
      </SolidToggleButtonGroup>
    </Box>
  )
}
