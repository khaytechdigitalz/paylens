/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-alert */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  CardActionArea,
  MenuItem,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import axios from '../../../utils/axios';
import { useSnackbar } from '../../../components/snackbar';

// ----------------------------------------------------------------------

const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

const CURRENCIES = [
  {
    id: 'NGN',
    title: 'Nigerian Naira (NGN)',
    flag: 'https://purecatamphetamine.github.io/country-flag-icons/3x2/NG.svg',
    desc: 'Local settlements via Mastercard',
  },
  {
    id: 'USD',
    title: 'United States Dollar (USD)',
    flag: 'https://purecatamphetamine.github.io/country-flag-icons/3x2/US.svg',
    desc: 'International purchases & subscriptions',
  },
];

RequestVirtualCardPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function RequestVirtualCardPage() {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // Lifecycle States
  const [pageLoading, setPageLoading] = useState(true);
  const [hasCustomer, setHasCustomer] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Flows Switcher
  const [currency, setCurrency] = useState<'USD' | 'NGN' | ''>('');

  // 1. Customer Creation Form State
  const [customerForm, setCustomerForm] = useState({
    address: '',
    city: '',
    state: '',
    postal_code: '',
    house_no: '',
    pin: '',
  });

  // 2. Card Request Form State
  const [cardForm, setCardForm] = useState({
    nin: '',
    funding_amount: '3', // Default min funding for Bridgecard USD
    card_brand: 'Mastercard',
    card_pin: '',
    pin: '', // Account Transaction Pin
  });

  // Check Customer Profile Existence
  const checkCustomerStatus = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await axios.get('/virtualcard/bridgecard/get/customer');
      if (response.data?.customer_id) {
        setHasCustomer(true);
      } else {
        setHasCustomer(false);
      }
    } catch (e: any) {
      console.error(e);
      setError('Failed to sync card holder account record status.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    checkCustomerStatus();
  }, [checkCustomerStatus]);

  // Submit Handler: Register Customer Profile
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const response = await axios.post('/virtualcard/bridgecard/create/customer', customerForm);
      enqueueSnackbar(response.data?.message || 'Virtual Card Customer Created Successfully', {
        variant: 'success',
      });

      // Page reload on success as required
      router.reload();
    } catch (e: any) {
      setError(e?.message || 'Failed to complete cardholder KYC setup configuration.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Handler: Issue Card Engine
  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    const isNgn = currency === 'NGN';
    const endpoint = isNgn
      ? '/virtualcard/bridgecard/create/card/ngn'
      : '/virtualcard/bridgecard/create/card/usd';

    const payload = isNgn
      ? {
          nin: cardForm.nin,
          card_brand: cardForm.card_brand,
          card_pin: cardForm.card_pin,
          pin: cardForm.pin,
        }
      : {
          funding_amount: cardForm.funding_amount,
          card_brand: cardForm.card_brand,
          card_pin: cardForm.card_pin,
          pin: cardForm.pin,
        };

    try {
      const response = await axios.post(endpoint, payload);
      enqueueSnackbar(response.data?.message || 'Virtual Card Issued Successfully!', {
        variant: 'success',
      });
      router.push('/dashboard/virtualcard/history');
    } catch (e: any) {
      setError(e?.message || 'Card creation request failed.');
      if (e.response?.status === 400) setCardForm((prev) => ({ ...prev, pin: '' }));
    } finally {
      setActionLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Box
        sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Request Card | CredDot</title>
      </Head>

      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 3, cursor: 'pointer', width: 'fit-content' }}
          onClick={() => router.back()}
        >
          <Iconify icon="solar:double-alt-arrow-left-bold-duotone" width={20} />
          <Typography variant="subtitle2">Back</Typography>
        </Stack>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {hasCustomer ? 'Issue Virtual Card' : 'Cardholder Profiling'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasCustomer
              ? 'Deploy an absolute operational virtual mastercard instantly.'
              : 'Setup mandatory regional regulatory infrastructure profile.'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={hasCustomer ? 8 : 12}>
            {/* CONDITION 1: Profile Wizard Form (Customer context is null) */}
            {!hasCustomer ? (
              <Card
                component="form"
                onSubmit={handleCreateCustomer}
                sx={{ p: 4, maxWidth: 720, mx: 'auto' }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  Address KYC Compliance
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      required
                      fullWidth
                      label="Street Address"
                      value={customerForm.address}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, address: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      label="House/Apartment Number"
                      value={customerForm.house_no}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, house_no: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      label="City"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      select
                      label="State"
                      value={customerForm.state}
                      onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                    >
                      {NIGERIAN_STATES.map((st) => (
                        <MenuItem key={st} value={st}>
                          {st}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      label="Postal Code"
                      value={customerForm.postal_code}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, postal_code: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ mx: 'auto' }}>
                    <TextField
                      required
                      fullWidth
                      type="password"
                      label="Transaction PIN"
                      placeholder="****"
                      value={customerForm.pin}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          pin: e.target.value.replace(/\D/g, '').slice(0, 4),
                        })
                      }
                      inputProps={{
                        maxLength: 4,
                        style: { textAlign: 'center', fontWeight: 'bold', letterSpacing: 8 },
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={actionLoading}
                  sx={{ mt: 4, py: 1.5, fontWeight: 700 }}
                >
                  {actionLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Register Setup Profile'
                  )}
                </Button>
              </Card>
            ) : (
              /* CONDITION 2: Active Card Issuer Component Panel */
              <Stack spacing={4} component="form" onSubmit={handleIssueCard}>
                {/* SUB-STEP 1: Choose Wallet Ledger Balance Group */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      1
                    </Box>
                    Select Settlement Currency
                  </Typography>

                  <Grid container spacing={2}>
                    {CURRENCIES.map((cur) => (
                      <Grid item xs={12} sm={6} key={cur.id}>
                        <CardActionArea
                          onClick={() => setCurrency(cur.id as any)}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: `2px solid ${
                              currency === cur.id
                                ? theme.palette.primary.main
                                : alpha(theme.palette.divider, 0.1)
                            }`,
                            bgcolor:
                              currency === cur.id
                                ? alpha(theme.palette.primary.main, 0.04)
                                : 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Stack direction="row" spacing={2.5} alignItems="center">
                            {/* Premium Circular SVG Flag Wrapper */}
                            <Box
                              component="img"
                              src={cur.flag}
                              alt={`${cur.id} Flag`}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                                filter: currency === cur.id ? 'none' : 'grayscale(20%)',
                                transition: 'all 0.2s',
                              }}
                            />

                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 700,
                                  color: currency === cur.id ? 'primary.main' : 'text.primary',
                                }}
                              >
                                {cur.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {cur.desc}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardActionArea>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {currency && (
                  <>
                    {/* SUB-STEP 2: Balance Requirements Inputs Form fields */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          2
                        </Box>
                        Card Parameters Setup
                      </Typography>

                      <Card sx={{ p: 3, variant: 'outlined' }}>
                        <Stack spacing={3}>
                          {currency === 'NGN' ? (
                            <TextField
                              required
                              fullWidth
                              label="National Identity Number (NIN)"
                              placeholder="Enter 11-digit identification number"
                              value={cardForm.nin}
                              onChange={(e) =>
                                setCardForm({
                                  ...cardForm,
                                  nin: e.target.value.replace(/\D/g, '').slice(0, 11),
                                })
                              }
                            />
                          ) : (
                            <TextField
                              required
                              fullWidth
                              label="Funding Amount ($)"
                              type="number"
                              value={cardForm.funding_amount}
                              inputProps={{ min: 3 }}
                              onChange={(e) =>
                                setCardForm({ ...cardForm, funding_amount: e.target.value })
                              }
                              helperText="Minimum opening deposit balance requirement is $3.00"
                            />
                          )}

                          <Grid container spacing={0}>
                            <Grid item xs={12} sm={12}>
                              <TextField
                                required
                                fullWidth
                                type="password"
                                label="Set Card Pin"
                                placeholder="****"
                                helperText="Pin used at merchant web transaction operations"
                                value={cardForm.card_pin}
                                onChange={(e) =>
                                  setCardForm({
                                    ...cardForm,
                                    card_pin: e.target.value.replace(/\D/g, '').slice(0, 4),
                                  })
                                }
                                inputProps={{
                                  maxLength: 4,
                                  style: { textAlign: 'center', fontWeight: 'bold' },
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} sm={12}>
                              <TextField
                                required
                                fullWidth
                                type="password"
                                label="Account Transaction PIN"
                                placeholder="****"
                                helperText="Your safe internal authorization code"
                                value={cardForm.pin}
                                onChange={(e) =>
                                  setCardForm({
                                    ...cardForm,
                                    pin: e.target.value.replace(/\D/g, '').slice(0, 4),
                                  })
                                }
                                inputProps={{
                                  maxLength: 4,
                                  style: { textAlign: 'center', fontWeight: 'bold' },
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Stack>
                      </Card>
                    </Box>
                  </>
                )}
              </Stack>
            )}
          </Grid>

          {/* RIGHT COL: Dynamic Context Card Summaries */}
          {hasCustomer && (
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 3,
                  position: 'sticky',
                  top: 100,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Issuance Overview
                </Typography>

                <Stack spacing={2}>
                  <SummaryRow label="Network Brand" value={cardForm.card_brand} />
                  <SummaryRow label="Selected Core" value={currency || 'Not selected'} />
                  {currency === 'NGN' && (
                    <SummaryRow
                      label="KYC Document"
                      value={cardForm.nin ? 'NIN Form Added' : 'Pending Verification'}
                    />
                  )}
                  {currency === 'USD' && (
                    <SummaryRow
                      label="Primary Funding"
                      value={`$${cardForm.funding_amount || '0'}.00`}
                    />
                  )}

                  <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    type="submit"
                    disabled={
                      !currency ||
                      cardForm.pin.length < 4 ||
                      cardForm.card_pin.length < 4 ||
                      actionLoading
                    }
                    onClick={handleIssueCard}
                    sx={{ fontWeight: 700 }}
                  >
                    {actionLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Deploy Card Device'
                    )}
                  </Button>
                </Stack>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}
