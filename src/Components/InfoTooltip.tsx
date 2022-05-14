
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, TooltipProps } from "@mui/material";
import BootstrapTooltip from "./BootstrapTooltip";

interface ITooltipProps extends Omit<TooltipProps, "children"> {
  className?: string,
}
const InfoTooltip = ({ className, ...props }: ITooltipProps) =>
  <BootstrapTooltip placement="top" {...props} className={className}>
    <Box component="span" sx={{ cursor: "help" }}><FontAwesomeIcon icon={faInfoCircle} /></Box>
  </BootstrapTooltip>

export default InfoTooltip
