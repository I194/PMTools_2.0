import React, { FC, useState } from 'react';
import styles from './AuthorsAndHistory.module.scss';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from 'react-responsive';
import Authors from './Authors';
import History from './History';
import { PrettyButton } from '../../components/Sub/Buttons';

const AuthorsAndHistory: FC = ({}) => {
  const theme = useTheme();
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
          !showHistory ? 
          'Хочу посмотреть историю создания' :
          'Не хочу смотреть историю создания'
        }
      </PrettyButton>
      <History show={showHistory} />
    </div>
  )
}

export default AuthorsAndHistory;
