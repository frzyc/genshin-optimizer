import { CardThemed } from '@genshin-optimizer/common/ui'
import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import type { Preset } from '@genshin-optimizer/game-opt/engine'
import { DebugReadContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { Frame } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import { Read } from '@genshin-optimizer/sr/formula'
import {
  OptimizationTargetSelector,
  TagDisplay,
} from '@genshin-optimizer/sr/formula-ui'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
import { Box, CardActionArea, Divider, Typography } from '@mui/material'
import type { MouseEvent } from 'react'
import { useCallback, useContext, useMemo } from 'react'
import { PresetContext, useTeamContext } from './context'

export function ComboEditor() {
  const { database } = useDatabaseContext()
  const { team, teamId } = useTeamContext()
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        overflowY: 'visible',
        p: 1,
      }}
    >
      {team.frames.map((frame, i) => (
        <Combo key={i} frame={frame} index={i} />
      ))}
      <Box sx={{ flexShrink: 0 }}>
        <OptimizationTargetSelector
          setOptTarget={(tag) =>
            database.teams.set(teamId, (team) => {
              team.frames = [
                ...team.frames,
                {
                  multiplier: 1,
                  tag: {
                    ...tag,
                    // TODO: This is going to cause collision issues when frame deletion is implemented
                    preset: `preset${team.frames.length}` as Preset,
                  },
                },
              ]
            })
          }
        />
      </Box>
    </Box>
  )
}
function Combo({ frame, index }: { frame: Frame; index: number }) {
  const { presetIndex, setPresetIndex } = useContext(PresetContext)
  const calc = useSrCalcContext()
  const { setRead } = useContext(DebugReadContext)
  const read = useMemo(() => new Read(frame.tag, 'sum'), [frame.tag])
  const value = useMemo(() => {
    try {
      return calc?.compute(read).val ?? 0
    } catch (error) {
      console.error('Error computing value:', error)
      return 0
    }
  }, [calc, read])
  const unit = getUnitStr(frame.tag.q ?? '')

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (event.altKey) setRead(read)
      else setPresetIndex(index)
    },
    [index, read, setPresetIndex, setRead]
  )
  return (
    <CardThemed
      bgt="light"
      sx={(theme) => ({
        flexShrink: 0,
        outline:
          presetIndex === index
            ? `solid ${theme.palette.success.main}`
            : undefined,
      })}
    >
      <CardActionArea onClick={handleClick}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch', p: 1 }}>
          <Typography>{index + 1}</Typography>
          <Divider orientation="vertical" />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TagDisplay tag={frame.tag} />
          </Box>
        </Box>

        <Divider />
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>
            {frame.multiplier} x {valueString(value, unit)}
          </Typography>
        </Box>
      </CardActionArea>
    </CardThemed>
  )
}
