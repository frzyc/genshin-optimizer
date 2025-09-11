import {
  CardThemed,
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  DropdownButton,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { clamp, deepClone, objPathValue } from '@genshin-optimizer/common/util'
import { allMultiOptHitModeKeys } from '@genshin-optimizer/gi/consts'
import type {
  AddressItemTypesMap,
  CustomFunction,
  CustomFunctionArgument,
  CustomMultiTarget,
  CustomTarget,
  ExpressionItem,
  ExpressionUnit,
  ItemAddress,
  ItemRelations,
  UnitAddress,
} from '@genshin-optimizer/gi/db'
import {
  OperationSpecs,
  initCustomMultiTarget,
  initExpressionUnit,
  itemAddressValue,
} from '@genshin-optimizer/gi/db'
import { CharacterContext } from '@genshin-optimizer/gi/db-ui'
import { isCharMelee } from '@genshin-optimizer/gi/stats'
import {
  DataContext,
  StatEditorList,
  infusionVals,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { allInputPremodKeys } from '@genshin-optimizer/gi/wr'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  Button,
  ButtonGroup,
  CardActionArea,
  Collapse,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Typography,
} from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetSelector from '../Tabs/TabOptimize/Components/OptimizationTargetSelector'
import ReactionDropdown from './ReactionDropdown'

async function copyToClipboard(target: any) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(target))
    return alert('Copied configuration to clipboard.')
  } catch (message_1) {
    return console.error(message_1)
  }
}

