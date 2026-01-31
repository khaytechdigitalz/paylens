/* eslint-disable prefer-destructuring */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useSnackbar } from 'notistack';
// @mui
import {
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  alpha,
  useTheme,
  CardHeader,
} from '@mui/material';
// auth
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
// utils
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

BusinessSettingsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function BusinessSettingsPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState('NGN');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    base_currency: 'NGN',
    fee_bearer: 'merchant',
    automated_settlement: true,
    authentication_method: 'pin',
    pin: '',
    confirm_pin: '',
    ngn_single_limit: 0,
    ngn_daily_limit: 0,
    usd_single_limit: 0,
    usd_daily_limit: 0,
    gbp_single_limit: 0,
    gbp_daily_limit: 0,
  });

  const [openPinModal, setOpenPinModal] = useState(false);

  const getBusinessSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/businesssettings');
      const data = response.data.data;
      setForm((prev) => ({
        ...prev,
        ...data,
        automated_settlement: Boolean(data.automated_settlement),
        ngn_single_limit: Number(data.ngn_single_limit),
        ngn_daily_limit: Number(data.ngn_daily_limit),
        usd_single_limit: Number(data.usd_single_limit),
        usd_daily_limit: Number(data.usd_daily_limit),
        gbp_single_limit: Number(data.gbp_single_limit),
        gbp_daily_limit: Number(data.gbp_daily_limit),
      }));
    } catch (error) {
      enqueueSnackbar('Failed to load settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    getBusinessSettings();
  }, [getBusinessSettings]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await axios.post('/businesssettings/update', form);
      enqueueSnackbar('Business configuration updated!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update settings', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Head>
        <title> Configuration | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3">Settings</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Control your business transaction limits and preferences.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={
              submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="eva:save-fill" />
              )
            }
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ boxShadow: theme.customShadows.primary }}
          >
            Save Changes
          </Button>
        </Stack>

        <Grid container spacing={4}>
          {/* Left Column: Limits & Core Settings */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 4, overflow: 'hidden' }}>
              <CardHeader
                title="Transaction Limits"
                subheader="Set maximum amounts for different currencies"
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
              />
              <Divider />
              <Tabs
                value={currentTab}
                onChange={(e, v) => setCurrentTab(v)}
                sx={{ px: 3, bgcolor: alpha(theme.palette.primary.main, 0.03) }}
              >
                {['NGN', 'USD', 'GBP'].map((tab) => (
                  <Tab key={tab} label={tab} value={tab} />
                ))}
              </Tabs>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={`${currentTab} Single Limit`}
                      type="number"
                      value={form[`${currentTab.toLowerCase()}_single_limit` as keyof typeof form]}
                      onChange={(e) =>
                        handleChange(
                          `${currentTab.toLowerCase()}_single_limit`,
                          Number(e.target.value)
                        )
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">{currentTab}</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={`${currentTab} Daily Limit`}
                      type="number"
                      value={form[`${currentTab.toLowerCase()}_daily_limit` as keyof typeof form]}
                      onChange={(e) =>
                        handleChange(
                          `${currentTab.toLowerCase()}_daily_limit`,
                          Number(e.target.value)
                        )
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">{currentTab}</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Card>

            <Card sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Fee Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Decide who covers processing costs during checkout.
              </Typography>
              <TextField
                select
                fullWidth
                value={form.fee_bearer}
                onChange={(e) => handleChange('fee_bearer', e.target.value)}
              >
                <MenuItem value="merchant">Merchant (I absorb the fees)</MenuItem>
                <MenuItem value="customer">Customer (Fees added to order total)</MenuItem>
              </TextField>
            </Card>
          </Grid>

          {/* Right Column: Security & Settlements */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      borderRadius: 1,
                      display: 'flex',
                    }}
                  >
                    <Iconify icon="eva:shield-fill" sx={{ color: 'warning.main' }} />
                  </Box>
                  <Typography variant="subtitle1">Security Level</Typography>
                </Stack>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Authentication"
                  value={form.authentication_method}
                  onChange={(e) => handleChange('authentication_method', e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="otp">Email OTP</MenuItem>
                  <MenuItem value="pin">Transaction PIN</MenuItem>
                </TextField>

                {form.authentication_method === 'pin' && (
                  <Button
                    fullWidth
                    variant="soft"
                    onClick={() => setOpenPinModal(true)}
                    startIcon={<Iconify icon="eva:lock-outline" />}
                  >
                    {form.pin ? 'PIN Prepared' : 'Setup Transaction PIN'}
                  </Button>
                )}
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Auto-Settlement
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.automated_settlement}
                      onChange={(e) => handleChange('automated_settlement', e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="caption" color="text.secondary">
                      When enabled, funds are swept to your bank account automatically.
                    </Typography>
                  }
                />
              </Card>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  border: `1px dashed ${theme.palette.info.main}`,
                }}
              >
                <Stack direction="row" spacing={1}>
                  <Iconify icon="eva:info-fill" sx={{ color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'info.darker' }}>
                    Changes to daily limits may take up to 2 hours to reflect across all payment
                    channels.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* --- PIN MODAL --- */}
        <Dialog open={openPinModal} onClose={() => setOpenPinModal(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>Security PIN</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="New 4-Digit PIN"
                type="password"
                value={form.pin}
                onChange={(e) => handleChange('pin', e.target.value)}
                inputProps={{
                  maxLength: 4,
                  style: { textAlign: 'center', letterSpacing: '0.8rem', fontSize: '1.2rem' },
                }}
              />
              <TextField
                fullWidth
                label="Confirm PIN"
                type="password"
                value={form.confirm_pin}
                onChange={(e) => handleChange('confirm_pin', e.target.value)}
                inputProps={{
                  maxLength: 4,
                  style: { textAlign: 'center', letterSpacing: '0.8rem', fontSize: '1.2rem' },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setOpenPinModal(false)}
            >
              Apply PIN
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
