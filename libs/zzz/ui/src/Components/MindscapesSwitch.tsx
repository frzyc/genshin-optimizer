import { styled, Switch } from '@mui/material'

export const MindscapesSwitch = styled(Switch)(({ theme }) => ({
  padding: '4px',
  width: '167px',
  height: '62px',
  '& .MuiSwitch-switchBase': {
    color: theme.palette.contentZzz.main,
    padding: '3px',
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked': {
    transform: 'translateX(57px)',
    color: theme.palette.contentZzz.main,
  },
  '& .Mui-checked+.MuiSwitch-track': {
    background: '#1B263B !important',
    opacity: 1,
  },
  '& .MuiSwitch-track': {
    borderRadius: 12,
    background: theme.palette.contentNormal.main,
    opacity: '1 !important',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '16px',
      height: '16px',
    },
    '&::before': {
      content: '""',
      left: 20,
      background: theme.palette.mindscapeActive.main,
      borderRadius: '50%',
    },
    '&::after': {
      content: '""',
      right: 20,
      background: theme.palette.mindscapeInactive.main,
      borderRadius: '50%',
    },
  },
  '& .MuiSwitch-thumb': {
    width: '100px',
    height: '52px',
    borderRadius: '30px',
    margin: '2px',
  },
}))
