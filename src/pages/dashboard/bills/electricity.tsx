/* eslint-disable new-cap */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-alert */
import { useState, useEffect, useCallback, useRef } from 'react';
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
  Paper,
  Dialog,
  DialogContent,
  ToggleButton,
  ToggleButtonGroup,
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

ElectricityPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function ElectricityPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Data States
  const [providers, setProviders] = useState<any[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
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
  const [form, setForm] = useState({
    meter: '',
    type: 'prepaid',
    customer: '',
    amount: '',
    pin: '',
  });
  const [result, setResult] = useState<any>(null);

  // Fetch Electricity Providers (Discos)
  const fetchProviders = useCallback(async () => {
    try {
      const response = await axios.get('/bills/electricity/providers');
      setProviders(response.data.data);
    } catch (error) {
      setErrorMessage('Failed to load electricity providers.');
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Verify Meter Number
  const handleVerifyCustomer = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/electricity/verify', {
        meter: form.meter,
        type: form.type,
        customer: form.customer,
      });
      setVerifiedName(response.data.customer);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Meter verification failed. Please check the number.');
      setVerifiedName(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Security Auth Check
  const handleCheckAuth = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/payouts/check_auth');
      setAuthType(response.data.status === 'pin_required' ? 'pin' : 'otp');
      setAuthMessage(response.data.message);
      setStep('auth');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Security verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Final Process Purchase
  const handleFinalPurchase = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post('/bills/electricity/buy', {
        meter: form.meter,
        customer: form.customer,
        amount: form.amount,
        type: form.type,
        pin: form.pin,
      });
      setResult(response.data);
      setShowSuccess(true);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Transaction could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  // Safe 4-Digit String Split Token Formatter
  const formatTokenString = (rawToken: string) => {
    if (!rawToken) return 'N/A';
    const cleaned = rawToken.replace(/[:-\s Token]/g, '');
    return cleaned.match(/.{1,5}/g)?.join(' ') || rawToken;
  };

  // Document Isolation PDF Generation Pipeline
  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !result) return;
    setPdfLoading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const originalElement = receiptRef.current;
      const clonedElement = originalElement.cloneNode(true) as HTMLDivElement;

      // Lock parameters onto the cloned canvas instance to avoid modal viewport crop limits
      clonedElement.style.width = '420px';
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.height = 'auto';
      clonedElement.style.backgroundColor = theme.palette.background.paper;
      document.body.appendChild(clonedElement);

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: theme.palette.background.paper,
      });

      document.body.removeChild(clonedElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const marginX = 20;
      const imgWidth = pdfWidth - marginX * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const topPosition = (pdfHeight - imgHeight) / 2 > 15 ? (pdfHeight - imgHeight) / 2 : 15;

      pdf.addImage(imgData, 'PNG', marginX, topPosition, imgWidth, imgHeight);
      pdf.save(`CredDot_Utility_Token_${result?.payout_ref || 'Receipt'}.pdf`);
    } catch (error) {
      console.error('PDF Build Execution Fault:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const selectedDisco = providers.find((p) => p.networkid === form.meter);

  return (
    <>
      <Head>
        <title>Electricity Bills | CredDot</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3">Electricity Bill</Typography>
          <Typography variant="body2" color="text.secondary">
            Pay your Disco bills and get tokens instantly.
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
              {/* Step 1: Provider Selection */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  1. Select Distribution Company (Disco)
                </Typography>
                <Grid container spacing={2}>
                  {providers.map((p) => (
                    <Grid item xs={6} sm={4} key={p.networkid}>
                      <CardActionArea
                        onClick={() => {
                          setForm({ ...form, meter: p.networkid });
                          setVerifiedName(null);
                        }}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          textAlign: 'center',
                          border: `2px solid ${
                            form.meter === p.networkid
                              ? theme.palette.primary.main
                              : alpha(theme.palette.divider, 0.1)
                          }`,
                          bgcolor:
                            form.meter === p.networkid
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                        }}
                      >
                        <Avatar
                          src={p.logo}
                          sx={{
                            width: 56,
                            height: 56,
                            mx: 'auto',
                            mb: 1,
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {p.name}
                        </Typography>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Step 2: Meter Details */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 3 }}>
                  2. Meter Details & Amount
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
                    >
                      Meter Type
                    </Typography>
                    <ToggleButtonGroup
                      fullWidth
                      value={form.type}
                      exclusive
                      onChange={(e, val) => {
                        if (val) setForm({ ...form, type: val });
                        setVerifiedName(null);
                      }}
                    >
                      <ToggleButton value="prepaid">Prepaid</ToggleButton>
                      <ToggleButton value="postpaid">Postpaid</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <TextField
                    fullWidth
                    label="Meter Number"
                    value={form.customer}
                    onChange={(e) => {
                      setForm({ ...form, customer: e.target.value });
                      setVerifiedName(null);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleVerifyCustomer}
                            disabled={!form.meter || !form.customer || isVerifying}
                          >
                            {isVerifying ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {verifiedName && (
                    <Alert icon={<Iconify icon="solar:user-check-bold" />} severity="success">
                      Meter Registered to: <strong>{verifiedName}</strong>
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Amount to Pay"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    }}
                  />

                  {step === 'auth' && (
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: 'background.neutral',
                        border: `1px dashed ${theme.palette.primary.main}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        {authMessage}
                      </Typography>
                      <TextField
                        fullWidth
                        autoFocus
                        type={authType === 'pin' ? 'password' : 'text'}
                        label={authType === 'pin' ? 'Transaction PIN' : 'OTP Code'}
                        value={form.pin}
                        onChange={(e) => setForm({ ...form, pin: e.target.value })}
                        inputProps={{
                          maxLength: authType === 'pin' ? 4 : 6,
                          style: { textAlign: 'center', letterSpacing: 10, fontWeight: 'bold' },
                        }}
                      />
                    </Paper>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Review Sidebar */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Payment Summary
              </Typography>
              <Stack spacing={2.5}>
                <ReviewRow label="Disco" value={selectedDisco?.name || '---'} />
                <ReviewRow label="Meter Type" value={form.type.toUpperCase()} />
                <ReviewRow label="Meter Number" value={form.customer || '---'} />
                <ReviewRow label="Customer" value={verifiedName || '---'} />

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Total Amount</Typography>
                  <Typography variant="h4" color="primary">
                    {fCurrency(form.amount || 0, 'NGN')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!verifiedName || !form.amount || loading}
                  onClick={step === 'input' ? handleCheckAuth : handleFinalPurchase}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : step === 'input' ? (
                    'Proceed'
                  ) : (
                    'Purchase Token'
                  )}
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Modal */}
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} fullWidth maxWidth="xs">
        <DialogContent sx={{ textAlign: 'center', py: 5, px: 3 }}>
          {/* ISOLATED COMPONENT FOR STABLE DOM RENDERING */}
          <Box ref={receiptRef} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Stack alignItems="center" sx={{ textAlign: 'center', mb: 3 }}>
              <Iconify
                icon="solar:bolt-circle-bold"
                width={64}
                color="warning.main"
                sx={{ mb: 1.5 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Payment Successful
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result?.message || 'Token provision successful'}
              </Typography>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 1,
                bgcolor: 'background.neutral',
                borderRadius: 1.5,
                borderStyle: 'solid',
              }}
            >
              <Stack spacing={1.8}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Total Paid
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {fCurrency(result?.data?.total || form.amount || 0, 'NGN')}
                  </Typography>
                </Stack>
                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Reference
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  >
                    {result?.payout_ref || 'N/A'}
                  </Typography>
                </Stack>
                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Unit Earned
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {result?.data?.unit || '0.0'} kWh
                  </Typography>
                </Stack>
                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Wallet Balance
                  </Typography>
                  <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                    {fCurrency(result?.data?.balance_after || 0, 'NGN')}
                  </Typography>
                </Stack>

                {result?.data?.token && (
                  <>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Box sx={{ mt: 1, pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
                      <Typography
                        variant="overline"
                        color="warning.dark"
                        sx={{ display: 'block', fontWeight: 800, mb: 0.5, letterSpacing: 0.5 }}
                      >
                        Prepaid Meter Token Pin
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            letterSpacing: 1,
                            color: 'text.primary',
                          }}
                        >
                          {formatTokenString(result.data.token)}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Box>

          <Stack spacing={1.5} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={pdfLoading}
              onClick={handleDownloadPDF}
              startIcon={
                pdfLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="solar:file-download-bold-duotone" />
                )
              }
              sx={{
                bgcolor: 'grey.900',
                color: 'common.white',
                '&:hover': { bgcolor: 'grey.800' },
                fontWeight: 700,
                height: 48,
              }}
            >
              {pdfLoading ? 'Generating...' : 'Download PDF Receipt'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={() => setShowSuccess(false)}
              sx={{ fontWeight: 700, height: 48 }}
            >
              Dismiss
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
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
