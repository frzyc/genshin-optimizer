import type { ContainerProps, ModalProps } from '@mui/material'
import { Container, Modal, styled } from '@mui/material'

const ModalContainer = styled(Container)(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100vh',
  ':focus': {
    outline: 'None',
  },
  // Allow clicking on the Container to exit modal
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'auto',
  },
}))

type ModalWrapperProps = ModalProps & {
  containerProps?: ContainerProps
}
export function ModalWrapper({
  children,
  containerProps,
  ...props
}: ModalWrapperProps) {
  return (
    <Modal
      sx={{
        overflow: 'auto',
      }}
      {...props}
    >
      <ModalContainer sx={{ p: { xs: 1 } }} {...containerProps}>
        {children}
      </ModalContainer>
    </Modal>
  )
}
