import { ListItemIcon, ListItemText, MenuItem, Theme } from "@mui/material";

type MenuItemWithImageProps = {
  key: string
  image?: Displayable
  text: Displayable
  theme: Theme
  isSelected?: boolean
  addlElement?: Displayable
  props?: object
}

export default function MenuItemWithImage({ key, image = "", text, theme, isSelected, addlElement, props }: MenuItemWithImageProps) {
  return <MenuItem key={key} value={key} {...props}>
    <ListItemIcon>{image}</ListItemIcon>
    <ListItemText primaryTypographyProps={{ style: { fontWeight: isSelected ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular } }}>
      {text}
    </ListItemText>
    {addlElement && addlElement}
  </MenuItem>
}
