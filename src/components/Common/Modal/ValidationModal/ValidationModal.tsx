import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Alert,
  AlertTitle,
  Chip,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../services/store/hooks';
import {
  confirmPendingUpload,
  cancelPendingUpload,
} from '../../../../services/reducers/parsedData';

const ValidationModal: React.FC = () => {
  const { t } = useTranslation('translation');
  const dispatch = useAppDispatch();
  const pendingUpload = useAppSelector((state) => state.parsedDataReducer.pendingUpload);

  if (!pendingUpload) return null;

  const { validationIssues } = pendingUpload;
  const totalInvalidRows = validationIssues.reduce(
    (sum, issue) => sum + issue.invalidRows.length,
    0,
  );
  const totalValidRows = validationIssues.reduce((sum, issue) => sum + issue.validRows, 0);
  const allRowsInvalid = totalValidRows === 0;

  const handleConfirm = () => {
    dispatch(confirmPendingUpload());
  };

  const handleCancel = () => {
    dispatch(cancelPendingUpload());
  };

  return (
    <Dialog open={true} onClose={handleCancel} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <WarningAmberIcon color="warning" />
        {t('validationModal.title')}
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity={allRowsInvalid ? 'error' : 'warning'} sx={{ mb: 2 }}>
          <AlertTitle>
            {allRowsInvalid
              ? t('validationModal.allRowsInvalid')
              : t('validationModal.someRowsInvalid')}
          </AlertTitle>
          {t('validationModal.summary', {
            invalid: totalInvalidRows,
            valid: totalValidRows,
            total: totalInvalidRows + totalValidRows,
          })}
        </Alert>

        {validationIssues.map((issue) => (
          <Box key={issue.fileName} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {issue.fileName}
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('validationModal.table.row')}</TableCell>
                    <TableCell>{t('validationModal.table.field')}</TableCell>
                    <TableCell>{t('validationModal.table.value')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issue.invalidRows.map((row) =>
                    row.invalidFields.map((field, fieldIdx) => (
                      <TableRow key={`${row.rowNumber}-${field.field}`}>
                        {fieldIdx === 0 ? (
                          <TableCell rowSpan={row.invalidFields.length}>{row.rowNumber}</TableCell>
                        ) : null}
                        <TableCell>
                          <Chip label={field.field} size="small" color="error" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {field.rawValue === '' ? (
                              <em>{t('validationModal.table.empty')}</em>
                            ) : (
                              `"${field.rawValue}"`
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>{t('validationModal.rules.title')}</AlertTitle>
          <Typography variant="body2" component="div">
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>{t('validationModal.rules.pmdFields')}</li>
              <li>{t('validationModal.rules.dirFields')}</li>
              <li>{t('validationModal.rules.numericOnly')}</li>
            </Box>
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          {t('validationModal.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={allRowsInvalid}
        >
          {allRowsInvalid
            ? t('validationModal.noValidRows')
            : t('validationModal.loadAnyway', { count: totalValidRows })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationModal;
