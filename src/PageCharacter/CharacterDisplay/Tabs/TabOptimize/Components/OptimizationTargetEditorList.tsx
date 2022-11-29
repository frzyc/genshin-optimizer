import { CheckBox, CheckBoxOutlineBlank, DeleteForever } from "@mui/icons-material"
import { Button, ButtonGroup } from "@mui/material"
import { useCallback, useContext } from "react"
import { useTranslation } from "react-i18next"
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from "../../../../../Components/CustomNumberInput"
import { DataContext } from "../../../../../Context/DataContext"
import { StatFilters, StatFilterSetting } from "../../../../../Database/DataManagers/BuildSettingData"
import { NodeDisplay } from "../../../../../Formula/uiData"
import { objPathValue } from "../../../../../Util/Util"
import OptimizationTargetSelector from "./OptimizationTargetSelector"

type OptimizationTargetEditorListProps = {
  statFilters: StatFilters,
  setStatFilters: (statFilters: StatFilters) => void,
  disabled: boolean,
}

export default function OptimizationTargetEditorList({ statFilters, setStatFilters, disabled = false }: OptimizationTargetEditorListProps) {
  const setTarget = useCallback((path: string[]) => {
    const statFilters_ = { ...statFilters }
    const pathStr = JSON.stringify(path)
    statFilters_[pathStr] = statFilters[pathStr] ?? { disabled: false, value: 0 }
    setStatFilters({ ...statFilters_ })
  }, [setStatFilters, statFilters])

  const delTarget = useCallback((path: string[]) => {
    const statFilters_ = { ...statFilters }
    const pathStr = JSON.stringify(path)
    delete statFilters_[pathStr]
    setStatFilters({ ...statFilters_ })
  }, [setStatFilters, statFilters])

  const setTargetValue = useCallback((path: string[], value: number) => {
    const statFilters_ = { ...statFilters }
    const pathStr = JSON.stringify(path)
    statFilters_[pathStr] = { ...statFilters[pathStr], value } as StatFilterSetting
    setStatFilters({ ...statFilters_ })
  }, [setStatFilters, statFilters])

  const setTargetDisabled = useCallback((path: string[], disabled: boolean) => {
    const statFilters_ = { ...statFilters }
    const pathStr = JSON.stringify(path)
    statFilters_[pathStr] = { ...statFilters[pathStr], disabled: disabled } as StatFilterSetting
    setStatFilters({ ...statFilters_ })
  }, [setStatFilters, statFilters])

  return <>
    {Object.entries(statFilters).map(([pathStr, setting]) =>
      <OptimizationTargetEditorItem path={JSON.parse(pathStr)} setting={setting} setTarget={setTarget} delTarget={delTarget} setValue={setTargetValue} setDisabled={setTargetDisabled} disabled={disabled} key={pathStr} />
    )}
    <OptimizationTargetEditorItem setTarget={setTarget} delTarget={delTarget} setValue={setTargetValue} setDisabled={setTargetDisabled} disabled={disabled} />
  </>
}

type OptimizationTargetEditorItemProps = {
  path?: string[],
  setting?: StatFilterSetting,
  setTarget: (path: string[]) => void,
  delTarget: (path: string[]) => void,
  setValue: (path: string[], value: number) => void,
  setDisabled: (path: string[], disabled: boolean) => void,
  disabled: boolean,
}
function OptimizationTargetEditorItem({ path, setting, setTarget, delTarget, setValue, setDisabled, disabled }: OptimizationTargetEditorItemProps) {
  const { t } = useTranslation("page_character_optimize")
  const { data } = useContext(DataContext)
  const onChange = useCallback((val: number | undefined) => path && setValue(path, val ?? 0), [setValue, path])
  const buttonGroupStyle = {
    "& .MuiButtonGroup-grouped": { minWidth: 24 }
  }
  const buttonStyle = { p: 1, flexBasis: 30, flexGrow: 0, flexShrink: 0 }

  const buildConstraintNode: NodeDisplay = objPathValue(data.getDisplay(), path ?? [])
  const isPercent = buildConstraintNode?.info?.unit === "%"

  return <ButtonGroup sx={{ ...buttonGroupStyle, width: "100%" }}>
    {!!setting && !!path && <Button sx={buttonStyle} color={setting.disabled ? "secondary" : "success"} onClick={() => setDisabled(path, !setting.disabled)} disabled={disabled}>
      {setting.disabled ? <CheckBoxOutlineBlank /> : <CheckBox />}
    </Button>}
    <OptimizationTargetSelector showEmptyTargets optimizationTarget={path} setTarget={setTarget} defaultText={t("targetSelector.selectBuildTarget")} />
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 150, flexGrow: 1 }}>
      <CustomNumberInput
        float
        disabled={!path || disabled}
        value={setting?.value}
        placeholder="Stat Value"
        onChange={onChange}
        sx={{ px: 1, }}
        inputProps={{ sx: { textAlign: "right" } }}
        endAdornment={isPercent ? "%" : undefined}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!path && <Button sx={buttonStyle} color="error" onClick={() => delTarget(path)} disabled={disabled}>
      <DeleteForever fontSize="small" />
    </Button>}
  </ButtonGroup>
}
