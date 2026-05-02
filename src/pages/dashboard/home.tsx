/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import Head from 'next/head';
// Framer Motion upgraded for premium transitions
import { m, AnimatePresence } from 'framer-motion';

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
import { BankingBalanceStatistics, BankingExpensesCategories, BankingInviteFriends, BankingRecentTransitions } from 'src/sections/dashboard';
import { useAuthContext } from 'src/auth/useAuthContext';
import BVNAlert from '../../layouts/dashboard/BVNAlert';

// utils
import axios from '../../utils/axios';
import { fCurrency } from '../../utils/formatNumber';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// components
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

PageOne.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PageOne() {
  const { themeStretch } = useSettingsContext();
  const theme = useTheme();
  const { user } = useAuthContext();
  const [isLive, setIsLive] = useState(user?.mode === 'live');

  const [walletIndex, setWalletIndex] = useState(0);

  useEffect(() => {
    if (user?.mode) {
      setIsLive(user.mode === 'live');
    }
  }, [user?.mode]);

  const [loading, setLoading] = useState<boolean>(true);
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const [wallets, setWallets] = useState<any[]>([]);
  const [verification, setVerifications] = useState<any[]>([]);
  const [business, setBusiiness] = useState('');

  const [stats, setStats] = useState({ totalinflow: 0, totaloutflow: 0 });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/dashboard');
        if (res.data?.data) {
          const d = res.data.data;
          setWallets(d.wallets || []);
          setVerifications(d.verification.bvn);
          setBusiiness(d.account_type);
          setStats(d.overall_stats || { totalinflow: 0, totaloutflow: 0 });
          setTransactions(d.recent_transactions || []);
          setChartData({
            inflow: d.chart?.inflow || [],
            outflow: d.chart?.outflow || [],
            bills: d.bills?.breakdown || { airtime: 0, cabletv: 0, internet: 0, electricity: 0 },
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

  const primaryBalanceWallet = wallets;
  const currencySymbols: Record<string, string> = {
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
  };

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
        <title>Dashboard | CredDot</title>
      </Head>
      <>{!verification && <BVNAlert />}</>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(45deg, ${theme.palette.grey[900]} 0%, #1a237e 100%)`,
                color: 'common.white',
                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)',
              }}
            >
              {/* Decorative Premium Glow */}
              <Box
                sx={{
                  position: 'absolute',
                  right: '-10%',
                  top: '-20%',
                  width: 500,
                  height: 200,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )} 0%, transparent 70%)`,
                  filter: 'blur(60px)',
                  zIndex: 0,
                }}
              />

              <Grid
                container
                spacing={3}
                alignItems="center"
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Grid item xs={12} md={7}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="overline"
                        sx={{ opacity: 0.5, letterSpacing: 3, fontWeight: 700 }}
                      >
                        Total Account Balance
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShowBalance(!showBalance)}
                        sx={{
                          color: 'common.white',
                          bgcolor: alpha(theme.palette.common.white, 0.05),
                          '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
                        }}
                      >
                        <Iconify
                          icon={showBalance ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          width={16}
                        />
                      </IconButton>
                    </Stack>

                    {/* PREMIUM SLIDER STAGE */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        perspective: '1000px',
                      }}
                    >
                      <Stack
                        component={m.div}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, info) => {
                          const swipe = info.offset.x;
                          if (swipe < -50 && walletIndex < primaryBalanceWallet.length - 1)
                            setWalletIndex((v) => v + 1);
                          if (swipe > 50 && walletIndex > 0) setWalletIndex((v) => v - 1);
                        }}
                        sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
                      >
                        <AnimatePresence mode="wait">
                          <m.div
                            key={walletIndex}
                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <Stack direction="row" alignItems="baseline" spacing={1.5}>
                              <Typography
                                variant="h1"
                                sx={{
                                  fontSize: { xs: '2.8rem', md: '4.2rem' },
                                  fontWeight: 900,
                                  background:
                                    'linear-gradient(to bottom, #FFFFFF 30%, #b0bec5 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  letterSpacing: -2,
                                }}
                              >
                                {currencySymbols[primaryBalanceWallet[walletIndex]?.currency] ||
                                  primaryBalanceWallet[walletIndex]?.currency}
                                {showBalance
                                  ? fCurrency(primaryBalanceWallet[walletIndex]?.balance, '').split(
                                      '.'
                                    )[0]
                                  : ' ••••'}
                              </Typography>

                              {showBalance && (
                                <Typography variant="h3" sx={{ opacity: 0.4, fontWeight: 400 }}>
                                  .
                                  {fCurrency(primaryBalanceWallet[walletIndex]?.balance, '').split(
                                    '.'
                                  )[1] || '00'}
                                </Typography>
                              )}
                            </Stack>
                          </m.div>
                        </AnimatePresence>
                      </Stack>
                    </Box>

                    {/* Enhanced Pagination Dots */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {primaryBalanceWallet.map((_, i) => (
                        <Box
                          key={i}
                          onClick={() => setWalletIndex(i)}
                          sx={{
                            width: i === walletIndex ? 24 : 8,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: i === walletIndex ? 'primary.main' : 'common.white',
                            opacity: i === walletIndex ? 1 : 0.2,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow:
                              i === walletIndex ? `0 0 10px ${theme.palette.primary.main}` : 'none',
                          }}
                        />
                      ))}
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '10px',
                          bgcolor: isLive
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.error.main, 0.1),
                          border: `1px solid ${
                            isLive
                              ? alpha(theme.palette.success.main, 0.2)
                              : alpha(theme.palette.error.main, 0.2)
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isLive ? 'success.main' : 'error.main',
                            boxShadow: `0 0 8px ${
                              isLive ? theme.palette.success.main : theme.palette.error.main
                            }`,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: isLive ? 'success.light' : 'error.light',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          {isLive ? 'Live Environment' : 'Sandbox Mode'}
                        </Typography>
                      </Box>
                      <>
                        {/*
                        <Typography variant="body2" sx={{ opacity: 0.5, fontWeight: 600 }}>
                          {primaryBalanceWallet[walletIndex]?.currency} Wallet Active
                        </Typography>
                        */}
                      </>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Stack direction="row" spacing={2} justifyContent={{ md: 'flex-end' }}>
                    <ActionButton
                      link="payout/history"
                      icon="solar:wallet-bold-duotone"
                      label="Payout"
                    />
                    <ActionButton
                      link="bills/history"
                      icon="solar:cart-large-minimalistic-bold-duotone"
                      label="Bills"
                    />
                    {business === 'business' && (
                      <ActionButton
                        link="pos/history"
                        icon="solar:smartphone-bold-duotone"
                        label="POS"
                      />
                    )}
                    <ActionButton
                      link="virtualcard/history"
                      icon="solar:card-send-bold-duotone"
                      label="Cards"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* ... Rest of your code remains exactly the same ... */}
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

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
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
              {business === 'business' && (
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
              )}
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

function ActionButton({ icon, label, link }: { icon: string; link: string; label: string }) {
  const theme = useTheme();
  return (
    <Stack spacing={1.5} alignItems="center">
      <Button
        onClick={() => router.push(link)}
        variant="soft"
        sx={{
          width: 72,
          height: 72,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.common.white, 0.08),
          color: 'common.white',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          '&:hover': {
            bgcolor: alpha(theme.palette.common.white, 0.15),
            transform: 'translateY(-5px) scale(1.05)',
            boxShadow: `0 12px 20px ${alpha(theme.palette.common.black, 0.4)}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Iconify icon={icon} width={32} />
      </Button>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          opacity: 0.7,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
