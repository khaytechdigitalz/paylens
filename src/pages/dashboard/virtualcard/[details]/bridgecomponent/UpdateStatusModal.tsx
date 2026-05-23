import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  TextField,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../../../../utils/axios';
import { useSnackbar } from '../../../../../components/snackbar';

export default function UpdateStatusModal({ open, onClose, sn, onRefresh }: any) {
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    if (!status) return;
    setLoading(true);
    try {
      await axios.get('/payouts/check_auth');
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
      // eslint-disable-next-line eqeqeq
      if (status != 'freeze') {
       // const state = 'freeze';
      } else {
        // const state = 'unfreeze';
      }
      const res = await axios.post(`/virtualcard/bridgecard/${status}/card/${sn}`, { status, pin });
      enqueueSnackbar(res.data.message || 'Status updated', { variant: 'success' });
      onRefresh();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Update failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Update Card Status</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          {step === 1 ? (
            <TextField
              fullWidth
              select
              label="New Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="freeze">Freeze Card</MenuItem>
              <MenuItem value="unfreeze">Unfreeze Card</MenuItem>
            </TextField>
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
        <LoadingButton
          loading={loading}
          variant="contained"
          onClick={step === 1 ? handleProceed : handleSubmit}
        >
          {step === 1 ? 'Proceed' : 'Update Status'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
