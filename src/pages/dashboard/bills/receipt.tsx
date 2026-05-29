/* eslint-disable new-cap */
/* eslint-disable no-alert */
import { useRef, memo, useState } from 'react';
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
  CircularProgress,
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
  transaction: TransactionData | null;
};

interface ReceiptRowProps {
  label: string;
  value: string;
}

export default function TransactionReceipt({ open, onClose, transaction }: ReceiptProps) {
  const theme = useTheme();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!transaction) {
    return null;
  }

  const { type, amount, beneficiary, provider, reference, date, token } = transaction;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Advanced Document Isolation Engine to prevent layout cropping cuts
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const originalElement = receiptRef.current;

      // 1. Clone the node into a hidden outer sandbox body structure
      const clonedElement = originalElement.cloneNode(true) as HTMLDivElement;

      // 2. Set absolute scale parameters to lock layout proportion tracking
      clonedElement.style.width = '420px';
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.height = 'auto';
      document.body.appendChild(clonedElement);

      // 3. Render isolated component target area at 2x Retina resolution
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: theme.palette.background.paper,
      });

      // 4. Safely clean up document body tree allocation footprints
      document.body.removeChild(clonedElement);

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Compute safe margins and crisp content aspect-ratios
      const marginX = 20;
      const imgWidth = pdfWidth - marginX * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Position centrally down page matrix lanes
      const topPosition = (pdfHeight - imgHeight) / 2 > 10 ? (pdfHeight - imgHeight) / 2 : 10;

      pdf.addImage(imgData, 'PNG', marginX, topPosition, imgWidth, imgHeight);
      pdf.save(`Receipt_${reference || 'Invoice'}.pdf`);
    } catch (error) {
      console.error('PDF Render Flow Error:', error);
    } finally {
      setDownloading(false);
    }
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
      handleCopy(shareData.text);
    }
  };

  // Structured token spacing function that cleanly splits strings into 4-digit token blocks
  const formatToken = (rawToken: string) => {
    const cleanStr = rawToken.replace(/[-\s]/g, '');

    // Handles standard 20-digit prepaid electric meters (e.g., 4123-5322-1244-9844-1245)
    if (cleanStr.length === 20) {
      return cleanStr.match(/.{1,5}/g)?.join(' - ') || rawToken;
    }
    // Handles fallback strings or longer pins safely
    return cleanStr.match(/.{1,4}/g)?.join(' ') || rawToken;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" scroll="body">
      <DialogContent sx={{ py: 4, px: 3, bgcolor: 'background.neutral' }}>
        <Paper
          ref={receiptRef}
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            position: 'relative',
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            '&:before, &:after': {
              content: '""',
              position: 'absolute',
              left: -1,
              right: -1,
              height: 8,
              zIndex: 1,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '16px 8px',
              backgroundImage: `radial-gradient(circle at 8px 8px, ${theme.palette.background.neutral} 8px, transparent 0)`,
            },
            '&:before': { top: -4 },
            '&:after': { bottom: -4, transform: 'rotate(180deg)' },
          }}
        >
          {/* Header Status Vector Block */}
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 4, mt: 1 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.08),
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:check-circle-bold-duotone" width={44} />
            </Box>

            <Stack spacing={0.5} alignItems="center">
              <Typography
                variant="overline"
                sx={{
                  color: 'success.main',
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  fontSize: '0.75rem',
                }}
              >
                Transaction Successful
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {fCurrency(amount, 'NGN')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                {fDateTime(date)}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

          {/* Core Fields Grid List Deck */}
          <Stack spacing={2.5}>
            <ReceiptRow label="Service Category" value={type} />
            <ReceiptRow label="Service Provider" value={provider} />
            <ReceiptRow label="Beneficiary Account" value={beneficiary} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Transaction Reference
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {reference}
                </Typography>
                <IconButton size="small" onClick={() => handleCopy(reference)} color="primary">
                  <Iconify icon="solar:copy-bold-duotone" width={16} />
                </IconButton>
              </Stack>
            </Stack>

            {/* SYMMETRIC, STYLED ELECTRICAL PIN DIGITS COMPONENT DISPLAY CARD */}
            {token && (
              <Box
                sx={{
                  mt: 1,
                  p: 2.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px dashed ${theme.palette.primary.main}`,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 900,
                      letterSpacing: 1,
                      fontSize: '0.65rem',
                    }}
                  >
                    Value Token Pin
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(token)}
                    sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                  >
                    <Iconify icon="solar:copy-bold-duotone" width={16} />
                  </IconButton>
                </Stack>

                <Box
                  sx={{
                    p: 1.8,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'monospace',
                      letterSpacing: 2,
                      fontWeight: 700,
                      color: 'text.primary',
                      textAlign: 'center',
                      lineHeight: 1.4,
                      fontSize: '1.25rem',
                    }}
                  >
                    {formatToken(token)}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                    display: 'block',
                    mt: 1.5,
                    textAlign: 'center',
                    fontSize: '0.68rem',
                    fontWeight: 500,
                  }}
                >
                  Input this code sequence directly into your power prepaid keypad receiver.
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                display: 'block',
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                fontSize: '0.65rem',
              }}
            >
              CredDot Official Settlement Ledger Receipt
            </Typography>
          </Box>
        </Paper>

        {/* Action Controls */}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={downloading}
            startIcon={
              downloading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="solar:file-download-bold-duotone" />
              )
            }
            onClick={handleDownloadPDF}
            sx={{
              fontWeight: 700,
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.800' },
            }}
          >
            {downloading ? 'Processing...' : 'Download PDF'}
          </Button>

          <Button
            fullWidth
            size="large"
            variant="soft"
            color="primary"
            startIcon={<Iconify icon="solar:share-bold-duotone" />}
            onClick={handleShare}
            sx={{ fontWeight: 700 }}
          >
            Share
          </Button>
        </Stack>

        <Button
          fullWidth
          variant="text"
          color="inherit"
          sx={{ mt: 2, fontWeight: 700, fontSize: '0.85rem' }}
          onClick={onClose}
        >
          Dismiss View
        </Button>
      </DialogContent>
    </Dialog>
  );
}

const ReceiptRow = memo(({ label, value }: ReceiptRowProps) => (
  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
    <Typography
      variant="subtitle2"
      sx={{ textAlign: 'right', fontWeight: 600, color: 'text.primary', wordBreak: 'break-all' }}
    >
      {value}
    </Typography>
  </Stack>
));

ReceiptRow.displayName = 'ReceiptRow';
