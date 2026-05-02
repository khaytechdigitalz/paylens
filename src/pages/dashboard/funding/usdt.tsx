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

VirtualUSDTPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function VirtualUSDTPage() {
  const theme = useTheme();
  const router = useRouter();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Calling the baseurl/virtualusdt endpoint
      const response = await axios.get('/virtualusdt');
      // Based on your JSON structure: response.data.accounts
      setAccounts(response.data.accounts || []);
    } catch (error) {
      enqueueSnackbar('Unable to retrieve USDT wallet data.', { variant: 'error' });
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
    enqueueSnackbar('Wallet address copied to clipboard!');
  };

  return (
    <>
      <Head>
        <title>USDT Wallets | CredDot</title>
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
              USDT Deposit Addresses
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Receive USDT (TRC20) instantly to your CredDot wallet.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:wallet-add-bold-duotone" />}
            onClick={() => router.push('/dashboard/funding/request_usdt')}
            sx={{ boxShadow: theme.customShadows.primary, px: 3, fontWeight: 700 }}
          >
            Generate USDT Address
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
                  {/* CRYPTO IDENTITY HEADER */}
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: alpha(theme.palette.warning.main, 0.05), // USDT Yellow/Orange tint
                      borderBottom: `1px dashed ${theme.palette.divider}`,
                      position: 'relative',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography
                          variant="overline"
                          sx={{ color: 'warning.dark', fontWeight: 900 }}
                        >
                          Tether USDT
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.primary' }}>
                          TRC20 Network
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'success.main',
                          color: 'common.white',
                        }}
                      >
                        <Iconify icon="cryptocurrency:usdt" width={28} />
                      </Box>
                    </Stack>
                  </Box>

                  {/* WALLET ADDRESS SECTION */}
                  <Box sx={{ p: 3 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.disabled',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      Your USDT Wallet Address
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                        borderRadius: 1.5,
                        position: 'relative',
                        wordBreak: 'break-all',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          pr: 4, // Make room for the button
                          lineHeight: 1.4,
                          fontWeight: 600,
                        }}
                      >
                        {acc.address}
                      </Typography>

                      <Tooltip title="Copy Address">
                        <IconButton
                          onClick={() => handleCopy(acc.address)}
                          size="small"
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'primary.main',
                          }}
                        >
                          <Iconify icon="solar:copy-bold-duotone" width={20} />
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  </Box>

                  {/* FOOTER DETAILS */}
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Stack
                      spacing={1.5}
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                        borderRadius: 1.5,
                        mb: 2,
                      }}
                    >
                      <InfoRow label="Status" value={acc.status} isStatus />
                      <InfoRow label="Network" value="TRON (TRC20)" />
                      <InfoRow
                        label="Created On"
                        value={new Date(acc.created_at).toLocaleDateString()}
                      />
                    </Stack>

                    <Button
                      fullWidth
                      variant="soft"
                      color="primary"
                      startIcon={<Iconify icon="solar:history-bold-duotone" />}
                      onClick={() =>
                        router.push(`/dashboard/transactions/history?address=${acc.address}`)
                      }
                    >
                      Wallet History
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
                    icon="solar:qr-code-bold-duotone"
                    width={64}
                    sx={{ mb: 2, color: 'text.disabled' }}
                  />
                  <Typography variant="h6">No USDT Addresses Found</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Generate a USDT address to start receiving crypto payments.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/dashboard/funding/request_usdt')}
                  >
                    Generate USDT Address
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
