/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import Head from 'next/head';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import router, { useRouter } from 'next/router';
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
  IconButton,
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
  BankingBalanceStatistics,
  BankingRecentTransitions,
  BankingExpensesCategories,
} from '../../sections/dashboard';
import { useAuthContext } from '../../auth/useAuthContext';

// ----------------------------------------------------------------------

PageOne.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PageOne() {
  const { themeStretch } = useSettingsContext();
  const theme = useTheme();
  const { user } = useAuthContext();
  const [isLive, setIsLive] = useState(user?.mode === 'live');

  // Sync local state with AuthContext on refresh or user change
  useEffect(() => {
    if (user?.mode) {
      setIsLive(user.mode === 'live');
    }
  }, [user?.mode]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBalance, setShowBalance] = useState<boolean>(true); // State for eye toggle

  const [wallets, setWallets] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalinflow: 0, totaloutflow: 0 });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState<any>(null);

  // 1. Data Fetching
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

  // Use the balance from the first wallet as the primary balance
  const primaryBalance = wallets.length > 0 ? wallets[0].balance : 0;

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
          <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
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
          {/* HERO: ACCOUNT BALANCE & TOGGLE */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: { xs: 3, md: 5 },
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
                  width: 350,
                  height: 350,
                  borderRadius: '50%',
                  background: alpha(theme.palette.primary.main, 0.2),
                  filter: 'blur(80px)',
                }}
              />

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="overline" sx={{ opacity: 0.6, letterSpacing: 2 }}>
                        Total Account Balance
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShowBalance(!showBalance)}
                        sx={{ color: 'common.white', opacity: 0.6 }}
                      >
                        <Iconify
                          icon={showBalance ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          width={18}
                        />
                      </IconButton>
                    </Stack>

                    <Typography
                      variant="h1"
                      sx={{ fontSize: { xs: '2.5rem', md: '3.8rem' }, fontWeight: 800 }}
                    >
                      ₦ {showBalance ? fCurrency(primaryBalance, 'NGN') : '**** ****'}
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.success.main, 0.15),
                          color: 'success.light',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Iconify
                          sx={{ color: isLive ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                          icon="solar:shield-check-bold"
                          width={14}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: isLive ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                        >
                          {isLive ? 'LIVE MODE' : 'TEST MODE'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>
                        Active Wallet: {wallets[0]?.currency || 'NGN'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent={{ md: 'flex-end' }}>
                    <ActionButton
                      link="bills/history"
                      icon="solar:square-transfer-horizontal-bold-duotone"
                      label="Transfer"
                    />
                    <ActionButton
                      link="payout/history"
                      icon="solar:card-send-bold-duotone"
                      label="Pay Bills"
                    />
                    <ActionButton
                      link="pos/history"
                      icon="solar:add-circle-bold-duotone"
                      label="Request POS"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* LEFT CONTENT: ANALYTICS & LEDGER */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <BankingBalanceStatistics
                title="Financial Velocity"
                subheader="Annual Cashflow Analysis"
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
                        { name: 'Total Inflow', data: formatSeries(chartData?.inflow) },
                        { name: 'Total Outflow', data: formatSeries(chartData?.outflow) },
                      ],
                    },
                  ],
                }}
              />

              <BankingRecentTransitions
                title="Recent Ledger Activity"
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

          {/* RIGHT CONTENT: INSIGHTS & UTILITIES */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Bills Distribution - Now takes priority in sidebar */}
              <BankingExpensesCategories
                title="Category Breakdown"
                chart={{
                  series: [
                    { label: 'Airtime', value: Number(chartData?.bills?.airtime || 0) },
                    { label: 'Cable TV', value: Number(chartData?.bills?.cabletv || 0) },
                    { label: 'Internet', value: Number(chartData?.bills?.internet || 0) },
                    { label: 'Electricity', value: Number(chartData?.bills?.electricity || 0) },
                  ],
                }}
              />

              {/* API Status Widget */}
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
                    <Iconify icon="solar:key-minimalistic-bold-duotone" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">API Credentials</Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'success.main', fontWeight: 'bold' }}
                    >
                      {isLive ? 'Live' : 'Test'} Mode Active
                    </Typography>
                  </Box>
                  <Button size="small" variant="soft" sx={{ ml: 'auto' }}>
                    View
                  </Button>
                </Stack>
              </Card>

              {/* Referral/Invite */}
              <BankingInviteFriends
                price="₦5,000"
                title="Growth Incentive"
                img="/assets/illustrations/characters/character_11.png"
                description="Expand the network. Earn commission on every active referral."
              />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

// Action Button Component
function ActionButton({ icon, label, link }: { icon: string; link: string; label: string }) {
  const theme = useTheme();
  return (
    <Stack spacing={1.5} alignItems="center">
      <Button
        onClick={() => router.push(link)}
        variant="soft"
        sx={{
          width: 64,
          height: 64,
          borderRadius: 2.5,
          bgcolor: alpha(theme.palette.common.white, 0.1),
          color: 'common.white',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          '&:hover': {
            bgcolor: alpha(theme.palette.common.white, 0.2),
            transform: 'translateY(-3px)',
          },
          transition: theme.transitions.create(['transform', 'background-color']),
        }}
      >
        <Iconify icon={icon} width={30} />
      </Button>
      <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, fontSize: '0.75rem' }}>
        {label}
      </Typography>
    </Stack>
  );
}
