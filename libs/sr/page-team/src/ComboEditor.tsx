import { CardThemed, ConditionalWrapper } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { useDatabaseContext } from '@genshin-optimizer/sr/ui'
import {
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material'
import { useContext } from 'react'
import { PresetContext, useTeamContext } from './context'
import { OptimizationTargetSelector } from './TeammateDisplay/Optimize/OptimizationTargetSelector'

export function ComboEditor() {
  const { database } = useDatabaseContext()
  const { team, teamId } = useTeamContext()
  return (
    <CardThemed
      sx={{
        overflow: 'visible',
        top: 137, // height of the team selector
        position: 'sticky',
        zIndex: 101,
      }}
    >
      <CardHeader title="Combo Editor" />
      <Divider />
      <CardContent
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
        }}
      >
        {team.frames.map((frame, i) => (
          <Team
            key={i + JSON.stringify(frame ?? {})}
            tag={frame}
            index={i}
            setTarget={(read) =>
              database.teams.set(teamId, (team) => {
                const frames = structuredClone(team.frames)
                frames[i] = read
                team.frames = frames
              })
            }
          />
        ))}
        <Box sx={{ flexShrink: 0 }}>
          <OptimizationTargetSelector
            setOptTarget={(tag) =>
              database.teams.set(teamId, (team) => {
                team.frames = [...team.frames, tag]
              })
            }
          />
        </Box>
      </CardContent>
    </CardThemed>
  )
}
function Team({
  tag,
  index,
  setTarget,
}: {
  tag: Tag
  index: number
  setTarget(tag: Tag): void
}) {
  const { presetIndex, setPresetIndex } = useContext(PresetContext)
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
      <ConditionalWrapper
        condition={presetIndex !== index}
        wrapper={(children) => (
          <CardActionArea onClick={() => setPresetIndex(index)}>
            {children}
          </CardActionArea>
        )}
      >
        <CardHeader title={`Team ${index + 1}`} />
      </ConditionalWrapper>
      <Divider />
      <CardContent>
        <OptimizationTargetSelector optTarget={tag} setOptTarget={setTarget} />
      </CardContent>
    </CardThemed>
  )
}
