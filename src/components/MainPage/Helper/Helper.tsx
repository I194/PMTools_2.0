
import React, { useCallback, useEffect, useState } from 'react';
import styles from './Helper.module.scss';
import { Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import BugReportIcon from '@mui/icons-material/BugReport';
import ModalWrapper from '../../Common/Modal/ModalWrapper';

const Helper = () => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const [showHelperModal, setShowHelperModal] = useState<boolean>(false);

  const handleClick = () => {
    setShowHelperModal(true);
  }

  const handleCloseModal = () => {
    setShowHelperModal(false);
  }

  const handleClearLocalStorage = useCallback(() => {
    localStorage.clear();
    alert('localStorage for pmtools.ru has been cleared');
  }, []);

  return (
    <>
      <div 
        className={styles.helper}
        onClick={handleClick}
      >
        <BugReportIcon />
      </div>

      {
        showHelperModal && 
        <ModalWrapper
          open={showHelperModal}
          setOpen={setShowHelperModal}
          size={{width: '56vw', height: '42vh'}}
          position={{left: '50%', top: '42%'}}
          onClose={handleCloseModal}
          isDraggable={false}
          bgColor='white'
          borderStyle='2px solid lime'
        >
          <div className={styles.modalContent}>
            <Typography textAlign='center' variant='h4'>
              PMTools v.{process.env.REACT_APP_VERSION}
            </Typography>
            <Typography>
              {t('helper.issues')}
            </Typography>
            <a href='https://github.com/I194/PMTools_2.0/issues' target='_blank' className={styles.link}>
              PMTools GitHub Issues
            </a>
            <Typography mt='8px'>
              {t('helper.blankScreen')}
            </Typography>
            <Typography mt='16px' mb='8px' fontWeight={600}>
              {t('helper.clearLocalStorage')}
            </Typography>
            <div className={styles.buttonWrapper}>
              <button className={styles.clearLocalStorage} onClick={handleClearLocalStorage}>
                ❗Click Here To Clear Your PMTools <code>localStorage</code>❗
              </button>
            </div>
          </div>
        </ModalWrapper>
      }
    </>
  );
};

export default Helper;
