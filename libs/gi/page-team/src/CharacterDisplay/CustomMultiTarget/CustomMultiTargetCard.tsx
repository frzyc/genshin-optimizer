import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ColorText,
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  InfoTooltip,
  ModalWrapper,
  SolidToggleButtonGroup,
} from '@genshin-optimizer/common/ui'
import {
  arrayMove,
  deepClone,
  objPathValue,
} from '@genshin-optimizer/common/util'
import type {
  CustomTarget,
  EnclosingOperation,
  ExpressionOperation,
  ExpressionUnit,
  NonenclosingOperation,
} from '@genshin-optimizer/gi/db'
import {
  EnclosingOperations,
  initCustomTarget,
  initExpressionUnit,
  type CustomMultiTarget,
} from '@genshin-optimizer/gi/db'
import { DataContext } from '@genshin-optimizer/gi/ui'
import { resolveInfo } from '@genshin-optimizer/gi/uidata'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Box,
  Button,
  ButtonGroup,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  TextField,
  ToggleButton,
  Typography,
} from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TargetSelectorModal } from '../Tabs/TabOptimize/Components/TargetSelectorModal'
import { CustomTargetDisplay } from './CustomTargetDisplay'
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
  const [target, setTarget] = useState(targetProp)
  useEffect(() => {
    if (JSON.stringify(targetProp) !== JSON.stringify(target))
      setTarget(targetProp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProp])

  const { name, description } = target
  const [show, onShow, onHide] = useBoolState()

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
    [target, setTarget]
  )

  const setCustomTarget = useCallback(
    (index: number) => (ctarget: CustomTarget) => {
      const targets = [...target.targets]
      targets[index] = ctarget
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const deleteCustomTarget = useCallback(
    (index: number) => () => {
      if (
        Object.values(target.targets[index].bonusStats).length &&
        !window.confirm(`Are you sure you want to delete this target?`)
      )
        return
      const targets = [...target.targets]
      targets.splice(index, 1)
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const setTargetIndex = useCallback(
    (oldInd: number) => (newRank?: number) => {
      if (newRank === undefined || newRank === 0) return
      const newInd = newRank - 1
      const targets = [...target.targets]
      arrayMove(targets, oldInd, newInd)
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const dupCustomTarget = useCallback(
    (index: number) => () => {
      const targets = [...target.targets]
      targets.splice(index, 0, deepClone(targets[index]))
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const copyToClipboard = () =>
    navigator.clipboard
      .writeText(JSON.stringify(target))
      .then(() => alert('Copied configuration to clipboard.'))
      .catch(console.error)

  const customTargetDisplays = useMemo(
    () =>
      target.targets.map((t, i) => (
        <CustomTargetDisplay
          key={t.path.join() + i}
          customTarget={t}
          setCustomTarget={setCustomTarget(i)}
          deleteCustomTarget={deleteCustomTarget(i)}
          rank={i + 1}
          maxRank={target.targets.length}
          setTargetIndex={setTargetIndex(i)}
          onDup={dupCustomTarget(i)}
        />
      )),
    [
      deleteCustomTarget,
      dupCustomTarget,
      setCustomTarget,
      setTargetIndex,
      target.targets,
    ]
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
                  color={
                    target.expression
                      ? 'electro'
                      : target.targets.length
                      ? 'success'
                      : undefined
                  }
                  label={
                    target.expression ? (
                      <Trans t={t} i18nKey="multiTarget.expression">
                        Expression
                      </Trans>
                    ) : (
                      <Trans
                        t={t}
                        i18nKey="multiTarget.target"
                        count={target.targets.length}
                      >
                        {{ count: target.targets.length }} Targets
                      </Trans>
                    )
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
        <CardThemed>
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
            <NameDesc name={name} desc={description} setTarget={setTarget} />
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
                Export
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
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {target.expression && (
              <ExpressionNavbar
                expression={target.expression}
                setCMT={setTarget}
              />
            )}
            {!target.expression && (
              <>
                {customTargetDisplays}
                <AddCustomTargetBtn setTarget={addTarget} />
              </>
            )}
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}

const operationSymbols = {
  addition: '+',
  subtraction: '-',
  multiplication: '*',
  division: '/',
}
const enclosingNames = {
  minimum: 'min',
  maximum: 'max',
  average: 'avg',
  priority: '',
}

function ExpressionNavbar({
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

  const moveUnit = (direction: 'up' | 'down') => {
    const unit = expression[sui]
    if (!unit) return
    if (direction === 'up' && sui === 0) return
    if (direction === 'down' && sui === expression.length - 1) return
    setCMT((cmt) => {
      const expression_ = [...(cmt.expression ?? [])]
      if (direction === 'up') {
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

  return (
    <>
      <Box display="flex" gap={1}>
        <SolidToggleButtonGroup
          sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
          value={surpi}
          size={'small'}
          baseColor="secondary"
        >
          {expression.map((unit, index) => {
            const { type } = unit
            let text: string | JSX.Element = ''
            if (type === 'constant') {
              text = unit.value.toString()
            } else if (type === 'target') {
              text = getTargetName(unit.target.path)
            } else if (type === 'operation') {
              text = operationSymbols[unit.operation]
            } else if (type === 'enclosing') {
              if (unit.part === 'head') {
                text = enclosingNames[unit.operation] + '('
              } else if (unit.part === 'comma') {
                text = ','
              } else if (unit.part === 'tail') {
                text = ')'
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
          })}
          <ToggleButton
            key={expression.length}
            value={expression.length}
            sx={{ minWidth: '0', pl: 0.3, pr: 0.3, pt: 1, pb: 1 }}
            onClick={() => setSUI(expression.length)}
            disabled={expression.length === sui}
          >
            ___
          </ToggleButton>
        </SolidToggleButtonGroup>
      </Box>
      <UnitConfig
        unit={expression[sui]}
        setUnit={setUnit}
        addUnits={addUnits}
      />
      <ScreenKeyboard
        addUnits={addUnits}
        moveUnit={moveUnit}
        onDelete={onDelete}
      />
    </>
  )
}

function ScreenKeyboard({
  addUnits,
  moveUnit,
  onDelete,
}: {
  addUnits: (units: ExpressionUnit[]) => void
  moveUnit: (direction: 'up' | 'down') => void
  onDelete: (replace?: ExpressionUnit) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState(false)
  const [newNumber, setNewNumber] = useState<number>(0)
  const addTarget = (target: CustomTarget) => {
    onClose()
    addUnits([initExpressionUnit({ type: 'target', target })])
  }
  const addOperation = (operation: ExpressionOperation) => {
    if (EnclosingOperations.includes(operation as any)) {
      addUnits([
        initExpressionUnit({
          type: 'enclosing',
          operation: operation as any,
          part: 'head',
        }),
      ])
    } else {
      addUnits([
        initExpressionUnit({ type: 'operation', operation: operation as any }),
      ])
    }
  }
  const addConstant = (value: number) => {
    addUnits([initExpressionUnit({ type: 'constant', value })])
    setNewNumber(0)
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
              <Button
                key={'addConstant'}
                onClick={() => addConstant(newNumber)}
              >
                {t`multiTarget.add`}
              </Button>
              <CustomNumberInputButtonGroupWrapper>
                <CustomNumberInput
                  float
                  value={newNumber}
                  onChange={(value) => setNewNumber(value ?? 1)}
                  inputProps={{ sx: { textAlign: 'center' } }}
                />
              </CustomNumberInputButtonGroupWrapper>
            </ButtonGroup>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <ButtonGroup fullWidth>
              <Button key={'up'} onClick={() => moveUnit('up')}>
                ←
              </Button>
              <Button key={'down'} onClick={() => moveUnit('down')}>
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
              'division',
            ] as NonenclosingOperation[]
          ).map((operation) => (
            <Grid item xs={1.5} key={operation}>
              <Button
                key={operation}
                onClick={() => addOperation(operation as any)}
              >
                {operationSymbols[operation]}
              </Button>
            </Grid>
          ))}
          {(['minimum', 'maximum', 'average'] as EnclosingOperation[]).map(
            (operation) => (
              <Grid item xs={1.5} key={operation}>
                <Button key={operation} onClick={() => addOperation(operation)}>
                  {enclosingNames[operation]}
                </Button>
              </Grid>
            )
          )}
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
        setTarget={(target, multi) =>
          addTarget(initCustomTarget(target, multi))
        }
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
  if (!unit) return null
  const editConstantValue = (value: number | undefined) => {
    if (value === undefined) return
    setUnit(initExpressionUnit({ type: 'constant', value }))
  }
  return (
    <>
      {unit.type === 'constant' && (
        <ButtonGroup fullWidth>
          <CustomNumberInputButtonGroupWrapper>
            <CustomNumberInput
              float
              value={unit.value}
              onChange={editConstantValue}
              inputProps={{ sx: { textAlign: 'center' } }}
            />
          </CustomNumberInputButtonGroupWrapper>
          {/* <Button sx={{ width: '5em' }}>Edit</Button> */}
        </ButtonGroup>
      )}
      {unit.type === 'target' && (
        <CustomTargetDisplay
          mode="expression"
          customTarget={unit.target}
          setCustomTarget={(t) =>
            setUnit(initExpressionUnit({ type: 'target', target: t }))
          }
          onDup={() => addUnits([deepClone(unit)])}
        />
      )}
    </>
  )
}

function NameDesc({
  name: nameProp,
  desc: descProp,
  setTarget,
}: {
  name: string
  desc?: string
  setTarget: Dispatch<SetStateAction<CustomMultiTarget>>
}) {
  const [name, setName] = useState(nameProp)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(descProp)
  const descDeferred = useDeferredValue(desc)

  useEffect(() => {
    setName(nameProp)
  }, [nameProp])

  useEffect(() => {
    setDesc(descProp)
  }, [descProp])

  useEffect(() => {
    setTarget((target) => ({
      ...target,
      name: nameDeferred,
    }))
    // Don't need to trigger when teamCharId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTarget, nameDeferred])

  useEffect(() => {
    setTarget((target) => ({
      ...target,
      description: descDeferred,
    }))
    // Don't need to trigger when teamCharId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTarget, descDeferred])

  return (
    <>
      <TextField
        fullWidth
        label="Custom Multi-target Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        fullWidth
        label="Custom Multi-target Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        multiline
        minRows={2}
      />
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
    [onClose, setTarget]
  )

  return (
    <>
      <Button
        fullWidth
        onClick={onShow}
        startIcon={<AddIcon />}
        sx={{ mb: 1 }}
      >{t`multiTarget.addNewTarget`}</Button>
      <TargetSelectorModal
        showEmptyTargets
        flatOnly
        excludeHeal
        show={show}
        onClose={onClose}
        setTarget={setTargetHandler}
        excludeSections={['basic', 'custom']}
      />
    </>
  )
}

function targetListToExpression(cmt: CustomMultiTarget): CustomMultiTarget {
  const expression: ExpressionUnit[] = []
  cmt.targets.forEach((t, i) => {
    if (i > 0) {
      expression.push(
        initExpressionUnit({ type: 'operation', operation: 'addition' })
      )
    }
    expression.push(initExpressionUnit({ type: 'constant', value: t.weight }))
    expression.push(
      initExpressionUnit({ type: 'operation', operation: 'multiplication' })
    )
    expression.push(initExpressionUnit({ type: 'target', target: t }))
  })
  if (!expression.length)
    expression.push(initExpressionUnit({ type: 'null', kind: 'operand' }))
  return {
    ...cmt,
    targets: [],
    expression,
  }
}

function partsFinder(expression: ExpressionUnit[], index: number): number[] {
  const unit = expression[index]
  const parts: number[] = [index]
  if (!unit || unit.type !== 'enclosing') return parts
  const directions: ('up' | 'down')[] = []
  if (['head', 'comma'].includes(unit.part)) {
    directions.push('down')
  }
  if (['comma', 'tail'].includes(unit.part)) {
    directions.push('up')
  }
  directions.forEach((direction) => {
    let stack = 0
    for (
      let i = index + (direction === 'up' ? -1 : 1);
      i >= 0 && i < expression.length;
      i += direction === 'up' ? -1 : 1
    ) {
      const unit_ = expression[i]
      if (unit_.type !== 'enclosing') continue
      if (unit_.part === 'head') {
        if (stack === 0 && direction === 'up') {
          parts.push(i)
          break
        }
        stack++
      } else if (unit_.part === 'comma') {
        stack === 0 && parts.push(i)
      } else if (unit_.part === 'tail') {
        if (stack === 0 && direction === 'down') {
          parts.push(i)
          break
        }
        stack--
      }
    }
  })
  if (unit.part !== 'head') parts.sort((a, b) => a - b)
  return parts
}
