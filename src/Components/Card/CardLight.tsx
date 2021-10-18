import { Card, styled } from "@mui/material";

const CardLight = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.contentLight.main
}));

export default CardLight