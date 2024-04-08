import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { DataContext, getDisplayHeader } from '@genshin-optimizer/gi/ui'
import { resolveInfo, type NodeDisplay } from '@genshin-optimizer/gi/uidata'
import { Box, Button, Divider, Stack } from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TargetSelectorModalProps } from './TargetSelectorModal'
import { TargetSelectorModal } from './TargetSelectorModal'

export default function OptimizationTargetSelector({
  optimizationTarget,
  setTarget,
  disabled = false,
  showEmptyTargets = false,
  defaultText,
  targetSelectorModalProps = {},
}: {
  optimizationTarget?: string[]
  setTarget: (target: string[]) => void
  disabled?: boolean
  showEmptyTargets?: boolean
  defaultText?: string
  targetSelectorModalProps?: Partial<TargetSelectorModalProps>
}) {
  const { t } = useTranslation('page_character_optimize')
  const [show, onShow, onClose] = useBoolState(false)

  const setTargetHandler = useCallback(
    (target: string[]) => {
      onClose()
      setTarget(target)
    },
    [onClose, setTarget]
  )
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const displayHeader = useMemo(
    () =>
      optimizationTarget &&
      getDisplayHeader(data, optimizationTarget[0], database),
    [data, optimizationTarget, database]
  )

  if (!defaultText) defaultText = t('targetSelector.selectOptTarget')

  const { title, icon, action } = displayHeader ?? {}
  const node: NodeDisplay | undefined =
    optimizationTarget &&
    (objPathValue(data.getDisplay(), optimizationTarget) as any)

  const invalidTarget =
    !optimizationTarget ||
    !displayHeader ||
    !node ||
    // Make sure the opt target is valid, if we are not in multi-target
    (!showEmptyTargets && node.isEmpty)

  const {
    name,
    textSuffix,
    icon: nodeIcon,
    variant = invalidTarget ? 'secondary' : undefined,
  } = (node?.info && resolveInfo(node?.info)) ?? {}

  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  const iconDisplay = icon ? <ImgIcon src={icon} size={2} /> : nodeIcon
  return (
    <>
      <Button
        color="info"
        onClick={onShow}
        disabled={disabled}
        sx={{ flexGrow: 1 }}
      >
        {invalidTarget ? (
          <strong>{defaultText}</strong>
        ) : (
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={1}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {iconDisplay}
              <span>{title}</span>
              {!!action && (
                <SqBadge color="success" sx={{ whiteSpace: 'normal' }}>
                  {action}
                </SqBadge>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SqBadge
                color={variant === 'invalid' ? undefined : variant}
                sx={{ whiteSpace: 'normal' }}
              >
                <strong>{name}</strong>
                {suffixDisplay}
              </SqBadge>
            </Box>
          </Stack>
        )}
      </Button>
      <TargetSelectorModal
        show={show}
        onClose={onClose}
        setTarget={setTargetHandler}
        showEmptyTargets={showEmptyTargets}
        {...targetSelectorModalProps}
      />
    </>
  )
}
