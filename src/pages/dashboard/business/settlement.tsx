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
  Box,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';

// ----------------------------------------------------------------------

SettlementSetupPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------

export default function SettlementSetupPage() {
  const { themeStretch } = useSettingsContext();

  // States
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accountData, setAccountData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  // Mock list of banks
  const BANKS = [
    { id: '1', name: 'Access Bank' },
    { id: '2', name: 'First Bank of Nigeria' },
    { id: '3', name: 'Guaranty Trust Bank' },
    { id: '4', name: 'Zenith Bank' },
    { id: '5', name: 'Kuda Microfinance Bank' },
  ];

  const handleVerify = () => {
    setLoading(true);
    // Simulating a Bank Name Inquiry API call
    setTimeout(() => {
      setAccountData((prev) => ({ ...prev, accountName: 'PAYLENS SOLUTIONS LTD' }));
      setIsVerified(true);
      setLoading(false);
    }, 1500);
  };

  const handleSave = () => {
    // Save logic here
    alert('Settlement account updated successfully!');
  };

  return (
    <>
      <Head>
        <title> Settlement Setup | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h3">Settlement Settings</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure the bank account where your earned payouts will be sent.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Bank Account Details
              </Typography>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  select
                  label="Select Bank"
                  value={accountData.bankName}
                  onChange={(e) => {
                    setAccountData({ ...accountData, bankName: e.target.value });
                    setIsVerified(false);
                  }}
                >
                  {BANKS.map((bank) => (
                    <MenuItem key={bank.id} value={bank.name}>
                      {bank.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Account Number"
                  placeholder="0123456789"
                  value={accountData.accountNumber}
                  onChange={(e) => {
                    setAccountData({ ...accountData, accountNumber: e.target.value });
                    setIsVerified(false);
                  }}
                  inputProps={{ maxLength: 10 }}
                />

                {!isVerified && (
                  <LoadingButton
                    fullWidth
                    size="large"
                    type="submit"
                    variant="soft"
                    loading={loading}
                    disabled={accountData.accountNumber.length < 10 || !accountData.bankName}
                    onClick={handleVerify}
                  >
                    Verify Account
                  </LoadingButton>
                )}

                {isVerified && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'success.lighter',
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'success.main',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: 'success.darker', fontWeight: 'bold', display: 'block' }}
                        >
                          ACCOUNT VERIFIED
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'success.darker' }}>
                          {accountData.accountName}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                <Divider />

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!isVerified}
                  onClick={handleSave}
                >
                  Save Settlement Account
                </Button>
              </Stack>
            </Card>
          </Grid>

          {/* Info Sidebar */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Settlement Schedule
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Your current settlement cycle is <strong>T+1</strong> (Daily).
                </Typography>
                <Alert severity="info" icon={<Iconify icon="eva:clock-fill" />}>
                  Funds processed today will be available in your bank account by 10:00 AM the next
                  business day.
                </Alert>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Current Active Account
                </Typography>
                {/* Visual of currently active bank */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderStyle: 'dashed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: 'common.white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Iconify
                      icon="eva:account-book-fill"
                      width={32}
                      sx={{ color: 'primary.main' }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Access Bank</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      **** 4567
                    </Typography>
                  </Box>
                </Paper>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
