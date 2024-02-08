import {
  CheckBox,
  CheckBoxOutlineBlank,
  DeleteForever,
} from '@mui/icons-material'
import { Button, ButtonGroup } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import CustomNumberInput, {
  CustomNumberInputButtonGroupWrapper,
} from '../../../../../Components/CustomNumberInput'
import { DataContext } from '../../../../../Context/DataContext'
import type {
  StatFilters,
  StatFilterSetting,
} from '../../../../../Database/DataManagers/BuildSettingData'
import type { NodeDisplay } from '../../../../../Formula/uiData'
import { objPathValue } from '../../../../../Util/Util'
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
      <OptimizationTargetEditorItem
        setTarget={setTarget}
        delTarget={delTarget}
        setValue={setTargetValue}
        setDisabled={setTargetDisabled}
        disabled={disabled}
      />
    </>
  )
}

type OptimizationTargetEditorItemProps = {
  path?: string[]
  setting?: StatFilterSetting
  index?: number
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
    (val: number | undefined) =>
      path && index !== undefined && setValue(path, index, val ?? 0),
    [setValue, path, index]
  )
  const buttonStyle = { p: 1, flexBasis: 30, flexGrow: 0, flexShrink: 0 }

  const buildConstraintNode: NodeDisplay = objPathValue(
    data.getDisplay(),
    path ?? []
  )
  const isPercent = buildConstraintNode?.info?.unit === '%'

  return (
    <ButtonGroup
      sx={{ '& .MuiButtonGroup-grouped': { minWidth: 24 }, width: '100%' }}
    >
      {!!setting && !!path && index !== undefined && (
        <Button
          sx={buttonStyle}
          color={setting.disabled ? 'secondary' : 'success'}
          onClick={() => setDisabled(path, index, !setting.disabled)}
          disabled={disabled}
        >
          {setting.disabled ? <CheckBoxOutlineBlank /> : <CheckBox />}
        </Button>
      )}
      <OptimizationTargetSelector
        showEmptyTargets
        optimizationTarget={path}
        setTarget={(target) => setTarget(target, path, index)}
        defaultText={t('targetSelector.selectBuildTarget')}
      />
      <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 150, flexGrow: 1 }}>
        <CustomNumberInput
          float
          disabled={!path || disabled}
          value={setting?.value}
          placeholder="Stat Value"
          onChange={onChange}
          sx={{ px: 1 }}
          inputProps={{ sx: { textAlign: 'right' } }}
          endAdornment={isPercent ? '%' : undefined}
        />
      </CustomNumberInputButtonGroupWrapper>
      {!!path && index !== undefined && (
        <Button
          sx={buttonStyle}
          color="error"
          onClick={() => delTarget(path, index)}
          disabled={disabled}
        >
          <DeleteForever fontSize="small" />
        </Button>
      )}
    </ButtonGroup>
  )
}
