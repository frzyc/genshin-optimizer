import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  InfoTooltip,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { arrayMove, clamp, deepClone } from '@genshin-optimizer/common/util'
import type { CustomTarget } from '@genshin-optimizer/gi/db'
import {
  initCustomTarget,
  type CustomMultiTarget,
} from '@genshin-optimizer/gi/db'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TargetSelectorModal } from '../Tabs/TabOptimize/Components/TargetSelectorModal'
import CustomTargetDisplay from './CustomTargetDisplay'
import JsonDescWarning from './JsonDescWarning'
import MTargetEditor from './MTargetEditor'
export default function CustomMultiTargetCard({
  customMultiTarget: targetProp,
  setTarget: setTargetProp,
  onDelete,
  onDup: onDupProp,
}: {
  customMultiTarget: CustomMultiTarget
  setTarget: (t: CustomMultiTarget) => void
  onDelete: () => void
  onDup: () => void
}) {
  const { t } = useTranslation('page_character')
  const [target, setTarget] = useState(structuredClone(targetProp))
  useEffect(() => {
    if (JSON.stringify(targetProp) !== JSON.stringify(target))
      setTarget(structuredClone(targetProp))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProp])

  const { name, description } = target
  const [show, onShow, onHide] = useBoolState()
  const [descIsJson, setDescIsJson] = useState(false)

  const onDup = () => {
    onDupProp()
    onHide()
  }

  const onSave = useCallback(() => {
    onHide()
    setTargetProp(target)
  }, [onHide, setTargetProp, target])

  const addTarget = useCallback(
    (t: string[], multi?: number) => {
      const target_ = { ...target }
      target_.targets = [...target_.targets, initCustomTarget(t, multi)]
      setTarget(target_)
    },
    [target, setTarget],
  )

  const setCustomTarget = useCallback(
    (index: number) => (ctarget: CustomTarget) => {
      const targets = [...target.targets]
      targets[index] = ctarget
      setTarget({ ...target, targets })
    },
    [target, setTarget],
  )

  const deleteCustomTarget = useCallback(
    (index: number) => () => {
      if (
        Object.values(target.targets[index].bonusStats).length &&
        !window.confirm(t('multiTarget.confirm'))
      )
        return
      const targets = [...target.targets]
      targets.splice(index, 1)
      setTarget({ ...target, targets })
    },
    [target, setTarget, t],
  )

  const [selectedTarget, setSelectedTarget] = useState(-1)
  const setTargetIndex = useCallback(
    (oldInd: number) => (newRank?: number) => {
      if (newRank === undefined || newRank === 0) return
      newRank = clamp(newRank, 1, target.targets.length)
      const newInd = newRank - 1
      const targets = [...target.targets]
      arrayMove(targets, oldInd, newInd)
      setTarget({ ...target, targets })
      setSelectedTarget(newRank - 1)
    },
    [target, setTarget],
  )

  const dupCustomTarget = useCallback(
    (index: number) => () => {
      const targets = [...target.targets]
      targets.splice(index, 0, deepClone(targets[index]))
      setTarget({ ...target, targets })
    },
    [target, setTarget],
  )

  const copyToClipboard = () =>
    navigator.clipboard
      .writeText(JSON.stringify(target))
      .then(() => alert(t('multiTarget.copyMsg')))
      .catch(console.error)

  const customTargetDisplays = useMemo(
    () =>
      target.targets.map((t, i) => (
        <CustomTargetDisplay
          key={t.path.join() + i}
          selected={selectedTarget === i}
          setSelect={() =>
            selectedTarget === i ? setSelectedTarget(-1) : setSelectedTarget(i)
          }
          customTarget={t}
          rank={i + 1}
        />
      )),
    [selectedTarget, target.targets],
  )
  const selectedTargetValid = clamp(
    selectedTarget,
    -1,
    target.targets.length - 1,
  )
  return (
    <>
      <CardThemed bgt="light">
        <CardActionArea onClick={onShow}>
          <CardHeader
            title={
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  sx={{ minWidth: '8em' }}
                  color={target.targets.length ? 'success' : undefined}
                  label={
                    <Trans
                      t={t}
                      i18nKey="multiTarget.target"
                      count={target.targets.length}
                    >
                      {{ count: target.targets.length }} Targets
                    </Trans>
                  }
                />
                <Typography>{name}</Typography>
                {target.description && (
                  <InfoTooltip title={<Typography>{description}</Typography>} />
                )}
              </Box>
            }
          />
        </CardActionArea>
      </CardThemed>
      <ModalWrapper open={show} onClose={onSave}>
        <CardThemed sx={{ overflow: 'visible' }}>
          <CardHeader
            title={name}
            action={
              <IconButton onClick={onSave}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextFieldLazy
              fullWidth
              label={t('multiTarget.label')}
              value={name}
              onChange={(name) =>
                setTarget((target) => ({
                  ...target,
                  name,
                }))
              }
            />
            {description && descIsJson && <JsonDescWarning />}
            <TextFieldLazy
              fullWidth
              label={t('multiTarget.desc')}
              value={description}
              onChange={(description) => {
                setDescIsJson(
                  description
                    ? (() => {
                        try {
                          JSON.parse(description)
                          return true
                        } catch (e) {
                          return false
                        }
                      })()
                    : false,
                )
                setTarget((target) => ({
                  ...target,
                  description,
                }))
              }}
              multiline
              minRows={2}
            />

            <Box display="flex" gap={2}>
              <Button
                onClick={onDup}
                color="info"
                sx={{ flexGrow: 1 }}
                startIcon={<ContentCopyIcon />}
              >
                {t('multiTarget.duplicate')}
              </Button>
              <Button
                color="info"
                onClick={copyToClipboard}
                startIcon={<ContentPasteIcon />}
                sx={{ flexGrow: 1 }}
              >
                {t('multiTarget.export')}
              </Button>
              <Button color="error" onClick={onDelete}>
                <DeleteForeverIcon />
              </Button>
            </Box>
          </CardContent>
          <Divider />
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              position: 'relative',
            }}
          >
            {customTargetDisplays}
            <AddCustomTargetBtn setTarget={addTarget} />
            {target.targets[selectedTargetValid] && (
              <MTargetEditor
                customTarget={target.targets[selectedTargetValid]}
                setCustomTarget={setCustomTarget(selectedTargetValid)}
                deleteCustomTarget={deleteCustomTarget(selectedTargetValid)}
                rank={selectedTargetValid + 1}
                maxRank={target.targets.length}
                setTargetIndex={setTargetIndex(selectedTargetValid)}
                onDup={dupCustomTarget(selectedTargetValid)}
              />
            )}
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}

function AddCustomTargetBtn({
  setTarget,
}: {
  setTarget: (t: string[], m?: number) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState(false)
  const setTargetHandler = useCallback(
    (target: string[], multi?: number) => {
      onClose()
      setTarget(target, multi)
    },
    [onClose, setTarget],
  )

  return (
    <>
      <Button fullWidth onClick={onShow} startIcon={<AddIcon />} sx={{ mb: 1 }}>
        {t('multiTarget.addNewTarget')}
      </Button>
      <TargetSelectorModal
        showEmptyTargets
        flatOnly
        excludeHeal
        show={show}
        onClose={onClose}
        setTarget={setTargetHandler}
        excludeSections={[
          'basic',
          'bonusStats',
          'custom',
          'character',
          'teamBuff',
        ]}
      />
    </>
  )
}
