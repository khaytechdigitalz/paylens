/* eslint-disable @typescript-eslint/no-shadow */
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
  CardActionArea,
  Avatar,
  Tooltip,
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

const PRESETS = [200, 500, 1000, 2000, 5000, 10000];

const RECENT_BENEFICIARIES = [
  {
    name: 'Mom',
    phone: '08031234567',
    network: 'mtn',
    avatar: 'https://api-dev-minimal-v4.vercel.app/assets/images/avatars/avatar_1.jpg',
  },
  {
    name: 'Wife',
    phone: '09055566677',
    network: 'glo',
    avatar: 'https://api-dev-minimal-v4.vercel.app/assets/images/avatars/avatar_2.jpg',
  },
  { name: 'Office Tab', phone: '08123334445', network: 'airtel', avatar: '' },
];

// ----------------------------------------------------------------------

AirtimePage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function AirtimePage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ network: '', phone: '', amount: '', pin: '' });

  const selectedNetworkData = NETWORKS.find((n) => n.value === form.network);

  const handleSelectRecent = (contact: typeof RECENT_BENEFICIARIES[0]) => {
    setForm({ ...form, phone: contact.phone, network: contact.network });
  };

  const handleBuyAirtime = async () => {
    setLoading(true);
    // Real API implementation would happen here
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSuccess(true);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title> Instant Top-up | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Airtime Top-up
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Instant recharge for yourself and loved ones.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              {/* 1. Frequent Beneficiaries */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Quick Select
                </Typography>
                <Stack direction="row" spacing={3}>
                  {RECENT_BENEFICIARIES.map((contact) => (
                    <Stack
                      key={contact.phone}
                      alignItems="center"
                      spacing={1}
                      onClick={() => handleSelectRecent(contact)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    >
                      <Tooltip title={`${contact.phone} (${contact.network.toUpperCase()})`}>
                        <Avatar
                          src={contact.avatar}
                          sx={{
                            width: 56,
                            height: 56,
                            border:
                              form.phone === contact.phone
                                ? `3px solid ${theme.palette.primary.main}`
                                : 'none',
                          }}
                        >
                          {contact.name.charAt(0)}
                        </Avatar>
                      </Tooltip>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {contact.name}
                      </Typography>
                    </Stack>
                  ))}
                  <Stack alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        border: '1px dashed',
                      }}
                    >
                      <Iconify icon="solar:user-plus-bold" />
                    </Avatar>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Add New
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* 2. Network Selection */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select Provider
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
                          boxShadow:
                            form.network === net.value
                              ? `0 0 12px ${alpha(net.color, 0.2)}`
                              : 'none',
                        }}
                      >
                        <CardActionArea
                          onClick={() => setForm({ ...form, network: net.value })}
                          sx={{ p: 2, textAlign: 'center' }}
                        >
                          <Iconify icon={net.icon} width={32} height={32} sx={{ mb: 1 }} />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 'bold', display: 'block' }}
                          >
                            {net.label}
                          </Typography>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* 3. Transaction Details */}
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:phone-bold-duotone" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box>
                    <TextField
                      fullWidth
                      label="Amount"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                      }}
                    />
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                      {PRESETS.map((amt) => (
                        <Button
                          key={amt}
                          variant="soft"
                          onClick={() => setForm({ ...form, amount: amt.toString() })}
                          sx={{ borderRadius: 1 }}
                        >
                          ₦{amt.toLocaleString()}
                        </Button>
                      ))}
                    </Stack>
                  </Box>

                  <TextField
                    fullWidth
                    type="password"
                    label="Transaction PIN"
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    inputProps={{
                      maxLength: 4,
                      style: { textAlign: 'center', letterSpacing: '15px', fontSize: '24px' },
                    }}
                  />
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* RIGHT: CHECKOUT SUMMARY */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 4,
                position: 'sticky',
                top: 100,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
                    theme.palette.background.paper,
                    1
                  )} 100%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Order Review
              </Typography>

              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Provider
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {selectedNetworkData ? (
                      <Iconify icon={selectedNetworkData.icon} width={20} />
                    ) : null}
                    <Typography variant="subtitle2">
                      {selectedNetworkData?.label || '---'}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Phone
                  </Typography>
                  <Typography variant="subtitle2">{form.phone || '---'}</Typography>
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
                  disabled={
                    !form.network ||
                    form.phone.length < 11 ||
                    !form.amount ||
                    form.pin.length < 4 ||
                    loading
                  }
                  onClick={handleBuyAirtime}
                  sx={{ py: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Recharge'}
                </Button>

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Recharge successful!
                  </Alert>
                )}
              </Stack>
              <Box
                sx={{ mt: 4, p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.08) }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Iconify icon="solar:info-circle-bold" sx={{ color: 'info.main' }} />
                  <Typography variant="caption" sx={{ color: 'info.darker' }}>
                    Airtime is usually credited within seconds. If you experience delays, please
                    contact support with your reference ID.
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
