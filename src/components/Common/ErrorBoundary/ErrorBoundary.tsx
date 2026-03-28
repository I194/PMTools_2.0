import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Typography, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import i18n from '../../../i18n';

interface Props {
  children: ReactNode;
  pageName: 'pca' | 'dir';
}

interface State {
  hasError: boolean;
}

const localStorageKeysByPage: Record<string, string[]> = {
  pca: [
    'treatmentData',
    'currentDataPMDid',
    'pcaPage_reference',
    'pcaPage_statisticsMode',
    'pcaPage_showStepsInput',
    'pcaPage_isNumericLabel',
    'pcaPage_projection',
    'pcaPage_allInterpretations',
    'pcaPage_currentInterpretation',
  ],
  dir: [
    'dirStatData',
    'currentDataDIRid',
    'dirPage_reference',
    'dirPage_statisticsMode',
    'dirPage_showStepsInput',
    'dirPage_isNumericLabel',
    'dirPage_allInterpretations',
    'dirPage_currentInterpretation',
  ],
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // intentionally left for browser devtools
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    const keys = localStorageKeysByPage[this.props.pageName] ?? [];
    keys.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const t = i18n.t.bind(i18n);

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          gap={2}
          p={4}
        >
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
          <Typography variant="h5">{t('errorBoundary.title')}</Typography>
          <Typography variant="body1" textAlign="center" maxWidth={480}>
            {t('errorBoundary.description')}
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" color="primary" onClick={this.handleReset}>
              {t('errorBoundary.clearAndRetry')}
            </Button>
            <Button variant="outlined" href="/">
              {t('errorBoundary.goHome')}
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
