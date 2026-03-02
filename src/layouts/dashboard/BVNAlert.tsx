/* eslint-disable @typescript-eslint/no-shadow */
import { useState } from 'react';
// @mui
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  alpha,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
// utils
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

export default function BVNAlert() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [bvn, setBvn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
      setBvn('');
    }
  };

  const handleVerify = async () => {
    if (bvn.length !== 11) {
      enqueueSnackbar('BVN must be 11 digits', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/profile/bvn/verify', { number: bvn });

      // 1. Show the success message
      enqueueSnackbar(response.data.message || 'BVN Verified Successfully', { variant: 'success' });

      // 2. Close the modal immediately
      setOpen(false);

      // 3. Reload the page to update the 'verification' state globally
      // We use a slight delay (500ms) so the user can actually see the success snackbar
      setTimeout(() => {
        window.location.reload();
        // OR if using Next.js router: router.reload();
      }, 500);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Verification failed', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ my: 3 }}>
      <Paper
        sx={{
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.02)} 0%, ${alpha(
              theme.palette.background.paper,
              1
            )} 100%)`,
          boxShadow: (theme) => theme.customShadows?.z12 || '0 8px 16px 0 rgba(0,0,0,0.08)',
        }}
      >
        <Iconify
          icon="solar:shield-warning-bold-duotone"
          width={140}
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            opacity: 0.05,
            color: 'error.main',
          }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'flex',
              flexShrink: 0,
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'error.main',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              border: (theme) => `2px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Iconify icon="solar:shield-keyhole-bold" width={32} />
          </Box>

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" sx={{ color: 'error.main', mb: 0.5, fontWeight: '700' }}>
              Action Required: BVN Enrollment
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 600 }}>
              To comply with financial regulations and <strong>enable payout access</strong>, you
              must verify your Bank Verification Number (BVN). Payouts are currently restricted.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleOpen}
            startIcon={<Iconify icon="solar:pen-new-square" />}
            sx={{
              whiteSpace: 'nowrap',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              boxShadow: (theme) => `0 8px 20px 0 ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            Verify BVN
          </Button>
        </Stack>
      </Paper>

      {/* VERIFICATION MODAL */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 2, p: 1 },
        }}
      >
        <DialogTitle
          sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            BVN Verification
          </Typography>
          <IconButton onClick={handleClose} disabled={isSubmitting}>
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Enter your 11-digit Bank Verification Number. We use this to confirm your identity via
            secure financial gateways.
          </Typography>

          <TextField
            fullWidth
            autoFocus
            label="BVN Number"
            placeholder="22XXXXXXXXX"
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
            inputProps={{ maxLength: 11 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ color: 'text.disabled', mr: 1, display: 'flex' }}>
                  <Iconify icon="solar:smartphone-2-bold-duotone" width={24} />
                </Box>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            onClick={handleVerify}
            sx={{
              py: 1.8,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.800' },
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.common.black, 0.24)}`,
            }}
          >
            Confirm & Verify
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
