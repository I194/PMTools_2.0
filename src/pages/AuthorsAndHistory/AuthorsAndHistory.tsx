import React, { FC, useState } from 'react';
import styles from './AuthorsAndHistory.module.scss';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from 'react-responsive';
import Authors from './Authors';
import History from './History';
import { PrettyButton } from '../../components/Sub/Buttons';
import { useTranslation } from 'react-i18next';

const AuthorsAndHistory: FC = ({}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const isSmallScreen = useMediaQuery({ query: '(max-width: 920px)' });
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className={styles.container}>
      <Authors />
      <PrettyButton 
        onClick={() => setShowHistory(!showHistory)}
        sx={{
          fontSize: isSmallScreen ? '18px' : '20px',
          textTransform: 'none',
        }}
      >
        {
          !showHistory 
            ? t('authorsAndHistoryPage.historybutton.show')
            : t('authorsAndHistoryPage.historybutton.hide')
        }
      </PrettyButton>
      <History show={showHistory} />
    </div>
  )
}

export default AuthorsAndHistory;
