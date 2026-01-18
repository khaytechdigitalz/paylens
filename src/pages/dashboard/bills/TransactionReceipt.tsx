/* eslint-disable no-alert */
import { useRef } from 'react';
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
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Iconify from '../../../components/iconify';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import { fDateTime } from '../../../utils/formatTime';

// ----------------------------------------------------------------------

type ReceiptProps = {
  open: boolean;
  onClose: () => void;
  transaction: {
    type: 'Airtime' | 'Data' | 'Cable TV' | 'Electricity';
    amount: number;
    beneficiary: string;
    provider: string;
    reference: string;
    date: string;
    token?: string; // Only for Electricity
  };
};

export default function TransactionReceipt({ open, onClose, transaction }: ReceiptProps) {
  const theme = useTheme();
  const receiptRef = useRef(null);

  const handleDownloadPDF = () => {
    alert('Generating PDF... Your receipt will download shortly.');
    // Here you would typically use a library like html2canvas + jsPDF
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: `Receipt for ${transaction.type} payment to ${transaction.beneficiary}`,
        url: window.location.href,
      });
    } else {
      alert('Sharing link copied to clipboard!');
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
              height: 8,
              backgroundSize: '16px 8px',
              backgroundImage: `linear-gradient(135deg, transparent 45%, ${theme.palette.background.paper} 50%, transparent 55%), linear-gradient(45deg, transparent 45%, ${theme.palette.background.paper} 50%, transparent 55%)`,
            },
            '&:before': { top: -8 },
            '&:after': { bottom: -8, transform: 'rotate(180deg)' },
          }}
        >
          {/* Header */}
          <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
            <Box
              sx={{ p: 1, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1) }}
            >
              <Iconify
                icon="solar:check-circle-bold"
                sx={{ color: 'success.main', width: 48, height: 48 }}
              />
            </Box>
            <Typography variant="h6">Transaction Successful</Typography>
            <Typography variant="h3">{fCurrency(transaction.amount, 'NGN')}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {fDateTime(transaction.date)}
            </Typography>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

          {/* Details */}
          <Stack spacing={2}>
            <ReceiptRow label="Service" value={transaction.type} />
            <ReceiptRow label="Provider" value={transaction.provider} />
            <ReceiptRow label="Beneficiary" value={transaction.beneficiary} />
            <ReceiptRow label="Reference" value={transaction.reference} />

            {transaction.token && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: 'background.neutral',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  Prepaid Token
                </Typography>
                <Typography variant="h5" sx={{ letterSpacing: 2 }}>
                  {transaction.token}
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              Thank you for using PayLens. <br /> Support: support@paylens.com
            </Typography>
          </Box>
        </Paper>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Iconify icon="solar:file-download-bold" />}
            onClick={handleDownloadPDF}
          >
            PDF
          </Button>
          <Button
            fullWidth
            variant="soft"
            startIcon={<Iconify icon="solar:share-bold" />}
            onClick={handleShare}
          >
            Share
          </Button>
        </Stack>

        <Button fullWidth sx={{ mt: 2, color: 'text.secondary' }} onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}
