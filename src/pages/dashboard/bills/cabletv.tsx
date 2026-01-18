/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-alert */
import { useState, useMemo } from 'react';
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
  MenuItem,
  Paper,
  Collapse,
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

const PROVIDERS = [
  { value: 'dstv', label: 'DSTV', icon: 'logos:dstv-icon', color: '#00AEEF' },
  { value: 'gotv', label: 'GOTV', icon: 'logos:gotv', color: '#E31E24' },
  { value: 'startimes', label: 'StarTimes', icon: 'logos:startimes-icon', color: '#FFD100' },
];

const PACKAGES: Record<string, { id: string; label: string; price: number }[]> = {
  dstv: [
    { id: 'd1', label: 'DSTV Premium', price: 29500 },
    { id: 'd2', label: 'DSTV Compact Plus', price: 19800 },
    { id: 'd3', label: 'DSTV Confam', price: 7400 },
  ],
  gotv: [
    { id: 'g1', label: 'GOTV Supa+', price: 12500 },
    { id: 'g2', label: 'GOTV Max', price: 5700 },
    { id: 'g3', label: 'GOTV Jinja', price: 2700 },
  ],
};

// ----------------------------------------------------------------------

CableTVPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function CableTVPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const [form, setForm] = useState({ provider: '', iucNumber: '', packageId: '', pin: '' });

  const availablePackages = useMemo(
    () => (form.provider ? PACKAGES[form.provider] || [] : []),
    [form.provider]
  );
  const selectedPackage = useMemo(
    () => availablePackages.find((p) => p.id === form.packageId),
    [availablePackages, form.packageId]
  );

  // SIMULATE ACCOUNT VALIDATION
  const handleValidateIUC = async () => {
    if (form.iucNumber.length < 10) return;
    setValidating(true);
    setCustomerName('');

    // Simulate API lookup
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCustomerName('EMMANUEL OLUWASEUN ADEBAYO');
    setValidating(false);
  };

  const handlePaySubscription = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSuccess(true);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title> Cable TV | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Cable TV
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Renew your TV subscription instantly.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              {/* 1. Provider Picker */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Choose Provider
                </Typography>
                <Grid container spacing={2}>
                  {PROVIDERS.map((item) => (
                    <Grid item xs={4} key={item.value}>
                      <Paper
                        variant="outlined"
                        onClick={() =>
                          setForm({ ...form, provider: item.value, packageId: '', iucNumber: '' })
                        }
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: '0.3s',
                          borderColor: form.provider === item.value ? item.color : 'divider',
                          bgcolor:
                            form.provider === item.value ? alpha(item.color, 0.05) : 'transparent',
                          borderWidth: form.provider === item.value ? 2 : 1,
                        }}
                      >
                        <Iconify icon={item.icon} width={40} height={40} />
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}
                        >
                          {item.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* 2. Account Validation */}
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="SmartCard / IUC Number"
                    placeholder="Enter 10-11 digit number"
                    value={form.iucNumber}
                    disabled={!form.provider}
                    onChange={(e) => {
                      setForm({ ...form, iucNumber: e.target.value });
                      setCustomerName('');
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="soft"
                            onClick={handleValidateIUC}
                            disabled={!form.iucNumber || validating}
                          >
                            {validating ? <CircularProgress size={16} /> : 'Verify'}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Collapse in={!!customerName}>
                    <Alert
                      icon={<Iconify icon="solar:user-check-bold" />}
                      severity="success"
                      sx={{ mb: 1 }}
                    >
                      Customer: <strong>{customerName}</strong>
                    </Alert>
                  </Collapse>

                  <TextField
                    select
                    fullWidth
                    label="Select Package"
                    value={form.packageId}
                    disabled={!customerName}
                    onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                  >
                    {availablePackages.map((pkg) => (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ width: '100%' }}
                        >
                          <Typography variant="body2">{pkg.label}</Typography>
                          <Typography variant="subtitle2">{fCurrency(pkg.price, 'NGN')}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    type="password"
                    label="Transaction PIN"
                    value={form.pin}
                    disabled={!form.packageId}
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

          {/* RIGHT: CHECKOUT */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, position: 'sticky', top: 100 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Subscription Summary</Typography>

                <Stack spacing={2}>
                  <SummaryRow label="Provider" value={form.provider.toUpperCase() || '---'} />
                  <SummaryRow label="Account Name" value={customerName || '---'} />
                  <SummaryRow label="Package" value={selectedPackage?.label || '---'} />

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">Total Payable</Typography>
                    <Typography variant="h4" color="primary">
                      {fCurrency(selectedPackage?.price || 0, 'NGN')}
                    </Typography>
                  </Stack>

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={!form.pin || loading}
                    onClick={handlePaySubscription}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay Subscription'}
                  </Button>

                  {success && (
                    <Stack spacing={2}>
                      <Alert severity="success">Subscription successful!</Alert>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                      >
                        Download Receipt
                      </Button>
                    </Stack>
                  )}
                </Stack>
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
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  );
}
