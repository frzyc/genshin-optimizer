import { Card, styled } from "@mui/material";

const CardDark = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.contentDark.main
}));

export default CardDark