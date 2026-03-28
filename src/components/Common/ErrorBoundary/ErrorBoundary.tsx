import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Typography, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import i18n from '../../../i18n';

interface Props {
  /** The subtree to protect — if any component inside throws during render, the fallback UI is shown instead. */
  children: ReactNode;
  /** Which page this boundary wraps. Determines which localStorage keys are cleared on reset. */
  pageName: 'pca' | 'dir';
}

interface State {
  hasError: boolean;
}

/**
 * Maps each page to the localStorage keys it owns.
 * On crash recovery, only the keys for the affected page are cleared —
 * this avoids wiping the user's data on the other page.
 */
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

/**
 * Catches JavaScript errors anywhere in its child component tree and displays a fallback UI
 * instead of crashing the whole application.
 *
 * **Why a class component?**
 * React only exposes the error-boundary API through two class lifecycle methods —
 * {@link ErrorBoundary.getDerivedStateFromError | getDerivedStateFromError} and
 * {@link ErrorBoundary.componentDidCatch | componentDidCatch}.
 * There is no hook equivalent (`useErrorBoundary` does not exist in React).
 * This is the only class component in the project; it exists solely for this reason.
 *
 * **Recovery flow:**
 * The fallback UI offers a "Clear & Retry" button that removes the page's localStorage
 * keys (potentially corrupted data that caused the crash) and reloads the window.
 *
 * @example
 * ```tsx
 * <ErrorBoundary pageName="pca">
 *   <PCAPage />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Called by React during the render phase when a child component throws.
   * Returning `{ hasError: true }` tells React to render the fallback UI on the next render.
   */
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  /**
   * Called by React after a child component throws (commit phase, after getDerivedStateFromError).
   * Used here only to log the error to the browser console for debugging.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  /**
   * Clears localStorage keys for the crashed page (removes potentially corrupted data)
   * and reloads the window so the app starts fresh.
   */
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
          sx={{ bgcolor: 'background.default', color: 'text.primary' }}
        >
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
          <Typography variant="h5" color="text.primary">
            {t('errorBoundary.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={480}>
            {t('errorBoundary.description')}
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" color="primary" onClick={this.handleReset}>
              {t('errorBoundary.clearAndRetry')}
            </Button>
            <Button variant="outlined" color="inherit" href="/">
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
