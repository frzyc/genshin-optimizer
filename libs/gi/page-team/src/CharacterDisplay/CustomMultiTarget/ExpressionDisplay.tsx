import {
  CardThemed,
  ColorText,
  SolidToggleButtonGroup,
} from '@genshin-optimizer/common/ui'
import { arrayMove, objPathValue } from '@genshin-optimizer/common/util'
import type {
  CustomMultiTarget,
  EnclosingOperation,
  ExpressionUnit,
} from '@genshin-optimizer/gi/db'
import {
  OperationSpecs,
  initExpressionUnit,
  partsFinder,
} from '@genshin-optimizer/gi/db'
import { DataContext, resolveInfo } from '@genshin-optimizer/gi/ui'
import { Box, ToggleButton } from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useContext, useEffect, useState } from 'react'
import EControlPanel from './EControlPanel'
import EUnitConfig from './EUnitConfig'

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
      // } else if (type === 'function') {
      //   text = unit.name + '('
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
    } else {
      text = ((_: never) => _)(type)
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
        <EUnitConfig
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
