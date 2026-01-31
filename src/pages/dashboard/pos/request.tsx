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
import { fCurrency } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

const TERMINAL_MODELS = [
  {
    id: 'Analogue POS Terminal',
    title: 'Analogue POS',
    subtitle: 'Classic & Reliable',
    features: ['Long Battery Life', 'Physical Keypad', 'GPRS Connectivity'],
    icon: 'solar:calculator-minimalistic-bold-duotone',
    price: 30000, // Added price as a number
  },
  {
    id: 'Android POS Terminal',
    title: 'Android Smart POS',
    subtitle: 'Modern & Powerful',
    features: ['Touch Screen', 'WiFi + 4G', 'Digital Receipts'],
    icon: 'solar:smartphone-2-bold-duotone',
    price: 50000, // Added price as a number
  },
];

RequestTerminalPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function RequestTerminalPage() {
  const theme = useTheme();
  const router = useRouter();

  // UI States
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'auth'>('input');
  const [error, setError] = useState<string | null>(null);

  // Auth Type States
  const [authType, setAuthType] = useState<'pin' | 'otp' | null>(null);
  const [authMessage, setAuthMessage] = useState('');

  // Form State
  const [form, setForm] = useState({
    type: '',
    price: 0, // Changed to number
    delivery_address: '',
    business_name: '',
    pin: '',
  });

  // 1. Check Auth Step
  const handleProceedToAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthType(response.data.status === 'pin_required' ? 'pin' : 'otp');
      setAuthMessage(response.data.message);
      setStep('auth');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Authentication check failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Final Submit Step
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/terminals/request', {
        terminal_type: form.type,
        price: form.price,
        delivery_address: form.delivery_address,
        business_name: form.business_name,
        pin: form.pin,
      });
      setError(response.data.message);
      alert(response.data.message);
      router.push('/dashboard/pos/history');
    } catch (e: any) {
      // Improved error message extraction
      const errorMessage = e.response?.data?.message || 'Request failed. Please try again.';
      setError(errorMessage);

      if (e.response?.status === 400) {
        setForm((prev) => ({ ...prev, pin: '' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const isInputValid = form.type && form.delivery_address && form.business_name;

  return (
    <>
      <Head>
        <title>Request POS Terminal | PayLens</title>
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
          <Typography variant="subtitle2">Back to POS</Typography>
        </Stack>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h3">POS Terminal Request</Typography>
          <Typography variant="body2" color="text.secondary">
            Securely request a terminal for your business.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              <Box
                sx={{
                  opacity: step === 'auth' ? 0.6 : 1,
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
                  Select Hardware Model
                </Typography>
                <Grid container spacing={2}>
                  {TERMINAL_MODELS.map((model) => (
                    <Grid item xs={12} sm={6} key={model.id}>
                      <CardActionArea
                        // Updated to pick model.price
                        onClick={() => setForm({ ...form, type: model.id, price: model.price })}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: `2px solid ${
                            form.type === model.id
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.type === model.id
                              ? alpha(theme.palette.primary.main, 0.04)
                              : 'background.paper',
                        }}
                      >
                        <Iconify
                          icon={model.icon}
                          width={40}
                          color={form.type === model.id ? 'primary.main' : 'text.disabled'}
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="subtitle1">{model.title}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 2 }}
                        >
                          {model.subtitle}
                        </Typography>
                        <Stack spacing={0.5}>
                          {model.features.map((f) => (
                            <Stack key={f} direction="row" alignItems="center" spacing={1}>
                              <Iconify
                                icon="solar:check-read-linear"
                                width={14}
                                color="success.main"
                              />
                              <Typography variant="caption">{f}</Typography>
                            </Stack>
                          ))}
                          <Typography
                            variant="caption"
                            sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}
                          >
                            Price: {fCurrency(model.price)}
                          </Typography>
                        </Stack>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box
                sx={{
                  opacity: step === 'auth' ? 0.6 : 1,
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
                  Business Logistics
                </Typography>
                <Card sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Delivery Address"
                      value={form.delivery_address}
                      onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                    />
                  </Stack>
                </Card>
              </Box>

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
                    Security Verification
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
                      type={authType === 'pin' ? 'password' : 'text'}
                      placeholder={authType === 'pin' ? '****' : '000 000'}
                      value={form.pin}
                      onChange={(e) => setForm({ ...form, pin: e.target.value })}
                      inputProps={{
                        maxLength: authType === 'pin' ? 4 : 6,
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
                <SummaryRow label="Terminal" value={form.type || 'Not selected'} />
                <SummaryRow label="Business" value={form.business_name || '---'} />
                <SummaryRow label="Delivery" value={form.delivery_address || '---'} />

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">Price</Typography>
                  <Typography variant="h4" color="primary">
                    {/* Picked dynamically from form state */}₦{fCurrency(form.price)}
                  </Typography>
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}

                {step === 'input' ? (
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={!isInputValid || loading}
                    onClick={handleProceedToAuth}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Verify'}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={form.pin.length < 4 || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Request'}
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
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textAlign: 'right', wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  );
}
