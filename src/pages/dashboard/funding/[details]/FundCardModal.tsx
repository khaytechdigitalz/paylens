import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../../../utils/axios';
import { useSnackbar } from '../../../../components/snackbar';

export default function FundCardModal({ open, onClose, sn, onRefresh }: any) {
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await axios.get('/payouts/check_auth'); // Check Auth Step
      setStep(2);
    } catch (error) {
      enqueueSnackbar('Auth check failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/virtualcard/fund/${sn}`, { amount, pin });
      enqueueSnackbar(res.data.message || 'Funded successfully', { variant: 'success' });
      onRefresh();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Funding failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Fund Virtual Card</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          {step === 1 ? (
            <TextField
              fullWidth
              label="Amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
            />
          ) : (
            <TextField
              fullWidth
              label="Transaction PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              type="password"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        {step === 1 ? (
          <LoadingButton loading={loading} variant="contained" onClick={handleProceed}>
            Proceed
          </LoadingButton>
        ) : (
          <LoadingButton loading={loading} variant="contained" onClick={handleSubmit}>
            Fund Now
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
