import React, { FC } from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { Box, IconButton } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const style = {
  position: 'absolute' as 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60vw',
  height: '60vh',
  bgcolor: 'background.paper',
  borderRadius: '6px',
  boxShadow: 24,
  p: '16px',
};

interface IModal {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  size?: {width: string, height: string};
};

const ModalWrapper: FC<IModal> = ({ open, setOpen, size, children }) => {
  const handleClose = () => setOpen(false);

  const definedSize = size ? size : {};

  return (
    <div>
      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={{ ...style, ...size }}>
          <IconButton 
            color="error" 
            sx={{
              position: 'absolute',
              right: '8px',
              top: '8px',
            }}
            onClick={handleClose}
          >
            <CloseOutlinedIcon />
          </IconButton>
          { children }
          <Button variant='outlined' onClick={handleClose} sx={{mt: 2}}>Закрыть</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ModalWrapper;
