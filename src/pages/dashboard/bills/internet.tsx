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

InternetPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function InternetPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  // Data States
  const [networks, setNetworks] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'auth'>('input');
  const [authType, setAuthType] = useState<'pin' | 'otp' | null>(null);
  const [authMessage, setAuthMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({ network: '', phone: '', plan: '', pin: '' });
  const [result, setResult] = useState<{ message: string; balance: number; ref: string } | null>(
    null
  );

  // 1. Fetch Networks
  const fetchNetworks = useCallback(async () => {
    try {
      const response = await axios.get('/bills/internet/networks');
      setNetworks(response.data.data);
    } catch (error) {
      setErrorMessage('Could not load network providers.');
    }
  }, []);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  // 2. Fetch Plans on Network Selection
  useEffect(() => {
    if (form.network) {
      const fetchPlans = async () => {
        setPlansLoading(true);
        setErrorMessage(null);
        try {
          const response = await axios.post('/bills/internet/plans', { network: form.network });
          setPlans(response.data.data);
        } catch (error: any) {
          setErrorMessage(error.response?.data?.message || 'Failed to fetch data plans.');
        } finally {
          setPlansLoading(false);
        }
      };
      fetchPlans();
    }
  }, [form.network]);

  const selectedNetwork = networks.find((n) => n.networkid === form.network);
  const currentPlanDetails = plans.find((p) => p.variation_code === form.plan);

  // 3. Handlers
  const handleCheckAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthType(response.data.status === 'pin_required' ? 'pin' : 'otp');
      setAuthMessage(response.data.message);
      setStep('auth');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Authentication check failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalPurchase = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/internet/buy', {
        network: form.network,
        number: form.phone,
        plan: form.plan,
        pin: form.pin,
      });

      setResult({
        message: response.data.message,
        balance: response.data.balance_after,
        ref: response.data.payout_ref,
      });
      setShowSuccess(true);
    } catch (error: any) {
      // Capture the error message from the response sample: {"message": "..."}
      setErrorMessage(error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setStep('input');
    setForm({ network: '', phone: '', plan: '', pin: '' });
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <>
      <Head>
        <title>Internet Subscription | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3">Internet Data</Typography>
          <Typography variant="body2" color="text.secondary">
            Fast data top-up for any network.
          </Typography>
        </Box>

        {errorMessage && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 4 }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* Network Provider Selection */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  1. Select Network Provider
                </Typography>
                <Grid container spacing={2}>
                  {networks.map((net) => (
                    <Grid item xs={6} sm={3} key={net.networkid}>
                      <CardActionArea
                        onClick={() => setForm({ ...form, network: net.networkid, plan: '' })}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          textAlign: 'center',
                          border: `2px solid ${
                            form.network === net.networkid
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.network === net.networkid
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                        }}
                      >
                        <Avatar
                          src={net.logo}
                          sx={{
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 1,
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {net.name}
                        </Typography>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Input Fields */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 3 }}>
                  2. Beneficiary & Plan Details
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 08012345678"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:phone-bold" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Select Data Bundle"
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    disabled={!form.network || plansLoading}
                  >
                    {plansLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 2 }} /> Loading available plans...
                      </MenuItem>
                    ) : (
                      plans.map((plan) => (
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
                      ))
                    )}
                  </TextField>

                  {step === 'auth' && (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: 'background.neutral',
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.primary.main}`,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Iconify icon="solar:lock-password-bold" color="primary.main" />{' '}
                        {authMessage}
                      </Typography>
                      <TextField
                        fullWidth
                        autoFocus
                        type={authType === 'pin' ? 'password' : 'text'}
                        placeholder={authType === 'pin' ? '****' : 'Enter OTP'}
                        value={form.pin}
                        onChange={(e) => setForm({ ...form, pin: e.target.value })}
                        inputProps={{
                          maxLength: authType === 'pin' ? 4 : 6,
                          style: {
                            textAlign: 'center',
                            letterSpacing: authType === 'pin' ? 12 : 4,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                          },
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column: Checkout Summary */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Transaction Summary
              </Typography>

              <Stack spacing={2.5}>
                <SummaryRow label="Network" value={selectedNetwork?.name || '---'} />
                <SummaryRow label="Phone" value={form.phone || '---'} />
                <SummaryRow label="Plan" value={currentPlanDetails?.name || '---'} />

                <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Amount Due</Typography>
                  <Typography variant="h4" color="primary">
                    {fCurrency(currentPlanDetails?.variation_amount || 0, 'NGN')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!form.plan || form.phone.length < 10 || loading}
                  onClick={step === 'input' ? handleCheckAuth : handleFinalPurchase}
                  sx={{ py: 1.5, fontSize: '1rem' }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : step === 'input' ? (
                    'Proceed'
                  ) : (
                    'Confirm Purchase'
                  )}
                </Button>

                {step === 'auth' && (
                  <Button
                    fullWidth
                    color="inherit"
                    onClick={() => setStep('input')}
                    disabled={loading}
                  >
                    Back to Selection
                  </Button>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Receipt Modal */}
      <Dialog open={showSuccess} onClose={handleCloseSuccess} fullWidth maxWidth="xs">
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <Box
            sx={{
              mb: 3,
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.1),
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={64} color="success.main" />
          </Box>
          <Typography variant="h4" gutterBottom>
            Payment Sent!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {result?.message}
          </Typography>

          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 4, bgcolor: 'background.neutral', borderStyle: 'dashed' }}
          >
            <Stack spacing={1}>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>
                TRANSACTION REFERENCE
              </Typography>
              <Typography variant="subtitle2" sx={{ wordBreak: 'break-all' }}>
                {result?.ref}
              </Typography>
              <Divider />
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 'bold' }}>
                REMAINING BALANCE
              </Typography>
              <Typography variant="h6" color="primary.main">
                {fCurrency(result?.balance || 0, 'NGN')}
              </Typography>
            </Stack>
          </Paper>

          <Button fullWidth variant="contained" size="large" onClick={handleCloseSuccess}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textAlign: 'right', pl: 3 }}>
        {value}
      </Typography>
    </Stack>
  );
}
