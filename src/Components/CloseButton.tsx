import { Close } from "@mui/icons-material";
import { Button, ButtonProps } from "@mui/material";
import { useTranslation } from "react-i18next";
type CloseButtonProps = ButtonProps & {
  large?: boolean
}
export default function CloseButton({ large = false, ...props }: CloseButtonProps) {
  const { t } = useTranslation("ui")
  if (large)
    return <Button color="error" startIcon={<Close />} {...props} >{t`close`}</Button>
  return <Button color="error" sx={{ p: 1, minWidth: 0 }} {...props} >
    <Close />
  </Button>
}