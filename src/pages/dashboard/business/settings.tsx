import { useState } from 'react';
// next
import Head from 'next/head';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';

// ----------------------------------------------------------------------

BusinessSettingsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------

export default function BusinessSettingsPage() {
  const { themeStretch } = useSettingsContext();

  // Main Business Settings State
  const [settings, setSettings] = useState({
    feeBearer: 'merchant',
    authType: 'otp',
    enableNotifications: true,
    autoSettle: false,
    currency: 'NGN',
    hasPinSet: false,
  });

  // Multi-Currency Limits State
  const [limits, setLimits] = useState<Record<string, { single: number; daily: number }>>({
    NGN: { single: 500000, daily: 2000000 },
    USD: { single: 1000, daily: 5000 },
    GBP: { single: 800, daily: 4000 },
  });

  // PIN Setup Modal States
  const [openPinModal, setOpenPinModal] = useState(false);
  const [pinData, setPinData] = useState({ pin: '', confirm: '' });
  const [pinError, setPinError] = useState('');

  const handleLimitChange = (field: 'single' | 'daily', value: number) => {
    setLimits((prev) => ({
      ...prev,
      [settings.currency]: { ...prev[settings.currency], [field]: value },
    }));
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'authType' && value === 'pin' && !settings.hasPinSet) {
      setOpenPinModal(true);
      return;
    }
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePin = () => {
    setPinError('');
    if (pinData.pin.length !== 4) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }
    if (pinData.pin !== pinData.confirm) {
      setPinError('PINs do not match');
      return;
    }
    setSettings((prev) => ({ ...prev, hasPinSet: true, authType: 'pin' }));
    setPinData({ pin: '', confirm: '' });
    setOpenPinModal(false);
  };

  const currentLimit = limits[settings.currency];

  return (
    <>
      <Head>
        <title> Business Settings | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h3">Business Settings</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure financial limits per currency and manage security preferences.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Financial Controls Column */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6">Financial Controls</Typography>
                  <TextField
                    select
                    size="small"
                    label="Currency"
                    value={settings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    sx={{ width: 120 }}
                  >
                    {['NGN', 'USD', 'GBP'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={`Single Limit (${settings.currency})`}
                      type="number"
                      value={currentLimit.single}
                      onChange={(e) => handleLimitChange('single', Number(e.target.value))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">{settings.currency}</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={`Daily Limit (${settings.currency})`}
                      type="number"
                      value={currentLimit.daily}
                      onChange={(e) => handleLimitChange('daily', Number(e.target.value))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">{settings.currency}</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Fee Bearer"
                      value={settings.feeBearer}
                      onChange={(e) => handleChange('feeBearer', e.target.value)}
                    >
                      <MenuItem value="merchant">Merchant (Business pays fees)</MenuItem>
                      <MenuItem value="customer">Customer (Fee added to checkout)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Operations & Preferences
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSettle}
                        onChange={(e) => handleChange('autoSettle', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Automated Settlement</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Payout to bank account every 24 hours.
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableNotifications}
                        onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">Transaction Email Alerts</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Notifications for every successful payment.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Security & Status Column */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <Iconify icon="eva:shield-fill" sx={{ color: 'primary.main' }} />
                  <Typography variant="h6">Security Validation</Typography>
                </Stack>

                <TextField
                  fullWidth
                  select
                  label="Authentication Method"
                  value={settings.authType}
                  onChange={(e) => handleChange('authType', e.target.value)}
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="otp">One-Time Password (OTP)</MenuItem>
                  <MenuItem value="pin">Static Transaction PIN</MenuItem>
                </TextField>

                {settings.authType === 'pin' && settings.hasPinSet && (
                  <Button
                    variant="soft"
                    fullWidth
                    startIcon={<Iconify icon="eva:edit-fill" />}
                    onClick={() => setOpenPinModal(true)}
                  >
                    Change Transaction PIN
                  </Button>
                )}
              </Card>

              <Card sx={{ p: 3, bgcolor: 'primary.lighter' }}>
                <Typography variant="subtitle1" sx={{ color: 'primary.darker', mb: 1 }}>
                  Verification Status
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
                  <Typography variant="body2" sx={{ color: 'primary.darker', fontWeight: 'bold' }}>
                    Tier 3 Merchant
                  </Typography>
                </Stack>
              </Card>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => alert(`Settings for ${settings.currency} Saved!`)}
              >
                Save All Changes
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* --- PIN DIALOG --- */}
        <Dialog open={openPinModal} onClose={() => setOpenPinModal(false)}>
          <DialogTitle>{settings.hasPinSet ? 'Update' : 'Set'} Transaction PIN</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={3}>
              {pinError && <Alert severity="error">{pinError}</Alert>}
              <TextField
                fullWidth
                label="4-Digit PIN"
                type="password"
                value={pinData.pin}
                onChange={(e) => setPinData({ ...pinData, pin: e.target.value })}
                inputProps={{
                  maxLength: 4,
                  style: {
                    textAlign: 'center',
                    letterSpacing: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Confirm PIN"
                type="password"
                value={pinData.confirm}
                onChange={(e) => setPinData({ ...pinData, confirm: e.target.value })}
                inputProps={{
                  maxLength: 4,
                  style: {
                    textAlign: 'center',
                    letterSpacing: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button color="inherit" onClick={() => setOpenPinModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSavePin}>
              Save PIN
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
