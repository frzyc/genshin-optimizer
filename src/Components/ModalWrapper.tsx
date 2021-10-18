import { CardContent, Container, ContainerProps, Modal, ModalProps, Skeleton, styled } from "@mui/material"
import { Suspense } from "react"
import CardLight from "./Card/CardLight"

const ScrollModal = styled(Modal)(({ theme }) => ({
  overflow: "scroll",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),

}))
const ModalContainer = styled(Container)(({ theme }) => ({
  padding: 0,
  minHeight: "100%",
  display: "flex", flexDirection: "column", justifyContent: "center",
  pointerEvents: "none",
  "& > *": {
    pointerEvents: "auto"
  }
}))

type ModalWrapperProps = ModalProps & {
  containerProps?: ContainerProps
}
export default function ModalWrapper({ children, containerProps, ...props }: ModalWrapperProps) {
  return <ScrollModal {...props}>
    <ModalContainer {...containerProps}>
      <Suspense fallback={<CardLight><CardContent><Skeleton variant="rectangular" width="100%" height={300} /></CardContent></CardLight>}>
        {children}
      </Suspense>
    </ModalContainer>
  </ScrollModal>
}