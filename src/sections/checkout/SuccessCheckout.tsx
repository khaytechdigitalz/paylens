/* eslint-disable react/no-unknown-property */
/* eslint-disable react/no-unescaped-entities */
import { m } from 'framer-motion';
// @mui
import { Box, Stack, Typography, Button, Divider, alpha, useTheme } from '@mui/material';
// components
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  ref_no?: string;
  amount?: number;
  currency?: string;
};

export function SuccessCheckout({ ref_no, amount, currency }: Props) {
  const theme = useTheme();

  const handleCloseTab = () => {
    window.close();
    // Fallback for browsers that block window.close()
    if (!window.closed) {
      alert('Payment successful! You can now safely close this tab.');
    }
  };

  return (
    <Stack
      spacing={3}
      alignItems="center"
      sx={{
        py: 5,
        px: 3,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Animated Success Header */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse-success 2s infinite',
          }}
        >
          <Iconify icon="solar:check-circle-bold" width={60} sx={{ color: 'success.main' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: -10,
            right: -10,
            bgcolor: 'white',
            borderRadius: '50%',
            p: 0.5,
            display: 'flex',
            boxShadow: theme.customShadows.z8,
          }}
        >
          <Iconify icon="solar:like-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
        </Box>
      </Box>

      <Box>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#1A1F36' }}>
          Payment Successful!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Your transaction has been verified and processed.
        </Typography>
      </Box>

      {/* Transaction Summary Card */}
      <Box
        sx={{
          width: 1,
          p: 3,
          borderRadius: 2,
          bgcolor: '#F8F9F9',
          border: '1px solid #E6E8EB',
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
              AMOUNT PAID
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.darker' }}>
              {currency} {amount?.toLocaleString()}
            </Typography>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>
              REFERENCE
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#1A1F36', fontFamily: 'monospace' }}
            >
              {ref_no}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ width: 1 }}>
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handleCloseTab}
          sx={{
            bgcolor: '#1A1F36',
            height: 54,
            borderRadius: 1.5,
            fontWeight: 700,
            fontSize: 16,
            '&:hover': { bgcolor: '#000' },
          }}
        >
          Close Window
        </Button>

        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
          A receipt has been sent to your email address.
        </Typography>
      </Stack>

      <style jsx global>{`
        @keyframes pulse-success {
          0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
          }
        }
      `}</style>
    </Stack>
  );
}
