/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import Head from 'next/head';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Typography,
  Container,
  Button,
  Stack,
  Skeleton,
  Box,
  ToggleButtonGroup,
  ToggleButton,
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
  BankingContacts,
  BankingInviteFriends,
  BankingQuickTransfer,
  BankingCurrentBalance,
  BankingBalanceStatistics,
  BankingRecentTransitions,
  BankingExpensesCategories,
} from '../../sections/dashboard';
import StatWidget from '../../components/widgets/StatWidget';

// ----------------------------------------------------------------------

// 1. TYPES
export type RowProps = {
  id: number;
  reference: string;
  amount: string | number;
  type: string;
  category: string;
  status: string;
  created_at: string;
  description: string;
  currency?: string;
};

interface Wallet {
  id: string;
  currency: string;
  balance: number;
}

interface Stats {
  totaloutflow: string | number;
  totalinflow: string | number;
}

PageOne.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function PageOne() {
  const { themeStretch } = useSettingsContext();
  const theme = useTheme();

  // States
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [stats, setStats] = useState<Stats>({ totalinflow: 0, totaloutflow: 0 });
  const [chartData, setChartData] = useState<any>(null);
  const [transactions, setTransactions] = useState<RowProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. DATA FETCHING & MAPPING
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

          // Map Chart Data: Ensure we extract the raw numbers
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
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 3. CHART HELPER: Ensures 12 slots for Jan-Dec
  const formatSeries = (data: any) => {
    const base = Array(12).fill(0);
    if (Array.isArray(data)) {
      data.forEach((val, index) => {
        if (index < 12) base[index] = Number(val);
      });
    } else if (data) {
      base[0] = Number(data); // If single value, put in first slot
    }
    return base;
  };

  return (
    <>
      <Head>
        <title> Business Dashboard | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3">Bills History</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Filter and manage your utility payments.
            </Typography>
          </Box>
          <ToggleButtonGroup value="NGN" exclusive size="small" color="primary">
            {['NGN', 'USD', 'GBP'].map((lib) => (
              <ToggleButton key={lib} value={lib} sx={{ fontWeight: 'bold', px: 2 }}>
                {lib}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Grid container spacing={3}>
          {/* Current Balance */}
          <Grid item xs={12} md={5}>
            {loading ? (
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />
            ) : (
              <BankingCurrentBalance list={wallets as any[]} />
            )}
          </Grid>

          {/* Quick Actions & Widgets */}
          <Grid item xs={12} md={7}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 5, justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Iconify icon="solar:code-circle-bold" />}>
                API
              </Button>
              <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>
                Transfer
              </Button>
              <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>
                Bills
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ width: 1 }}>
                {loading ? (
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                ) : (
                  <StatWidget
                    title="Total Inflow"
                    amount={fCurrency(stats.totalinflow, 'NGN')}
                    variant="primary"
                    icon={<Iconify icon="solar:bill-list-bold-duotone" width={32} />}
                  />
                )}
              </Box>
              <Box sx={{ width: 1 }}>
                {loading ? (
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                ) : (
                  <StatWidget
                    title="Total Outflow"
                    amount={fCurrency(stats.totaloutflow, 'NGN')}
                    variant="error"
                    icon={<Iconify icon="solar:check-circle-bold-duotone" width={32} />}
                  />
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Main Statistics & Tables */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {loading ? (
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
              ) : (
                <BankingBalanceStatistics
                  key={JSON.stringify(chartData?.inflow)} // Forces re-draw on data load
                  title="Transaction Statistics"
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
                          { name: 'Income', data: formatSeries(chartData?.inflow) },
                          { name: 'Expenses', data: formatSeries(chartData?.outflow) },
                        ],
                      },
                    ],
                    options: {
                      tooltip: { y: { formatter: (value: number) => fCurrency(value) } },
                      yaxis: { labels: { formatter: (value: number) => fCurrency(value) } },
                    },
                  }}
                />
              )}

              {loading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              ) : (
                <BankingExpensesCategories
                  title="Bills Breakdown"
                  chart={{
                    series: [
                      { label: 'Airtime', value: Number(chartData?.bills?.airtime || 0) },
                      { label: 'Cable TV', value: Number(chartData?.bills?.cabletv || 0) },
                      { label: 'Internet', value: Number(chartData?.bills?.internet || 0) },
                      { label: 'Electricity', value: Number(chartData?.bills?.electricity || 0) },
                    ],
                  }}
                />
              )}

              {loading ? (
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
              ) : (
                <BankingRecentTransitions
                  title="Recent Transactions"
                  tableData={transactions}
                  tableLabels={[
                    { id: 'description', label: 'Description' },
                    { id: 'created_at', label: 'Date' },
                    { id: 'amount', label: 'Amount' },
                    { id: 'status', label: 'Status' },
                  ]}
                />
              )}
            </Stack>
          </Grid>

          {/* Sidebar Area */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {loading ? (
                <>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
                </>
              ) : (
                <>
                  <BankingQuickTransfer title="Quick Transfer" list={[]} />
                  <BankingContacts title="Contacts" list={[]} />
                  <BankingInviteFriends
                    price="50%"
                    title="Refer & Earn"
                    description="Invite friends to earn royalty on fees."
                    img="/assets/illustrations/characters/character_11.png"
                  />
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
