import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import { TagContext } from '@genshin-optimizer/pando/ui-sheet'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import { Read, type Tag } from '@genshin-optimizer/sr/formula'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { useCallback, useContext } from 'react'
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
  )
}
function Combo({
  tag,
  index,
  setTarget,
}: {
  tag: Tag
  index: number
  setTarget(tag: Tag): void
}) {
  const { presetIndex, setPresetIndex } = useContext(PresetContext)
  const calc = useSrCalcContext()
  const tagcontext = useContext(TagContext)
  const value = calc?.withTag(tagcontext).compute(new Read(tag, 'sum')).val ?? 0
  const unit = getUnitStr(tag.q ?? '')
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
      <ComboEditorModal index={index} show={open} onClose={onClose} />
      <CardActionArea onClick={handleClick}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch', p: 1 }}>
          <Typography>{index + 1}</Typography>
          <Divider orientation="vertical" />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <OptimizationTargetDisplay tag={tag} />
          </Box>
        </Box>

        <Divider />
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>X x {valueString(value, unit)}</Typography>
        </Box>
      </CardActionArea>
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
function LightConeConditionals() {
  const [show, onShow, onHide] = useBoolState()
  return (
    <>
      {/* TODO: translation */}
      <Button onClick={onShow}>Light Cone Conditionals</Button>
      <ModalWrapper open={show} onClose={onHide}>
        <LightConeSheetsDisplay />
      </ModalWrapper>
    </>
  )
}
function ComboEditorModal({
  index,
  show,
  onClose,
}: {
  index: number
  show: boolean
  onClose: () => void
}) {
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <CardThemed>
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
          <RelicConditionals />
          <LightConeConditionals />
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
