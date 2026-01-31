/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Alert,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Badge,
  Avatar,
} from '@mui/material';
import { alpha, useTheme, styled } from '@mui/material/styles';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import axios from '../../../utils/axios';
import { fCurrency } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

const StyledSearch = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 12px',
  width: 300,
  backgroundColor: alpha(theme.palette.grey[500], 0.08),
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
}));

POSTerminalPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function POSTerminalPage() {
  const theme = useTheme();
  const router = useRouter();
  const { themeStretch } = useSettingsContext();

  const [summary, setSummary] = useState<any>(null);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/terminals');
      setSummary(response.data.summary);
      setTerminals(response.data.data);
    } catch (error) {
      setErrorMessage('Unable to synchronize terminal data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Head>
        <title>Terminal Management | PayLens</title>
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
            <Typography variant="h3" sx={{ mb: 1 }}>
              Terminal Management
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Monitor and manage your POS terminal network.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="solar:shop-2-bold-duotone" />}
            onClick={() => router.push('/dashboard/pos/request')}
            sx={{ boxShadow: theme.customShadows.primary, px: 3 }}
          >
            New Request
          </Button>
        </Stack>

        {/* Analytics Widgets */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {summary &&
            [
              {
                label: 'Active Terminals',
                value: summary.active,
                color: 'success',
                icon: 'solar:bolt-circle-bold-duotone',
              },
              {
                label: 'Requested Terminals',
                value: summary.requested,
                color: 'warning',
                icon: 'solar:delivery-bold-duotone',
              },
              {
                label: 'Pending Request',
                value: summary.pending_action,
                color: 'error',
                icon: 'solar:shield-warning-bold-duotone',
              },
              {
                label: 'Assigned Terminals',
                value: summary.assigned,
                color: 'info',
                icon: 'solar:user-rounded-bold-duotone',
              },
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.label}>
                <Card
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h3">{item.value}</Typography>
                  </Box>
                  <Iconify
                    icon={item.icon}
                    width={60}
                    sx={{
                      position: 'absolute',
                      right: -10,
                      bottom: -10,
                      color: `${item.color}.main`,
                      opacity: 0.12,
                      transform: 'rotate(-15deg)',
                    }}
                  />
                </Card>
              </Grid>
            ))}
        </Grid>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Terminals</Typography>
          <StyledSearch>
            <Iconify icon="solar:magnifer-linear" sx={{ color: 'text.disabled', mr: 1 }} />
            <InputBase placeholder="Search terminal or SN..." />
          </StyledSearch>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {terminals.map((terminal) => (
              <Grid item xs={12} sm={6} md={4} key={terminal.id}>
                <Card sx={{ border: `1px solid ${theme.palette.divider}` }}>
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Badge
                      color={terminal.status === 'active' ? 'success' : 'warning'}
                      variant="dot"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Iconify icon="solar:card-2-bold-duotone" />
                      </Avatar>
                    </Badge>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        color: terminal.status === 'requested' ? 'warning.main' : 'success.main',
                      }}
                    >
                      {terminal.status}
                    </Typography>
                  </Box>

                  <Box sx={{ px: 2, pb: 2 }}>
                    <Typography variant="subtitle1" noWrap>
                      {terminal.brand || 'Unassigned Hardware'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', mb: 2 }}>
                      SN: {terminal.serial_number || 'Pending Assignment'}
                    </Typography>

                    <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon="solar:map-point-bold-duotone"
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="caption" noWrap>
                          {terminal.delivery_address}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                          icon="solar:wad-of-money-bold-duotone"
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="caption">
                          Caution Fee: {fCurrency(terminal.caution_fee, 'NGN')}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Button
                      fullWidth
                      variant="soft"
                      color="primary"
                      endIcon={<Iconify icon="solar:arrow-right-linear" />}
                      onClick={() =>
                        router.push(`/dashboard/pos/${terminal.terminal_id}/details`)
                      }
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}
