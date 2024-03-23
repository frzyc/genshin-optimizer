'use client'
import type { ContainerProps, ModalProps } from '@mui/material'
import { Box, Container, Modal, styled } from '@mui/material'

const ModalContainer = styled(Container)(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  justifyContent: 'center',
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
      component={Box}
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