export default function ItemConfigPanel({
  item,
  addItem,
  setItem,
  moveItem,
  removeItem,
  sia,
  sirpa,
  functions,
  expression,
  setSIA,
  focusToSIA,
}: {
  item: ExpressionItem
  addItem: <T extends AddressItemTypesMap>(address: T[0], item: T[1]) => void
  setItem: <T extends AddressItemTypesMap>(
    address: T[0],
    arg: Partial<T[1]> | ((item: T[1]) => T[1])
  ) => void
  moveItem: <T extends NonNullable<ItemAddress>>(from: T, to: T) => void
  removeItem: (address: NonNullable<ItemAddress>) => void
  sia: NonNullable<ItemAddress>
  sirpa: ItemRelations
  functions: CustomFunction[]
  expression: ExpressionUnit[]
  setSIA: Dispatch<SetStateAction<ItemAddress>>
  focusToSIA: () => void
}): JSX.Element {
  const { t } = useTranslation('page_character')
  const [collapse, setcollapse] = useState(false)

  const onEdit = useCallback(
    <T extends AddressItemTypesMap>(
      address: T[0],
      arg: Partial<T[1]> | ((item: T[1]) => T[1])
    ) => {
      setItem(address, arg)
      focusToSIA()
    },
    [focusToSIA, setItem]
  )

  const onDup = useCallback(() => {
    const _sia = sia
    if (_sia.type === 'function') {
      _sia.layer++
    } else {
      _sia.index++
    }
    addItem(_sia, deepClone(item))
    setSIA(_sia)
  }, [addItem, item, setSIA, sia])

  const onFunctionExport = useCallback(() => {
    if (sia.type !== 'function') return
    const func = item as CustomFunction
    const functionsToExport = [func.name]
    const functionsToCheck = functions.slice(0, sia.layer + 1)
    console.log(sia.layer)
    while (functionsToCheck.length) {
      const f1 = functionsToCheck.pop() as CustomFunction
      if (!functionsToExport.includes(f1.name)) continue
      for (const u of f1.expression) {
        if (u.type === 'function' && !functionsToExport.includes(u.name)) {
          functionsToExport.push(u.name)
        }
      }
    }
    const exportData: CustomMultiTarget = {
      ...initCustomMultiTarget(),
      name: func.name,
      functions: functions.filter((f) => functionsToExport.includes(f.name)),
      expression: [initExpressionUnit({ type: 'function', name: func.name })],
    }
    copyToClipboard(exportData)
  }, [functions, item, sia])

  // When function or argument name is changed, update the names in the expressions
  const onNameChange = useCallback(
    (name: string) => {
      onEdit(sia, { name })
      if (sia.type === 'function' || sia.type === 'argument') {
        for (const a of sirpa.dependent) {
          if (a.type === 'unit') {
            const unit = itemAddressValue(
              expression,
              functions,
              a
            ) as ExpressionUnit
            if (unit && unit.type === 'function') {
              setItem(a, { name })
            }
          }
        }
      }
    },
    [expression, functions, onEdit, setItem, sia, sirpa.dependent]
  )

  const onMove = useCallback(
    (from: NonNullable<ItemAddress>, to: NonNullable<ItemAddress>) => {
      if (to.type === 'function') {
        to.layer = clamp(to.layer, 0, functions.length)
      } else {
        to.layer = clamp(to.layer, 0, functions.length + 1)
        const e =
          to.layer < functions.length
            ? functions[to.layer].expression
            : expression
        to.index = clamp(to.index, 0, e.length)
      }
      moveItem(from, to)
      setSIA(to)
    },
    [expression, functions, moveItem, setSIA]
  )

  const onRemove = useCallback(() => {
    removeItem(sia)
    if (sia.type === 'function') {
      if (sia.layer < 1) {
        setSIA(undefined)
      } else {
        setSIA({ ...sia, layer: sia.layer - 1 })
      }
    } else {
      if (sia.index < 1) {
        if (sia.layer < functions.length) {
          setSIA({ type: 'function', layer: sia.layer })
        } else {
          setSIA(undefined)
        }
      } else {
        setSIA({ ...sia, index: sia.index - 1 })
      }
    }
  }, [functions.length, removeItem, setSIA, sia])

  const moveButtons = useMemo(() => {
    // If the item is a function, it can be moved up or down
    // Arguments and units can be moved up, down, left or right
    const result: JSX.Element[] = []
    if (sia.type !== 'function') {
      result.push(
        <IconButton
          key="left"
          onClick={() => onMove(sia, { ...sia, index: sia.index - 1 })}
          disabled={sia.index === 0}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
      )
      let maxIndex: number
      if (sia.type === 'argument') {
        maxIndex = functions[sia.layer].args.length - 1
      } else {
        const e =
          sia.layer < functions.length
            ? functions[sia.layer].expression
            : expression
        maxIndex = e.length - 1
      }
      result.push(
        <IconButton
          key="right"
          onClick={() => onMove(sia, { ...sia, index: sia.index + 1 })}
          disabled={sia.index === maxIndex}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      )
    }
    result.push(
      <IconButton
        key="up"
        onClick={() => onMove(sia, { ...sia, layer: sia.layer - 1 })}
        disabled={sia.layer === 0}
      >
        <KeyboardArrowUpIcon />
      </IconButton>
    )
    result.push(
      <IconButton
        key="down"
        onClick={() => onMove(sia, { ...sia, layer: sia.layer + 1 })}
        disabled={sia.layer === functions.length}
      >
        <KeyboardArrowDownIcon />
      </IconButton>
    )
    return result
  }, [expression, functions, onMove, sia])

  const duplicateButton = useMemo(() => {
    return (
      <IconButton color="info" onClick={onDup}>
        <ContentCopyIcon />
      </IconButton>
    )
  }, [onDup])

  const deleteButton = useMemo(() => {
    return (
      <IconButton color="error" onClick={() => onRemove()}>
        <DeleteForeverIcon />
      </IconButton>
    )
  }, [onRemove])

  const configs = useMemo(() => {
    const result: JSX.Element[] = []
    if (sia.type === 'function' || sia.type === 'argument') {
      const _item = item as CustomFunction | CustomFunctionArgument
      result.push(
        <Box sx={{ display: 'flex', gap: 1 }} flexDirection="column">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextFieldLazy
              fullWidth
              label="Name"
              value={_item.name}
              onChange={onNameChange}
            />
            <Button
              color="info"
              onClick={onFunctionExport}
              startIcon={<ContentPasteIcon />}
              sx={{ flexGrow: 1 }}
            >
              {t('multiTarget.export')}
            </Button>
          </Box>
          <TextFieldLazy
            fullWidth
            label="Description"
            value={_item.description ?? ''}
            onChange={(description) => setItem(sia, { description })}
            multiline
          />
        </Box>
      )
    } else if (sia.type === 'unit') {
      result.push(
        <UnitConfig
          unit={item as ExpressionUnit}
          setUnit={(unit) => onEdit(sia, unit)}
          functions={functions}
          sia={sia}
          focusToSIA={focusToSIA}
        />
      )
    }
    return result
  }, [
    focusToSIA,
    functions,
    item,
    onEdit,
    onFunctionExport,
    onNameChange,
    setItem,
    sia,
    t,
  ])

  return (
    <CardThemed
      bgt="light"
      sx={{
        boxShadow: '0 0 10px black',
        position: 'sticky',
        bottom: `10px`,
        zIndex: 1000,
      }}
    >
      <Collapse in={!collapse} onEntered={focusToSIA}>
        <Box sx={{ p: 1, flexGrow: 1 }}>{configs}</Box>
      </Collapse>
      <Divider />
      <Box
        sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <CardActionArea
          sx={{
            display: 'flex',
            flexGrow: 1,
            gap: 1,
            height: '100%',
            py: 1,
            alignItems: 'center',
            width: 'auto',
          }}
          onClick={() => setcollapse((c) => !c)}
        >
          <Typography variant="h6">Item Config</Typography>
          {collapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </CardActionArea>
        {moveButtons}
        {duplicateButton}
        {deleteButton}
      </Box>
    </CardThemed>
  )
}

function UnitConfig({
  unit,
  setUnit,
  functions,
  sia,
  focusToSIA,
}: {
  unit: ExpressionUnit
  setUnit: (unit: Partial<ExpressionUnit>) => void
  functions: CustomFunction[]
  sia: UnitAddress
  focusToSIA: () => void
}) {
  /** Aveilaible Names */
  const avana = useMemo(() => {
    const result = [] as string[]
    for (const a of functions.slice(0, sia.layer)) {
      result.push(a.name)
    }
    if (sia.layer < functions.length) {
      for (const arg of functions[sia.layer].args) {
        result.push(arg.name)
      }
    }
    return result
  }, [functions, sia.layer])

  const config = useMemo(() => {
    const result: JSX.Element[] = []
    if (unit.type === 'function') {
      let title = unit.name
      if (avana.length === 0) {
        title = 'No available names, add some function or argument'
      } else if (!avana.includes(unit.name)) {
        title = 'Select a name'
      }
      result.push(
        <DropdownButton title={title}>
          {avana.map((name) => (
            <MenuItem
              key={'avaibleNames' + sia.layer + sia.index + name}
              value={name}
              onClick={() => setUnit({ name })}
            >
              {name}
            </MenuItem>
          ))}
        </DropdownButton>
      )
    } else if (unit.type === 'constant') {
      result.push(
        <ButtonGroup variant="outlined" fullWidth>
          <CustomNumberInputButtonGroupWrapper>
            <CustomNumberInput
              float
              value={unit.value}
              onChange={(value) => {
                setUnit({ value })
                focusToSIA()
              }}
              inputProps={{ sx: { pl: 1 } }}
            />
          </CustomNumberInputButtonGroupWrapper>
        </ButtonGroup>
      )
    } else if (unit.type === 'target') {
      result.push(
        <TargetUnitConfig
          customTarget={unit.target}
          setCustomTarget={(t) => setUnit({ target: t })}
        />
      )
    } else if (unit.type === 'enclosing' && unit.part === 'head') {
      const { operation } = unit
      const description = OperationSpecs[operation].description
      if (description) {
        result.push(
          <Typography key="description" variant="body1">
            {description}
          </Typography>
        )
      }
    }
    if (unit.type !== 'target') {
      result.push(
        <TextFieldLazy
          fullWidth
          label="Description"
          value={unit.description ?? ''}
          onChange={(description) => setUnit({ description })}
          multiline
        />
      )
    }
    return result
  }, [avana, focusToSIA, setUnit, sia.index, sia.layer, unit])

  return (
    <Box sx={{ flexGrow: 1 }} display="flex" flexDirection="column" gap={1}>
      {config}
    </Box>
  )
}

const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element, key?: string) => (
  <Grid item key={key} xs={1}>
    {e}
  </Grid>
)

