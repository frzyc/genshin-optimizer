import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ColorText,
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  SolidToggleButtonGroup,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import {
  arrayMove,
  deepClone,
  objPathValue,
} from '@genshin-optimizer/common/util'
import type {
  CustomMultiTarget,
  EnclosingOperation,
  ExpressionOperation,
  ExpressionUnit,
} from '@genshin-optimizer/gi/db'
import {
  OperationSpecs,
  initCustomTarget,
  initExpressionUnit,
  isEnclosing,
  partsFinder,
} from '@genshin-optimizer/gi/db'
import { DataContext, resolveInfo } from '@genshin-optimizer/gi/ui'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
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
  ToggleButton,
  Typography,
} from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TargetSelectorModal } from '../Tabs/TabOptimize/Components/TargetSelectorModal'
import TargetUnitConfig from './TargetUnitConfig'

export default function ExpressionDisplay({
  expression,
  setCMT,
}: {
  expression: ExpressionUnit[]
  setCMT: Dispatch<SetStateAction<CustomMultiTarget>>
}) {
  // Selected unit index
  const [sui, setSUI] = useState(0)

  // Selected unit related parts index list
  const [surpi, setSURPI] = useState(partsFinder(expression, sui))

  useEffect(() => {
    setSURPI(partsFinder(expression, sui))
  }, [sui, expression, setSURPI])

  const { data } = useContext(DataContext)
  const getTargetName = (path: string[]) => {
    const node = objPathValue(data.getDisplay(), path)
    if (!node) return path.join('.')
    return resolveInfo(node.info)?.name ?? path.join('.')
  }

  const addUnits = (units: ExpressionUnit[], moveSUI = 0) => {
    setCMT((cmt) => {
      const expression_ = [...(cmt.expression ?? [])]
      if (sui === expression_.length) {
        expression_.push(...units)
        moveSUI = expression_.length
      } else if (expression_[sui].type === 'null') {
        expression_.splice(sui, 1, ...units)
      } else {
        expression_.splice(sui + 1, 0, ...units)
        moveSUI++
      }
      if (sui + moveSUI < 0) {
        setSUI(0)
      } else if (sui + moveSUI > expression_.length) {
        setSUI(expression_.length)
      } else {
        setSUI(sui + moveSUI)
      }
      return { ...cmt, expression: expression_ }
    })
  }

  const moveUnit = (direction: 'left' | 'right') => {
    const unit = expression[sui]
    if (!unit) return
    if (direction === 'left' && sui === 0) return
    if (direction === 'right' && sui === expression.length - 1) return
    setCMT((cmt) => {
      const expression_ = [...(cmt.expression ?? [])]
      if (direction === 'left') {
        arrayMove(expression_, sui, sui - 1)
        setSUI(sui - 1)
      } else {
        arrayMove(expression_, sui, sui + 1)
        setSUI(sui + 1)
      }
      return { ...cmt, expression: expression_ }
    })
  }

  const onDelete = (replace?: ExpressionUnit) => {
    setCMT((cmt) => {
      const expression_ = [...(cmt.expression ?? [])]
      if (replace) {
        expression_.splice(sui, 1, replace)
      } else if (expression_.length < 2) {
        expression_.splice(0, 1, initExpressionUnit({ type: 'null' }))
      } else {
        expression_.splice(sui, 1)
      }
      return { ...cmt, expression: expression_ }
    })
  }

  const setUnit = (unit: ExpressionUnit) => {
    setCMT((cmt) => {
      const expression_ = [...(cmt.expression ?? [])]
      expression_.splice(sui, 1, unit)
      return { ...cmt, expression: expression_ }
    })
  }

  const enclosingStack: EnclosingOperation[] = []
  const buttons = expression.map((unit, index) => {
    const { type } = unit
    let text: string | JSX.Element = ''
    if (type === 'constant') {
      text = unit.value.toString()
    } else if (type === 'target') {
      text = getTargetName(unit.target.path)
    } else if (type === 'operation') {
      text = OperationSpecs[unit.operation].symbol
    } else if (type === 'enclosing') {
      if (unit.part === 'head') {
        text =
          OperationSpecs[unit.operation].symbol +
          OperationSpecs[unit.operation].enclosing.left
        enclosingStack.push(unit.operation)
      } else if (unit.part === 'comma') {
        text = ','
      } else if (unit.part === 'tail') {
        if (enclosingStack.length) {
          text = OperationSpecs[enclosingStack.pop()!].enclosing.right
        } else {
          text = <ColorText color="burning">{')'}</ColorText>
        }
      }
    } else if (type === 'null') {
      text = <ColorText color="burning">null</ColorText>
    }
    return (
      <ToggleButton
        key={index}
        value={index}
        sx={{ minWidth: '0', pl: 0.25, pr: 0.35, pt: 1, pb: 1 }}
        onClick={() => setSUI(index)}
        disabled={index === sui}
      >
        {text}
      </ToggleButton>
    )
  })

  return (
    <>
      <Box display="flex" gap={1}>
        <SolidToggleButtonGroup
          sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
          value={surpi}
          size={'small'}
          baseColor="secondary"
        >
          {buttons}
        </SolidToggleButtonGroup>
      </Box>
      <CardThemed
        bgt="light"
        sx={{
          boxShadow: '0 0 10px black',
          position: 'sticky',
          bottom: `10px`,
          zIndex: 1000,
        }}
      >
        <UnitConfig
          unit={expression[sui]}
          setUnit={setUnit}
          addUnits={addUnits}
        />
        <EControlPanel
          addUnits={addUnits}
          moveUnit={moveUnit}
          onDelete={onDelete}
        />
      </CardThemed>
    </>
  )
}

