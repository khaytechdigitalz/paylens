/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable consistent-return */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-unknown-property */
import Head from 'next/head';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Stack,
  Divider,
  Typography,
  IconButton,
  useTheme,
  Button,
  CircularProgress,
  Fade,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import axios from '../../utils/axios';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export default function CredDotCheckoutPage() {
  const { query } = useRouter();
  const { themeStretch } = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Timer State (in seconds)
  const [secondsLeft, setSecondsLeft] = useState(1200); // 20 minutes

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const TABS = useMemo(
    () => [
      { value: 'bank_transfer', label: 'Transfer', icon: 'solar:wallet-bold-duotone' },
      { value: 'card', label: 'Card', icon: 'solar:card-bold-duotone' },
      { value: 'ussd', label: 'USSD', icon: 'solar:iphone-bold-duotone' },
    ],
    []
  );

  // Countdown Logic
  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTransactionDetails = useCallback(async () => {
    const identifier = query.reference || query.initialize;
    if (!identifier) return;

    try {
      setLoading(true);
      const response = await axios.get(`/transaction/details/${identifier}`);
      if (response.data.status) {
        setTransactionData(response.data.data);
      } else {
        setError(response.data.message || 'Transaction not found.');
      }
    } catch (err) {
      setError('Connection error. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [query.reference, query.initialize]);

  useEffect(() => {
    if (query.reference || query.initialize) {
      getTransactionDetails();
    }
  }, [query.reference, query.initialize, getTransactionDetails]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Logic to handle cancel and redirect
  const handleCancel = () => {
    const callbackUrl = transactionData?.payment_account?.callback;
    if (callbackUrl) {
      window.location.href = callbackUrl;
    }
  };

  if (loading)
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress thickness={2} size={32} color="inherit" sx={{ opacity: 0.3 }} />
      </Box>
    );

  return (
    <>
      <Head>
        <title>Pay {transactionData?.merchant?.business_name || 'Merchant'}</title>
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#FFFFFF',
        }}
      >
        {/* LEFT SIDE: ORDER SUMMARY */}
        <Box
          sx={{
            width: { xs: 1, md: '40%' },
            bgcolor: '#F8F9F9',
            p: { xs: 4, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            borderRight: { md: '1px solid #E6E8EB' },
          }}
        >
          <Box sx={{ maxWidth: 400, mx: 'auto', width: 1 }}>
            {/* REMOVED BACK BUTTON, ADDED CANCEL BUTTON */}
            <Button
              onClick={handleCancel}
              startIcon={<Iconify icon="solar:close-circle-outline" width={16} />}
              sx={{
                color: 'error.main',
                p: 0,
                mb: 6,
                fontSize: 13,
                fontWeight: 700,
                '&:hover': { bgcolor: 'transparent', color: 'error.dark' },
              }}
            >
              Cancel Payment
            </Button>

            <Stack spacing={3}>
              <Box
                component="img"
                src={transactionData?.merchant?.logo}
                sx={{ width: 52, height: 52, borderRadius: 1.5, mb: 1 }}
              />
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}
                >
                  Pay {transactionData?.merchant?.business_name}
                </Typography>
                <Typography
                  variant="h2"
                  sx={{ fontWeight: 800, letterSpacing: -1.5, color: '#1A1F36' }}
                >
                  {transactionData?.transaction?.currency}{' '}
                  {transactionData?.transaction?.amount_payable?.toLocaleString()}
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {transactionData?.transaction?.description || 'Service Payment'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {transactionData?.transaction?.currency}{' '}
                    {transactionData?.transaction?.amount?.toLocaleString()}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Processing Fee
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {transactionData?.transaction?.currency}{' '}
                    {(
                      transactionData?.transaction?.amount_payable -
                      transactionData?.transaction?.amount
                    ).toLocaleString()}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Total due
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {transactionData?.transaction?.currency}{' '}
                    {transactionData?.transaction?.amount_payable?.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Box sx={{ mt: 'auto', pt: 10 }}>
              <Logo sx={{ mx: 'auto', my: 2, opacity: 0.6 }} />
            </Box>
          </Box>
        </Box>

        {/* RIGHT SIDE: PAYMENT METHODS */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 4, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: 1, maxWidth: 460 }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#1A1F36' }}>
              Payment Method
            </Typography>

            {/* Tabs */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 5, p: 0.5, bgcolor: '#F6F8FA', borderRadius: 1.5 }}
            >
              {TABS.map((tab) => (
                <Box
                  key={tab.value}
                  onClick={() => setCurrentTab(tab.value)}
                  sx={{
                    flex: 1,
                    py: 1.2,
                    cursor: 'pointer',
                    borderRadius: 1,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    bgcolor: currentTab === tab.value ? 'white' : 'transparent',
                    boxShadow: currentTab === tab.value ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    color: currentTab === tab.value ? '#1A1F36' : 'text.disabled',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {tab.label}
                </Box>
              ))}
            </Stack>

            {currentTab === 'bank_transfer' ? (
              <Fade in>
                <Stack spacing={4}>
                  <Box
                    sx={{ p: 3, borderRadius: 2, border: '1px solid #E6E8EB', bgcolor: '#FFFFFF' }}
                  >
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', fontWeight: 800 }}
                        >
                          ACCOUNT NUMBER
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: '#1A1F36', letterSpacing: 1 }}
                          >
                            {transactionData?.payment_account?.account_number}
                          </Typography>
                          <Tooltip title={copied ? 'Copied' : 'Copy'}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCopy(transactionData?.payment_account?.account_number)
                              }
                            >
                              <Iconify
                                icon={copied ? 'solar:check-circle-bold' : 'solar:copy-outline'}
                                sx={{ color: copied ? 'success.main' : 'primary.main' }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                      <Divider />
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.disabled', fontWeight: 800 }}
                          >
                            BANK
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {transactionData?.payment_account?.bank_name}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.disabled', fontWeight: 800 }}
                          >
                            BENEFICIARY
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {transactionData?.payment_account?.account_name}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>

                  <LoadingButton
                    fullWidth
                    size="large"
                    variant="contained"
                    loading={isSubmitting}
                    onClick={() => setIsSubmitting(true)}
                    sx={{
                      bgcolor: '#1A1F36',
                      height: 54,
                      borderRadius: 1,
                      fontSize: 16,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#000' },
                    }}
                  >
                    I've sent the money
                  </LoadingButton>

                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        bgcolor: 'error.main',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      SESSION EXPIRES IN {formatTime(secondsLeft)}
                    </Typography>
                  </Stack>
                </Stack>
              </Fade>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ py: 10, textAlign: 'center' }}
              >
                <Iconify
                  icon="solar:settings-minimalistic-bold-duotone"
                  width={48}
                  sx={{ color: 'text.disabled', mb: 2, animation: 'spin 4s linear infinite' }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  Coming Soon
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  This payment method is currently under maintenance.
                </Typography>
              </Stack>
            )}

            {/* Compliance Footer */}
            <Stack sx={{ mt: 10, pt: 6, borderTop: '1px solid #F6F8FA' }}>
              <Stack
                direction="row"
                spacing={4}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box
                  component="img"
                  src="https://www.staffordnet.com/img/logos/logo-pci-dss-500.png"
                  sx={{ height: 28, opacity: 0.8 }}
                />
                <Box
                  component="img"
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Central_Bank_of_Nigeria_logo.png"
                  sx={{ height: 22, filter: 'grayscale(1)', opacity: 0.5 }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  textAlign: 'center',
                  color: 'text.disabled',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                SECURED BY CREDDOT • PCI-DSS COMPLIANT • LICENSED BY CBN
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
