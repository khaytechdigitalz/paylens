/* eslint-disable consistent-return */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Divider,
  Container,
  Typography,
  IconButton,
  alpha,
  useTheme,
  Button,
  Paper,
  CircularProgress,
  Fade,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import axios from '../../../../utils/axios';
// components
import Iconify from '../../../../components/iconify';
import { useSettingsContext } from '../../../../components/settings';

// ----------------------------------------------------------------------

export default function FlutterwaveCheckoutPage() {
  const theme = useTheme();
  const { query } = useRouter();
  const { themeStretch } = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  // Updated Icons to use Solar Duotone for that "Premium" feel
  const TABS = useMemo(
    () => [
      { value: 'bank_transfer', label: 'Transfer', icon: 'solar:wallet-bold-duotone' },
      { value: 'card', label: 'Card', icon: 'solar:card-bold-duotone' },
      { value: 'ussd', label: 'USSD', icon: 'solar:iphone-bold-duotone' },
    ],
    []
  );

  const getTransactionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/transaction/details/${query.checkout}`);
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
  }, [query.checkout]);

  useEffect(() => {
    if (query.checkout) getTransactionDetails();
  }, [query.checkout, getTransactionDetails]);

  useEffect(() => {
    if (!transactionData?.transaction?.expires_at) return;
    const interval = setInterval(() => {
      const expiry = new Date(transactionData.transaction.expires_at).getTime();
      const diff = expiry - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(interval);
      } else {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [transactionData]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress thickness={4} size={40} color="primary" />
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
          <Iconify
            icon="solar:shield-warning-bold-duotone"
            width={80}
            sx={{ color: 'error.main' }}
          />
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Payment Link Error
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {error}
            </Typography>
          </Box>
          <Button variant="contained" size="large" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Stack>
      </Box>
    );

  return (
    <Box
      sx={{ minHeight: '100vh', bgcolor: '#f4f7f9', display: 'flex', alignItems: 'center', py: 5 }}
    >
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={9}>
            {/* Main Header with Merchant Branding */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3, px: 1 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  component="img"
                  src={transactionData?.merchant?.logo}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 0.75,
                    boxShadow: theme.customShadows.z8,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, letterSpacing: 1, color: 'text.primary' }}
                >
                  {transactionData?.merchant?.business_name?.toUpperCase()}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                REF: {transactionData?.transaction?.reference}
              </Typography>
            </Stack>

            <Card
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                minHeight: 580,
                borderRadius: 3,
                boxShadow: '0 32px 64px -12px rgba(0,0,0,0.14)',
                overflow: 'hidden',
                border: 'none',
              }}
            >
              {/* LEFT SIDE: The Checkout Receipt */}
              <Box
                sx={{
                  width: { xs: 1, md: 360 },
                  p: { xs: 4, md: 5 },
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800 }}>
                  Order Summary
                </Typography>

                <Box sx={{ my: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {transactionData?.transaction?.currency}{' '}
                    {(
                      transactionData?.transaction?.amount +
                      (transactionData?.transaction?.fee || 0)
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Includes processing fees
                  </Typography>
                </Box>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Merchant Charge
                    </Typography>
                    <Typography variant="subtitle2">
                      {transactionData?.transaction?.amount?.toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Gateway Fee
                    </Typography>
                    <Typography variant="subtitle2">
                      {(transactionData?.transaction?.fee || 0).toLocaleString()}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed', mb: 4 }} />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', fontWeight: 700, mb: 1, display: 'block' }}
                  >
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {transactionData?.transaction?.description}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify
                      icon="solar:shield-check-bold"
                      width={20}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                      SECURE TRANSACTION
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              {/* RIGHT SIDE: Payment Logic */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: { xs: 4, md: 6 },
                  bgcolor: '#F9FAFB',
                  borderLeft: `1px solid ${theme.palette.divider}`,
                }}
              >
                {/* Method Switcher */}
                <Stack direction="row" spacing={1} sx={{ mb: 5 }}>
                  {TABS.map((tab) => {
                    const isSelected = currentTab === tab.value;
                    return (
                      <Box
                        key={tab.value}
                        onClick={() => setCurrentTab(tab.value)}
                        sx={{
                          flex: 1,
                          py: 2,
                          cursor: 'pointer',
                          borderRadius: 1.5,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          bgcolor: isSelected ? 'white' : 'transparent',
                          boxShadow: isSelected ? theme.customShadows.z8 : 'none',
                          border: `1px solid ${
                            isSelected ? theme.palette.primary.main : 'transparent'
                          }`,
                          '&:hover': {
                            bgcolor: isSelected ? 'white' : alpha(theme.palette.divider, 0.5),
                          },
                        }}
                      >
                        <Iconify
                          icon={tab.icon}
                          width={24}
                          sx={{ color: isSelected ? 'primary.main' : 'text.disabled', mb: 0.5 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            fontWeight: 800,
                            color: isSelected ? 'primary.main' : 'text.disabled',
                          }}
                        >
                          {tab.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>

                {currentTab === 'bank_transfer' ? (
                  <Fade in={currentTab === 'bank_transfer'}>
                    <Stack spacing={4}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800 }}>
                          Transfer details
                        </Typography>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'white',
                            border: `1px solid ${theme.palette.divider}`,
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
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography
                                  variant="h4"
                                  sx={{ letterSpacing: 2, fontWeight: 900, color: 'text.primary' }}
                                >
                                  {transactionData?.payment_account?.account_number}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopy(transactionData?.payment_account?.account_number)
                                  }
                                >
                                  <Iconify
                                    icon={
                                      copied
                                        ? 'solar:check-circle-bold-duotone'
                                        : 'solar:copy-bold-duotone'
                                    }
                                    sx={{ color: copied ? 'success.main' : 'primary.main' }}
                                  />
                                </IconButton>
                              </Stack>
                            </Box>

                            <Divider />

                            <Stack direction="row" spacing={3}>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.disabled', fontWeight: 800 }}
                                >
                                  BANK
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
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
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  {transactionData?.payment_account?.account_name}
                                </Typography>
                              </Box>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Box>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={1.5}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            bgcolor: 'error.main',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s infinite',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'error.main', fontWeight: 800, letterSpacing: 1 }}
                        >
                          PAY WITHIN {timeLeft}
                        </Typography>
                      </Stack>

                      <LoadingButton
                        fullWidth
                        size="large"
                        variant="contained"
                        loading={isSubmitting}
                        onClick={() => setIsSubmitting(true)}
                        sx={{
                          height: 64,
                          fontSize: '1rem',
                          borderRadius: 1.5,
                          boxShadow: theme.customShadows.primary,
                          textTransform: 'none',
                          fontWeight: 800,
                        }}
                      >
                        Confirm Transfer
                      </LoadingButton>
                    </Stack>
                  </Fade>
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: 320 }}>
                    <Iconify
                      icon="solar:settings-bold-duotone"
                      width={64}
                      sx={{ color: 'text.disabled', mb: 2, animation: 'spin 4s linear infinite' }}
                    />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      Coming Soon
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      We are working on making this payment method available.
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Card>

            <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
              <Button
                color="inherit"
                size="small"
                sx={{ opacity: 0.5, fontWeight: 700 }}
                startIcon={<Iconify icon="solar:arrow-left-linear" />}
              >
                Return to {transactionData?.merchant?.business_name}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(0.9);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.9);
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
