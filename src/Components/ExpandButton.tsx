import { IconButton, IconButtonProps, styled } from "@mui/material";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
const ExpandButton = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: (theme as any).transitions.create('transform', {
    duration: (theme as any).transitions.duration.shortest,
  }),
}));

export default ExpandButton