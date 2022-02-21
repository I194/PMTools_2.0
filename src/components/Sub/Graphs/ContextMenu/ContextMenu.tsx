import React, { FC, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { TMenuItem } from '../../../../utils/graphs/types';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

interface IContextMenu {
  items?: Array<TMenuItem>;
}

const ContextMenu: FC<IContextMenu> = ({ items, children }) => {

  const [contextMenu, setContextMenu] = useState<{mouseX: number, mouseY: number} | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleClick = (item: TMenuItem) => {
    if (item.onClick) item.onClick();
    handleClose();
  }

  if (!items) return <>{children}</>

  return (
    <div onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
      {children}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {
          items.map((item) => {
            return (
              <MenuItem 
                onClick={() => handleClick(item)}
                sx={{padding: '4px 8px'}}
                key={item.label}
              >
                {
                  item.state 
                    ? <CheckOutlinedIcon sx={{mr: '8px'}}/>
                    : <CloseOutlinedIcon sx={{mr: '8px'}}/>
                }
                {item.label}
              </MenuItem>
            );
          })
        }
      </Menu>
    </div>
  );
};

export default ContextMenu;