function TargetUnitConfig({
  customTarget,
  setCustomTarget,
}: {
  customTarget: CustomTarget
  setCustomTarget: (t: CustomTarget) => void
}): JSX.Element {
  const { t } = useTranslation('page_character')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { path, hitMode, reaction, infusionAura, bonusStats, description } =
    customTarget

  const node = objPathValue(data.getDisplay(), path) as CalcResult | undefined
  const setFilter = useCallback(
    (bonusStats: CustomTarget['bonusStats']) =>
      setCustomTarget({ ...customTarget, bonusStats }),
    [customTarget, setCustomTarget]
  )

  const statEditorList = useMemo(
    () => (
      <StatEditorList
        statKeys={keys}
        statFilters={bonusStats}
        setStatFilters={setFilter}
        wrapperFunc={wrapperFunc}
        label={t('addStats.label')}
      />
    ),
    [bonusStats, setFilter, t]
  )

  const isMeleeAuto =
    isCharMelee(characterKey) &&
    (path[0] === 'normal' || path[0] === 'charged' || path[0] === 'plunging')
  const isTransformativeReaction = path[0] === 'reaction'
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <OptimizationTargetSelector
          optimizationTarget={path}
          setTarget={(path) =>
            setCustomTarget({
              ...customTarget,
              path,
              reaction: undefined,
              infusionAura: undefined,
            })
          }
          showEmptyTargets
          targetSelectorModalProps={{
            excludeSections: ['bonusStats', 'character', 'custom'],
          }}
        />
        {node && (
          <ReactionDropdown
            reaction={reaction}
            setReactionMode={(rm) =>
              setCustomTarget({ ...customTarget, reaction: rm })
            }
            node={node}
            infusionAura={infusionAura}
          />
        )}
        <DropdownButton title={t(`hitmode.${hitMode}`)}>
          {allMultiOptHitModeKeys.map((hm) => (
            <MenuItem
              key={hm}
              value={hm}
              disabled={hitMode === hm}
              onClick={() => setCustomTarget({ ...customTarget, hitMode: hm })}
            >
              {t(`hitmode.${hm}`)}
            </MenuItem>
          ))}
        </DropdownButton>
      </Box>
      <Grid container columns={{ xs: 1, md: 2 }} spacing={1}>
        <Grid item xs={1}>
          <Box>
            <Grid container columns={{ xs: 1 }} sx={{ pt: 1 }} spacing={1}>
              {(isMeleeAuto || isTransformativeReaction) && (
                <Grid item xs={1}>
                  <DropdownButton
                    title={infusionVals[infusionAura ?? '']}
                    color={infusionAura || 'secondary'}
                    disableElevation
                    fullWidth
                  >
                    {Object.entries(infusionVals).map(([key, text]) => (
                      <MenuItem
                        key={key}
                        sx={key ? { color: `${key}.main` } : undefined}
                        selected={key === infusionAura}
                        disabled={key === infusionAura}
                        onClick={() =>
                          setCustomTarget({
                            ...customTarget,
                            infusionAura: key ? key : undefined,
                            reaction: undefined,
                          })
                        }
                      >
                        {text}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                </Grid>
              )}
              {statEditorList}
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={1}>
          <TextFieldLazy
            fullWidth
            label="Target Description"
            value={description}
            onChange={(description) =>
              setCustomTarget({ ...customTarget, description })
            }
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />
        </Grid>
      </Grid>
    </>
  )
}
