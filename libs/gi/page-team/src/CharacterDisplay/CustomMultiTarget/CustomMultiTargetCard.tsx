import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  InfoTooltip,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import type { CustomMultiTarget } from '@genshin-optimizer/gi/db'
import { targetListToExpression } from '@genshin-optimizer/gi/db'
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
import { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import JsonDescWarning from './JsonDescWarning'
import TargetExpressionEditor from './TargetExpressionEditor'
import TargetListEditor from './TargetListEditor'

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

  const [expression, setExpression] = useState(target.expression)
  const [functions, setFunctions] = useState(target.functions)
  useEffect(() => {
    setExpression(target.expression)
    setFunctions(target.functions)
  }, [target])

  const onSave = useCallback(() => {
    onHide()
    setTargetProp({ ...target, expression, functions })
  }, [expression, functions, onHide, setTargetProp, target])

  const copyToClipboard = () =>
    navigator.clipboard
      .writeText(JSON.stringify(target))
      .then(() => alert(t('multiTarget.copyMsg')))
      .catch(console.error)

  return (
    <>
      <CardThemed bgt="light">
        <CardActionArea onClick={onShow}>
          <CardHeader
            title={
              <Box display="flex" gap={1} alignItems="center">
                {target.expression ? (
                  <Chip
                    sx={{ minWidth: '8em' }}
                    color="electro"
                    label={
                      <Trans t={t} i18nKey="multiTarget.expression">
                        Expression
                      </Trans>
                    }
                  />
                ) : (
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
                )}
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
                    : false
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
              {!target.expression && (
                <Button
                  color="warning"
                  onClick={() => setTarget(targetListToExpression(target))}
                >
                  {t`multiTarget.convertToExpression`}
                </Button>
              )}
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
            {target.expression ? (
              <TargetExpressionEditor
                expression={expression}
                setExpression={setExpression}
                functions={functions}
                setFunctions={setFunctions}
              />
            ) : (
              <TargetListEditor
                customMultiTarget={target}
                setCustomMultiTarget={setTarget}
              />
            )}
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
