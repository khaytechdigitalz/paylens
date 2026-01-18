/* eslint-disable no-alert */
import { useRef, memo } from 'react';
// @mui
import {
  Box,
  Stack,
  Button,
  Typography,
  Divider,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Iconify from '../../../components/iconify';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import { fDateTime } from '../../../utils/formatTime';

// ----------------------------------------------------------------------

type TransactionType = 'Airtime' | 'Data' | 'Cable TV' | 'Electricity';

type TransactionData = {
  type: TransactionType;
  amount: number;
  beneficiary: string;
  provider: string;
  reference: string;
  date: string;
  token?: string;
};

type ReceiptProps = {
  open: boolean;
  onClose: VoidFunction;
  transaction: TransactionData | null; // Nullable for safety
};

interface ReceiptRowProps {
  label: string;
  value: string;
}

export default function TransactionReceipt({ open, onClose, transaction }: ReceiptProps) {
  const theme = useTheme();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Safety check to prevent build errors related to accessing properties of null
  if (!transaction) {
    return null;
  }

  const { type, amount, beneficiary, provider, reference, date, token } = transaction;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const handleDownloadPDF = () => {
    alert('Preparing your receipt...');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Transaction Receipt',
      text: `Receipt for ${type} payment of ${fCurrency(amount, 'NGN')} to ${beneficiary}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') console.error(err);
      }
    } else {
      handleCopy(shareData.text, 'Receipt details');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ py: 5, bgcolor: 'background.neutral' }}>
        <Paper
          ref={receiptRef}
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            position: 'relative',
            bgcolor: 'background.paper',
            '&:before, &:after': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              height: 10,
              zIndex: 1,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '20px 10px',
              backgroundImage: `radial-gradient(circle at 10px 10px, ${theme.palette.background.neutral} 10px, transparent 0)`,
            },
            '&:before': { top: -5 },
            '&:after': { bottom: -5, transform: 'rotate(180deg)' },
          }}
        >
          <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: 'success.main',
                display: 'inline-flex',
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={48} />
            </Box>
            <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              Success
            </Typography>
            <Typography variant="h3">{fCurrency(amount, 'NGN')}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {fDateTime(date)}
            </Typography>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

          <Stack spacing={2.5}>
            <ReceiptRow label="Service Type" value={type} />
            <ReceiptRow label="Provider" value={provider} />
            <ReceiptRow label="Beneficiary" value={beneficiary} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Reference
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="subtitle2">
                  {reference ? `${reference.slice(0, 12)}...` : 'N/A'}
                </Typography>
                <IconButton size="small" onClick={() => handleCopy(reference, 'Reference')}>
                  <Iconify icon="solar:copy-bold" width={16} />
                </IconButton>
              </Stack>
            </Stack>

            {token && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  bgcolor: 'background.neutral',
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  Prepaid Token
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                  <Typography variant="h4" sx={{ letterSpacing: 4 }}>
                    {token}
                  </Typography>
                  <IconButton onClick={() => handleCopy(token, 'Token')}>
                    <Iconify icon="solar:copy-bold" />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Stack>

          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
              PayLens Official Receipt
            </Typography>
          </Box>
        </Paper>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<Iconify icon="solar:file-download-bold" />}
            onClick={handleDownloadPDF}
          >
            PDF
          </Button>
          <Button
            fullWidth
            size="large"
            variant="soft"
            startIcon={<Iconify icon="solar:share-bold" />}
            onClick={handleShare}
          >
            Share
          </Button>
        </Stack>

        <Button fullWidth variant="text" color="inherit" sx={{ mt: 2 }} onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Fixed Sub-component with explicit Props interface
const ReceiptRow = memo(({ label, value }: ReceiptRowProps) => (
  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="subtitle2" sx={{ textAlign: 'right', pl: 2 }}>
      {value}
    </Typography>
  </Stack>
));

ReceiptRow.displayName = 'ReceiptRow';
