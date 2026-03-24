/* eslint-disable no-nested-ternary */
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
  TextField,
  Box,
  Divider,
  Paper,
  IconButton,
  alpha,
  useTheme,
  Switch,
  FormControlLabel,
  Skeleton,
  Autocomplete,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
// utils
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

SettlementSetupPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function SettlementSetupPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  // States
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    bank_name: '',
    bank_code: '',
    account_number: '',
    account_name: '',
  });

  const initPage = useCallback(async () => {
    try {
      setLoadingBanks(true);
      setLoadingAccounts(true);
      const [bankRes, accountRes] = await Promise.all([
        axios.get('/monnify/banklist'),
        axios.get('/businesssettings/settlement/accounts'),
      ]);
      if (bankRes.data.status === 'success') setBanks(bankRes.data.banks);
      if (accountRes.data.status === 'success') setSavedAccounts(accountRes.data.data);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Initialization failed', {
        variant: 'error',
      });
    } finally {
      setLoadingBanks(false);
      setLoadingAccounts(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    initPage();
  }, [initPage]);

  const handleSetDefault = async (accountId: number) => {
    try {
      const response = await axios.post('/businesssettings/settlement/account/default', {
        account_id: accountId,
      });
      enqueueSnackbar(response.data.message || 'Primary account updated', { variant: 'success' });
      const accountRes = await axios.get('/businesssettings/settlement/accounts');
      setSavedAccounts(accountRes.data.data);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Update failed', { variant: 'error' });
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setIsVerified(false);
    try {
      const response = await axios.post('/monnify/validateaccount', {
        bank_code: formData.bank_code,
        account_number: formData.account_number,
      });
      if (response.data.ok) {
        setFormData((prev) => ({ ...prev, account_name: response.data.message }));
        setIsVerified(true);
        enqueueSnackbar('Account verified', { variant: 'success' });
      } else {
        enqueueSnackbar(response.data.message || 'Identity check failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Verification error', { variant: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.post('/businesssettings/settlement/save', {
        bankname: formData.bank_name,
        bankcode: formData.bank_code,
        accountnumber: formData.account_number,
        accountname: formData.account_name,
      });
      enqueueSnackbar(response.data.message || 'Account linked successfully', {
        variant: 'success',
      });
      setFormData({ bank_name: '', bank_code: '', account_number: '', account_name: '' });
      setIsVerified(false);
      initPage();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to save', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const glassStyle = {
    backdropFilter: 'blur(10px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    boxShadow: theme.customShadows.z20,
  };

  return (
    <>
      <Head>
        <title> Settlement | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            Settlement Channels
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage your payout destinations with ease.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Card sx={{ p: 3, ...glassStyle }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Iconify icon="solar:add-circle-bold-duotone" width={24} color="primary.main" />
                  Link New Bank
                </Typography>

                <Stack spacing={2.5}>
                  <Autocomplete
                    fullWidth
                    options={banks}
                    loading={loadingBanks}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, newValue) => {
                      setFormData({
                        ...formData,
                        bank_code: newValue?.code || '',
                        bank_name: newValue?.name || '',
                      });
                      setIsVerified(false);
                    }}
                    renderInput={(params) => <TextField {...params} label="Search Bank Name" />}
                  />

                  <TextField
                    fullWidth
                    label="Account Number"
                    value={formData.account_number}
                    onChange={(e) => {
                      setFormData({ ...formData, account_number: e.target.value });
                      setIsVerified(false);
                    }}
                    inputProps={{ maxLength: 10 }}
                  />

                  {isVerified && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Verified Beneficiary
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="success.darker"
                        sx={{ textTransform: 'uppercase' }}
                      >
                        {formData.account_name}
                      </Typography>
                    </Box>
                  )}

                  <LoadingButton
                    fullWidth
                    size="large"
                    variant="contained"
                    loading={verifying || saving}
                    onClick={isVerified ? handleSave : handleVerify}
                    disabled={formData.account_number.length < 10 || !formData.bank_code}
                    sx={{ height: 54, borderRadius: 1.5 }}
                  >
                    {isVerified ? 'Confirm & Link Account' : 'Identify Account'}
                  </LoadingButton>
                </Stack>
              </Card>

              <Card
                sx={{
                  p: 3,
                  bgcolor: 'grey.900',
                  color: 'common.white',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Iconify
                  icon="solar:lightbulb-minimalistic-bold-duotone"
                  width={80}
                  sx={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.15 }}
                />
                <Typography variant="subtitle2" color="primary.light" sx={{ mb: 1 }}>
                  Settlement Tip
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.875rem' }}>
                  Standard settlements are disbursed daily. You can have multiple accounts but only
                  one can be active at a time.
                </Typography>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Configured Accounts</Typography>
            </Box>

            <Grid container spacing={2}>
              {loadingAccounts ? (
                [...Array(2)].map((_, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))
              ) : savedAccounts.length > 0 ? (
                savedAccounts.map((account) => (
                  <Grid item xs={12} sm={6} key={account.id}>
                    <Paper
                      sx={{
                        p: 3,
                        position: 'relative',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        ...glassStyle,
                        border:
                          account.is_default === 1
                            ? `2px solid ${theme.palette.primary.main}`
                            : glassStyle.border,
                        '&:hover': { transform: 'scale(1.02)', boxShadow: theme.customShadows.z24 },
                      }}
                    >
                      {account.is_default === 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            px: 1.5,
                            py: 0.5,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: 1,
                            typography: 'caption',
                            fontWeight: 'bold',
                          }}
                        >
                          PRIMARY
                        </Box>
                      )}

                      <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                            }}
                          >
                            <Iconify
                              icon="solar:bank-bold-duotone"
                              width={28}
                              color="primary.main"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1">{account.bank_name}</Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                            >
                              {account.mode.toUpperCase()}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box>
                          <Typography variant="h5" sx={{ letterSpacing: 2, mb: 0.5 }}>
                            **** **** {account.account_number.slice(-4)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
                          >
                            {account.account_name}
                          </Typography>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <FormControlLabel
                            control={
                              <Switch
                                color="primary"
                                size="small"
                                checked={account.is_default === 1}
                                onChange={() => handleSetDefault(account.id)}
                                disabled={account.is_default === 1}
                              />
                            }
                            label={
                              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                Primary Destination
                              </Typography>
                            }
                          />
                          <IconButton
                            color="error"
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                ))
              ) : (
                /* EMPTY STATE */
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      ...glassStyle,
                      py: 10,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        width: 120,
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        color: 'text.disabled',
                      }}
                    >
                      <Iconify icon="solar:folder-error-bold-duotone" width={64} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      No Linked Accounts
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.disabled', maxWidth: 300, mx: 'auto' }}
                    >
                      You have not added any bank accounts for settlements yet. Use the form on the
                      left to get started.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
