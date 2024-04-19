import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { allSubstatKeys } from '@genshin-optimizer/gi/consts'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { Box, ToggleButton } from '@mui/material'
import { ArtifactStatWithUnit } from './ArtifactStatKeyDisplay'

const rvfilterHandler = handleMultiSelect([...allSubstatKeys])
const keys1 = allSubstatKeys.slice(0, 6)
const keys2 = allSubstatKeys.slice(6)
export function SubstatToggle({
  selectedKeys,
  onChange,
}: {
  selectedKeys: SubstatKey[]
  onChange: (keys: SubstatKey[]) => void
}) {
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
