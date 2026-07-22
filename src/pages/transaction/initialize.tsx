/* eslint-disable consistent-return */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Alert,
  alpha,
  Chip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
import axios from '../../utils/axios';
// Reusable Success Component
import { SuccessCheckout } from '../../sections/checkout';

// ----------------------------------------------------------------------

export default function CredDotCheckoutPage() {
  const { query, push } = useRouter();
  const theme = useTheme();

  const [currentTab, setCurrentTab] = useState('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Added success state
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(1200);
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

  useEffect(() => {
    if (loading || isSuccess) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSuccess]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Verification Polling Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSubmitting && transactionData?.transaction?.reference) {
      const verifyTransaction = async () => {
        try {
          const response = await axios.get(
            `/transaction/verify/transfer/${transactionData.transaction.reference}`
          );

          if (response.status === 200 && response.data.status === true) {
            const callback = response.data?.data?.callback;
            const status = response.data?.data?.status;
            const reference = response.data?.data?.reference;

            if (!callback) {
              // Show the success component instead of redirecting
              setIsSuccess(true);
              setIsSubmitting(false);
            } else {
              setIsSubmitting(false);
              const url = new URL(callback);
              url.searchParams.append('ref', reference);
              url.searchParams.append('status', status);
              window.location.href = url.toString();
            }
          }
        } catch (err) {
          console.error('Verification pending...');
        }
      };

      verifyTransaction();
      interval = setInterval(verifyTransaction, 20000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubmitting, transactionData, push]);

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
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  }, [query.reference, query.initialize]);

  useEffect(() => {
    if (query.reference || query.initialize) {
      getTransactionDetails();
    }
  }, [query.reference, query.initialize, getTransactionDetails]);

  const handleCopy = (text: string, type: 'account' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleCancel = () => {
    const callbackUrl = transactionData?.payment_account?.callback;
    if (callbackUrl) window.location.href = callbackUrl;
  };

  const processingFee =
    transactionData?.transaction?.amount_payable - transactionData?.transaction?.amount || 0;

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
          height: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* SIDEBAR/HEADER SECTION */}
        <Box
          sx={{
            width: { xs: 1, md: '40%' },
            bgcolor: { xs: '#FFFFFF', md: '#F8F9F9' },
            p: { xs: 2.5, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { xs: 'center', md: 'flex-start' },
            borderRight: { md: '1px solid #E6E8EB' },
            borderBottom: { xs: '1px solid #E6E8EB', md: 'none' },
            boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.03)', md: 'none' },
            zIndex: 10,
          }}
        >
          <Box sx={{ maxWidth: 400, mx: 'auto', width: 1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: { xs: 1, md: 8 } }}
            >
              <Button
                disabled={isSuccess}
                onClick={handleCancel}
                startIcon={<Iconify icon="solar:close-circle-outline" width={16} />}
                sx={{ color: 'error.main', p: 0, fontSize: 12, fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Logo sx={{ height: { xs: 20, md: 24 } }} />
            </Stack>

            <Stack
              direction={{ xs: 'row', md: 'column' }}
              spacing={{ xs: 2, md: 3 }}
              alignItems={{ xs: 'center', md: 'flex-start' }}
            >
              <Box
                component="img"
                src={transactionData?.merchant?.logo}
                sx={{
                  width: { xs: 44, md: 64 },
                  height: { xs: 44, md: 64 },
                  borderRadius: 1.5,
                  border: '1px solid #E6E8EB',
                  p: 0.5,
                  bgcolor: 'white',
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  PAYING {transactionData?.merchant?.business_name?.toUpperCase()}
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: -1.5,
                    color: '#1A1F36',
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                  }}
                >
                  {transactionData?.transaction?.currency}{' '}
                  {transactionData?.transaction?.amount_payable?.toLocaleString()}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: { xs: 'block', md: 'none' },
                    color: 'text.disabled',
                    fontWeight: 700,
                  }}
                >
                  Transaction Amount:
                  {transactionData?.transaction?.amount?.toLocaleString()} <small> NGN</small>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: { xs: 'block', md: 'none' },
                    color: 'text.disabled',
                    fontWeight: 700,
                  }}
                >
                  Processing Fee: {processingFee?.toLocaleString()}
                  <small> NGN</small>
                </Typography>
                <Typography
                  color="orange"
                  variant="caption"
                  sx={{
                    display: { xs: 'block', md: 'none' },
                    fontWeight: 700,
                  }}
                >
                  <a>{transactionData?.transaction?.fee_structure}</a>
                  
                </Typography>
              </Box>
            </Stack>

            {!isSuccess && (
              <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2.5 }}>
                <Stack spacing={1.5}>
                  <Chip
                    label={copiedAmount ? 'Amount Copied!' : 'Tap to Copy Amount'}
                    onClick={() =>
                      handleCopy(transactionData?.transaction?.amount_payable, 'amount')
                    }
                    icon={
                      <Iconify
                        icon={copiedAmount ? 'solar:check-circle-bold' : 'solar:copy-outline'}
                      />
                    }
                    sx={{
                      borderRadius: 1,
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: 0.5,
                      color: copiedAmount ? 'success.darker' : 'primary.darker',
                      bgcolor: copiedAmount
                        ? 'success.lighter'
                        : alpha(theme.palette.primary.main, 0.08),
                      border: `1px solid ${
                        copiedAmount ? 'success.light' : alpha(theme.palette.primary.main, 0.2)
                      }`,
                    }}
                  />
                  <Alert
                    severity="warning"
                    icon={<Iconify icon="solar:shield-warning-bold" />}
                    sx={{
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.warning.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
                      '& .MuiAlert-message': {
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: 'warning.darker',
                      },
                    }}
                  >
                    Make a single payment from your bank to this account before it expires.
                  </Alert>
                </Stack>
              </Box>
            )}

            <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 6 }}>
              <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Subtotal
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {transactionData?.transaction?.currency}{' '}
                    {transactionData?.transaction?.amount?.toLocaleString()}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Processing Fee
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {transactionData?.transaction?.currency} {processingFee?.toLocaleString()}
                    <br />
                  </Typography>
                </Stack>

                <Alert
                  severity="warning"
                  icon={<Iconify icon="solar:info-circle-bold" />}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    '& .MuiAlert-message': {
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'info.darker',
                    },
                    display: { xs: 'none', md: 'flex' },
                  }}
                >
                  {transactionData?.transaction?.fee_structure}
                </Alert>

                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Total Due
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {transactionData?.transaction?.currency}{' '}
                    {transactionData?.transaction?.amount_payable?.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}
                >
                  MEMO
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                  {transactionData?.transaction?.description || 'Service payment'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* INTERACTION AREA */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2.5, md: 8 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'center' },
            overflowY: 'auto',
          }}
        >
          {isSuccess ? (
            <Fade in timeout={600}>
              <Box sx={{ width: 1, maxWidth: 460 }}>
                <SuccessCheckout
                  ref_no={transactionData?.transaction?.reference || '122'}
                  amount={transactionData?.transaction?.amount_payable || 100}
                  currency={transactionData?.transaction?.currency || 'NGN'}
                />
              </Box>
            </Fade>
          ) : (
            <Box sx={{ width: 1, maxWidth: 460 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: { xs: 2.5, md: 4 }, p: 0.5, bgcolor: '#F6F8FA', borderRadius: 1.5 }}
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
                      bgcolor: currentTab === tab.value ? 'white' : 'transparent',
                      color: currentTab === tab.value ? '#1A1F36' : 'text.disabled',
                      fontSize: 11,
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
                  <Stack spacing={{ xs: 2.5, md: 3 }}>
                    {/* Desktop-only Instruction Alert (Hidden on Mobile) */}
                    <Alert
                      severity="info"
                      icon={<Iconify icon="solar:info-circle-bold" />}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        '& .MuiAlert-message': {
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'info.darker',
                        },
                        display: { xs: 'none', md: 'flex' },
                      }}
                    >
                      Transfer exactly{' '}
                      <strong>
                        {transactionData?.transaction?.currency}{' '}
                        {transactionData?.transaction?.amount_payable?.toLocaleString()}
                      </strong>{' '}
                      to the account below.
                    </Alert>
                    <Box
                      sx={{
                        p: { xs: 2.5, md: 3 },
                        borderRadius: 2.5,
                        border: '1px solid #E6E8EB',
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <Stack spacing={2.5}>
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
                              sx={{ fontWeight: 800, color: '#1A1F36', letterSpacing: 1.5 }}
                            >
                              {transactionData?.payment_account?.account_number}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCopy(
                                  transactionData?.payment_account?.account_number,
                                  'account'
                                )
                              }
                            >
                              <Iconify
                                icon={copied ? 'solar:check-circle-bold' : 'solar:copy-outline'}
                                sx={{ color: copied ? 'success.main' : 'primary.main' }}
                              />
                            </IconButton>
                          </Stack>
                        </Box>
                        <Divider />
                        <Stack direction="row" spacing={1}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.disabled', fontWeight: 800 }}
                            >
                              BANK
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
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
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
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
                        borderRadius: 1.5,
                        fontWeight: 700,
                        fontSize: 16,
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
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 700 }}
                      >
                        SESSION EXPIRES IN {formatTime(secondsLeft)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Fade>
              ) : (
                <Fade in>
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ py: 6, textAlign: 'center' }}
                  >
                    <Iconify
                      icon="solar:settings-minimalistic-bold-duotone"
                      width={56}
                      sx={{ color: 'text.disabled', mb: 3, animation: 'spin 4s linear infinite' }}
                    />
                    <Alert
                      severity="warning"
                      sx={{ width: 1, borderRadius: 1.5, border: '1px solid' }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Coming Soon
                      </Typography>
                      <Typography variant="caption">
                        This payment method is currently under maintenance.
                      </Typography>
                    </Alert>
                  </Stack>
                </Fade>
              )}

              <Stack
                sx={{
                  mt: { xs: 4, md: 6 },
                  pt: 3,
                  borderTop: '1px solid #F6F8FA',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', fontSize: 10, fontWeight: 700, letterSpacing: 0.8 }}
                >
                  SECURED BY CREDDOT • PCI-DSS COMPLIANT
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      <style jsx global>{`
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
