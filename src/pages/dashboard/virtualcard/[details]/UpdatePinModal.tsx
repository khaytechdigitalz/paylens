import { useState } from 'react';
// @mui
import {
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import axios from '../../../../utils/axios';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  sn: string | string[] | undefined;
  onRefresh: VoidFunction;
};

export default function UpdatePinModal({ open, onClose, sn, onRefresh }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    old_pin: '',
    new_pin: '',
    pin: '', // The transaction/security PIN
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceed = async () => {
    if (!formData.old_pin || !formData.new_pin) {
      enqueueSnackbar('Please fill in both PIN fields', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify authority like in Payouts
      await axios.get('/payouts/check_auth');
      setStep(2);
    } catch (error) {
      enqueueSnackbar('Authorization check failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.pin) {
      enqueueSnackbar('Security PIN is required', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Step 2: Final submission to virtual card endpoint
      const response = await axios.post(`/virtualcard/update/pin/${sn}`, {
        old_pin: formData.old_pin,
        new_pin: formData.new_pin,
        pin: formData.pin, // Transaction PIN
      });

      enqueueSnackbar(response.data.message || 'Card PIN updated successfully', {
        variant: 'success',
      });

      // Cleanup and exit
      onRefresh();
      handleClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update PIN', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({ old_pin: '', new_pin: '', pin: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:key-square-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
        Update Card PIN
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          {step === 1
            ? "Change your virtual card's spending PIN. This is different from your login PIN."
            : 'Confirm your identity to authorize this change.'}
        </Typography>

        <Stack spacing={2.5}>
          {step === 1 ? (
            <>
              <TextField
                fullWidth
                name="old_pin"
                label="Current Card PIN"
                type="password"
                value={formData.old_pin}
                onChange={handleChange}
                inputProps={{ maxLength: 4 }}
              />
              <TextField
                fullWidth
                name="new_pin"
                label="New Card PIN"
                type="password"
                value={formData.new_pin}
                onChange={handleChange}
                inputProps={{ maxLength: 4 }}
                helperText="Enter a 4-digit numeric code"
              />
            </>
          ) : (
            <TextField
              fullWidth
              autoFocus
              name="pin"
              label="Transaction PIN"
              type="password"
              value={formData.pin}
              onChange={handleChange}
              placeholder="****"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:lock-password-bold-duotone" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>

        {step === 1 ? (
          <LoadingButton variant="contained" onClick={handleProceed} loading={loading}>
            Proceed
          </LoadingButton>
        ) : (
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            Change PIN
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
