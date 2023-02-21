import { KeyboardArrowDown } from "@mui/icons-material";
import { Button, ButtonProps, ClickAwayListener, Grow, MenuList, Paper, Popper, Skeleton } from "@mui/material";
import { Suspense, useCallback, useState } from "react";

export type DropdownButtonProps = Omit<ButtonProps, "title"> & {
  title: React.ReactNode,
  id?: string,
  children: React.ReactNode
}
export default function DropdownButton({ title, children, id = "dropdownbtn", ...props }: DropdownButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget),
    [setAnchorEl],
  )
  const handleClose = useCallback(
    () => setAnchorEl(null),
    [setAnchorEl],
  )

  return <Suspense fallback={<Button endIcon={<KeyboardArrowDown />}{...props}><Skeleton width={50} /></Button>} >
    <Button
      {...props}
      id={id}
      aria-controls="basic-menu"
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleClick}
      endIcon={<KeyboardArrowDown />}
    >
      {title}
    </Button>
    <Popper
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      placement="bottom-start"
      transition
      onClick={handleClose}
      sx={{ zIndex: 1500 }} // Appear above modals
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === 'bottom-start' ? 'left top' : 'left bottom',
          }}
        >
          {/* Replicating previous menu paper */}
          <Paper sx={{
            maxHeight: "50vh",
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))",
            boxShadow: "rgb(0 0 0 / 20%) 0px 5px 5px -3px, rgb(0 0 0 / 14%) 0px 8px 10px 1px, rgb(0 0 0 / 12%) 0px 3px 14px 2px",
            paddingTop: "1px",
            paddingBottom: "1px",
            overflow: "auto"
          }}>
            <ClickAwayListener onClickAway={handleClose}>
              <div> {/* div needed for ClickAwayListener to function */}
                {/* set Skeleton to be really high so the taller dropdowns can still be placed properly... */}
                <Suspense fallback={<Skeleton width="100%" height="1000" />}>
                  <MenuList aria-labelledby={id}>
                    {children}
                  </MenuList>
                </Suspense>
              </div>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  </Suspense>
}
