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

const CARD_PROVIDERS = [
  {
    id: 'visa',
    title: 'Visa Virtual Card',
    subtitle: 'Global Acceptance',
    features: ['Instant Issuance', 'Secure Online Shopping', 'USD/NGN Supported'],
    icon: 'logos:visa',
  },
  {
    id: 'mastercard',
    title: 'Mastercard Virtual',
    subtitle: 'Reliable & Faster',
    features: ['Subscription Friendly', '3D Secure Enabled', 'Zero Maintenance Fee'],
    icon: 'logos:mastercard',
  },
];

RequestVirtualCardPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function RequestVirtualCardPage() {
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
    type: '', // visa or mastercard
    nin: '',
    pin: '',
  });

  // 1. Check Auth Step
  const handleProceedToAuth = async () => {
    if (form.nin.length !== 11) {
      setError('Please enter a valid 11-digit NIN.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthMessage(
        response.data.message || 'Enter your Transaction PIN to complete registration.'
      );
      setStep('auth');
    } catch (e: any) {
      setError(e.message || 'Authentication check failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Final Submit Step
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/virtualcard/request', {
        type: form.type,
        nin: form.nin,
        pin: form.pin,
      });

      enqueueSnackbar(response.data.message || 'Virtual Card Created Successfully!', {
        variant: 'success',
      });
      router.push('/dashboard/virtualcard/log');
    } catch (e: any) {
      const errorMessage = e?.message || 'Request failed. Please try again.';
      setError(errorMessage);
      if (e.response?.status === 400) setForm((prev) => ({ ...prev, pin: '' }));
    } finally {
      setLoading(false);
    }
  };

  const isInputValid = form.type && form.nin.length === 11;

  return (
    <>
      <Head>
        <title>Request Virtual Card | CredDot</title>
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

        <Box sx={{ mb: 5 }}>
          <Typography variant="h3">Issue Virtual Card</Typography>
          <Typography variant="body2" color="text.secondary">
            Provide your details to generate a secure virtual payment card.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* STEP 1: Select Type */}
              <Box
                sx={{
                  opacity: step === 'auth' ? 0.5 : 1,
                  pointerEvents: step === 'auth' ? 'none' : 'auto',
                }}
              >
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
                    1
                  </Box>
                  Select Card Network
                </Typography>
                <Grid container spacing={2}>
                  {CARD_PROVIDERS.map((card) => (
                    <Grid item xs={12} sm={6} key={card.id}>
                      <CardActionArea
                        onClick={() => setForm({ ...form, type: card.id })}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: `2px solid ${
                            form.type === card.id
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.type === card.id
                              ? alpha(theme.palette.primary.main, 0.04)
                              : 'background.paper',
                        }}
                      >
                        <Iconify icon={card.icon} width={45} sx={{ mb: 2 }} />
                        <Typography variant="subtitle1">{card.title}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 2 }}
                        >
                          {card.subtitle}
                        </Typography>
                        <Stack spacing={0.5}>
                          {card.features.map((f) => (
                            <Stack key={f} direction="row" alignItems="center" spacing={1}>
                              <Iconify
                                icon="solar:check-read-linear"
                                width={14}
                                color="success.main"
                              />
                              <Typography variant="caption">{f}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* STEP 2: Identity */}
              <Box
                sx={{
                  opacity: step === 'auth' ? 0.5 : 1,
                  pointerEvents: step === 'auth' ? 'none' : 'auto',
                }}
              >
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
                  Identity Verification
                </Typography>
                <Card sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
                  <TextField
                    fullWidth
                    label="National Identity Number (NIN)"
                    placeholder="Enter 11-digit NIN"
                    value={form.nin}
                    onChange={(e) =>
                      setForm({ ...form, nin: e.target.value.replace(/\D/g, '').slice(0, 11) })
                    }
                    helperText="Your NIN is required for card issuance compliance."
                  />
                </Card>
              </Box>

              {/* STEP 3: Security */}
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
                      3
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
                      Change details
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
                Issuance Summary
              </Typography>

              <Stack spacing={2.5}>
                <SummaryRow label="Network" value={form.type.toUpperCase() || 'Not selected'} />
                <SummaryRow label="ID Method" value={form.nin ? 'NIN Verified' : '---'} />
                <SummaryRow label="NIN" value={form.nin ? `*******${form.nin.slice(-4)}` : '---'} />

                <Divider sx={{ borderStyle: 'dashed' }} />

                {error && <Alert severity="error">{error}</Alert>}

                {step === 'input' ? (
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={!isInputValid || loading}
                    onClick={handleProceedToAuth}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Create'}
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Card Now'}
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
