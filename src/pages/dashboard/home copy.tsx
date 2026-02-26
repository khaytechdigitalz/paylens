/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import Head from 'next/head';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Grid,
  Typography,
  Container,
  Button,
  Stack,
  Skeleton,
  Box,
  Card,
  Avatar,
} from '@mui/material';

// utils
import axios from '../../utils/axios';
import { fCurrency } from '../../utils/formatNumber';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// components
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';
// sections
import {
  BankingInviteFriends,
  BankingCurrentBalance,
  BankingBalanceStatistics,
  BankingRecentTransitions,
  BankingExpensesCategories,
} from '../../sections/dashboard';

// ----------------------------------------------------------------------

PageOne.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PageOne() {
  const { themeStretch } = useSettingsContext();
  const theme = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [wallets, setWallets] = useState([]);
  const [stats, setStats] = useState({ totalinflow: 0, totaloutflow: 0 });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState<any>(null);

  // 1. Data Fetching Logic
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/dashboard');

        if (res.data?.data) {
          const d = res.data.data;

          setWallets(d.wallets || []);
          setStats(d.overall_stats || { totalinflow: 0, totaloutflow: 0 });
          setTransactions(d.recent_transactions || []);

          // Mapping the backend chart structure to the UI requirements
          setChartData({
            inflow: d.chart?.inflow || [],
            outflow: d.chart?.outflow || [],
            bills: d.chart?.bills?.breakdown || {
              airtime: 0,
              cabletv: 0,
              internet: 0,
              electricity: 0,
            },
          });
        }
      } catch (error) {
        console.error('Dashboard Load Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Helper to ensure chart arrays are always 12 months long
  const formatSeries = (data: any) => {
    const base = Array(12).fill(0);
    if (Array.isArray(data)) {
      data.forEach((val, index) => {
        if (index < 12) base[index] = Number(val);
      });
    }
    return base;
  };

  if (loading) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Command Center | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={3}>
          {/* HERO: LIQUIDITY & ACTIONS */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(25deg, ${theme.palette.grey[900]} 0%, ${theme.palette.primary.darker} 100%)`,
                color: 'common.white',
                boxShadow: theme.customShadows.z24,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: '-5%',
                  top: '-10%',
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: alpha(theme.palette.primary.main, 0.25),
                  filter: 'blur(60px)',
                }}
              />

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="overline" sx={{ opacity: 0.6, letterSpacing: 2 }}>
                      Net Business Inflow
                    </Typography>
                    <Typography
                      variant="h1"
                      sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800 }}
                    >
                      {fCurrency(stats.totalinflow, 'NGN')}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.success.main, 0.2),
                          color: 'success.light',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Iconify icon="solar:round-arrow-right-up-bold" width={16} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          LIVE
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>
                        Updated just now
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent={{ md: 'flex-end' }}>
                    <ActionButton
                      icon="solar:square-transfer-horizontal-bold-duotone"
                      label="Transfer"
                      color="primary"
                    />
                    <ActionButton
                      icon="solar:card-send-bold-duotone"
                      label="Pay Bills"
                      color="info"
                    />
                    <ActionButton
                      icon="solar:add-circle-bold-duotone"
                      label="Add Fund"
                      color="warning"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* LEFT CONTENT: CHART & LEDGER */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <BankingBalanceStatistics
                title="Revenue vs Outflow"
                subheader="Annual Performance Overview"
                chart={{
                  categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ],
                  colors: [theme.palette.primary.main, theme.palette.warning.main],
                  series: [
                    {
                      type: 'Year',
                      data: [
                        { name: 'Inflow', data: formatSeries(chartData?.inflow) },
                        { name: 'Outflow', data: formatSeries(chartData?.outflow) },
                      ],
                    },
                  ],
                }}
              />

              <BankingRecentTransitions
                title="Recent Ledger Entries"
                tableData={transactions}
                tableLabels={[
                  { id: 'description', label: 'Service/Beneficiary' },
                  { id: 'created_at', label: 'Timestamp' },
                  { id: 'amount', label: 'Value' },
                  { id: 'status', label: 'State' },
                  { id: '' },
                ]}
              />
            </Stack>
          </Grid>

          {/* RIGHT CONTENT: WALLETS & UTILITIES */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Iconify icon="solar:wallet-bold-duotone" color="primary.main" />
                  Managed Wallets
                </Typography>
                <BankingCurrentBalance list={wallets} />
              </Box>

              <BankingExpensesCategories
                title="Bills Distribution"
                chart={{
                  series: [
                    { label: 'Airtime', value: Number(chartData?.bills?.airtime || 0) },
                    { label: 'Cable TV', value: Number(chartData?.bills?.cabletv || 0) },
                    { label: 'Internet', value: Number(chartData?.bills?.internet || 0) },
                    { label: 'Electricity', value: Number(chartData?.bills?.electricity || 0) },
                  ],
                }}
              />

              <Card
                sx={{
                  p: 2.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  border: `1px dashed ${theme.palette.primary.main}`,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <Iconify icon="solar:shield-check-bold-duotone" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">API Status</Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'success.main', fontWeight: 'bold' }}
                    >
                      Production Live
                    </Typography>
                  </Box>
                  <Button size="small" color="primary" sx={{ ml: 'auto' }}>
                    Manage
                  </Button>
                </Stack>
              </Card>

              <BankingInviteFriends
                price="₦5,000"
                title="Referral Program"
                description="Invite partners and earn ₦5k per active merchant."
              />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

function ActionButton({ icon, label, color }: { icon: string; label: string; color: any }) {
  const theme = useTheme();
  return (
    <Stack spacing={1} alignItems="center">
      <Button
        variant="soft"
        sx={{
          width: 60,
          height: 60,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.common.white, 0.1),
          color: 'common.white',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          '&:hover': {
            bgcolor: alpha(theme.palette.common.white, 0.2),
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Iconify icon={icon} width={28} />
      </Button>
      <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
        {label}
      </Typography>
    </Stack>
  );
}
