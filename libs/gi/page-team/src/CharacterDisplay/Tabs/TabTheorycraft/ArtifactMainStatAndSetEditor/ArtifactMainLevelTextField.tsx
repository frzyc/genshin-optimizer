import type { TextFieldProps } from '@mui/material'
import { TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import type { ChangeEvent, FocusEvent } from 'react';
import { useCallback, useState } from 'react';
import { styled } from '@mui/material/styles'

const StyledTextField = styled(TextField)(
  ({ theme, color = 'primary' }) => ({
    '& .MuiFilledInput-root': {
      overflow: 'hidden',
      borderRadius: 4,
      backgroundColor: theme.palette[color].main,
      '&:hover': {
        backgroundColor: theme.palette[color].dark,
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette[color].dark,
      }
    },
  })
)

export type ArtifactMainLevelTextFieldProps = Omit<TextFieldProps, 'onChange'> & {
  value?: number | undefined
  onChange: (newValue: number | undefined) => void
  min?: number | undefined
  max?: number | undefined
}

export function ArtifactMainLevelTextField({
  value = 0,
  onChange,
  min = 0,
  max = 20,
  ...props
}: ArtifactMainLevelTextFieldProps) {
  const { inputProps = {}, ...restProps } = props;
  const { color } = inputProps;
  const [level, setLevel] = useState(value.toString());

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.match(/[^0-9]/)) {
      return e.preventDefault();
    }

    setLevel(val);

  }, [])

  const onBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val: number = parseInt(e.target.value);
    if (val > max) {
      setLevel(max.toString());
      onChange(max);
    } else if (val < min) {
      setLevel(min.toString());
      onChange(min);
    } else if (val) {
      onChange(val);
    } else { // if left empty, defaults to min value
      setLevel(min.toString());
      onChange(min);
    }
  }, [onChange])

  return (
    <StyledTextField
      id='artifact_level'
      size='small'
      sx={{width: '8ch'}}
      variant='filled'
      inputProps={{
        inputMode: 'numeric',
        style: {
          textAlign: 'center',
        }
      }}
      InputProps={{
        startAdornment: <InputAdornment
          position='start'
          variant='outlined' // override filled type to center adornment
          >+</InputAdornment>,
        disableUnderline: true,
        hiddenLabel: true,
        margin: 'dense',
      }}
      value={level}
      onChange={onInputChange}
      onBlur={onBlur}
      {...restProps}
    />
  )
}