function EControlPanel({
  addUnits,
  moveUnit,
  onDelete,
}: {
  addUnits: (units: ExpressionUnit[]) => void
  moveUnit: (direction: 'left' | 'right') => void
  onDelete: (replace?: ExpressionUnit) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState(false)
  let newNumber: number | undefined = undefined
  const addOperation = (operation: ExpressionOperation) => {
    addUnits([
      initExpressionUnit(
        isEnclosing(operation)
          ? { type: 'enclosing', operation, part: 'head' }
          : { type: 'operation', operation }
      ),
    ])
  }

  const [_newNumber, _setNewNumber] = useState<number | undefined>(newNumber)

  const addConstant = () => {
    addUnits([initExpressionUnit({ type: 'constant', value: newNumber ?? 1 })])
    newNumber = undefined
    _setNewNumber(undefined)
  }

  return (
    <Box display="flex" gap={1}>
      <Box sx={{ flexGrow: 1 }} display="flex" flexDirection="column" gap={1}>
        <Box display="flex" gap={1}>
          <Button
            key={'addNewTarget'}
            sx={{ flexGrow: 8 }}
            onClick={onShow}
          >{t`multiTarget.addNewTarget`}</Button>
          <Box sx={{ flexGrow: 1 }}>
            <ButtonGroup fullWidth>
              <Button key={'addConstant'} onClick={addConstant}>
                {t`multiTarget.add`}
              </Button>
              <CustomNumberInputButtonGroupWrapper>
                <CustomNumberInput
                  float
                  value={_newNumber}
                  onChange={(value) => {
                    newNumber = value
                    _setNewNumber(value)
                  }}
                  allowEmpty
                  onEnter={addConstant}
                  inputProps={{ sx: { pl: 1 } }}
                />
              </CustomNumberInputButtonGroupWrapper>
            </ButtonGroup>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <ButtonGroup fullWidth>
              <Button key={'left'} onClick={() => moveUnit('left')}>
                ←
              </Button>
              <Button key={'right'} onClick={() => moveUnit('right')}>
                →
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
        <ButtonGroup fullWidth>
          {(
            [
              'addition',
              'subtraction',
              'multiplication',
              // 'division', // Division is not supported yet.
            ] as const
          ).map((operation) => (
            <Grid item xs={1.5} key={operation}>
              <Button
                key={operation}
                onClick={() => addOperation(operation as any)}
              >
                {OperationSpecs[operation].symbol}
              </Button>
            </Grid>
          ))}
          {(['minimum', 'maximum', 'average'] as const).map((operation) => (
            <Grid item xs={1.5} key={operation}>
              <Button key={operation} onClick={() => addOperation(operation)}>
                {OperationSpecs[operation].symbol}
              </Button>
            </Grid>
          ))}
          <Grid item xs={0.5} key={'priority'}>
            <Button key={'priority'} onClick={() => addOperation('priority')}>
              {'('}
            </Button>
          </Grid>
          <Grid item xs={0.5} key={'comma'}>
            <Button
              key={'comma'}
              onClick={() =>
                addUnits([
                  initExpressionUnit({ type: 'enclosing', part: 'comma' }),
                ])
              }
            >
              {','}
            </Button>
          </Grid>
          <Grid item xs={0.5} key={'tail'}>
            <Button
              key={'tail'}
              onClick={() =>
                addUnits([
                  initExpressionUnit({ type: 'enclosing', part: 'tail' }),
                ])
              }
            >
              {')'}
            </Button>
          </Grid>
        </ButtonGroup>
      </Box>
      <ButtonGroup orientation="vertical" color="error">
        <Button
          key={'delete'}
          size="small"
          onClick={() => onDelete()}
          sx={{ height: '100%' }}
        >
          <DeleteForeverIcon />
        </Button>
        <Button
          key={'null'}
          size="small"
          onClick={() => onDelete(initExpressionUnit({ type: 'null' }))}
          sx={{ height: '100%' }}
        >
          null
        </Button>
      </ButtonGroup>
      <TargetSelectorModal
        showEmptyTargets
        show={show}
        onClose={onClose}
        setTarget={(target, multi) => {
          onClose()
          addUnits([
            initExpressionUnit({
              type: 'target',
              target: initCustomTarget(target, multi),
            }),
          ])
        }}
        excludeSections={['custom']}
      />
    </Box>
  )
}

function UnitConfig({
  unit,
  setUnit,
  addUnits,
}: {
  unit: ExpressionUnit
  setUnit: (unit: ExpressionUnit) => void
  addUnits: (units: ExpressionUnit[], moveSUI?: number) => void
}) {
  const [collapse, setcollapse] = useState(true)

  const editConstantValue = (value: number | undefined) => {
    if (value === undefined) return
    unit.type === 'constant' && setUnit({ ...unit, value })
  }

  const onDup = () => addUnits([deepClone(unit)])

  const config = (() => {
    const result: JSX.Element[] = []
    if (unit.type === 'constant') {
      result.push(
        <ButtonGroup fullWidth>
          <CustomNumberInputButtonGroupWrapper>
            <CustomNumberInput
              float
              value={unit.value}
              onChange={editConstantValue}
              inputProps={{ sx: { pl: 1 } }}
            />
          </CustomNumberInputButtonGroupWrapper>
        </ButtonGroup>
      )
    } else if (unit.type === 'target') {
      result.push(
        <TargetUnitConfig
          customTarget={unit.target}
          setCustomTarget={(t) => setUnit({ ...unit, target: t })}
          onDup={onDup}
        />
      )
    }
    if (unit.type !== 'target') {
      result.push(
        <TextFieldLazy
          fullWidth
          label="Description"
          value={unit.description}
          onChange={(description) =>
            setUnit({
              ...unit,
              description: description === '' ? undefined : description,
            })
          }
          multiline
          minRows={1}
        />
      )
    }
    return (
      <Box
        sx={{ p: 1, flexGrow: 1 }}
        display="flex"
        flexDirection="column"
        gap={1}
      >
        {result}
      </Box>
    )
  })()

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <CardActionArea
          sx={{
            display: 'flex',
            flexGrow: 1,
            gap: 1,
            height: '100%',
            py: 1,
            alignItems: 'center',
          }}
          onClick={() => setcollapse((c) => !c)}
        >
          <Typography variant="h6">Unit Config</Typography>
          {collapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </CardActionArea>

        <IconButton color="info" onClick={onDup}>
          <ContentCopyIcon />
        </IconButton>
      </Box>
      <Divider />
      <Collapse in={!collapse}>{config}</Collapse>
    </>
  )
}
