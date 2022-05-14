import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, TooltipProps } from "@mui/material";
import BootstrapTooltip from "./BootstrapTooltip";

interface ITooltipProps extends Omit<TooltipProps, "children"> {
  className?: string,
}
const QuestionTooltip = ({ className, ...props }: ITooltipProps) =>
  <BootstrapTooltip placement="top" {...props} className={className}>
    <Box component="span" sx={{ cursor: "help" }}><FontAwesomeIcon icon={faQuestionCircle} /></Box>
  </BootstrapTooltip>

export default QuestionTooltip
