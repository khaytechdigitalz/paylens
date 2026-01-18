/* eslint-disable @typescript-eslint/no-shadow */
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
  CardActionArea,
  MenuItem,
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

const NETWORKS = [
  { value: 'mtn', label: 'MTN', icon: 'logos:mtn', color: '#FFCC00' },
  { value: 'airtel', label: 'Airtel', icon: 'logos:airtel', color: '#FF0000' },
  { value: 'glo', label: 'Glo', icon: 'logos:glo', color: '#28A745' },
  { value: '9mobile', label: '9mobile', icon: 'logos:9mobile', color: '#00533E' },
];

const DATA_PLANS: Record<string, { id: string; label: string; price: number; type: string }[]> = {
  mtn: [
    { id: 'm1', label: '1.5GB - 30 Days', price: 1200, type: 'Monthly' },
    { id: 'm2', label: '3.5GB - 30 Days', price: 2500, type: 'Monthly' },
    { id: 'm3', label: '10GB - 30 Days', price: 5000, type: 'Monthly' },
    { id: 'm4', label: '1GB - 1 Day', price: 350, type: 'Daily' },
  ],
  airtel: [
    { id: 'a1', label: '2GB - 30 Days', price: 1500, type: 'Monthly' },
    { id: 'a2', label: '5GB - 30 Days', price: 3000, type: 'Monthly' },
    { id: 'a3', label: '15GB - 30 Days', price: 6000, type: 'Monthly' },
  ],
  glo: [
    { id: 'g1', label: '2.5GB - 30 Days', price: 1000, type: 'Monthly' },
    { id: 'g2', label: '7GB - 30 Days', price: 2500, type: 'Monthly' },
  ],
};

// ----------------------------------------------------------------------

InternetDataPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function InternetDataPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ network: '', planId: '', phone: '', pin: '' });

  // Dynamically get available plans for selected network
  const availablePlans = useMemo(
    () => (form.network ? DATA_PLANS[form.network] || [] : []),
    [form.network]
  );

  // Get selected plan details
  const selectedPlan = useMemo(
    () => availablePlans.find((p) => p.id === form.planId),
    [availablePlans, form.planId]
  );

  const handlePurchase = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // API Sim
    setSuccess(true);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title> Buy Data | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Internet Data
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Top up your data balance instantly.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              {/* 1. Provider Selection */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select Network
                </Typography>
                <Grid container spacing={2}>
                  {NETWORKS.map((net) => (
                    <Grid item xs={6} sm={3} key={net.value}>
                      <Card
                        sx={{
                          border: (theme) =>
                            `2px solid ${
                              form.network === net.value
                                ? net.color
                                : alpha(theme.palette.divider, 0.1)
                            }`,
                          transition: '0.3s',
                        }}
                      >
                        <CardActionArea
                          onClick={() => setForm({ ...form, network: net.value, planId: '' })}
                          sx={{ p: 2, textAlign: 'center' }}
                        >
                          <Iconify icon={net.icon} width={32} />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}
                          >
                            {net.label}
                          </Typography>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* 2. Form Details */}
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Recipient Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    inputProps={{ maxLength: 11 }}
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
                    label="Select Data Plan"
                    value={form.planId}
                    disabled={!form.network}
                    onChange={(e) => setForm({ ...form, planId: e.target.value })}
                    helperText={!form.network ? 'Please select a network first' : ''}
                  >
                    {availablePlans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ width: '100%' }}
                        >
                          <Typography variant="body2">{plan.label}</Typography>
                          <Typography variant="subtitle2" color="primary">
                            {fCurrency(plan.price, 'NGN')}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    type="password"
                    label="Security PIN"
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    inputProps={{
                      maxLength: 4,
                      style: { textAlign: 'center', letterSpacing: '10px', fontSize: '20px' },
                    }}
                  />
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* RIGHT: SUMMARY SECTION */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, bgcolor: 'background.neutral' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Purchase Details
              </Typography>

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Network
                  </Typography>
                  <Typography variant="subtitle2" sx={{ textTransform: 'uppercase' }}>
                    {form.network || '---'}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Plan
                  </Typography>
                  <Typography variant="subtitle2" sx={{ textAlign: 'right' }}>
                    {selectedPlan?.label || '---'}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Recipient
                  </Typography>
                  <Typography variant="subtitle2">{form.phone || '---'}</Typography>
                </Stack>

                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Total Cost</Typography>
                  <Typography variant="h4" color="primary">
                    {fCurrency(selectedPlan?.price || 0, 'NGN')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={
                    !form.planId || form.phone.length < 11 || form.pin.length < 4 || loading
                  }
                  onClick={handlePurchase}
                  sx={{ py: 1.5, mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Activate Data'}
                </Button>

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Data activated successfully!
                  </Alert>
                )}
              </Stack>
            </Card>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 1.5,
                border: '1px dashed',
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Stack direction="row" spacing={1}>
                <Iconify icon="solar:info-circle-bold" sx={{ color: 'primary.main' }} />
                <Typography variant="caption" sx={{ color: 'primary.darker' }}>
                  Data plans are valid for the specified duration from the moment of activation. No
                  refunds for wrong phone numbers.
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
