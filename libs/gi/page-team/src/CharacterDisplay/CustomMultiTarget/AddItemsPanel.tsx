import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import type {
  AddressItemTypesMap,
  CustomFunction,
  CustomFunctionArgument,
  ExpressionUnit,
  ItemAddress,
} from '@genshin-optimizer/gi/db'
import {
  OperationSpecs,
  initCustomFunction,
  initCustomFunctionArgument,
  initCustomTarget,
  initExpressionUnit,
  validateCustomMultiTarget,
} from '@genshin-optimizer/gi/db'
import UploadIcon from '@mui/icons-material/Upload'
import type { ButtonProps } from '@mui/material'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TargetSelectorModal } from '../Tabs/TabOptimize/Components/TargetSelectorModal'

export default function AddItemsPanel({
  addItem,
  sia,
  setSIA,
  functions,
  noFunctions,
}: {
  addItem: <T extends AddressItemTypesMap>(address: T[0], item: T[1]) => void
  sia: ItemAddress
  setSIA: Dispatch<SetStateAction<ItemAddress>>
  functions: CustomFunction[]
  noFunctions?: boolean
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState(false)
  const [newNumber, setNewNumber] = useState<number | undefined>()

  const addFunction = useCallback(
    (func: Partial<CustomFunction>, isImport = false) => {
      let _sia = sia
      if (!_sia) {
        _sia = { type: 'function', layer: 0 }
        if (isImport) _sia.layer = functions.length
      } else if (_sia.type !== 'function') {
        _sia = {
          type: 'function',
          layer: clamp(_sia.layer + 1, 0, functions.length),
        }
      } else {
        _sia.layer++
      }
      addItem(_sia, initCustomFunction(func, functions))
      setSIA(_sia)
    },
    [addItem, functions, setSIA, sia]
  )

  const addArgument = useCallback(
    (arg: Partial<CustomFunctionArgument>) => {
      let _sia = sia
      if (!_sia || _sia.type !== 'argument') {
        if (functions.length === 0) return
        const layer = _sia && _sia.layer < functions.length ? _sia.layer : 0
        _sia = { type: 'argument', layer, index: 0 }
      } else {
        _sia.index++
      }
      addItem(_sia, initCustomFunctionArgument(arg, functions[_sia.layer]))
      setSIA(_sia)
    },
    [addItem, functions, setSIA, sia]
  )

  const addUnit = useCallback(
    (unit: Partial<ExpressionUnit>) => {
      let _sia = sia
      if (!_sia || _sia.type !== 'unit') {
        const layer = _sia?.layer ?? functions.length
        _sia = { type: 'unit', layer, index: 0 }
      } else {
        _sia.index++
      }
      if (unit.type === 'function' && !unit.name) {
        if (!unit.name && sia?.type === 'argument') {
          unit.name = functions[sia.layer]?.args[sia.index]?.name
        }
        if (!unit.name && _sia.layer < functions.length) {
          unit.name = functions[_sia.layer]?.args[0]?.name
        }
        if (!unit.name) {
          unit.name = functions[_sia.layer - 1]?.name
        }
      }
      addItem(_sia, initExpressionUnit(unit))
      setSIA(_sia)
    },
    [addItem, functions, setSIA, sia]
  )

  const addConstant = useCallback(() => {
    addUnit({ type: 'constant', value: newNumber ?? 0 })
    setNewNumber(undefined)
  }, [addUnit, newNumber])

  const OperationButtons = useMemo(() => {
    return (
      ['addition', 'subtraction', 'multiplication', 'division'] as const
    ).map((operation) => {
      return (
        <Grid item xs={1.5} key={operation}>
          <Button
            key={operation}
            onClick={() => addUnit({ type: 'operation', operation })}
          >
            {OperationSpecs[operation].symbol}
          </Button>
        </Grid>
      )
    })
  }, [addUnit])

  const EnclosingButtons = useMemo(() => {
    const result = [] as JSX.Element[]
    for (const enclosing of [
      'minimum',
      'maximum',
      'average',
      'clamp',
      'sum_fraction',
    ] as const) {
      result.push(
        <Grid item xs={1.5} key={enclosing}>
          <Button
            key={enclosing}
            onClick={() =>
              addUnit({
                type: 'enclosing',
                operation: enclosing,
                part: 'head',
              })
            }
          >
            {OperationSpecs[enclosing].symbol}
          </Button>
        </Grid>
      )
    }
    return result
  }, [addUnit])

  const EnclosingPartButtons = useMemo(() => {
    const result = [] as JSX.Element[]
    result.push(
      <Grid item xs={0.5} key={'priority'}>
        <Button
          key={'priority'}
          onClick={() =>
            addUnit({
              type: 'enclosing',
              operation: 'priority',
              part: 'head',
            })
          }
        >
          {'('}
        </Button>
      </Grid>
    )
    for (const part of ['comma', 'tail'] as const) {
      result.push(
        <Grid item xs={0.5} key={part}>
          <Button
            key={part}
            onClick={() => addUnit({ type: 'enclosing', part })}
          >
            {part === 'comma' ? ',' : ')'}
          </Button>
        </Grid>
      )
    }
    return result
  }, [addUnit])

  const addFunctionUnitButton = useMemo(() => {
    return (
      <Button
        sx={{ flexGrow: 1 }}
        key={'addFunctionUnit'}
        onClick={() => addUnit({ type: 'function' })}
      >
        {'ƒ'}
      </Button>
    )
  }, [addUnit])

  return (
    <CardThemed
      bgt="light"
      sx={{
        boxShadow: '0 0 10px black',
        position: 'sticky',
        top: `10px`,
        zIndex: 1000,
      }}
    >
      <Box display="flex" gap={1}>
        <Box sx={{ flexGrow: 1 }} display="flex" flexDirection="column" gap={1}>
          <Box display="flex" gap={1} flexWrap="wrap">
            {noFunctions ? null : (
              <>
                <Button
                  key={'addNewFunction'}
                  sx={{ flexGrow: 1 }}
                  onClick={() => addFunction({})}
                >{t`multiTarget.addNewFunction`}</Button>
                <Button
                  key={'addNewArgument'}
                  sx={{ flexGrow: 1 }}
                  onClick={() => addArgument({})}
                >{t`multiTarget.addNewArgument`}</Button>
              </>
            )}
            <Button
              key={'addNewTarget'}
              sx={{ flexGrow: 2 }}
              onClick={onShow}
            >{t`multiTarget.addNewTarget`}</Button>
            {addFunctionUnitButton}
            {noFunctions ? null : (
              <ImportCustomFunctionBtn
                addFunction={(func) => addFunction(func, true)}
              />
            )}
            <ButtonGroup>
              <Button key={'addConstant'} onClick={addConstant}>
                {t`multiTarget.add`}
              </Button>
              <CustomNumberInputButtonGroupWrapper>
                <CustomNumberInput
                  float
                  value={newNumber}
                  onChange={setNewNumber}
                  inputProps={{ sx: { pl: 1 } }}
                />
              </CustomNumberInputButtonGroupWrapper>
              <Button
                key={'addConstant'}
                onClick={() => addUnit({ type: 'constant', value: 1 })}
              >
                {'1'}
              </Button>
            </ButtonGroup>
          </Box>
          <ButtonGroup fullWidth>{EnclosingButtons}</ButtonGroup>
          <ButtonGroup fullWidth>
            {OperationButtons}
            {EnclosingPartButtons}
          </ButtonGroup>
        </Box>
        <TargetSelectorModal
          showEmptyTargets
          show={show}
          onClose={onClose}
          setTarget={(target, multi) => {
            onClose()
            addUnit({ type: 'target', target: initCustomTarget(target, multi) })
          }}
          excludeSections={['bonusStats', 'character', 'custom']}
        />
      </Box>
    </CardThemed>
  )
}

function ImportCustomFunctionBtn({
  addFunction,
  btnProps = {},
}: {
  addFunction: (func: Partial<CustomFunction>) => void
  btnProps?: ButtonProps
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState()
  const [data, setData] = useState('')

  const importData = () => {
    try {
      const dataObj = JSON.parse(data)
      const validated = validateCustomMultiTarget(dataObj)
      if (!validated) window.alert('Invalid Multi-Optimization Config')
      else {
        for (const func of validated.functions ?? []) {
          addFunction(func)
        }
        onClose()
      }
    } catch (e) {
      window.alert(`Data Import failed. ${e}`)
      return
    }
  }

  return (
    <>
      <Button {...btnProps} onClick={onShow}>
        {t`multiTarget.importCustomFunctions`}
      </Button>
      <ModalWrapper open={show} onClose={onClose}>
        <CardThemed>
          <CardHeader title="Import Custom Functions" />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography>
              Import Custom Functions from Custom Multi-Opt in JSON form below.
            </Typography>
            <TextField
              fullWidth
              label="JSON Data"
              placeholder="Paste your Custom Function JSON here"
              value={data}
              onChange={(e) => setData(e.target.value)}
              multiline
              rows={4}
            />
            <Button
              startIcon={<UploadIcon />}
              disabled={!data}
              onClick={importData}
            >
              Import
            </Button>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
