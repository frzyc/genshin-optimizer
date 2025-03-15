import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  CardThemed,
  DropdownButton,
  ImgIcon,
} from '@genshin-optimizer/common/ui'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
import type { ArtifactSetKey, SetNum } from '@genshin-optimizer/gi/consts'
import { getArtSheet } from '@genshin-optimizer/gi/sheets'
import {
  ArtifactSetName,
  ArtifactSetTooltip,
  SetEffectDisplay,
} from '@genshin-optimizer/gi/ui'
import ClearIcon from '@mui/icons-material/Clear'
import InfoIcon from '@mui/icons-material/Info'
import { Box, Button, ButtonGroup, MenuItem, Stack } from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { BuildTcContext } from '../../../../BuildTcContext'

export function ArtifactSetEditor({
  setKey,
  remaining,
  disabled = false,
}: {
  setKey: ArtifactSetKey
  remaining: number
  disabled?: boolean
}) {
  const {
    buildTc: {
      artifact: { sets },
    },
    setBuildTc,
  } = useContext(BuildTcContext)
  const value = sets[setKey]
  const setValue = useCallback(
    (value: 1 | 2 | 4) => {
      setBuildTc((buildTc) => {
        buildTc.artifact.sets[setKey] = value
      })
    },
    [setBuildTc, setKey],
  )
  const deleteValue = useCallback(() => {
    setBuildTc((buildTc) => {
      const { [setKey]: _, ...rest } = buildTc.artifact.sets
      buildTc.artifact.sets = rest
    })
  }, [setBuildTc, setKey])
  const artifactSheet = getArtSheet(setKey)

  /* Assumes that all conditionals are from 4-Set. needs to change if there are 2-Set conditionals */
  const condNums = useMemo(() => {
    if (!value || value < 2) return []
    return Object.keys(artifactSheet.setEffects).filter(
      (setNumKey) =>
        +setNumKey <= value &&
        artifactSheet.setEffects[setNumKey]?.document.some(
          (doc) => 'states' in doc,
        ),
    )
  }, [artifactSheet, value])

  return (
    <CardThemed bgt="light">
      <Box display="flex">
        <ArtifactSetTooltip setKey={setKey} numInSet={value}>
          <Box flexGrow={1} p={1} display="flex" gap={1} alignItems="center">
            <ImgIcon size={2} src={artifactDefIcon(setKey)} />
            <Box>
              <ArtifactSetName setKey={setKey} />
            </Box>
            <InfoIcon {...iconInlineProps} />
          </Box>
        </ArtifactSetTooltip>
        <ButtonGroup>
          <DropdownButton
            size="small"
            title={<Box whiteSpace="nowrap">{value}-set</Box>}
            disabled={disabled}
          >
            {Object.keys(artifactSheet.setEffects)
              .map((setKey) => parseInt(setKey))
              .map((setKey) => (
                <MenuItem
                  key={setKey}
                  disabled={
                    value === setKey || setKey > remaining + (value ?? 0)
                  }
                  onClick={() => setValue(setKey as 1 | 2 | 4)}
                >
                  {setKey}-set
                </MenuItem>
              ))}
          </DropdownButton>
          <Button
            color="error"
            size="small"
            onClick={deleteValue}
            disabled={disabled}
          >
            <ClearIcon />
          </Button>
        </ButtonGroup>
      </Box>
      {!!condNums.length && (
        <Stack spacing={1} sx={{ p: 1 }}>
          {condNums.map((setNumKey) => (
            <SetEffectDisplay
              key={setNumKey}
              setKey={setKey}
              setNumKey={parseInt(setNumKey) as SetNum}
              hideHeader
              disabled={disabled}
            />
          ))}
        </Stack>
      )}
    </CardThemed>
  )
}
