/* eslint-disable no-alert */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

VirtualAccountPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function VirtualAccountPage() {
  const theme = useTheme();
  const router = useRouter();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint: {{baseurl}}/virtualaccounts
      const response = await axios.get('/virtualaccounts');
      setAccounts(response.data.accounts);
    } catch (error) {
      enqueueSnackbar('Unable to retrieve virtual account data.', { variant: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar('Account number copied to clipboard!');
  };

  return (
    <>
      <Head>
        <title>Virtual Accounts | CredDot</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          sx={{ mb: 5 }}
          spacing={2}
        >
          <Box>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
              Virtual Accounts
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Receive payments instantly via your reserved bank accounts.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="solar:wallet-add-bold-duotone" />}
            onClick={() => router.push('/dashboard/funding/request')}
            sx={{ boxShadow: theme.customShadows.primary, px: 3, fontWeight: 700 }}
          >
            Create New Account
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {accounts.map((acc) => (
              <Grid item xs={12} sm={6} md={4} key={acc.id}>
                <Card
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: theme.customShadows.z12,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* BANK IDENTITY HEADER */}
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderBottom: `1px dashed ${theme.palette.divider}`,
                      position: 'relative',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography
                          variant="overline"
                          sx={{ color: 'primary.main', fontWeight: 900 }}
                        >
                          {acc.bank_name || 'Partner Bank'}
                        </Typography>
                        <Typography variant="h6" noWrap sx={{ maxWidth: 200 }}>
                          {acc.account_name}
                        </Typography>
                      </Box>
                      <Iconify
                        icon="solar:bank-bold-duotone"
                        width={40}
                        sx={{ color: 'primary.main', opacity: 0.8 }}
                      />
                    </Stack>
                  </Box>

                  {/* ACCOUNT NUMBER SECTION */}
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}
                    >
                      Account Number
                    </Typography>
                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                      <Typography variant="h3" sx={{ letterSpacing: 2 }}>
                        {acc.account_number}
                      </Typography>
                      <Tooltip title="Copy Account Number">
                        <IconButton onClick={() => handleCopy(acc.account_number)} size="small">
                          <Iconify icon="solar:copy-bold-duotone" width={20} color="primary.main" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* FOOTER DETAILS */}
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Stack
                      spacing={1.5}
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                        borderRadius: 1.5,
                      }}
                    >
                      <InfoRow label="Status" value={acc.status} isStatus />
                      <InfoRow label="Provider" value={acc.provider.toUpperCase()} />
                      <InfoRow label="Assignment" value={acc.assignment} />
                    </Stack>

                    <Button
                      fullWidth
                      variant="soft"
                      color="primary"
                      sx={{ mt: 2, fontWeight: 700 }}
                      onClick={() => router.push(`/dashboard/virtualaccounts/${acc.reference}`)}
                    >
                      View Transactions
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}

            {accounts.length === 0 && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    py: 10,
                    textAlign: 'center',
                    border: `2px dashed ${theme.palette.divider}`,
                    bgcolor: 'transparent',
                  }}
                >
                  <Iconify
                    icon="solar:user-id-bold-duotone"
                    width={64}
                    sx={{ mb: 2, color: 'text.disabled' }}
                  />
                  <Typography variant="h6">No Virtual Accounts Found</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Generate a dedicated account number to start receiving local transfers.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/dashboard/funding/request')}
                  >
                    Generate Now
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function InfoRow({
  label,
  value,
  isStatus = false,
}: {
  label: string;
  value: string;
  isStatus?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          color: isStatus && value === 'active' ? 'success.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
