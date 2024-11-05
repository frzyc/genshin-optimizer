import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ConditionalWrapper,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import type { Tag } from '@genshin-optimizer/sr/formula'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Stack,
} from '@mui/material'
import { useContext } from 'react'
import { BonusStats } from './BonusStats'
import { PresetContext, useTeamContext } from './context'
import { OptimizationTargetSelector } from './Optimize/OptimizationTargetSelector'
import { RelicSheetsDisplay } from './RelicSheetsDisplay'

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
                team.frames = [...team.frames]
                team.frames[i] = read
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
        <CardHeader title={`Combo ${index + 1}`} />
      </ConditionalWrapper>
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          <OptimizationTargetSelector
            optTarget={tag}
            setOptTarget={setTarget}
          />
          <BonusStats />
          <RelicConditionals />
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function RelicConditionals() {
  const [show, onShow, onHide] = useBoolState()
  return (
    <>
      {/* TODO: translation */}
      <Button onClick={onShow}>Relic Conditionals</Button>
      <ModalWrapper open={show} onClose={onHide}>
        <RelicSheetsDisplay />
      </ModalWrapper>
    </>
  )
}
