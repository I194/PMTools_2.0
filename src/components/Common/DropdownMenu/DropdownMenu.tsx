import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './DropdownMenu.module.scss';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { Button, Grow, Paper, Popper } from '@mui/material';

interface IDropdownMenu {
  label: string;
  options: Array<string>;
  onOptionSelect: () => void;
}

const DropdownMenu: FC<IDropdownMenu> = ({ label, options, onOptionSelect }) => {

  const [menuOpen, setMenuOpen] = useState(false);

  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleMenuToggle = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  };

  const handleMenuClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setMenuOpen(false);
  };

  const handleSelect = (event: Event | React.SyntheticEvent) => {
    onOptionSelect();
    handleMenuClose(event);
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setMenuOpen(false);
    } else if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(menuOpen);
  useEffect(() => {
    if (prevOpen.current === true && menuOpen === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = menuOpen;
  }, [menuOpen]);

  const createMenuItem = (option: string) => {
    return (
      <MenuItem onClick={handleSelect}>{ option }</MenuItem>
    );
  };

  return (
    <>
      <Button
        ref={anchorRef}
        id="composition-button"
        aria-controls={menuOpen ? 'composition-menu' : undefined}
        aria-expanded={menuOpen ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleMenuToggle}
        variant="outlined" 
        sx={{
          textTransform: 'none',
          marginLeft: '8px'
        }}
      >
        { label }
      </Button>
      <Popper
        open={menuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'right top' : 'left bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleMenuClose}>
                <MenuList
                  autoFocusItem={menuOpen}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  {
                    options.map((option) => createMenuItem(option))
                  }
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

export default DropdownMenu;