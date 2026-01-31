/* eslint-disable no-nested-ternary */
/* eslint-disable no-alert */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
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
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  CardActionArea,
  Avatar,
  MenuItem,
  Paper,
  Dialog,
  DialogContent,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

CableTVPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function CableTVPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  // Data States
  const [providers, setProviders] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'input' | 'auth'>('input');

  // Verification States
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'pin' | 'otp' | null>(null);
  const [authMessage, setAuthMessage] = useState('');

  // Feedback States
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({ decoder: '', customer: '', plan: '', pin: '' });
  const [result, setResult] = useState<any>(null);

  // 1. Fetch Providers
  const fetchProviders = useCallback(async () => {
    try {
      const response = await axios.get('/bills/cabletv/providers');
      setProviders(response.data.data);
    } catch (error) {
      setErrorMessage('Failed to load Cable TV providers.');
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // 2. Fetch Plans when Decoder changes
  useEffect(() => {
    if (form.decoder) {
      const fetchPlans = async () => {
        setPlansLoading(true);
        setVerifiedName(null); // Reset verification if provider changes
        try {
          const response = await axios.post('/bills/cabletv/plans', { decoder: form.decoder });
          setPlans(response.data.data);
        } catch (error) {
          setErrorMessage('Could not load plans for this provider.');
        } finally {
          setPlansLoading(false);
        }
      };
      fetchPlans();
    }
  }, [form.decoder]);

  // 3. Verify Customer
  const handleVerifyCustomer = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/cabletv/verify', {
        decoder: form.decoder,
        customer: form.customer,
      });
      setVerifiedName(response.data.customer);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Verification failed. Check decoder number.'
      );
      setVerifiedName(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Auth Check
  const handleCheckAuth = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthType(response.data.status === 'pin_required' ? 'pin' : 'otp');
      setAuthMessage(response.data.message);
      setStep('auth');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Security check failed.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Final Purchase
  const handleFinalPurchase = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/cabletv/buy', {
        decoder: form.decoder,
        customer: form.customer,
        plan: form.plan,
        pin: form.pin,
      });
      setResult(response.data);
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = providers.find((p) => p.networkid === form.decoder);
  const currentPlan = plans.find((p) => p.variation_code === form.plan);

  return (
    <>
      <Head>
        <title>Cable TV Subscription | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3">Cable TV</Typography>
          <Typography variant="body2" color="text.secondary">
            Renew your DSTV, GOtv, or StarTimes instantly.
          </Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* Provider Selection */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  1. Choose Provider
                </Typography>
                <Grid container spacing={2}>
                  {providers.map((p) => (
                    <Grid item xs={6} sm={4} key={p.networkid}>
                      <CardActionArea
                        onClick={() => setForm({ ...form, decoder: p.networkid, plan: '' })}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          textAlign: 'center',
                          border: `2px solid ${
                            form.decoder === p.networkid
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.decoder === p.networkid
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                        }}
                      >
                        <Avatar src={p.logo} sx={{ width: 56, height: 56, mx: 'auto', mb: 1 }} />
                        <Typography variant="subtitle2">{p.name}</Typography>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Input Section */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 3 }}>
                  2. Plan & Decoder Details
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    select
                    fullWidth
                    label="Select Plan"
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    disabled={!form.decoder || plansLoading}
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan.variation_code} value={plan.variation_code}>
                        <Box
                          sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                        >
                          <Typography variant="body2">{plan.name}</Typography>
                          <Typography variant="subtitle2" color="primary">
                            ₦{plan.variation_amount}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  <Box>
                    <TextField
                      fullWidth
                      label="Smart Card / IUC Number"
                      value={form.customer}
                      onChange={(e) => {
                        setForm({ ...form, customer: e.target.value });
                        setVerifiedName(null);
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              variant="soft"
                              color="info"
                              size="small"
                              onClick={handleVerifyCustomer}
                              disabled={!form.decoder || !form.customer || isVerifying}
                            >
                              {isVerifying ? <CircularProgress size={20} /> : 'Verify'}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {verifiedName && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          color: 'success.main',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Iconify icon="solar:user-check-bold" width={16} /> Verified User:{' '}
                        {verifiedName}
                      </Typography>
                    )}
                  </Box>

                  {step === 'auth' && (
                    <Paper
                      variant="outlined"
                      sx={{ p: 3, bgcolor: 'background.neutral', borderStyle: 'dashed' }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        {authMessage}
                      </Typography>
                      <TextField
                        fullWidth
                        autoFocus
                        type={authType === 'pin' ? 'password' : 'text'}
                        label={authType === 'pin' ? 'PIN' : 'OTP Code'}
                        value={form.pin}
                        onChange={(e) => setForm({ ...form, pin: e.target.value })}
                        inputProps={{
                          maxLength: authType === 'pin' ? 4 : 6,
                          style: { textAlign: 'center', letterSpacing: 8, fontWeight: 'bold' },
                        }}
                      />
                    </Paper>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Preview Sidebar */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Preview
              </Typography>
              <Stack spacing={2.5}>
                <PreviewRow label="Provider" value={selectedProvider?.name || '---'} />
                <PreviewRow label="SmartCard" value={form.customer || '---'} />
                <PreviewRow label="Owner" value={verifiedName || '---'} />
                <PreviewRow label="Package" value={currentPlan?.name || '---'} />

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Amount Due</Typography>
                  <Typography variant="h4" color="primary">
                    {fCurrency(currentPlan?.variation_amount || 0, 'NGN')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!form.plan || !verifiedName || loading}
                  onClick={step === 'input' ? handleCheckAuth : handleFinalPurchase}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : step === 'input' ? (
                    'Proceed'
                  ) : (
                    'Buy Plan'
                  )}
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Modal */}
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} fullWidth maxWidth="xs">
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="solar:check-circle-bold" width={72} color="success.main" sx={{ mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Subscription Active!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {result?.message}
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'background.neutral' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Total Charged</Typography>
                <Typography variant="subtitle2">
                  {fCurrency(result?.data?.total || 0, 'NGN')}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">Reference</Typography>
                <Typography variant="subtitle2" sx={{ fontSize: 11 }}>
                  {result?.payout_ref}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">New Balance</Typography>
                <Typography variant="h6" color="primary">
                  {fCurrency(result?.data?.balance_after || 0, 'NGN')}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Button fullWidth variant="contained" onClick={() => window.location.reload()}>
            Finish
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textAlign: 'right', pl: 2 }}>
        {value}
      </Typography>
    </Stack>
  );
}
