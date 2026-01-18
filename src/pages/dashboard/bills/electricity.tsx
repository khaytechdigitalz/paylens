/* eslint-disable no-alert */
import { useState } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  Paper,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
// utils
import { fCurrency } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

const DISCOS = [
  { value: 'ikeja', label: 'Ikeja Electric', icon: 'solar:bolt-bold', color: '#ED1C24' },
  { value: 'eko', label: 'Eko Electric', icon: 'solar:bolt-bold', color: '#00A859' },
  { value: 'abuja', label: 'Abuja Electric', icon: 'solar:bolt-bold', color: '#2E3192' },
  { value: 'kano', label: 'Kano Electric', icon: 'solar:bolt-bold', color: '#F7941D' },
  { value: 'portharcourt', label: 'PHED', icon: 'solar:bolt-bold', color: '#0071BC' },
  { value: 'ibadan', label: 'IBEDC', icon: 'solar:bolt-bold', color: '#662D91' },
];

// ----------------------------------------------------------------------

ElectricityPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function ElectricityPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);

  const [customerData, setCustomerData] = useState<{ name: string; address: string } | null>(null);
  const [form, setForm] = useState({
    disco: '',
    meterType: 'prepaid',
    meterNumber: '',
    amount: '',
    pin: '',
  });

  const handleValidateMeter = async () => {
    if (form.meterNumber.length < 10) return;
    setValidating(true);
    setCustomerData(null);

    // Simulate API lookup for Meter details
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCustomerData({
      name: 'CHUKWUDI JOHNATHAN OBINNA',
      address: '14b Admiralty Way, Lekki Phase 1, Lagos',
    });
    setValidating(false);
  };

  const handlePayBill = async () => {
    setLoading(true);
    // Simulate API Payment & Token Generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSuccess(true);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title> Electricity Bill | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Electricity Bill
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Pay for your prepaid or postpaid meter instantly.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              {/* 1. DISCO Selection */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select Distribution Company (DISCO)
                </Typography>
                <Grid container spacing={2}>
                  {DISCOS.map((disco) => (
                    <Grid item xs={6} sm={4} key={disco.value}>
                      <Paper
                        variant="outlined"
                        onClick={() => {
                          setForm({ ...form, disco: disco.value });
                          setCustomerData(null);
                        }}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: '0.3s',
                          borderColor: form.disco === disco.value ? disco.color : 'divider',
                          bgcolor:
                            form.disco === disco.value ? alpha(disco.color, 0.05) : 'transparent',
                          borderWidth: form.disco === disco.value ? 2 : 1,
                        }}
                      >
                        <Iconify icon={disco.icon} width={32} sx={{ color: disco.color, mb: 1 }} />
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                          {disco.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* 2. Meter Details */}
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1, display: 'block' }}
                    >
                      METER TYPE
                    </Typography>
                    <ToggleButtonGroup
                      fullWidth
                      value={form.meterType}
                      exclusive
                      onChange={(e, val) => val && setForm({ ...form, meterType: val })}
                      size="small"
                      color="primary"
                    >
                      <ToggleButton value="prepaid">Prepaid</ToggleButton>
                      <ToggleButton value="postpaid">Postpaid</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <TextField
                    fullWidth
                    label="Meter Number"
                    placeholder="Enter 11-13 digit meter number"
                    value={form.meterNumber}
                    disabled={!form.disco}
                    onChange={(e) => {
                      setForm({ ...form, meterNumber: e.target.value });
                      setCustomerData(null);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="soft"
                            disabled={!form.meterNumber || validating}
                            onClick={handleValidateMeter}
                          >
                            {validating ? <CircularProgress size={16} /> : 'Verify'}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Collapse in={!!customerData}>
                    {customerData && (
                      <Alert severity="info" icon={<Iconify icon="solar:map-point-bold" />}>
                        <Typography variant="subtitle2">{customerData.name}</Typography>
                        <Typography variant="caption">{customerData.address}</Typography>
                      </Alert>
                    )}
                  </Collapse>

                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={form.amount}
                    disabled={!customerData}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    }}
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Transaction PIN"
                    value={form.pin}
                    disabled={!form.amount}
                    onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    inputProps={{
                      maxLength: 4,
                      style: { textAlign: 'center', letterSpacing: '10px' },
                    }}
                  />
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* RIGHT: SUMMARY */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 4,
                position: 'sticky',
                top: 100,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Payment Summary
              </Typography>

              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Utility
                  </Typography>
                  <Typography variant="subtitle2">{form.disco.toUpperCase() || '---'}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Meter Type
                  </Typography>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                    {form.meterType}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Meter No.
                  </Typography>
                  <Typography variant="subtitle2">{form.meterNumber || '---'}</Typography>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Amount</Typography>
                  <Typography variant="h4" color="primary">
                    {fCurrency(form.amount || 0, 'NGN')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!form.pin || loading}
                  onClick={handlePayBill}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Payment'}
                </Button>

                {success && (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Alert severity="success">Payment Successful!</Alert>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, textAlign: 'center', bgcolor: 'background.neutral' }}
                    >
                      <Typography variant="overline" color="text.secondary">
                        Your Prepaid Token
                      </Typography>
                      <Typography variant="h4" sx={{ letterSpacing: 4, my: 1 }}>
                        4492-1102-8831-0021
                      </Typography>
                      <Button size="small" startIcon={<Iconify icon="solar:copy-bold" />}>
                        Copy Token
                      </Button>
                    </Paper>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
