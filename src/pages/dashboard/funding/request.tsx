/* eslint-disable no-alert */
import { useState } from 'react';
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
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import axios from '../../../utils/axios';
import { useSnackbar } from '../../../components/snackbar';

// ----------------------------------------------------------------------

const BANK_PROVIDERS = [
  {
    id: 'netbank',
    title: 'NET MFB',
    subtitle: 'Instant Activation',
    icon: 'solar:shield-check-bold-duotone',
  },
  {
    id: 'safehaven',
    title: 'SafeHaven MFB',
    subtitle: 'Reliable Transfers',
    icon: 'solar:shield-check-bold-duotone',
  },
  /*
  {
    id: 'providus',
    title: 'Providus Bank',
    subtitle: 'Premium Settlements',
    icon: 'solar:shield-check-bold-duotone',
  },
  {
    id: 'gtb',
    title: 'GTBank',
    subtitle: 'Mainstream Choice',
    icon: 'solar:shield-check-bold-duotone',
  },
  {
    id: 'vfd',
    title: 'VFD Microfinance',
    subtitle: 'Digital First',
    icon: 'solar:shield-check-bold-duotone',
  },
  */
];

RequestVirtualAccountPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function RequestVirtualAccountPage() {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // UI States
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'auth'>('input');
  const [error, setError] = useState<string | null>(null);

  // Auth States
  const [authMessage, setAuthMessage] = useState('');

  // Form State
  const [form, setForm] = useState({
    provider: '',
    pin: '',
  });

  // 1. Check Auth Step
  const handleProceedToAuth = async () => {
    if (!form.provider) {
      setError('Please select a bank provider to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthMessage(response.data.message || 'Confirm your Transaction PIN to generate account.');
      setStep('auth');
    } catch (e: any) {
      setError(e?.message || 'Authentication check failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Final Submit Step
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/virtualaccounts/request', {
        provider: form.provider,
        pin: form.pin,
      });

      enqueueSnackbar(response.data.message || 'Virtual Account Created Successfully!', {
        variant: 'success',
      });
      router.push('/dashboard/funding/history/');
    } catch (e: any) {
      const errorMessage = e?.message || 'Request failed. Please try again.';
      setError(errorMessage);
      if (e.response?.status === 400) setForm((prev) => ({ ...prev, pin: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Request Virtual Account | CredDot</title>
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
          <Typography variant="subtitle2">Back to Accounts</Typography>
        </Stack>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h3">Generate Virtual Account</Typography>
          <Typography variant="body2" color="text.secondary">
            Select a preferred bank to create a dedicated receiving account.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* STEP 1: Select Provider */}
              <Box
                sx={{
                  opacity: step === 'auth' ? 0.5 : 1,
                  pointerEvents: step === 'auth' ? 'none' : 'auto',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    1
                  </Box>
                  Select Bank Provider
                </Typography>

                <Grid container spacing={2}>
                  {BANK_PROVIDERS.map((bank) => (
                    <Grid item xs={12} sm={6} md={4} key={bank.id}>
                      <CardActionArea
                        onClick={() => setForm({ ...form, provider: bank.id })}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          textAlign: 'center',
                          border: `2px solid ${
                            form.provider === bank.id
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.provider === bank.id
                              ? alpha(theme.palette.primary.main, 0.04)
                              : 'background.paper',
                        }}
                      >
                        <Iconify
                          icon={bank.icon}
                          width={40}
                          sx={{
                            mb: 1.5,
                            color: form.provider === bank.id ? 'primary.main' : 'text.disabled',
                          }}
                        />
                        <Typography variant="subtitle2">{bank.title}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {bank.subtitle}
                        </Typography>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* STEP 2: Security Authorization */}
              {step === 'auth' && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                      }}
                    >
                      2
                    </Box>
                    Security Authorization
                  </Typography>
                  <Card
                    sx={{
                      p: 4,
                      border: `2px dashed ${theme.palette.primary.main}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 3 }}>
                      {authMessage}
                    </Typography>
                    <TextField
                      fullWidth
                      autoFocus
                      type="password"
                      placeholder="****"
                      value={form.pin}
                      onChange={(e) => setForm({ ...form, pin: e.target.value })}
                      inputProps={{
                        maxLength: 4,
                        style: {
                          textAlign: 'center',
                          letterSpacing: 15,
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                        },
                      }}
                    />
                    <Button sx={{ mt: 3 }} color="inherit" onClick={() => setStep('input')}>
                      Change Provider
                    </Button>
                  </Card>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Sidebar Summary */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 3,
                position: 'sticky',
                top: 100,
                border: `1px solid ${theme.palette.primary.main}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Summary
              </Typography>

              <Stack spacing={2.5}>
                <SummaryRow
                  label="Provider"
                  value={
                    BANK_PROVIDERS.find((b) => b.id === form.provider)?.title || 'Not selected'
                  }
                />
                <SummaryRow label="Currency" value="NGN" />
                <SummaryRow label="Fee" value="Free" />

                <Divider sx={{ borderStyle: 'dashed' }} />

                {error && <Alert severity="error">{error}</Alert>}

                {step === 'input' ? (
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={!form.provider || loading}
                    onClick={handleProceedToAuth}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Proceed'}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    disabled={form.pin.length < 4 || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Account'}
                  </Button>
                )}
              </Stack>
            </Card>
          </Grid>
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
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  );
}
