import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { textColor } from '../../../../utils/ThemeConstants';
import { generateMergedName } from '../../../../utils/files/mergeUtils';

type MergeMode = { enabled: true; name: string; alsoLoadSeparately?: boolean };

type Props = {
  open: boolean;
  files: File[];
  onConfirm: (mergeMode?: MergeMode) => void;
  onCancel: () => void;
};

const MergePromptModal: React.FC<Props> = ({ open, files, onConfirm, onCancel }) => {
  const theme = useTheme();
  const { t } = useTranslation('translation');
  const color = textColor(theme.palette.mode);

  const [mergeEnabled, setMergeEnabled] = useState(false);
  const [mergeName, setMergeName] = useState('');
  const [alsoLoadSeparately, setAlsoLoadSeparately] = useState(false);

  const handleConfirm = () => {
    const mergeMode = mergeEnabled
      ? {
          enabled: true as const,
          name: mergeName || generateMergedName(files.map((f) => f.name)),
          alsoLoadSeparately,
        }
      : undefined;
    onConfirm(mergeMode);
    setMergeEnabled(false);
    setMergeName('');
    setAlsoLoadSeparately(false);
  };

  const handleCancel = () => {
    onCancel();
    setMergeEnabled(false);
    setMergeName('');
    setAlsoLoadSeparately(false);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('mergePrompt.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('mergePrompt.subtitle', { count: files.length })}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={mergeEnabled}
              onChange={(e) => setMergeEnabled(e.target.checked)}
              size="small"
            />
          }
          label={t('importModal.mergeFiles')}
          sx={{ color }}
        />
        {mergeEnabled && (
          <>
            <TextField
              size="small"
              fullWidth
              label={t('importModal.mergedCollectionName')}
              value={mergeName}
              onChange={(e) => setMergeName(e.target.value)}
              placeholder={t('importModal.mergedCollectionPlaceholder')}
              sx={{
                mt: 1,
                '& .MuiInputBase-input': { color },
                '& .MuiInputLabel-root': { color },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: color },
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={alsoLoadSeparately}
                  onChange={(e) => setAlsoLoadSeparately(e.target.checked)}
                  size="small"
                />
              }
              label={t('importModal.alsoLoadSeparately')}
              sx={{ color, mt: 1, display: 'block' }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          {t('mergePrompt.cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          {t('mergePrompt.import')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergePromptModal;
