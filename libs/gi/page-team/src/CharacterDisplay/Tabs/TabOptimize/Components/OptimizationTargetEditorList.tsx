import { NumberInputLazy } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import type { StatFilterSetting, StatFilters } from '@genshin-optimizer/gi/db'
import { DataContext, resolveInfo } from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import {
  CheckBox,
  CheckBoxOutlineBlank,
  DeleteForever,
} from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetSelector from './OptimizationTargetSelector'

type OptimizationTargetEditorListProps = {
  statFilters: StatFilters
  setStatFilters: (statFilters: StatFilters) => void
  disabled: boolean
}

export default function OptimizationTargetEditorList({
  statFilters,
  setStatFilters,
  disabled = false,
}: OptimizationTargetEditorListProps) {
  const { t } = useTranslation('page_character_optimize')
  const setTarget = useCallback(
    (path: string[], oldPath?: string[], oldIndex?: number) => {
      const statFilters_ = { ...statFilters }
      const oldPathStr = JSON.stringify(oldPath)
      const oldFilterArr = oldPath ? [...statFilters[oldPathStr]!] : undefined
      const pathStr = JSON.stringify(path)
      const filterArr = [...(statFilters[pathStr] ?? [])]
      // Copy/create new setting
      if (oldIndex !== undefined && oldFilterArr)
        filterArr.push(oldFilterArr[oldIndex])
      else filterArr.push({ value: 0, disabled: false })
      statFilters_[pathStr] = filterArr
      // Remove old setting
      if (oldIndex !== undefined && oldFilterArr) {
        oldFilterArr.splice(oldIndex, 1)
        if (oldFilterArr.length) statFilters_[oldPathStr] = oldFilterArr
        else delete statFilters_[oldPathStr]
      }
      setStatFilters({ ...statFilters_ })
    },
    [setStatFilters, statFilters]
  )

  const delTarget = useCallback(
    (path: string[], index: number) => {
      const statFilters_ = { ...statFilters }
      const pathStr = JSON.stringify(path)
      const filterArr = [...statFilters[pathStr]!]
      filterArr.splice(index, 1)
      if (filterArr.length) statFilters_[pathStr] = filterArr
      else delete statFilters_[pathStr]
      setStatFilters({ ...statFilters_ })
    },
    [setStatFilters, statFilters]
  )

  const setTargetValue = useCallback(
    (path: string[], index: number, value: number) => {
      const statFilters_ = { ...statFilters }
      const pathStr = JSON.stringify(path)
      const filterArr = [...statFilters[pathStr]!]
      filterArr[index] = { ...filterArr[index], value } as StatFilterSetting
      statFilters_[pathStr] = filterArr
      setStatFilters({ ...statFilters_ })
    },
    [setStatFilters, statFilters]
  )

  const setTargetDisabled = useCallback(
    (path: string[], index: number, disabled: boolean) => {
      const statFilters_ = { ...statFilters }
      const pathStr = JSON.stringify(path)
      const filterArr = [...statFilters[pathStr]!]
      filterArr[index] = { ...filterArr[index], disabled } as StatFilterSetting
      statFilters_[pathStr] = filterArr
      setStatFilters({ ...statFilters_ })
    },
    [setStatFilters, statFilters]
  )

  return (
    <>
      {Object.entries(statFilters).flatMap(([pathStr, settings]) =>
        settings?.map((setting, index) => (
          <OptimizationTargetEditorItem
            path={JSON.parse(pathStr)}
            setting={setting}
            index={index}
            setTarget={setTarget}
            delTarget={delTarget}
            setValue={setTargetValue}
            setDisabled={setTargetDisabled}
            disabled={disabled}
            key={pathStr + index}
          />
        ))
      )}
      <OptimizationTargetSelector
        showEmptyTargets
        setTarget={(target) => setTarget(target)}
        defaultText={t('targetSelector.selectBuildTarget')}
        disabled={disabled}
        targetSelectorModalProps={{
          excludeSections: ['custom', 'bonusStats', 'character', 'teamBuff'],
        }}
      />
    </>
  )
}

type OptimizationTargetEditorItemProps = {
  path: string[]
  setting: StatFilterSetting
  index: number
  setTarget: (path: string[], oldPath?: string[], oldIndex?: number) => void
  delTarget: (path: string[], index: number) => void
  setValue: (path: string[], index: number, value: number) => void
  setDisabled: (path: string[], index: number, disabled: boolean) => void
  disabled: boolean
}
function OptimizationTargetEditorItem({
  path,
  setting,
  index,
  setTarget,
  delTarget,
  setValue,
  setDisabled,
  disabled,
}: OptimizationTargetEditorItemProps) {
  const { t } = useTranslation('page_character_optimize')
  const { data } = useContext(DataContext)
  const onChange = useCallback(
    (val: number | undefined) => setValue(path, index, val ?? 0),
    [setValue, path, index]
  )
  const buttonStyle = { p: 1, flexBasis: 30, flexGrow: 0, flexShrink: 0 }

  const buildConstraintNode: CalcResult = objPathValue(data.getDisplay(), path)
  const resolvedInfo =
    buildConstraintNode?.info && resolveInfo(buildConstraintNode?.info)
  const isPercent = resolvedInfo?.unit === '%'

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ButtonGroup
        sx={{ '& .MuiButtonGroup-grouped': { minWidth: 24 }, width: '100%' }}
      >
        <Button
          sx={buttonStyle}
          color={setting.disabled ? 'secondary' : 'success'}
          onClick={() => setDisabled(path, index, !setting.disabled)}
          disabled={disabled}
        >
          {setting.disabled ? <CheckBoxOutlineBlank /> : <CheckBox />}
        </Button>

        <OptimizationTargetSelector
          showEmptyTargets
          optimizationTarget={path}
          setTarget={(target) => setTarget(target, path, index)}
          defaultText={t('targetSelector.selectBuildTarget')}
          disabled={disabled}
          targetSelectorModalProps={{
            excludeSections: ['custom', 'bonusStats', 'character', 'teamBuff'],
          }}
        />
      </ButtonGroup>
      <NumberInputLazy
        float
        value={setting.value}
        sx={{ flexBasis: 150, flexGrow: 1, height: '100%' }}
        disabled={disabled}
        onChange={onChange}
        placeholder="Stat Value"
        size="small"
        inputProps={{ sx: { textAlign: 'right' } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ ml: 0 }}>
              {isPercent ? '%' : undefined}{' '}
              <IconButton
                aria-label="Delete Stat Constraint"
                onClick={() => delTarget(path, index)}
                edge="end"
              >
                <DeleteForever fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}
