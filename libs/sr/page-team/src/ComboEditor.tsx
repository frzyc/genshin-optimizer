import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import { TagContext } from '@genshin-optimizer/pando/ui-sheet'
import type { Frame } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import { Read } from '@genshin-optimizer/sr/formula'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
import CloseIcon from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { PresetContext, useTeamContext } from './context'
import { LightConeSheetsDisplay } from './LightConeSheetsDisplay'
import { OptimizationTargetDisplay } from './Optimize/OptimizationTargetDisplay'
import { OptimizationTargetSelector } from './Optimize/OptimizationTargetSelector'
import { RelicSheetsDisplay } from './RelicSheetsDisplay'

export function ComboEditor() {
  const { database } = useDatabaseContext()
  const { team, teamId } = useTeamContext()
  return (
    <CardContent
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
      }}
    >
      {team.frames.map((frame, i) => (
        <Combo
          key={i}
          frame={frame}
          index={i}
          setFrame={(frame) =>
            database.teams.set(teamId, (team) => {
              team.frames = [...team.frames]
              team.frames[i] = {
                ...team.frames[i],
                ...frame,
              }
            })
          }
          removeFrame={() =>
            database.teams.set(teamId, (team) => {
              team.frames = team.frames.filter((_, index) => index !== i)
            })
          }
        />
      ))}
      <Box sx={{ flexShrink: 0 }}>
        <OptimizationTargetSelector
          setOptTarget={(tag) =>
            database.teams.set(teamId, (team) => {
              team.frames = [
                ...team.frames,
                {
                  multiplier: 1,
                  tag,
                },
              ]
            })
          }
        />
      </Box>
    </CardContent>
  )
}
function Combo({
  frame,
  index,
  setFrame,
  removeFrame,
}: {
  frame: Frame
  index: number
  setFrame(frame: Partial<Frame>): void
  removeFrame(): void
}) {
  const { presetIndex, setPresetIndex } = useContext(PresetContext)
  const calc = useSrCalcContext()
  const tagcontext = useContext(TagContext)
  const value = useMemo(
    () =>
      calc?.withTag(tagcontext).compute(new Read(frame.tag, 'sum')).val ?? 0,
    [calc, frame.tag, tagcontext]
  )
  const unit = getUnitStr(frame.tag.q ?? '')
  const [open, onOpen, onClose] = useBoolState()

  const handleClick = useCallback(() => {
    if (presetIndex === index) {
      onOpen()
    } else {
      onClose()
      setPresetIndex(index)
    }
  }, [index, onClose, onOpen, presetIndex, setPresetIndex])
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
      <ComboEditorModal
        frame={frame}
        setFrame={setFrame}
        index={index}
        show={open}
        onClose={onClose}
        removeFrame={removeFrame}
      />
      <CardActionArea onClick={handleClick}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch', p: 1 }}>
          <Typography>{index + 1}</Typography>
          <Divider orientation="vertical" />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <OptimizationTargetDisplay tag={frame.tag} />
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

function ComboEditorModal({
  index,
  frame,
  setFrame,
  removeFrame,
  show,
  onClose,
}: {
  frame: Frame
  index: number
  setFrame(frame: Partial<Frame>): void
  removeFrame(): void
  show: boolean
  onClose: () => void
}) {
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <CardThemed bgt="dark">
        {/* TODO: translation */}
        <CardHeader
          title={`Edit Combo ${index + 1}`}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <NumberInputLazy
                value={frame.multiplier}
                onChange={(v) => setFrame({ multiplier: v })}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Multi x </InputAdornment>
                  ),
                }}
              />
              <OptimizationTargetSelector
                optTarget={frame.tag}
                setOptTarget={(tag) =>
                  setFrame({
                    tag,
                  })
                }
              />
              <Button
                size="small"
                color="error"
                onClick={removeFrame}
                startIcon={<Delete />}
              >
                Remove
              </Button>
            </Box>
            <Box>
              <Typography variant="h6">Relic Conditionals</Typography>
              <RelicSheetsDisplay />
            </Box>
            <Box>
              <Typography variant="h6">Lightcone Conditionals</Typography>
              <LightConeSheetsDisplay />
            </Box>
          </Stack>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
