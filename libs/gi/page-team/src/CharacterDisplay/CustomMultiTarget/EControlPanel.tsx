import { useBoolState } from '@genshin-optimizer/common/react-util';
import {
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper
} from '@genshin-optimizer/common/ui';
import type {
  ExpressionOperation,
  ExpressionUnit
} from '@genshin-optimizer/gi/db';
import {
  OperationSpecs,
  initCustomTarget,
  initExpressionUnit,
  isEnclosing
} from '@genshin-optimizer/gi/db';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {
  Box,
  Button,
  ButtonGroup,
  Grid
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TargetSelectorModal } from '../Tabs/TabOptimize/Components/TargetSelectorModal';

export default function EControlPanel({
  addUnits, moveUnit, onDelete,
}: {
  addUnits: (units: ExpressionUnit[]) => void;
  moveUnit: (direction: 'left' | 'right') => void;
  onDelete: (replace?: ExpressionUnit) => void;
}) {
  const { t } = useTranslation('page_character');
  const [show, onShow, onClose] = useBoolState(false);
  let newNumber: number | undefined = undefined;
  const addOperation = (operation: ExpressionOperation) => {
    addUnits([
      initExpressionUnit(
        isEnclosing(operation)
          ? { type: 'enclosing', operation, part: 'head' }
          : { type: 'operation', operation }
      ),
    ]);
  };

  const [_newNumber, _setNewNumber] = useState<number | undefined>(newNumber);

  const addConstant = () => {
    addUnits([initExpressionUnit({ type: 'constant', value: newNumber ?? 1 })]);
    newNumber = undefined;
    _setNewNumber(undefined);
  };

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
                    newNumber = value;
                    _setNewNumber(value);
                  }}
                  allowEmpty
                  onEnter={addConstant}
                  inputProps={{ sx: { pl: 1 } }} />
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
              onClick={() => addUnits([
                initExpressionUnit({ type: 'enclosing', part: 'comma' }),
              ])}
            >
              {','}
            </Button>
          </Grid>
          <Grid item xs={0.5} key={'tail'}>
            <Button
              key={'tail'}
              onClick={() => addUnits([
                initExpressionUnit({ type: 'enclosing', part: 'tail' }),
              ])}
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
          onClose();
          addUnits([
            initExpressionUnit({
              type: 'target',
              target: initCustomTarget(target, multi),
            }),
          ]);
        }}
        excludeSections={['custom']} />
    </Box>
  );
}
