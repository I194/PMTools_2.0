import React, { FC, useEffect } from 'react';
import styles from './ModalWrapper.module.scss';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Draggable from 'react-draggable';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../../utils/ThemeConstants';
import { useAppDispatch } from '../../../services/store/hooks';
import { acitvateHotkeys, deactivateHotkeys } from '../../../services/reducers/appSettings';
import { useTranslation } from 'react-i18next';

interface IModal {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  size?: {width?: string, height?: string};
  position?: {left?: string, top?: string};
  isDraggable?: boolean;
  showBottomClose?: boolean;
};

const ModalWrapper: FC<IModal> = ({ 
  open, 
  setOpen, 
  onClose, 
  size, 
  position, 
  isDraggable,
  showBottomClose,
  children
}) => {

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const handleClose = () => {
    setOpen(false);
    dispatch(acitvateHotkeys());
    if (onClose) onClose();
  };

  useEffect(() => {
    if (open) dispatch(deactivateHotkeys());
    else dispatch(acitvateHotkeys());
    return () => {dispatch(acitvateHotkeys())}
  }, [open]);

  const ModalInnerData = (
    <Modal
      keepMounted
      open={open}
      onClose={handleClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
      disablePortal={isDraggable}
      hideBackdrop={isDraggable}
      sx={isDraggable ? {
        ...size,
        ...position,
      }: {}}
      
    >
      <div 
        style={{ 
          ...size,
          ...position,
          backgroundColor: bgColorMain(theme.palette.mode),
        }}
        className={styles.container}
      >
        <IconButton 
          color="error" 
          sx={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            zIndex: 100,
          }}
          onClick={handleClose}
        >
          <CloseOutlinedIcon />
        </IconButton>
        { children }
        {
          showBottomClose && 
          <Button variant='outlined' onClick={handleClose} sx={{mt: 2}}>
            {t('importModal.close')}
          </Button>
        }
      </div>
    </Modal>
  )

  return (
    <>
      {
      isDraggable 
        ? (
          <Draggable positionOffset={{x: '-50%', y: '-50%'}}>
            { ModalInnerData }
          </Draggable>
        )
        : ModalInnerData
      }
    </>
  );
};

export default ModalWrapper;
